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

        # Check for direct database URL (Railway sets DATABASE_URL or MYSQL_URL automatically)
        db_url = os.environ.get("DATABASE_URL") or os.environ.get("MYSQL_URL") or self.DATABASE_URL
        if db_url:
            if db_url.startswith("mysql://"):
                db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)
            return db_url

        # Check environment variables with or without underscores (Railway sets MYSQLHOST, MYSQLUSER, etc.)
        host = os.environ.get("MYSQLHOST") or os.environ.get("MYSQL_HOST") or self.MYSQL_HOST
        port = os.environ.get("MYSQLPORT") or os.environ.get("MYSQL_PORT") or self.MYSQL_PORT
        user = os.environ.get("MYSQLUSER") or os.environ.get("MYSQL_USER") or self.MYSQL_USER
        password = os.environ.get("MYSQLPASSWORD") or os.environ.get("MYSQL_PASSWORD") or self.MYSQL_PASSWORD
        database = os.environ.get("MYSQLDATABASE") or os.environ.get("MYSQL_DATABASE") or self.MYSQL_DATABASE

        encoded_password = quote_plus(str(password))
        return (
            f"mysql+pymysql://{user}:{encoded_password}"
            f"@{host}:{port}/{database}?charset=utf8mb4"
        )

    @property
    def cors_origins(self) -> List[str]:
        origins = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]
        if self.FRONTEND_URL and self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL)
        return origins


settings = Settings()
