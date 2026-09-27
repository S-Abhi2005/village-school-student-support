import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Village School Digital Learning & Parent-Teacher Platform"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/village_school_db"
    )
    
    # JWT & Auth
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "village_school_super_secret_jwt_key_2026_dev")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # School localization
    SCHOOL_NAME: str = "Govt. Model Primary School, Hosahalli"
    SCHOOL_NAME_KN: str = "ಸರ್ಕಾರಿ ಮಾದರಿ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಹೊಸಹಳ್ಳಿ"
    DEFAULT_LANGUAGE: str = "kn"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "*"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
