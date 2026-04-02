from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key
from fastapi import HTTPException, status

from echolab.core.config import get_settings
from echolab.repositories.dynamo import table
from echolab.repositories.voices import VoicesRepository
from echolab.schemas.voice_defaults import TenantDefaultVoice, VoiceSelection


def _pair_key(language: str, gender: str) -> str:
    return f"{language}#{gender}"


class VoiceDefaultsRepository:
    def __init__(self):
        self._settings = get_settings()
        self._user_table = table(self._settings.voice_selections_table_name)
        self._tenant_table = table(self._settings.tenant_defaults_table_name)
        self._voices_repo = VoicesRepository()

    def list_user_selections(self, user_id: str) -> List[Dict[str, Any]]:
        resp = self._user_table.query(KeyConditionExpression=Key("userId").eq(user_id))
        items = resp.get("Items", [])
        items.sort(key=lambda i: i.get("pairKey", ""))
        return [
            {"language": i["language"], "gender": i["gender"], "voiceId": i["voiceId"]}
            for i in items
        ]

    def replace_user_selections(self, user_id: str, selections: List[VoiceSelection]) -> List[Dict[str, Any]]:
        pairs: List[Tuple[str, str]] = [(s.language, s.gender) for s in selections]
        if len(set(pairs)) != len(pairs):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="(language, gender) must be unique")

        for s in selections:
            if not self._voices_repo.exists(s.voiceId):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="voiceId not found")

        # delete all existing
        existing = self.list_user_selections(user_id)
        for e in existing:
            self._user_table.delete_item(Key={"userId": user_id, "pairKey": _pair_key(e["language"], e["gender"])})

        # insert new
        for s in selections:
            self._user_table.put_item(
                Item={
                    "userId": user_id,
                    "pairKey": _pair_key(s.language, s.gender),
                    "language": s.language,
                    "gender": s.gender,
                    "voiceId": s.voiceId,
                }
            )

        return [s.model_dump() for s in selections]

    def list_tenant_defaults(self, tenant_id: str) -> List[Dict[str, Any]]:
        resp = self._tenant_table.query(KeyConditionExpression=Key("tenantId").eq(tenant_id))
        items = resp.get("Items", [])
        items.sort(key=lambda i: i.get("pairKey", ""))
        return [
            {"language": i["language"], "gender": i["gender"], "voiceId": i["voiceId"]}
            for i in items
        ]

    def replace_tenant_defaults(self, tenant_id: str, defaults: List[TenantDefaultVoice]) -> List[Dict[str, Any]]:
        pairs = [(d.language, d.gender) for d in defaults]
        if len(set(pairs)) != len(pairs):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="(language, gender) must be unique")

        for d in defaults:
            if not self._voices_repo.exists(d.voiceId):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="voiceId not found")

        existing = self.list_tenant_defaults(tenant_id)
        for e in existing:
            self._tenant_table.delete_item(Key={"tenantId": tenant_id, "pairKey": _pair_key(e["language"], e["gender"])})

        for d in defaults:
            self._tenant_table.put_item(
                Item={
                    "tenantId": tenant_id,
                    "pairKey": _pair_key(d.language, d.gender),
                    "language": d.language,
                    "gender": d.gender,
                    "voiceId": d.voiceId,
                }
            )

        return [d.model_dump() for d in defaults]

    def resolve_voice_for(self, *, user_id: str, tenant_id: str, language: str, gender: str) -> Optional[str]:
        # user selection
        resp = self._user_table.get_item(Key={"userId": user_id, "pairKey": _pair_key(language, gender)})
        item = resp.get("Item")
        if item and item.get("voiceId"):
            return item["voiceId"]

        # tenant default
        resp = self._tenant_table.get_item(Key={"tenantId": tenant_id, "pairKey": _pair_key(language, gender)})
        item = resp.get("Item")
        if item and item.get("voiceId"):
            return item["voiceId"]

        return None

    def is_voice_in_use(self, voice_id: str) -> bool:
        voice_id = (voice_id or "").strip()
        if not voice_id:
            return False

        filter_expr = Attr("voiceId").eq(voice_id)

        for t in (self._user_table, self._tenant_table):
            resp = t.scan(FilterExpression=filter_expr, Limit=1)
            if resp.get("Items"):
                return True
            while "LastEvaluatedKey" in resp:
                resp = t.scan(
                    FilterExpression=filter_expr,
                    ExclusiveStartKey=resp["LastEvaluatedKey"],
                    Limit=1,
                )
                if resp.get("Items"):
                    return True

        return False
