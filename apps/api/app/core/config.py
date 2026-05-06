from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

API_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = API_ROOT.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(REPO_ROOT / ".env", API_ROOT / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = Field(
        default="AI Research Workspace SaaS API",
        validation_alias="APP_NAME",
    )
    environment: str = Field(default="local", validation_alias="ENVIRONMENT")
    api_v1_prefix: str = Field(default="/api/v1", validation_alias="API_V1_PREFIX")

    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/research_workspace",
        validation_alias="DATABASE_URL",
    )
    postgres_user: str = Field(default="postgres", validation_alias="POSTGRES_USER")
    postgres_password: str = Field(default="postgres", validation_alias="POSTGRES_PASSWORD")
    postgres_db: str = Field(default="research_workspace", validation_alias="POSTGRES_DB")
    postgres_host: str = Field(default="localhost", validation_alias="POSTGRES_HOST")
    postgres_port: int = Field(default=5432, validation_alias="POSTGRES_PORT")

    redis_url: str = Field(default="redis://localhost:6379/0", validation_alias="REDIS_URL")
    secret_key: str = Field(
        default="change-me-in-local-development",
        validation_alias="SECRET_KEY",
    )
    access_token_expire_minutes: int = Field(
        default=60,
        validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES",
    )
    upload_dir: Path = Field(default=API_ROOT / "uploads", validation_alias="UPLOAD_DIR")
    max_upload_size_bytes: int = Field(
        default=25 * 1024 * 1024,
        validation_alias="MAX_UPLOAD_SIZE_BYTES",
    )

    default_admin_email: str | None = Field(
        default=None,
        validation_alias="DEFAULT_ADMIN_EMAIL",
    )
    default_admin_name: str | None = Field(
        default=None,
        validation_alias="DEFAULT_ADMIN_NAME",
    )
    default_admin_password: str | None = Field(
        default=None,
        validation_alias="DEFAULT_ADMIN_PASSWORD",
    )
    default_admin_reset_password: bool = Field(
        default=False,
        validation_alias="DEFAULT_ADMIN_RESET_PASSWORD",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
