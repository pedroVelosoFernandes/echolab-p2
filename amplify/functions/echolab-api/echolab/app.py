from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from echolab.routers.admin import router as admin_router
from echolab.routers.health import router as health_router
from echolab.routers.me import router as me_router
from echolab.routers.tenant import router as tenant_router
from echolab.routers.voices import router as voices_router

app = FastAPI(title="EchoLab API", version="1.0")


@app.exception_handler(HTTPException)
def _http_exception_handler(_request: Request, exc: HTTPException):
    status_code = int(getattr(exc, "status_code", 500) or 500)
    detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)

    if status_code == 401:
        err_type = "authentication_error"
    elif status_code == 403:
        err_type = "authorization_error"
    elif status_code == 404:
        err_type = "not_found"
    elif status_code == 409:
        err_type = "conflict"
    elif status_code == 400:
        err_type = "validation_error"
    else:
        err_type = "http_error"

    return JSONResponse(
        status_code=status_code,
        content={"detail": detail, "status": status_code, "type": err_type},
    )


@app.exception_handler(RequestValidationError)
def _validation_exception_handler(_request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "status": 422,
            "type": "validation_error",
            "errors": exc.errors(),
        },
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(me_router)
app.include_router(voices_router)
app.include_router(tenant_router)
app.include_router(admin_router)
