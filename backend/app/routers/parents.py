from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.profiles import Parent
from app.models.user import UserRole
from app.schemas.profiles import ParentResponse
from app.services.auth_service import require_roles

router = APIRouter(prefix="/parents", tags=["Parents"])

@router.get("/", response_model=List[ParentResponse])
def list_parents(
    db: Session = Depends(get_db),
    _user = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.TEACHER]))
):
    """Retrieve parents list for community outreach."""
    return db.query(Parent).all()
