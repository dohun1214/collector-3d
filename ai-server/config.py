from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    backend_internal_key: str = "3d-collector-internal-key-change-in-prod"
    uploads_base_path: str = "uploads"
    max_gsplat_steps: int = 7000
    ffmpeg_fps: int = 2
    colmap_executable: str = "colmap"
    vocab_tree_path: str = ""


settings = Settings()
