from app.schemas.auth import LoginRequest, Token, TokenPayload
from app.schemas.user import UserBase, UserCreate, UserResponse
from app.schemas.academic import SchoolClassBase, SchoolClassCreate, SchoolClassResponse, SubjectBase, SubjectCreate, SubjectResponse
from app.schemas.profiles import TeacherResponse, ParentResponse, StudentResponse

__all__ = [
    "LoginRequest", "Token", "TokenPayload",
    "UserBase", "UserCreate", "UserResponse",
    "SchoolClassBase", "SchoolClassCreate", "SchoolClassResponse",
    "SubjectBase", "SubjectCreate", "SubjectResponse",
    "TeacherResponse", "ParentResponse", "StudentResponse"
]
