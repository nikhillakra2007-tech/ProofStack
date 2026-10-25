"""Database and application configuration with unified environment variables and validation."""
from typing import Optional
from urllib.parse import urlparse
from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    database_url: str = Field(
        default="sqlite:///./proofstack.db",
        validation_alias=AliasChoices("database_url", "DATABASE_URL", "postgres_dsn", "POSTGRES_DSN"),
        description="Database connection URL (PostgreSQL for production/shared, SQLite for local dev/testing)",
    )

    # Security & Authentication
    secret_key: str = Field(
        default="change-me-in-production",
        validation_alias=AliasChoices("secret_key", "SECRET_KEY", "jwt_secret", "JWT_SECRET"),
        description="Cryptographic secret key for signing JWTs and session tokens",
    )
    auth_algorithm: str = Field(
        default="HS256",
        validation_alias=AliasChoices("auth_algorithm", "AUTH_ALGORITHM"),
        description="Algorithm used for JWT token signing (HS256 or RS256)",
    )
    jwt_expiration_minutes: int = Field(
        default=1440,
        validation_alias=AliasChoices("jwt_expiration_minutes", "JWT_EXPIRATION_MINUTES"),
        description="JWT session expiration time in minutes (default 24h)",
    )
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001",
        validation_alias=AliasChoices("cors_origins", "CORS_ORIGINS"),
        description="Comma-separated list of allowed origins. Wildcard * is prohibited when credentials are enabled.",
    )

    # Redis & Event Bus
    redis_url: str = Field(
        default="",
        validation_alias=AliasChoices("redis_url", "REDIS_URL"),
        description="Redis connection URL for multi-worker distributed event delivery and background coordination",
    )

    # Environment
    proofstack_env: str = Field(
        default="development",
        validation_alias=AliasChoices("proofstack_env", "PROOFSTACK_ENV"),
        description="Environment mode: development, test, or production",
    )

    # Storage paths
    data_dir: str = "./data"
    artifact_dir: str = "./artifacts"

    # AI Model Provider & Sandboxing
    nebius_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("nebius_api_key", "NEBIUS_API_KEY"),
        description="API key for NVIDIA Nemotron / Nebius inference provider",
    )
    nebius_project_id: str = Field(
        default="",
        validation_alias=AliasChoices("nebius_project_id", "NEBIUS_PROJECT_ID"),
    )
    nebius_base_url: str = Field(
        default="https://api.tokenfactory.nebius.com/v1",
        validation_alias=AliasChoices("nebius_base_url", "NEBIUS_BASE_URL", "token_factory_base_url", "TOKEN_FACTORY_BASE_URL"),
    )
    contree_base_url: str = "https://api.tokenfactory.nebius.com/sandboxes"
    model_diagnosis: str = "nvidia/nemotron-3-super-120b"
    model_patch: str = "nvidia/nemotron-3.5-lightning"
    sandbox_backend: str = Field(
        default="local_container",
        validation_alias=AliasChoices("sandbox_backend", "SANDBOX_BACKEND"),
    )
    proofstack_target: str = Field(
        default="fixtures.demo_app",
        validation_alias=AliasChoices("proofstack_target", "PROOFSTACK_TARGET"),
    )

    # Networking
    host: str = "127.0.0.1"
    port: int = 8765

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        protected_namespaces=("settings_",),
        extra="ignore",
    )

    @property
    def is_production(self) -> bool:
        return self.proofstack_env.strip().lower() == "production"

    @property
    def safe_database_url(self) -> str:
        """Returns database URL with masked password for safe logging and telemetry."""
        if not self.database_url:
            return ""
        if self.database_url.startswith("sqlite"):
            return self.database_url
        try:
            parsed = urlparse(self.database_url)
            if parsed.password:
                netloc = f"{parsed.username}:***@{parsed.hostname}"
                if parsed.port:
                    netloc += f":{parsed.port}"
                return parsed._replace(netloc=netloc).geturl()
            return self.database_url
        except Exception:
            return "masked_database_url"

    def validate_for_production(self) -> list[str]:
        """Returns a list of configuration errors if running in production mode."""
        errors: list[str] = []
        if not self.is_production:
            return errors

        # 1. Prohibit SQLite in production
        if self.database_url.startswith("sqlite"):
            errors.append(
                "Production mode requires a production-grade database (PostgreSQL). "
                "SQLite is prohibited in production. Set POSTGRES_DSN / DATABASE_URL."
            )

        # 2. Check secret key
        insecure_secrets = {
            "change-me-in-production",
            "dev-secret-do-not-use-in-prod-replace-with-rs256-key",
            "secret",
            "",
        }
        if self.secret_key in insecure_secrets or len(self.secret_key) < 32:
            errors.append(
                "Insecure or short secret_key configured for production. "
                "Provide a secure random string of at least 32 characters in JWT_SECRET / SECRET_KEY."
            )

        # 3. Check CORS wildcard
        origins = [o.strip() for o in self.cors_origins.split(",") if o.strip()]
        if "*" in origins:
            errors.append(
                "CORS origins cannot contain wildcard '*' when credentialed requests are allowed in production."
            )

        return errors


settings = Settings()
