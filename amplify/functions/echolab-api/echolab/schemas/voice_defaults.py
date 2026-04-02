from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class VoiceSelection(BaseModel):
    language: str = Field(min_length=2)
    gender: str = Field(min_length=1)
    voiceId: str = Field(min_length=1)


class UserVoiceSelectionsResponse(BaseModel):
    userId: str
    tenantId: str
    selections: List[VoiceSelection]


class UserVoiceSelectionsUpsertRequest(BaseModel):
    selections: List[VoiceSelection]


class TenantDefaultVoice(BaseModel):
    language: str = Field(min_length=2)
    gender: str = Field(min_length=1)
    voiceId: str = Field(min_length=1)


class TenantDefaultsResponse(BaseModel):
    tenantId: str
    defaults: List[TenantDefaultVoice]


class TenantDefaultsUpsertRequest(BaseModel):
    tenantId: Optional[str] = None
    defaults: List[TenantDefaultVoice]
