-- ====================================================================
-- Village School Digital Learning & Parent-Teacher Platform
-- Grameena Vidya Setu (ಗ್ರಾಮೀಣ ವಿದ್ಯಾ ಸೇತು)
-- PostgreSQL Database Initialization & Migration Schema
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and types if recreating
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS parent_teacher_messages CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS teacher_class_subjects CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS parents CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role_enum CASCADE;
DROP TYPE IF EXISTS gender_enum CASCADE;
DROP TYPE IF EXISTS medium_enum CASCADE;
DROP TYPE IF EXISTS attendance_status_enum CASCADE;

-- --------------------------------------------------------------------
-- ENUM TYPES
-- --------------------------------------------------------------------
CREATE TYPE user_role_enum AS ENUM (
    'SUPER_ADMIN',  -- School Headmaster / BEO / Admin
    'TEACHER',      -- Class Teacher / Subject Instructor
    'PARENT',       -- Mother / Father / Guardian
    'STUDENT'       -- Village School Student
);

CREATE TYPE gender_enum AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);

CREATE TYPE medium_enum AS ENUM (
    'KANNADA',
    'ENGLISH',
    'BILINGUAL'
);

CREATE TYPE attendance_status_enum AS ENUM (
    'PRESENT',
    'ABSENT',
    'EXCUSED',
    'LATE'
);

-- --------------------------------------------------------------------
-- 1. USERS TABLE (Central Authentication & Base Profile)
-- --------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    full_name_kn VARCHAR(120), -- Kannada script representation
    role user_role_enum NOT NULL DEFAULT 'STUDENT',
    preferred_language VARCHAR(5) NOT NULL DEFAULT 'kn', -- 'kn' or 'en'
    avatar_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_username ON users(username);

-- --------------------------------------------------------------------
-- 2. CLASSES TABLE (Grades 1 to 10 & Sections)
-- --------------------------------------------------------------------
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_level SMALLINT NOT NULL CHECK (grade_level BETWEEN 1 AND 10),
    section VARCHAR(5) NOT NULL DEFAULT 'A',
    academic_year VARCHAR(15) NOT NULL DEFAULT '2026-2027',
    medium medium_enum NOT NULL DEFAULT 'KANNADA',
    room_number VARCHAR(20),
    is_nali_kali BOOLEAN NOT NULL DEFAULT FALSE, -- Multi-grade Nali-Kali methodology (Grades 1-3)
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_grade_section_year UNIQUE (grade_level, section, academic_year)
);

CREATE INDEX idx_classes_grade ON classes(grade_level, academic_year);

-- --------------------------------------------------------------------
-- 3. SUBJECTS TABLE (State Curriculum & Kannada-first learning)
-- --------------------------------------------------------------------
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_kn VARCHAR(100) NOT NULL, -- e.g. 'ಕನ್ನಡ ಪ್ರಥಮ ಭಾಷೆ', 'ಗಣಿತ', 'ಪರಿಸರ ಅಧ್ಯಯನ'
    grade_level SMALLINT NOT NULL CHECK (grade_level BETWEEN 1 AND 10),
    is_language_subject BOOLEAN NOT NULL DEFAULT FALSE,
    curriculum_board VARCHAR(50) NOT NULL DEFAULT 'KSEEB - Karnataka State',
    weekly_periods SMALLINT DEFAULT 6,
    icon_name VARCHAR(50) DEFAULT 'book-open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subjects_grade ON subjects(grade_level);

-- --------------------------------------------------------------------
-- 4. TEACHERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_code VARCHAR(30) UNIQUE NOT NULL,
    qualification VARCHAR(100) NOT NULL, -- e.g. 'B.Ed, M.A. Kannada', 'D.Ed, B.Sc'
    specialization VARCHAR(100) NOT NULL,
    assigned_class_teacher_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    bio_kn TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teachers_user ON teachers(user_id);

