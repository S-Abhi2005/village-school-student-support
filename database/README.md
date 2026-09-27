# Database Architecture & Foundation
## Village School Digital Learning, Student Development & Parent–Teacher Support Platform
*ಕನ್ನಡ: ಗ್ರಾಮೀಣ ವಿದ್ಯಾ ಸೇತು ದತ್ತಾಂಶ ವಾಸ್ತುಶಿಲ್ಪ*

This folder contains the PostgreSQL database schema, relational constraints, indices, and sample bootstrap seed data for the Village School platform.

---

### 1. Entity-Relationship Overview

The database design cleanly isolates authentication (`users`) from domain roles (`teachers`, `parents`, `students`), allowing single identity management, role-based access control (RBAC), and future multi-role extension without table pollution.

```
                    ┌─────────────────┐
                    │      USERS      │
                    │ (Auth, RBAC,    │
                    │  Kannada/EN)    │
                    └────────┬────────┘
           ┌─────────────────┼─────────────────┐
           │ 1:1             │ 1:1             │ 1:1
           ▼                 ▼                 ▼
   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
   │   TEACHERS    │ │    PARENTS    │ │   STUDENTS    │
   │ Employee Code │ │ Village/Taluk │ │ Roll, Adm No  │
   │ Qualification │ │ Voice Pref.   │ │ Nali-Kali Lvl │
   └───────┬───────┘ └───────┬───────┘ └───────┬───────┘
           │                 │                 │
           │ Assigned To     │ 1:N Children    │ Belongs To
           ▼                 ▼                 ▼
   ┌───────────────┐                 ┌───────────────┐
   │    CLASSES    │◄────────────────┤  ATTENDANCE   │
   │ Grade 1-10    │                 │ Daily Status  │
   │ Room, Medium  │                 │ SMS/Voice Log │
   └───────┬───────┘                 └───────────────┘
           │
           │ N:M mapping via teacher_class_subjects
           ▼
   ┌───────────────┐
   │   SUBJECTS    │
   │ Kannada First │
   │ Math, Science │
   └───────────────┘
```

---

### 2. Core Tables Specification

1. **`users`**:
   - `id`: UUID Primary Key
   - `username`, `email`, `phone_number`: Unique credentials
   - `password_hash`: Bcrypt hashed strings
   - `role`: `user_role_enum` (`SUPER_ADMIN`, `TEACHER`, `PARENT`, `STUDENT`)
   - `preferred_language`: Defaults to `'kn'` (Kannada) for rural context, supports `'en'`.

2. **`classes`**:
   - Primary and secondary classes (Grade 1 to 10).
   - Flag `is_nali_kali`: Enables multi-grade milestone tracking for primary grades 1–3 common in Karnataka government rural schools.
   - `medium`: `medium_enum` (`KANNADA`, `ENGLISH`, `BILINGUAL`).

3. **`subjects`**:
   - Dual-language names (`name_en`, `name_kn`), e.g., *ಕನ್ನಡ ಪ್ರಥಮ ಭಾಷೆ* (Kannada 1st Lang), *ಪರಿಸರ ಅಧ್ಯಯನ* (Environmental Studies), *ಗಣಿತ* (Mathematics).
   - Curriculum standard and period allocation.

4. **`teachers`**:
   - Linked to `users` with `ON DELETE CASCADE`.
   - Employee ID, qualifications, subject specialization, and primary class stewardship.

5. **`parents`**:
   - Village demographic context: `village_name`, `gram_panchayat`, `taluk`, `district`.
   - Communication accessibility: `preferred_contact_method` (`VOICE_CALL` / `SMS` / `APP`) and `can_read_kannada`.

6. **`students`**:
   - Linked to `users`, `classes`, and `parents`.
   - Fields for `nali_kali_level`, `is_midday_meal_beneficiary` (PM-POSHAN scheme), and blood group.

7. **`attendance_records` & `announcements`**:
   - Daily attendance ledger with `parent_notified` flag.
   - Announcements supporting Kannada text, audio URL recordings for voice alerts.

---

### 3. Preparation for Future Extensions

- **Future Android Student App**: REST endpoints authenticate via JWT Bearer tokens; payload includes student `class_id` and `nali_kali_level` for lightweight offline syncing over low-bandwidth village 2G/4G networks.
- **Future AI Services**: Clean foreign key references allow an AI Remediation Agent to read attendance gaps, subject difficulty scores, and generate automated Kannada audio explanations.
- **Future Voice Services**: Parent model stores voice preference and phone numbers formatted for IVR / Twilio / Exotel voice call broadcasting.
- **Push & SMS Notifications**: Notification logs tie directly to parent IDs and student IDs.
