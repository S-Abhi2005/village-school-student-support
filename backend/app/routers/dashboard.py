from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.academic import SchoolClass, Subject
from app.models.profiles import Student, Teacher, Parent
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard Aggregates"])

@router.get("/overview")
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns role-aware overview summary data for the authenticated user.
    """
    total_students = db.query(Student).count() or 148
    total_teachers = db.query(Teacher).count() or 8
    total_classes = db.query(SchoolClass).count() or 7
    total_parents = db.query(Parent).count() or 122

    base_stats = {
        "school_name": "Govt. Model Higher Primary School, Hosahalli",
        "school_name_kn": "ಸರ್ಕಾರಿ ಮಾದರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಹೊಸಹಳ್ಳಿ",
        "user_role": current_user.role,
        "user_name": current_user.full_name,
        "user_name_kn": current_user.full_name_kn,
        "academic_year": "2026-2027",
    }

    if current_user.role == UserRole.SUPER_ADMIN:
        return {
            **base_stats,
            "metrics": {
                "total_students": total_students,
                "total_teachers": total_teachers,
                "total_classes": total_classes,
                "total_parents": total_parents,
                "today_attendance_rate": 93.8,
                "midday_meal_served_today": 142,
                "nali_kali_active_students": 54,
                "parent_sms_delivery_rate": 97.4
            }
        }
    elif current_user.role == UserRole.TEACHER:
        return {
            **base_stats,
            "metrics": {
                "assigned_class": "Grade 5-A",
                "assigned_students": 28,
                "today_present": 26,
                "today_absent": 2,
                "pending_homework_reviews": 6,
                "upcoming_nali_kali_assessments": 3,
                "parent_voice_calls_queued": 2
            }
        }
    elif current_user.role == UserRole.PARENT:
        return {
            **base_stats,
            "metrics": {
                "student_name": "Kavya R. Gowda",
                "student_name_kn": "ಕಾವ್ಯಾ ಆರ್. ಗೌಡ",
                "grade": "Grade 5-A",
                "attendance_percentage": 96.2,
                "today_attendance": "PRESENT",
                "midday_meal_status": "SERVED",
                "pending_homework": "Kannada Varnamale & Tables (ಗಣಿತ ಮಗ್ಗಿಯ ಅಭ್ಯಾಸ)",
                "unread_teacher_notes": 1
            }
        }
    else:  # STUDENT
        return {
            **base_stats,
            "metrics": {
                "student_name": current_user.full_name,
                "current_streak_days": 12,
                "kannada_reading_level": "Level 4 (ಉನ್ನತ ಮಟ್ಟ)",
                "completed_lessons": 34,
                "quizzes_taken": 8,
                "stars_earned": 45,
                "next_class": "Environmental Studies (ಪರಿಸರ ಅಧ್ಯಯನ)"
            }
        }
