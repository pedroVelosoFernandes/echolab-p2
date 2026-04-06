from __future__ import annotations

import hashlib
import json
import re
from typing import Any, Dict, Optional, Tuple
from xml.sax.saxutils import escape as _xml_escape

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


_COMMAND_RE = re.compile(r"(?i)\b(pause|characters|numbers)\[([^\]]*)\]")

# Bump this when SSML generation changes to avoid serving stale cached audio.
_SYNTH_CACHE_VERSION = 2


def _format_percent(delta: float) -> str:
    # Polly SSML accepts values like "-10%", "0%", "10%".
    v = round(delta, 1)
    if abs(v) < 0.05:
        v = 0.0
    s = f"{v:.1f}".rstrip("0").rstrip(".")
    if s == "-0":
        s = "0"
    return f"{s}%"


def _format_ratio_percent(ratio: float) -> str:
    # SSML prosody rate accepts percentages relative to default (100% = normal).
    pct = round(ratio * 100.0, 1)
    s = f"{pct:.1f}".rstrip("0").rstrip(".")
    return f"{s}%"


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def _to_ssml_text(raw_text: str) -> str:
    """Convert custom inline commands to SSML-safe markup.

    Supported commands:
    - pause[500ms] / pause[1000] / pause[2s]
    - characters[ABC]
    - numbers[123]
    """

    parts: list[str] = []
    last = 0
    for m in _COMMAND_RE.finditer(raw_text or ""):
        start, end = m.span()
        if start > last:
            parts.append(_xml_escape(raw_text[last:start]))

        cmd = m.group(1).lower()
        arg = (m.group(2) or "").strip()

        if cmd == "pause":
            # Normalize durations: "500" => "500ms"; allow "500ms" and "2s".
            dur = arg
            if dur.isdigit():
                dur = f"{dur}ms"
            if re.fullmatch(r"\d+(ms|s)", dur):
                parts.append(f"<break time=\"{dur}\"/>")
            else:
                # If malformed, treat as literal text.
                parts.append(_xml_escape(m.group(0)))
        elif cmd == "characters":
            parts.append(f"<say-as interpret-as=\"characters\">{_xml_escape(arg)}</say-as>")
        elif cmd == "numbers":
            parts.append(f"<say-as interpret-as=\"digits\">{_xml_escape(arg)}</say-as>")
        else:
            parts.append(_xml_escape(m.group(0)))

        last = end

    if last < len(raw_text or ""):
        parts.append(_xml_escape(raw_text[last:]))

    return "".join(parts)


def _build_ssml(*, text: str, rate: float, pitch: float, intonation: float, domain: Optional[str]) -> str:
    # Map [0.5, 1.5] to [50%, 150%] (100% is normal).
    rate_pct = _format_ratio_percent(rate)

    # Polly doesn't have a dedicated "intonation" control; we approximate it by
    # letting it influence the final pitch multiplier.
    effective_pitch = _clamp(pitch * intonation, 0.5, 1.5)
    pitch_pct = _format_percent((effective_pitch - 1.0) * 100.0)

    inner = _to_ssml_text(text)
    inner = f"<prosody rate=\"{rate_pct}\" pitch=\"{pitch_pct}\">{inner}</prosody>"

    if domain in {"news", "conversational"}:
        inner = f"<amazon:domain name=\"{domain}\">{inner}</amazon:domain>"

    return (
        '<speak xmlns="http://www.w3.org/2001/10/synthesis" '
        'xmlns:amazon="http://www.amazon.com/ssml">'
        f"{inner}"
        "</speak>"
    )


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

    def _cache_key(
        self,
        *,
        user_id: str,
        text: str,
        voice_id: str,
        voice_qualities: list[str],
        rate: float,
        pitch: float,
        intonation: float,
    ) -> str:
        settings = {
            "v": _SYNTH_CACHE_VERSION,
            "voiceId": voice_id,
            "qualities": sorted([q for q in (voice_qualities or []) if isinstance(q, str)]),
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

        qualities = voice.get("qualities") or []
        if not isinstance(qualities, list):
            qualities = []
        qualities = [q for q in qualities if isinstance(q, str)]

        # Polly-specific tuning: engine (standard/neural) and domain (news/conversational).
        engine: Optional[str] = None
        qset = {q.lower() for q in qualities}
        if "neural" in qset:
            engine = "neural"
        elif "standard" in qset:
            engine = "standard"

        domain: Optional[str] = None
        if "conversational" in qset:
            domain = "conversational"
        elif "news" in qset:
            domain = "news"

        ssml = _build_ssml(text=body.text, rate=rate, pitch=pitch, intonation=intonation, domain=domain)
        ssml_no_domain = ssml if domain is None else _build_ssml(text=body.text, rate=rate, pitch=pitch, intonation=intonation, domain=None)

        key = self._cache_key(
            user_id=ctx.userId,
            text=body.text,
            voice_id=voice["voiceId"],
            voice_qualities=qualities,
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
            polly_params: Dict[str, Any] = {
                "Text": ssml,
                "TextType": "ssml",
                "OutputFormat": "mp3",
                "VoiceId": voice_key,
            }
            if engine:
                polly_params["Engine"] = engine

            try:
                polly_resp = self._polly.synthesize_speech(**polly_params)
            except ClientError as e:
                # If engine/domain/ssml combo isn't supported for this voice/region,
                # try a couple of safe fallbacks while keeping SSML whenever possible.
                try:
                    if polly_params.get("Engine") and polly_params["Engine"] != "standard":
                        polly_params["Engine"] = "standard"
                        polly_resp = self._polly.synthesize_speech(**polly_params)
                    elif domain is not None:
                        polly_params["Text"] = ssml_no_domain
                        polly_resp = self._polly.synthesize_speech(**polly_params)
                    else:
                        raise
                except ClientError:
                    if domain is not None and polly_params.get("Text") != ssml_no_domain:
                        polly_params["Text"] = ssml_no_domain
                        polly_resp = self._polly.synthesize_speech(**polly_params)
                    else:
                        raise e
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
