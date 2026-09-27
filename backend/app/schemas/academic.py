from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.academic import MediumEnum

class SchoolClassBase(BaseModel):
    grade_level: int
    section: str = "A"
    academic_year: str = "2026-2027"
    medium: MediumEnum = MediumEnum.KANNADA
    room_number: Optional[str] = None
    is_nali_kali: bool = False

class SchoolClassCreate(SchoolClassBase):
    pass

class SchoolClassResponse(SchoolClassBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    subject_code: str
    name_en: str
    name_kn: str
    grade_level: int
    is_language_subject: bool = False
    curriculum_board: str = "KSEEB - Karnataka State"
    weekly_periods: int = 6
    icon_name: Optional[str] = "book-open"

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
