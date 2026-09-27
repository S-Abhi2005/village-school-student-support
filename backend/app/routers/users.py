from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserCreate
from app.services.security import get_password_hash
from app.services.auth_service import require_roles

router = APIRouter(prefix="/users", tags=["Users Management"])

@router.get("/", response_model=List[UserResponse])
def list_users(
    role: UserRole = None,
    db: Session = Depends(get_db),
    _user = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    """List system users, filtered optionally by role (Super Admin only)."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.all()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _user = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    """Register a new user account with hashed password (Super Admin only)."""
    existing = db.query(User).filter(
        (User.username == payload.username) | 
        (User.phone_number == payload.phone_number)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username or phone number already exists."
        )

    user_data = payload.model_dump()
    raw_password = user_data.pop("password")
    user_data["password_hash"] = get_password_hash(raw_password)

    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
