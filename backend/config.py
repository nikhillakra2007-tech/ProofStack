"""Database and application configuration."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./proofstack.db"
    secret_key: str = "change-me-in-production"
    cors_origins: str = "http://localhost:3000"
    data_dir: str = "./data"
    artifact_dir: str = "./artifacts"
    nebius_api_key: str = ""
    nebius_project_id: str = ""
    nebius_base_url: str = "https://api.tokenfactory.nebius.com/v1"
    contree_base_url: str = "https://api.tokenfactory.nebius.com/sandboxes"
    model_diagnosis: str = "nvidia/nemotron-3-super-120b"
    model_patch: str = "nvidia/nemotron-3.5-lightning"
    host: str = "127.0.0.1"
    port: int = 8765
    proofstack_env: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        protected_namespaces=("settings_",),
        extra="ignore",
    )


settings = Settings()
