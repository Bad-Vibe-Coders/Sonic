from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="SONIC_", env_file=".env", extra="ignore"
    )

    env: str = "dev"
    secret_key: str = "dev-secret-key"
    access_token_expire_minutes: int = 60
    refresh_token_expire_minutes: int = 60 * 24 * 14

    database_url: str = "postgresql+asyncpg://sonic:sonic@localhost:5432/sonic"
    redis_url: str = "redis://localhost:6379/0"
    cors_origins: list[str] = ["http://localhost:5180"]

    # storage
    storage_backend: str = "s3"  # "s3" | "local"
    s3_endpoint_url: str = "http://localhost:9000"
    s3_access_key: str = "sonic"
    s3_secret_key: str = "sonic-secret"
    s3_bucket: str = "sonic-audio"
    local_storage_dir: str = "./data/audio"

    # pipeline feature flags
    enable_asr: bool = True
    asr_model: str = "base"
    enable_diarization: bool = True
    enable_emotion: bool = True
    enable_nlp: bool = True
    enable_llm: bool = True
    enable_qa: bool = True
    enable_prediction: bool = True
    enable_indexing: bool = True

    llm_model: str = "claude-sonnet-5"
    qa_rules_path: str = "rules/qa_rules.yaml"

    @property
    def sync_database_url(self) -> str:
        """Celery workers use a sync engine; derive the sync URL."""
        return (
            self.database_url.replace("+asyncpg", "+psycopg2")
            .replace("+aiosqlite", "")
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
