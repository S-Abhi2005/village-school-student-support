from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.academic import SchoolClass, Subject
from app.models.user import UserRole
from app.schemas.academic import SchoolClassResponse, SchoolClassCreate, SubjectResponse, SubjectCreate
from app.services.auth_service import get_current_user, require_roles

router = APIRouter(prefix="/academic", tags=["Classes & Subjects"])

@router.get("/classes", response_model=List[SchoolClassResponse])
def list_classes(db: Session = Depends(get_db)):
    """Fetch all classes (Grades 1 to 10) in the school."""
    return db.query(SchoolClass).order_by(SchoolClass.grade_level, SchoolClass.section).all()

@router.post("/classes", response_model=SchoolClassResponse, status_code=status.HTTP_201_CREATED)
def create_class(
    payload: SchoolClassCreate, 
    db: Session = Depends(get_db),
    _user = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    """Create a new class section (Super Admin only)."""
    new_class = SchoolClass(**payload.model_dump())
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class

@router.get("/subjects", response_model=List[SubjectResponse])
def list_subjects(grade_level: int = None, db: Session = Depends(get_db)):
    """Fetch subjects offered, optionally filtered by grade level."""
    query = db.query(Subject)
    if grade_level:
        query = query.filter(Subject.grade_level == grade_level)
    return query.order_by(Subject.grade_level, Subject.name_en).all()

@router.post("/subjects", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(
    payload: SubjectCreate,
    db: Session = Depends(get_db),
    _user = Depends(require_roles([UserRole.SUPER_ADMIN]))
):
    """Add a new subject to curriculum (Super Admin only)."""
    subject = Subject(**payload.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject
