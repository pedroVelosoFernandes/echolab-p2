from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class MessagePackMessage(BaseModel):
    messageName: str = Field(min_length=1)
    presetId: str = Field(min_length=1)
    messageText: str = Field(min_length=1)


class MessagePack(BaseModel):
    packId: str
    userId: str
    name: str
    messages: List[MessagePackMessage]
    createdAt: str
    updatedAt: str


class MessagePackCreate(BaseModel):
    name: str = Field(min_length=1)
    messages: List[MessagePackMessage]


class MessagePackUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    messages: Optional[List[MessagePackMessage]] = None
