from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class SynthesizeRequest(BaseModel):
    text: str = Field(min_length=1)
    presetId: Optional[str] = None

    language: Optional[str] = None
    gender: Optional[str] = None
    rate: Optional[float] = None
    pitch: Optional[float] = None
    intonation: Optional[float] = None


class SynthesizeResponse(BaseModel):
    url: str
    cached: bool
