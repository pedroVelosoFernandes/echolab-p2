from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

from fastapi import Depends, HTTPException, Request, status
from pydantic import BaseModel


class UserContext(BaseModel):
    userId: str
    tenantId: str
    isAdmin: bool
    groups: List[str]


def _parse_groups(raw: Any) -> List[str]:
    if raw is None:
        return []
    if isinstance(raw, list):
        return [str(g) for g in raw if str(g).strip()]
    if isinstance(raw, str):
        s = raw.strip()
        if not s:
            return []
        if s.startswith("["):
            try:
                parsed = json.loads(s)
                if isinstance(parsed, list):
                    return [str(g) for g in parsed if str(g).strip()]
            except Exception:
                pass
        if "," in s:
            return [part.strip() for part in s.split(",") if part.strip()]
        return [s]
    return [str(raw)]


def _get_jwt_claims(request: Request) -> Dict[str, Any]:
    event = request.scope.get("aws.event")
    if not isinstance(event, dict):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    try:
        return event["requestContext"]["authorizer"]["jwt"]["claims"]
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


def get_user_context(request: Request) -> UserContext:
    claims = _get_jwt_claims(request)

    user_id = claims.get("sub") or claims.get("username")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    tenant_id = claims.get("custom:tenantId") or "default"

    groups = _parse_groups(claims.get("cognito:groups"))
    is_admin = "admin" in set(groups)

    return UserContext(userId=str(user_id), tenantId=str(tenant_id), isAdmin=is_admin, groups=groups)


def require_auth(ctx: UserContext = Depends(get_user_context)) -> UserContext:
    return ctx


def require_admin(ctx: UserContext = Depends(get_user_context)) -> UserContext:
    if not ctx.isAdmin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return ctx
