from __future__ import annotations

from datetime import datetime, timezone
from functools import lru_cache

import boto3

from echolab.core.config import Settings, get_settings


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@lru_cache
def _settings() -> Settings:
    return get_settings()


@lru_cache
def dynamodb_resource():
    s = _settings()
    return boto3.resource("dynamodb", region_name=s.aws_region)


def table(name: str):
    return dynamodb_resource().Table(name)
