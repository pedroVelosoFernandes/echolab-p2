from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from echolab.core.auth import UserContext, require_admin
from echolab.repositories.voice_defaults import VoiceDefaultsRepository
from echolab.repositories.voices import VoicesRepository
from echolab.schemas.common import ItemsResponse
from echolab.schemas.voice_defaults import TenantDefaultsResponse, TenantDefaultsUpsertRequest
from echolab.schemas.voices import Voice, VoiceCreate, VoiceUpdate

router = APIRouter(prefix="/admin")


@router.get("/voices", response_model=ItemsResponse[Voice])
def admin_list_voices(
    language: Optional[str] = Query(default=None),
    gender: Optional[str] = Query(default=None),
    ctx: UserContext = Depends(require_admin),
):
    repo = VoicesRepository()
    return {"items": repo.list(enabled_only=False, language=language, gender=gender)}


@router.post("/voices", response_model=Voice, status_code=status.HTTP_201_CREATED)
def admin_create_voice(body: VoiceCreate, ctx: UserContext = Depends(require_admin)):
    repo = VoicesRepository()
    existing = repo.find_by_provider_voice_key(body.provider, body.voiceKey)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Voice already exists")
    return repo.create(body)


@router.put("/voices/{voice_id}", response_model=Voice)
def admin_update_voice(voice_id: str, body: VoiceUpdate, ctx: UserContext = Depends(require_admin)):
    repo = VoicesRepository()
    updated = repo.update(voice_id, body)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voice not found")
    return updated


@router.delete("/voices/{voice_id}")
def admin_delete_voice(voice_id: str, ctx: UserContext = Depends(require_admin)):
    repo = VoicesRepository()
    defaults_repo = VoiceDefaultsRepository()
    if defaults_repo.is_voice_in_use(voice_id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Voice in use")
    deleted = repo.delete(voice_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voice not found")
    return {"deleted": True}


@router.put("/tenant/voice-defaults", response_model=TenantDefaultsResponse)
def admin_put_tenant_defaults(body: TenantDefaultsUpsertRequest, ctx: UserContext = Depends(require_admin)):
    repo = VoiceDefaultsRepository()
    tenant_id = body.tenantId or ctx.tenantId
    defaults = repo.replace_tenant_defaults(tenant_id, body.defaults)
    return {"tenantId": tenant_id, "defaults": defaults}
