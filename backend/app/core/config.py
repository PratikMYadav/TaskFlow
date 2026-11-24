import os
from typing import List
from urllib.parse import quote_plus
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "TaskFlow"
    ENV: str = "development"
    API_V1_STR: str = "/api"

    # Security & JWT
    SECRET_KEY: str = "taskflow_super_secret_jwt_key_change_in_production_123456789"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # MySQL Database Connection Details
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = ""
    MYSQL_DATABASE: str = "taskflow_db"

    # Frontend CORS Origins
    FRONTEND_URL: str = "http://localhost:3000"

    # Optional direct Database URI override (for testing or cloud hosting like Railway)
    DATABASE_URL: str = ""

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def get_database_url(self) -> str:
        if self.ENV == "testing":
            return "sqlite:///:memory:"
        if self.DATABASE_URL:
            return self.DATABASE_URL
        # URL-encode password in case it contains special characters (@, :, /, %, etc.)
        encoded_password = quote_plus(self.MYSQL_PASSWORD)
        return (
            f"mysql+pymysql://{self.MYSQL_USER}:{encoded_password}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}?charset=utf8mb4"
        )

    @property
    def cors_origins(self) -> List[str]:
        origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
        if self.FRONTEND_URL and self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL)
        return origins


settings = Settings()
