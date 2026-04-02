from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from echolab.core.auth import UserContext, require_auth
from echolab.schemas.common import ItemsResponse
from echolab.schemas.voices import Voice
from echolab.repositories.voices import VoicesRepository

router = APIRouter()


@router.get("/voices", response_model=ItemsResponse[Voice])
def list_voices(
    language: Optional[str] = Query(default=None),
    gender: Optional[str] = Query(default=None),
    ctx: UserContext = Depends(require_auth),
):
    repo = VoicesRepository()
    return {"items": repo.list(enabled_only=True, language=language, gender=gender)}


@router.get("/voices/{voice_id}", response_model=Voice)
def get_voice(voice_id: str, ctx: UserContext = Depends(require_auth)):
    repo = VoicesRepository()
    voice = repo.get(voice_id)
    if not voice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voice not found")
    if not voice["enabled"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voice not found")
    return voice
