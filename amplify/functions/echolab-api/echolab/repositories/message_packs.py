from __future__ import annotations

from typing import Any, Dict, List, Optional, Union
from uuid import uuid4

from boto3.dynamodb.conditions import Key
from fastapi import HTTPException, status

from echolab.core.config import get_settings
from echolab.repositories.dynamo import iso_now, table
from echolab.schemas.message_packs import MessagePackCreate, MessagePackUpdate


class MessagePacksRepository:
    def __init__(self):
        self._settings = get_settings()
        self._table = table(self._settings.message_packs_table_name)

    def list_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        resp = self._table.query(KeyConditionExpression=Key("userId").eq(user_id))
        items = resp.get("Items", [])
        items.sort(key=lambda i: i.get("name", ""))
        return items

    def get(self, user_id: str, pack_id: str) -> Optional[Dict[str, Any]]:
        resp = self._table.get_item(Key={"userId": user_id, "packId": pack_id})
        return resp.get("Item")

    def create(self, user_id: str, body: MessagePackCreate, *, presets_repo) -> Dict[str, Any]:
        if not body.messages:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="messages cannot be empty")

        names = [m.messageName for m in body.messages]
        if len(set(names)) != len(names):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="messageName must be unique")

        preset_ids = [m.presetId for m in body.messages]
        if not presets_repo.all_exist_for_user(user_id, preset_ids):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="presetId not found")

        now = iso_now()
        pack_id = str(uuid4())
        item: Dict[str, Any] = {
            "userId": user_id,
            "packId": pack_id,
            "name": body.name,
            "messages": [m.model_dump() for m in body.messages],
            "createdAt": now,
            "updatedAt": now,
        }
        self._table.put_item(Item=item)
        return item

    def update(self, user_id: str, pack_id: str, body: MessagePackUpdate, *, presets_repo) -> Optional[Dict[str, Any]]:
        existing = self.get(user_id, pack_id)
        if not existing:
            return None

        updates = body.model_dump(exclude_unset=True)
        if "messages" in updates and updates["messages"] is not None:
            messages = updates["messages"]
            if not messages:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="messages cannot be empty")
            names = [m["messageName"] for m in messages]
            if len(set(names)) != len(names):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="messageName must be unique")
            preset_ids = [m["presetId"] for m in messages]
            if not presets_repo.all_exist_for_user(user_id, preset_ids):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="presetId not found")
            existing["messages"] = messages

        if "name" in updates and updates["name"] is not None:
            existing["name"] = updates["name"]

        existing["updatedAt"] = iso_now()
        self._table.put_item(Item=existing)
        return existing

    def delete(self, user_id: str, pack_id: str) -> bool:
        existing = self.get(user_id, pack_id)
        if not existing:
            return False
        self._table.delete_item(Key={"userId": user_id, "packId": pack_id})
        return True

    def delete_message(self, user_id: str, pack_id: str, message_name: str) -> Union[Dict[str, Any], bool, None]:
        existing = self.get(user_id, pack_id)
        if not existing:
            return None

        messages = existing.get("messages") or []
        new_messages = [m for m in messages if m.get("messageName") != message_name]
        if len(new_messages) == len(messages):
            return False

        existing["messages"] = new_messages
        existing["updatedAt"] = iso_now()
        self._table.put_item(Item=existing)
        return existing
