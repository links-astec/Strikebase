from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    bright_data_token: str = ""
    bright_data_serp_zone: str = ""
    bright_data_unlocker_zone: str = ""

    anthropic_api_key: str = ""
    aiml_api_key: str = ""

    supabase_url: str = ""
    supabase_service_key: str = ""

    cors_origins: str = "http://localhost:3000"
    port: int = 8000

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
