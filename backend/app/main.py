from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth_router,
    users_router,
    academic_router,
    students_router,
    teachers_router,
    parents_router,
    dashboard_router
)

# Initialize database tables
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    # Graceful pass in case of offline dev environment without running postgres container
    pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API services for the Village School Digital Learning, Student Development & Parent-Teacher Support Platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration for web & mobile frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
api_v1 = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1)
app.include_router(dashboard_router, prefix=api_v1)
app.include_router(academic_router, prefix=api_v1)
app.include_router(students_router, prefix=api_v1)
app.include_router(teachers_router, prefix=api_v1)
app.include_router(parents_router, prefix=api_v1)
app.include_router(users_router, prefix=api_v1)

@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint for container orchestrators and status monitoring."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "school": settings.SCHOOL_NAME,
        "school_kn": settings.SCHOOL_NAME_KN,
        "api_version": "v1"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "documentation": "/docs",
        "health": "/health"
    }
