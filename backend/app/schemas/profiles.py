from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel
from app.models.profiles import GenderEnum
from app.schemas.user import UserResponse
from app.schemas.academic import SchoolClassResponse

class TeacherResponse(BaseModel):
    id: str
    user_id: str
    employee_code: str
    qualification: str
    specialization: str
    assigned_class_teacher_id: Optional[str] = None
    joined_date: date
    bio_kn: Optional[str] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ParentResponse(BaseModel):
    id: str
    user_id: str
    relationship_to_student: str
    occupation: Optional[str] = None
    village_name: str
    gram_panchayat: Optional[str] = None
    taluk: Optional[str] = None
    district: Optional[str] = None
    preferred_contact_method: str
    can_read_kannada: bool
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class StudentResponse(BaseModel):
    id: str
    user_id: str
    admission_number: str
    roll_number: str
    first_name: str
    last_name: str
    first_name_kn: Optional[str] = None
    last_name_kn: Optional[str] = None
    date_of_birth: date
    gender: GenderEnum
    class_id: str
    parent_id: Optional[str] = None
    nali_kali_level: Optional[str] = None
    is_midday_meal_beneficiary: bool
    blood_group: Optional[str] = None
    emergency_contact_phone: str
    user: Optional[UserResponse] = None
    school_class: Optional[SchoolClassResponse] = None

    class Config:
        from_attributes = True
