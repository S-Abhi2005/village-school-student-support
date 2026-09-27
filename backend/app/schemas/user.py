from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    phone_number: str
    full_name: str
    full_name_kn: Optional[str] = None
    role: UserRole
    preferred_language: str = "kn"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    is_phone_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
