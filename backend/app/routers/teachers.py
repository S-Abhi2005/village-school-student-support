from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.profiles import Teacher
from app.models.user import UserRole
from app.schemas.profiles import TeacherResponse
from app.services.auth_service import require_roles

router = APIRouter(prefix="/teachers", tags=["Teachers"])

@router.get("/", response_model=List[TeacherResponse])
def list_teachers(
    db: Session = Depends(get_db),
    _user = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.TEACHER]))
):
    """Retrieve teacher staff directory."""
    return db.query(Teacher).all()
