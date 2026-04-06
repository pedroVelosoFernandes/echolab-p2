from __future__ import annotations

from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import uuid4

from boto3.dynamodb.conditions import Key

from echolab.core.config import get_settings
from echolab.repositories.dynamo import table
from echolab.schemas.presets import PresetCreate


class PresetsRepository:
    def __init__(self):
        self._settings = get_settings()
        self._table = table(self._settings.presets_table_name)

    def list_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        resp = self._table.query(KeyConditionExpression=Key("userId").eq(user_id))
        items = resp.get("Items", [])
        items.sort(key=lambda i: i.get("name", ""))
        return items

    def get(self, user_id: str, preset_id: str) -> Optional[Dict[str, Any]]:
        resp = self._table.get_item(Key={"userId": user_id, "presetId": preset_id})
        return resp.get("Item")

    def create(self, user_id: str, body: PresetCreate) -> Dict[str, Any]:
        preset_id = str(uuid4())
        item: Dict[str, Any] = {
            "userId": user_id,
            "presetId": preset_id,
            "name": body.name,
            "language": body.language,
            "gender": body.gender,
            # DynamoDB (boto3) does not support float; use Decimal.
            "rate": Decimal(str(body.rate)),
            "pitch": Decimal(str(body.pitch)),
            "intonation": Decimal(str(body.intonation)),
        }
        self._table.put_item(Item=item)
        return item

    def delete(self, user_id: str, preset_id: str) -> bool:
        existing = self.get(user_id, preset_id)
        if not existing:
            return False
        self._table.delete_item(Key={"userId": user_id, "presetId": preset_id})
        return True

    def all_exist_for_user(self, user_id: str, preset_ids: List[str]) -> bool:
        wanted = {pid for pid in preset_ids if pid}
        if not wanted:
            return True
        # naive check: query all and compare
        items = self.list_by_user(user_id)
        have = {i.get("presetId") for i in items}
        return wanted.issubset(have)
