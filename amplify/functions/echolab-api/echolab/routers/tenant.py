from fastapi import APIRouter, Depends

from echolab.core.auth import UserContext, require_auth
from echolab.repositories.voice_defaults import VoiceDefaultsRepository
from echolab.schemas.voice_defaults import TenantDefaultsResponse

router = APIRouter(prefix="/tenant")


@router.get("/voice-defaults", response_model=TenantDefaultsResponse)
def get_tenant_defaults(ctx: UserContext = Depends(require_auth)):
    repo = VoiceDefaultsRepository()
    defaults = repo.list_tenant_defaults(ctx.tenantId)
    return {"tenantId": ctx.tenantId, "defaults": defaults}