-- --------------------------------------------------------------------
-- 5. PARENTS TABLE (Tailored for Rural Families)
-- --------------------------------------------------------------------
CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    relationship_to_student VARCHAR(30) NOT NULL DEFAULT 'Father', -- 'Father', 'Mother', 'Guardian'
    occupation VARCHAR(100), -- Agriculture / Small business / Artisan
    village_name VARCHAR(100) NOT NULL,
    gram_panchayat VARCHAR(100),
    taluk VARCHAR(100) DEFAULT 'Hosahalli',
    district VARCHAR(100) DEFAULT 'Hassan',
    preferred_contact_method VARCHAR(20) DEFAULT 'VOICE_CALL', -- 'VOICE_CALL' / 'SMS' / 'APP'
    can_read_kannada BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_parents_user ON parents(user_id);
CREATE INDEX idx_parents_village ON parents(village_name);

-- --------------------------------------------------------------------
-- 6. STUDENTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    admission_number VARCHAR(30) UNIQUE NOT NULL,
    roll_number VARCHAR(20) NOT NULL,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    first_name_kn VARCHAR(60),
    last_name_kn VARCHAR(60),
    date_of_birth DATE NOT NULL,
    gender gender_enum NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
    nali_kali_level VARCHAR(20), -- For primary grades 1-3: e.g. 'Milestone 4'
    is_midday_meal_beneficiary BOOLEAN NOT NULL DEFAULT TRUE,
    blood_group VARCHAR(10),
    emergency_contact_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_parent ON students(parent_id);
CREATE INDEX idx_students_admission ON students(admission_number);

-- --------------------------------------------------------------------
-- 7. TEACHER-CLASS-SUBJECT MAPPING
-- --------------------------------------------------------------------
CREATE TABLE teacher_class_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    academic_year VARCHAR(15) NOT NULL DEFAULT '2026-2027',
    CONSTRAINT uq_teacher_class_subject UNIQUE (teacher_id, class_id, subject_id, academic_year)
);

CREATE INDEX idx_tcs_teacher ON teacher_class_subjects(teacher_id);
CREATE INDEX idx_tcs_class ON teacher_class_subjects(class_id);

-- --------------------------------------------------------------------
-- 8. ATTENDANCE RECORDS (Daily Register with Village School SMS/Voice Trigger)
-- --------------------------------------------------------------------
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status_enum NOT NULL DEFAULT 'PRESENT',
    marked_by_teacher_id UUID REFERENCES teachers(id),
    remarks VARCHAR(255),
    parent_notified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_attendance_date UNIQUE (student_id, attendance_date)
);

CREATE INDEX idx_attendance_date ON attendance_records(attendance_date, class_id);

-- --------------------------------------------------------------------
-- 9. ANNOUNCEMENTS & NOTICES (Bilingual broadcast for school community)
-- --------------------------------------------------------------------
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en VARCHAR(200) NOT NULL,
    title_kn VARCHAR(200) NOT NULL,
    body_en TEXT NOT NULL,
    body_kn TEXT NOT NULL,
    target_role user_role_enum, -- NULL means broadcast to everyone
    published_by_user_id UUID NOT NULL REFERENCES users(id),
    is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
    has_voice_audio BOOLEAN NOT NULL DEFAULT FALSE,
    audio_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- UPDATED_AT TRIGGER FUNCTION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER trg_classes_updated BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER trg_subjects_updated BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER trg_teachers_updated BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER trg_parents_updated BEFORE UPDATE ON parents FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ====================================================================
-- SEED DATA (Authentic Karnataka Village School Sample Dataset)
-- ====================================================================

-- 1. Classes
INSERT INTO classes (id, grade_level, section, academic_year, medium, room_number, is_nali_kali) VALUES
('c1111111-1111-1111-1111-111111111111', 1, 'A', '2026-2027', 'KANNADA', 'Room 1 (Nali-Kali)', TRUE),
('c2222222-2222-2222-2222-222222222222', 3, 'A', '2026-2027', 'KANNADA', 'Room 3', TRUE),
('c3333333-3333-3333-3333-333333333333', 5, 'A', '2026-2027', 'KANNADA', 'Room 5', FALSE),
('c4444444-4444-4444-4444-444444444444', 7, 'A', '2026-2027', 'BILINGUAL', 'Room 7', FALSE);

