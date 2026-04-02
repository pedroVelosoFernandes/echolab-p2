from __future__ import annotations

from pydantic import BaseModel, Field, conint, confloat


Rate = confloat(ge=0.5, le=1.5)
Pitch = confloat(ge=0.5, le=1.5)
Intonation = confloat(ge=0.5, le=1.5)


class Preset(BaseModel):
    presetId: str
    userId: str
    name: str
    language: str
    gender: str
    rate: float
    pitch: float
    intonation: float


class PresetCreate(BaseModel):
    name: str = Field(min_length=1)
    language: str = Field(min_length=2)
    gender: str = Field(min_length=1)
    rate: Rate
    pitch: Pitch
    intonation: Intonation
