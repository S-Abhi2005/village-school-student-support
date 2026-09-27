from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.profiles import Student
from app.models.user import UserRole
from app.schemas.profiles import StudentResponse
from app.services.auth_service import get_current_user, require_roles

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/", response_model=List[StudentResponse])
def list_students(
    class_id: str = None, 
    db: Session = Depends(get_db),
    _user = Depends(require_roles([UserRole.SUPER_ADMIN, UserRole.TEACHER]))
):
    """Retrieve students roster with optional filter by class."""
    query = db.query(Student)
    if class_id:
        query = query.filter(Student.class_id == class_id)
    return query.all()

@router.get("/{student_id}", response_model=StudentResponse)
def get_student_by_id(
    student_id: str,
    db: Session = Depends(get_db),
    _user = Depends(get_current_user)
):
    """Retrieve specific student details."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student
