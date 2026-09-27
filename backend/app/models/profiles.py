import enum
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Date, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class GenderEnum(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    employee_code = Column(String(30), unique=True, nullable=False)
    qualification = Column(String(100), nullable=False)
    specialization = Column(String(100), nullable=False)
    assigned_class_teacher_id = Column(String(36), ForeignKey("classes.id", ondelete="SET NULL"), nullable=True)
    joined_date = Column(Date, default=date.today, nullable=False)
    bio_kn = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User")
    assigned_class = relationship("SchoolClass")

class Parent(Base):
    __tablename__ = "parents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    relationship_to_student = Column(String(30), default="Father", nullable=False)
    occupation = Column(String(100), nullable=True)
    village_name = Column(String(100), nullable=False)
    gram_panchayat = Column(String(100), nullable=True)
    taluk = Column(String(100), default="Hosahalli", nullable=True)
    district = Column(String(100), default="Hassan", nullable=True)
    preferred_contact_method = Column(String(20), default="VOICE_CALL", nullable=False)
    can_read_kannada = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User")
    children = relationship("Student", back_populates="parent")

class Student(Base):
    __tablename__ = "students"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    admission_number = Column(String(30), unique=True, nullable=False)
    roll_number = Column(String(20), nullable=False)
    first_name = Column(String(60), nullable=False)
    last_name = Column(String(60), nullable=False)
    first_name_kn = Column(String(60), nullable=True)
    last_name_kn = Column(String(60), nullable=True)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(Enum(GenderEnum), nullable=False)
    class_id = Column(String(36), ForeignKey("classes.id", ondelete="RESTRICT"), nullable=False)
    parent_id = Column(String(36), ForeignKey("parents.id", ondelete="SET NULL"), nullable=True)
    nali_kali_level = Column(String(30), nullable=True)
    is_midday_meal_beneficiary = Column(Boolean, default=True, nullable=False)
    blood_group = Column(String(10), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User")
    school_class = relationship("SchoolClass", back_populates="students")
    parent = relationship("Parent", back_populates="children")