-- 2. Subjects
INSERT INTO subjects (id, subject_code, name_en, name_kn, grade_level, is_language_subject, icon_name) VALUES
('s1111111-1111-1111-1111-111111111111', 'KAN-05', 'Kannada First Language', 'ಕನ್ನಡ ಪ್ರಥಮ ಭಾಷೆ', 5, TRUE, 'book-open'),
('s2222222-2222-2222-2222-222222222222', 'ENG-05', 'English Second Language', 'ಇಂಗ್ಲಿಷ್ ದ್ವಿತೀಯ ಭಾಷೆ', 5, TRUE, 'languages'),
('s3333333-3333-3333-3333-333333333333', 'MAT-05', 'Mathematics', 'ಗಣಿತ', 5, FALSE, 'calculator'),
('s4444444-4444-4444-4444-444444444444', 'EVS-05', 'Environmental Studies', 'ಪರಿಸರ ಅಧ್ಯಯನ', 5, FALSE, 'leaf'),
('s5555555-5555-5555-5555-555555555555', 'SCI-07', 'General Science', 'ಸಾಮಾನ್ಯ ವಿಜ್ಞಾನ', 7, FALSE, 'flask-conical');

-- 3. Super Admin User
INSERT INTO users (id, username, email, phone_number, password_hash, full_name, full_name_kn, role, preferred_language) VALUES
('u1111111-1111-1111-1111-111111111111', 'admin', 'headmaster.hosahalli@education.kar.gov.in', '9845012345', '$2b$12$e7rEwF1W0O2V0G5pB51VbeG5vYp5jHq6J9tJ3oGZ3rM7pB3o5sZ9q', 'Sri Basavaraj Patil (Headmaster)', 'ಶ್ರೀ ಬಸವರಾಜ್ ಪಾಟೀಲ್ (ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು)', 'SUPER_ADMIN', 'kn');

-- 4. Teacher User & Profile
INSERT INTO users (id, username, email, phone_number, password_hash, full_name, full_name_kn, role, preferred_language) VALUES
('u2222222-2222-2222-2222-222222222222', 'teacher', 'savitri.teacher@school.in', '9845098765', '$2b$12$e7rEwF1W0O2V0G5pB51VbeG5vYp5jHq6J9tJ3oGZ3rM7pB3o5sZ9q', 'Smt. Savitri Hegde', 'ಶ್ರೀಮತಿ ಸಾವಿತ್ರಿ ಹೆಗಡೆ', 'TEACHER', 'kn');

INSERT INTO teachers (id, user_id, employee_code, qualification, specialization, assigned_class_teacher_id, joined_date, bio_kn) VALUES
('t1111111-1111-1111-1111-111111111111', 'u2222222-2222-2222-2222-222222222222', 'EMP-KA-8842', 'B.Ed, M.A. Kannada', 'Kannada & Social Studies', 'c3333333-3333-3333-3333-333333333333', '2019-06-01', '೧೫ ವರ್ಷಗಳ ಗ್ರಾಮೀಣ ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ ಅನುಭವ. ನಲಿಕಲಿ ಪರಿಣಿತರು.');

-- 5. Parent User & Profile
INSERT INTO users (id, username, email, phone_number, password_hash, full_name, full_name_kn, role, preferred_language) VALUES
('u3333333-3333-3333-3333-333333333333', 'parent', 'ramesh.gowda@ruralmail.in', '9900112233', '$2b$12$e7rEwF1W0O2V0G5pB51VbeG5vYp5jHq6J9tJ3oGZ3rM7pB3o5sZ9q', 'Sri Ramesh Gowda', 'ಶ್ರೀ ರಮೇಶ್ ಗೌಡ', 'PARENT', 'kn');

