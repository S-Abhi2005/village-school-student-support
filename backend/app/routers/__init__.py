from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.academic import router as academic_router
from app.routers.students import router as students_router
from app.routers.teachers import router as teachers_router
from app.routers.parents import router as parents_router
from app.routers.dashboard import router as dashboard_router

__all__ = [
    "auth_router",
    "users_router",
    "academic_router",
    "students_router",
    "teachers_router",
    "parents_router",
    "dashboard_router"
]
