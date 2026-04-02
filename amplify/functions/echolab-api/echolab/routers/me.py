from fastapi import APIRouter, Depends, HTTPException, status

from echolab.core.auth import UserContext, require_auth
from echolab.schemas.common import ItemsResponse
from echolab.schemas.message_packs import MessagePack, MessagePackCreate, MessagePackUpdate
from echolab.schemas.presets import Preset, PresetCreate
from echolab.schemas.synthesize import SynthesizeRequest, SynthesizeResponse
from echolab.schemas.voice_defaults import UserVoiceSelectionsResponse, UserVoiceSelectionsUpsertRequest, VoiceSelection
from echolab.repositories.message_packs import MessagePacksRepository
from echolab.repositories.presets import PresetsRepository
from echolab.repositories.voice_defaults import VoiceDefaultsRepository
from echolab.services.synthesize import SynthesizeService

router = APIRouter(prefix="/me")


@router.get("", response_model=UserContext)
def get_me(ctx: UserContext = Depends(require_auth)):
    return ctx


@router.get("/presets", response_model=ItemsResponse[Preset])
def list_presets(ctx: UserContext = Depends(require_auth)):
    repo = PresetsRepository()
    return {"items": repo.list_by_user(ctx.userId)}


@router.post("/presets", response_model=Preset, status_code=status.HTTP_201_CREATED)
def create_preset(body: PresetCreate, ctx: UserContext = Depends(require_auth)):
    repo = PresetsRepository()
    return repo.create(ctx.userId, body)


@router.delete("/presets/{preset_id}")
def delete_preset(preset_id: str, ctx: UserContext = Depends(require_auth)):
    repo = PresetsRepository()
    deleted = repo.delete(ctx.userId, preset_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Preset not found")
    return {"deleted": True}


@router.get("/message-packs", response_model=ItemsResponse[MessagePack])
def list_message_packs(ctx: UserContext = Depends(require_auth)):
    repo = MessagePacksRepository()
    return {"items": repo.list_by_user(ctx.userId)}


@router.post("/message-packs", response_model=MessagePack, status_code=status.HTTP_201_CREATED)
def create_message_pack(body: MessagePackCreate, ctx: UserContext = Depends(require_auth)):
    presets_repo = PresetsRepository()
    packs_repo = MessagePacksRepository()
    return packs_repo.create(ctx.userId, body, presets_repo=presets_repo)


@router.get("/message-packs/{pack_id}", response_model=MessagePack)
def get_message_pack(pack_id: str, ctx: UserContext = Depends(require_auth)):
    repo = MessagePacksRepository()
    pack = repo.get(ctx.userId, pack_id)
    if not pack:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message pack not found")
    return pack


@router.put("/message-packs/{pack_id}", response_model=MessagePack)
def update_message_pack(pack_id: str, body: MessagePackUpdate, ctx: UserContext = Depends(require_auth)):
    presets_repo = PresetsRepository()
    repo = MessagePacksRepository()
    updated = repo.update(ctx.userId, pack_id, body, presets_repo=presets_repo)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message pack not found")
    return updated


@router.delete("/message-packs/{pack_id}")
def delete_message_pack(pack_id: str, ctx: UserContext = Depends(require_auth)):
    repo = MessagePacksRepository()
    deleted = repo.delete(ctx.userId, pack_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message pack not found")
    return {"deleted": True}


@router.delete("/message-packs/{pack_id}/messages/{message_name}", response_model=MessagePack)
def delete_message_from_pack(pack_id: str, message_name: str, ctx: UserContext = Depends(require_auth)):
    repo = MessagePacksRepository()
    updated = repo.delete_message(ctx.userId, pack_id, message_name)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message pack not found")
    if updated is False:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return updated


@router.get("/voice-selections", response_model=UserVoiceSelectionsResponse)
def get_voice_selections(ctx: UserContext = Depends(require_auth)):
    repo = VoiceDefaultsRepository()
    selections = repo.list_user_selections(ctx.userId)
    return {"userId": ctx.userId, "tenantId": ctx.tenantId, "selections": selections}


@router.put("/voice-selections", response_model=UserVoiceSelectionsResponse)
def put_voice_selections(body: UserVoiceSelectionsUpsertRequest, ctx: UserContext = Depends(require_auth)):
    repo = VoiceDefaultsRepository()
    selections = repo.replace_user_selections(ctx.userId, body.selections)
    return {"userId": ctx.userId, "tenantId": ctx.tenantId, "selections": selections}


@router.post("/synthesize", response_model=SynthesizeResponse)
def synthesize(body: SynthesizeRequest, ctx: UserContext = Depends(require_auth)):
    svc = SynthesizeService()
    return svc.synthesize(ctx, body)