INSERT INTO parents (id, user_id, relationship_to_student, occupation, village_name, gram_panchayat, taluk, district, preferred_contact_method, can_read_kannada) VALUES
('p1111111-1111-1111-1111-111111111111', 'u3333333-3333-3333-3333-333333333333', 'Father', 'Agriculture (ರೈತರು)', 'Hosahalli Village', 'Hosahalli Gram Panchayat', 'Channarayapatna', 'Hassan', 'VOICE_CALL', TRUE);

-- 6. Student User & Profile
INSERT INTO users (id, username, email, phone_number, password_hash, full_name, full_name_kn, role, preferred_language) VALUES
('u4444444-4444-4444-4444-444444444444', 'student', 'kavya.gowda@student.in', '9900112234', '$2b$12$e7rEwF1W0O2V0G5pB51VbeG5vYp5jHq6J9tJ3oGZ3rM7pB3o5sZ9q', 'Kavya R. Gowda', 'ಕಾವ್ಯಾ ಆರ್. ಗೌಡ', 'STUDENT', 'kn');

INSERT INTO students (id, user_id, admission_number, roll_number, first_name, last_name, first_name_kn, last_name_kn, date_of_birth, gender, class_id, parent_id, nali_kali_level, is_midday_meal_beneficiary, emergency_contact_phone) VALUES
('s1111111-2222-3333-4444-555555555555', 'u4444444-4444-4444-4444-444444444444', 'ADM-2024-042', '05-A-12', 'Kavya', 'Gowda', 'ಕಾವ್ಯಾ', 'ಗೌಡ', '2015-08-14', 'FEMALE', 'c3333333-3333-3333-3333-333333333333', 'p1111111-1111-1111-1111-111111111111', 'Competent / Level 5', TRUE, '9900112233');

-- 7. Announcements
INSERT INTO announcements (title_en, title_kn, body_en, body_kn, published_by_user_id, is_urgent, has_voice_audio) VALUES
('School Development & Monitoring Committee (SDMC) Meeting', 'ಶಾಲಾ ಅಭಿವೃದ್ಧಿ ಮತ್ತು ಮೇಲುಸ್ತುವಾರಿ ಸಮಿತಿ (SDMC) ಸಭೆ', 'The monthly SDMC meeting will be held on Friday at 2:00 PM in the school prayer hall. All parents and village elders are requested to attend.', 'ಶುಕ್ರವಾರ ಮಧ್ಯಾಹ್ನ ೨:೦೦ ಗಂಟೆಗೆ ಶಾಲಾ ಪ್ರಾರ್ಥನಾ ಮಂದಿರದಲ್ಲಿ ಮಾಸಿಕ SDMC ಸಭೆ ನಡೆಯಲಿದೆ. ಎಲ್ಲಾ ಪೋಷಕರು ಮತ್ತು ಗ್ರಾಮದ ಮುಖಂಡರು ಭಾಗವಹಿಸಲು ಕೋರಲಾಗಿದೆ.', 'u1111111-1111-1111-1111-111111111111', FALSE, TRUE),
('Mid-Day Meal Special Egg / Banana Distribution & Deworming Camp', 'ಬಿಸಿಯೂಟ ವಿಶೇಷ ಮೊಟ್ಟೆ/ಬಾಳೆಹಣ್ಣು ಮತ್ತು ಜಂತುಹುಳು ನಿವಾರಣಾ ದಿನ', 'Primary healthcare team from PHC Hosahalli will conduct health check-ups and nutritional supplement distribution tomorrow morning.', 'ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ ಹೊಸಹಳ್ಳಿಯ ವೈದ್ಯಕೀಯ ತಂಡವು ವಿದ್ಯಾರ್ಥಿಗಳ ಆರೋಗ್ಯ ತಪಾಸಣೆ ಮತ್ತು ಪೌಷ್ಟಿಕಾಂಶ ವಿತರಣೆ ನಡೆಸಲಿದೆ.', 'u2222222-2222-2222-2222-222222222222', TRUE, TRUE);
