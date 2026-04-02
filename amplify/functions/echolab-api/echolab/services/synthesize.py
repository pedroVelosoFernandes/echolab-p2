from __future__ import annotations

import hashlib
import json
from typing import Any, Dict, Optional, Tuple

import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException, status

from echolab.core.auth import UserContext
from echolab.core.config import get_settings
from echolab.repositories.presets import PresetsRepository
from echolab.repositories.voice_defaults import VoiceDefaultsRepository
from echolab.repositories.voices import VoicesRepository
from echolab.schemas.synthesize import SynthesizeRequest


def _sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


class SynthesizeService:
    def __init__(self):
        self._settings = get_settings()
        self._s3 = boto3.client("s3", region_name=self._settings.aws_region)
        self._polly = boto3.client("polly", region_name=self._settings.aws_region)
        self._voices_repo = VoicesRepository()
        self._presets_repo = PresetsRepository()
        self._defaults_repo = VoiceDefaultsRepository()

    def _resolve_settings(self, ctx: UserContext, body: SynthesizeRequest) -> Tuple[str, str, float, float, float]:
        if body.presetId:
            preset = self._presets_repo.get(ctx.userId, body.presetId)
            if not preset:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="presetId not found")
            return (
                preset["language"],
                preset["gender"],
                float(preset["rate"]),
                float(preset["pitch"]),
                float(preset["intonation"]),
            )

        missing = [k for k in ("language", "gender", "rate", "pitch", "intonation") if getattr(body, k) is None]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing fields for direct synthesis",
            )

        # basic range checks (docs: [0.5, 1.5])
        for name in ("rate", "pitch", "intonation"):
            v = float(getattr(body, name))
            if v < 0.5 or v > 1.5:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{name} must be in [0.5, 1.5]")

        return (str(body.language), str(body.gender), float(body.rate), float(body.pitch), float(body.intonation))

    def _resolve_voice(self, ctx: UserContext, language: str, gender: str) -> Dict[str, Any]:
        voice_id = self._defaults_repo.resolve_voice_for(
            user_id=ctx.userId,
            tenant_id=ctx.tenantId,
            language=language,
            gender=gender,
        )

        if voice_id:
            voice = self._voices_repo.get(voice_id)
            if voice:
                return voice

        # fallback: first enabled voice matching language+gender
        voices = self._voices_repo.list(enabled_only=True, language=language, gender=gender)
        if voices:
            return voices[0]

        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No voice available for language/gender")

    def _cache_key(self, *, user_id: str, text: str, voice_id: str, rate: float, pitch: float, intonation: float) -> str:
        settings = {
            "voiceId": voice_id,
            "rate": rate,
            "pitch": pitch,
            "intonation": intonation,
        }
        raw = json.dumps({"text": text, "settings": settings}, sort_keys=True, separators=(",", ":"))
        return f"{user_id}/{_sha256_hex(raw)}.mp3"

    def synthesize(self, ctx: UserContext, body: SynthesizeRequest) -> Dict[str, Any]:
        language, gender, rate, pitch, intonation = self._resolve_settings(ctx, body)
        voice = self._resolve_voice(ctx, language, gender)

        provider = (voice.get("provider") or "").lower()
        if provider != "polly":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only Polly voices are supported")

        voice_key = voice.get("voiceKey")
        if not voice_key:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Voice misconfigured")

        key = self._cache_key(
            user_id=ctx.userId,
            text=body.text,
            voice_id=voice["voiceId"],
            rate=rate,
            pitch=pitch,
            intonation=intonation,
        )

        bucket = self._settings.audio_bucket_name

        cached = False
        try:
            self._s3.head_object(Bucket=bucket, Key=key)
            cached = True
        except ClientError as e:
            if e.response.get("ResponseMetadata", {}).get("HTTPStatusCode") != 404:
                # ignore any other errors? treat as miss but still attempt synth
                pass

        if not cached:
            polly_resp = self._polly.synthesize_speech(
                Text=body.text,
                OutputFormat="mp3",
                VoiceId=voice_key,
            )
            stream = polly_resp.get("AudioStream")
            if not stream:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Polly failed")

            audio_bytes = stream.read()
            self._s3.put_object(
                Bucket=bucket,
                Key=key,
                Body=audio_bytes,
                ContentType="audio/mpeg",
            )

        url = self._s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=self._settings.presign_expires_seconds,
        )

        return {"url": url, "cached": cached}
