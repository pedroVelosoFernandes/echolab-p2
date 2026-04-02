import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    aws_region: str

    voices_table_name: str
    presets_table_name: str
    message_packs_table_name: str
    voice_selections_table_name: str
    tenant_defaults_table_name: str

    audio_bucket_name: str
    presign_expires_seconds: int = 3600


def _require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required env var: {name}")
    return value


def get_settings() -> Settings:
    return Settings(
        aws_region=os.getenv("AWS_REGION", "us-east-1"),
        voices_table_name=_require_env("VOICES_TABLE_NAME"),
        presets_table_name=_require_env("PRESETS_TABLE_NAME"),
        message_packs_table_name=_require_env("MESSAGE_PACKS_TABLE_NAME"),
        voice_selections_table_name=_require_env("VOICE_SELECTIONS_TABLE_NAME"),
        tenant_defaults_table_name=_require_env("TENANT_DEFAULTS_TABLE_NAME"),
        audio_bucket_name=_require_env("AUDIO_BUCKET_NAME"),
    )
