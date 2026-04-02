from __future__ import annotations

from typing import Any, Dict, List, Optional
from uuid import uuid4

from boto3.dynamodb.conditions import Attr

from echolab.core.config import get_settings
from echolab.repositories.dynamo import iso_now, table
from echolab.schemas.voices import VoiceCreate, VoiceUpdate


class VoicesRepository:
    def __init__(self):
        self._settings = get_settings()
        self._table = table(self._settings.voices_table_name)

    def list(self, *, enabled_only: bool, language: Optional[str], gender: Optional[str]) -> List[Dict[str, Any]]:
        filter_expr = None

        if enabled_only:
            filter_expr = Attr("enabled").eq(True)

        if language:
            expr = Attr("language").eq(language)
            filter_expr = expr if filter_expr is None else filter_expr & expr

        if gender:
            expr = Attr("gender").eq(gender)
            filter_expr = expr if filter_expr is None else filter_expr & expr

        scan_kwargs = {}
        if filter_expr is not None:
            scan_kwargs["FilterExpression"] = filter_expr

        items: List[Dict[str, Any]] = []
        resp = self._table.scan(**scan_kwargs)
        items.extend(resp.get("Items", []))
        while "LastEvaluatedKey" in resp:
            resp = self._table.scan(ExclusiveStartKey=resp["LastEvaluatedKey"], **scan_kwargs)
            items.extend(resp.get("Items", []))

        items.sort(key=lambda i: (i.get("language", ""), i.get("gender", ""), i.get("voiceId", "")))
        return items

    def get(self, voice_id: str) -> Optional[Dict[str, Any]]:
        resp = self._table.get_item(Key={"voiceId": voice_id})
        return resp.get("Item")

    def exists(self, voice_id: str) -> bool:
        return self.get(voice_id) is not None

    def find_by_provider_voice_key(self, provider: str, voice_key: str) -> Optional[Dict[str, Any]]:
        provider = (provider or "").strip()
        voice_key = (voice_key or "").strip()
        if not provider or not voice_key:
            return None

        filter_expr = Attr("provider").eq(provider) & Attr("voiceKey").eq(voice_key)
        resp = self._table.scan(FilterExpression=filter_expr, Limit=1)
        items = resp.get("Items", [])
        if items:
            return items[0]

        while "LastEvaluatedKey" in resp:
            resp = self._table.scan(
                FilterExpression=filter_expr,
                ExclusiveStartKey=resp["LastEvaluatedKey"],
                Limit=1,
            )
            items = resp.get("Items", [])
            if items:
                return items[0]

        return None

    def create(self, body: VoiceCreate) -> Dict[str, Any]:
        now = iso_now()
        voice_id = str(uuid4())
        item = {
            "voiceId": voice_id,
            "provider": body.provider,
            "voiceKey": body.voiceKey,
            "language": body.language,
            "gender": body.gender,
            "qualities": body.qualities or [],
            "displayName": body.displayName,
            "enabled": body.enabled,
            "createdAt": now,
            "updatedAt": now,
        }
        self._table.put_item(Item=item)
        return item

    def update(self, voice_id: str, body: VoiceUpdate) -> Optional[Dict[str, Any]]:
        existing = self.get(voice_id)
        if not existing:
            return None

        updates = body.model_dump(exclude_unset=True)
        if not updates:
            return existing

        existing.update(updates)
        existing["updatedAt"] = iso_now()
        self._table.put_item(Item=existing)
        return existing

    def delete(self, voice_id: str) -> bool:
        existing = self.get(voice_id)
        if not existing:
            return False
        self._table.delete_item(Key={"voiceId": voice_id})
        return True
