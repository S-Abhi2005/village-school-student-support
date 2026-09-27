# Village School Platform - FastAPI Backend
*ಗ್ರಾಮೀಣ ವಿದ್ಯಾ ಸೇತು - ಬ್ಯಾಕೆಂಡ್ ಸೇವೆಗಳು*

This folder contains the complete RESTful backend built with Python FastAPI, SQLAlchemy ORM, Pydantic v2 schemas, and JWT/Bcrypt authentication.

---

### Key Architectural Features

1. **Role-Based Authentication (RBAC)**:
   - Super Admin (Headmaster / School Authority)
   - Teacher (Class Teacher / Instructor)
   - Parent (Rural Guardian / SMS & Voice recipient)
   - Student (Learner)
2. **Prepared for Android Student Application**:
   - Clean JSON endpoints with standard Bearer JWT authorization.
   - Low bandwidth payload responses suitable for village 2G/3G/4G connectivity.
3. **Prepared for AI & Voice Services**:
   - Audio attachment support in announcements (`has_voice_audio`, `audio_url`).
   - Hooks for automated Kannada speech-to-text and AI learning recommendations.
4. **PostgreSQL Integration**:
   - Connection pooling, strict relational models, indexes, and soft-delete safeguards.

---

### Local Development Setup

1. **Create Virtual Environment & Install Requirements**:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials & JWT secret
   ```

3. **Run Dev Server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **API Documentation**:
   - Interactive Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`
