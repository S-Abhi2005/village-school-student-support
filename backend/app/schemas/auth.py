from typing import Optional
from pydantic import BaseModel, Field
from app.models.user import UserRole

class LoginRequest(BaseModel):
    username: str = Field(..., description="Username, email, or phone number")
    password: str = Field(..., min_length=4)
    role: Optional[UserRole] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str
    username: str
    role: UserRole
    full_name: str
    preferred_language: str

class TokenPayload(BaseModel):
    sub: str  # user_id
    role: UserRole
    username: str
    exp: Optional[int] = None
