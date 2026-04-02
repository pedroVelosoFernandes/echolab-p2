from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class Voice(BaseModel):
    voiceId: str
    provider: str
    voiceKey: str
    language: str
    gender: str
    qualities: List[str] = Field(default_factory=list)
    displayName: Optional[str] = None
    enabled: bool
    createdAt: str
    updatedAt: str


class VoiceCreate(BaseModel):
    provider: str
    voiceKey: str
    language: str
    gender: str
    qualities: List[str] = Field(default_factory=list)
    displayName: Optional[str] = None
    enabled: bool


class VoiceUpdate(BaseModel):
    provider: Optional[str] = None
    voiceKey: Optional[str] = None
    language: Optional[str] = None
    gender: Optional[str] = None
    qualities: Optional[List[str]] = None
    displayName: Optional[str] = None
    enabled: Optional[bool] = None
