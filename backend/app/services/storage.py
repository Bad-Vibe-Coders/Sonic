"""Audio object storage: S3/MinIO by default, local directory for dev without Docker."""
import logging
import os
from pathlib import Path

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class StorageBackend:
    def put(self, key: str, data: bytes) -> None:
        raise NotImplementedError

    def get(self, key: str) -> bytes:
        raise NotImplementedError


class LocalStorage(StorageBackend):
    def __init__(self, base_dir: str | None = None):
        self.base = Path(base_dir or get_settings().local_storage_dir)
        self.base.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        path = (self.base / key).resolve()
        if not path.is_relative_to(self.base.resolve()):
            raise ValueError("invalid storage key")
        return path

    def put(self, key: str, data: bytes) -> None:
        path = self._path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)

    def get(self, key: str) -> bytes:
        return self._path(key).read_bytes()


class S3Storage(StorageBackend):
    def __init__(self) -> None:
        import boto3

        s = get_settings()
        self.bucket = s.s3_bucket
        self.client = boto3.client(
            "s3",
            endpoint_url=s.s3_endpoint_url,
            aws_access_key_id=s.s3_access_key,
            aws_secret_access_key=s.s3_secret_key,
        )
        try:
            self.client.head_bucket(Bucket=self.bucket)
        except Exception:
            self.client.create_bucket(Bucket=self.bucket)

    def put(self, key: str, data: bytes) -> None:
        self.client.put_object(Bucket=self.bucket, Key=key, Body=data)

    def get(self, key: str) -> bytes:
        body: bytes = self.client.get_object(Bucket=self.bucket, Key=key)["Body"].read()
        return body


def get_storage() -> StorageBackend:
    settings = get_settings()
    if settings.storage_backend == "local" or os.environ.get("SONIC_FORCE_LOCAL_STORAGE"):
        return LocalStorage()
    try:
        return S3Storage()
    except Exception:
        logger.warning("S3/MinIO unavailable — falling back to local storage")
        return LocalStorage()
