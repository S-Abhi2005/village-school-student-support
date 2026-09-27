import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class MediumEnum(str, enum.Enum):
    KANNADA = "KANNADA"
    ENGLISH = "ENGLISH"
    BILINGUAL = "BILINGUAL"

class SchoolClass(Base):
    __tablename__ = "classes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    grade_level = Column(Integer, nullable=False, index=True)
    section = Column(String(5), default="A", nullable=False)
    academic_year = Column(String(15), default="2026-2027", nullable=False)
    medium = Column(Enum(MediumEnum), default=MediumEnum.KANNADA, nullable=False)
    room_number = Column(String(20), nullable=True)
    is_nali_kali = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    students = relationship("Student", back_populates="school_class")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    subject_code = Column(String(20), unique=True, nullable=False)
    name_en = Column(String(100), nullable=False)
    name_kn = Column(String(100), nullable=False)
    grade_level = Column(Integer, nullable=False, index=True)
    is_language_subject = Column(Boolean, default=False, nullable=False)
    curriculum_board = Column(String(50), default="KSEEB - Karnataka State", nullable=False)
    weekly_periods = Column(Integer, default=6, nullable=False)
    icon_name = Column(String(50), default="book-open", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
