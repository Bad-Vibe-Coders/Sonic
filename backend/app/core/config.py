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

    # SON-65: subdomain-per-tenant resolution (*.{base_domain}). Custom CNAME
    # is out of scope for v1 -- see backend/app/core/tenant_resolution.py.
    # Disabled by default so it's a no-op until DNS/wildcard-cert infra for
    # base_domain actually exists in an environment.
    base_domain: str = "sonic.app"
    enforce_host_tenant_resolution: bool = False

    # rate limiting (slowapi) — storage defaults to redis_url; override (e.g. "memory://")
    # for environments without Redis, such as tests.
    rate_limit_storage_url: str | None = None
    rate_limit_login: str = "8/minute"
    rate_limit_register: str = "20/hour"
    rate_limit_refresh: str = "30/minute"
    rate_limit_forgot_password: str = "5/hour"

    @property
    def effective_rate_limit_storage_url(self) -> str:
        return self.rate_limit_storage_url or self.redis_url

    # storage
    storage_backend: str = "s3"  # "s3" | "local"
    s3_endpoint_url: str = "http://localhost:9000"
    s3_access_key: str = "sonic"
    s3_secret_key: str = "sonic-secret"
    s3_bucket: str = "sonic-audio"
    local_storage_dir: str = "./data/audio"

    # pipeline feature flags
    enable_asr: bool = True
    asr_backend: str = "banglaspeech2text"  # "banglaspeech2text" | "faster-whisper"
    asr_model: str = "base"
    enable_diarization: bool = True
    enable_emotion: bool = True
    enable_nlp: bool = True
    enable_llm: bool = True
    enable_qa: bool = True
    enable_prediction: bool = True
    enable_indexing: bool = True

    llm_provider: str = "ollama"  # "ollama" | "anthropic"
    llm_model: str = "mistral"    # Ollama tag (Mistral 7B) or Claude model id
    ollama_base_url: str = "http://localhost:11434"
    ollama_timeout_seconds: float = 120.0
    qa_rules_path: str = "rules/qa_rules.yaml"

    # email (password reset, etc.) — unset smtp_host means no provider is
    # configured, so app/services/email.py logs the message instead of
    # sending it (see that module's docstring).
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: str = "no-reply@sonic.dev"
    smtp_use_tls: bool = True
    frontend_base_url: str = "http://localhost:5180"
    password_reset_token_expire_minutes: int = 30

    @property
    def sync_database_url(self) -> str:
        """Celery workers use a sync engine; derive the sync URL."""
        return (
            self.database_url.replace("+asyncpg", "+psycopg2")
            .replace("+aiosqlite", "")
        )


_DEFAULT_SECRET_KEY = "dev-secret-key"
_DEFAULT_S3_SECRET_KEY = "sonic-secret"


def _check_prod_secrets(settings: Settings) -> None:
    """Refuse to boot in prod with placeholder secrets checked into the repo.

    A prod deploy that forgets to set SONIC_SECRET_KEY would otherwise sign
    every JWT with a publicly-known key.
    """
    if settings.env != "prod":
        return
    if settings.secret_key == _DEFAULT_SECRET_KEY:
        raise RuntimeError(
            "SONIC_SECRET_KEY is still set to the default dev value. "
            "Set a real secret before running with SONIC_ENV=prod."
        )
    if settings.storage_backend == "s3" and settings.s3_secret_key == _DEFAULT_S3_SECRET_KEY:
        raise RuntimeError(
            "SONIC_S3_SECRET_KEY is still set to the default dev value. "
            "Set a real secret before running with SONIC_ENV=prod."
        )


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    _check_prod_secrets(settings)
    return settings
