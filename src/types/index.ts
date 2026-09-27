export type UserRole = 'SUPER_ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';

export type Language = 'en' | 'kn';

export interface User {
  id: string;
  username: string;
  email?: string;
  phoneNumber: string;
  fullName: string;
  fullNameKn?: string;
  displayNameEn?: string;
  role: UserRole;
  preferredLanguage: Language;
  avatarUrl?: string;
  isActive: boolean;
  isPhoneVerified: boolean;
  passwordHash?: string;
}

export interface SchoolClass {
  id: string;
  gradeLevel: number;
  section: string;
  academicYear: string;
  medium: 'KANNADA' | 'ENGLISH' | 'BILINGUAL';
  roomNumber: string;
  isNaliKali: boolean;
  studentCount?: number;
  classTeacherName?: string;
}

export interface Subject {
  id: string;
  code: string;
  nameEn: string;
  nameKn: string;
  gradeLevel: number;
  isLanguage: boolean;
  weeklyPeriods: number;
  iconName: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  employeeCode: string;
  qualification: string;
  specialization: string;
  assignedClassId?: string;
  joinedDate: string;
  bioKn?: string;
  user: User;
}

export interface ParentProfile {
  id: string;
  userId: string;
  relationship: string;
  occupation: string;
  villageName: string;
  gramPanchayat: string;
  taluk: string;
  district: string;
  preferredContact: 'VOICE_CALL' | 'SMS' | 'APP';
  canReadKannada: boolean;
  user: User;
  children: StudentProfile[];
}

export interface StudentProfile {
  id: string;
  userId: string;
  admissionNumber: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  firstNameKn: string;
  lastNameKn: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  classId: string;
  className: string;
  parentId?: string;
  parentName?: string;
  parentPhone?: string;
  naliKaliLevel?: string;
  isMiddayMealBeneficiary: boolean;
  bloodGroup?: string;
  emergencyPhone: string;
  attendanceRate: number;
}

export type NotificationType =
  // Parent
  | 'TEST_PUBLISHED'
  | 'RESULT_PUBLISHED'
  | 'ATTENDANCE_UPDATE'
  | 'TEACHER_ANNOUNCEMENT'
  | 'CONCERN_RESPONSE'
  | 'PROGRESS_UPDATE'
  // Teacher
  | 'PARENT_CONCERN'
  | 'REPORT_VIEWED'
  | 'TEST_SUBMISSION'
  | 'SUSPICIOUS_EXAM_ACTIVITY'
  | 'STUDENT_ACTIVITY'
  // Student
  | 'LEARNING_MATERIAL'
  // General fallback
  | 'ANNOUNCEMENT'
  | 'VOICE_ALERT';

export type ReportType =
  | 'MARKS_REPORT'
  | 'ATTENDANCE_REPORT'
  | 'PROGRESS_REPORT'
  | 'TEST_REPORT';

export interface NotificationItem {
  id: string;
  type?: NotificationType;
  titleEn: string;
  titleKn: string;
  bodyEn: string;
  bodyKn: string;
  category: 'ANNOUNCEMENT' | 'ATTENDANCE' | 'ACADEMIC' | 'HEALTH' | 'VOICE_ALERT' | 'REPORT' | 'TEST' | 'CONCERN';
  targetRole?: UserRole | 'ALL';
  targetUserId?: string;
  targetStudentId?: string;
  createdAt: string;
  timestamp?: number;
  isRead: boolean;
  isUrgent?: boolean;
  audioDurationSeconds?: number;
  metadata?: {
    studentId?: string;
    studentName?: string;
    studentRoll?: string;
    parentId?: string;
    parentName?: string;
    reportType?: ReportType;
    reportTitle?: string;
    testId?: string;
    testTitle?: string;
    score?: number;
    totalMarks?: number;
    concernId?: string;
    actionTab?: string;
    linkView?: string;
  };
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';
  date: string;
  remarks?: string;
  parentNotified: boolean;
}

export interface TestItem {
  id: string;
  titleEn: string;
  titleKn: string;
  subjectCode: string;
  subjectName: string;
  gradeLevel: number;
  totalMarks: number;
  passingMarks: number;
  testDate: string;
  durationMinutes: number;
  questionsCount: number;
  isVoiceEnabled?: boolean;
}

export interface StudentMarkRecord {
  id: string;
  testId: string;
  testTitle: string;
  studentId: string;
  studentName: string;
  subjectCode: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  teacherRemarks: string;
  teacherRemarksKn: string;
  recordedAt: string;
}

export interface LearningMaterial {
  id: string;
  titleEn: string;
  titleKn: string;
  subjectCode: string;
  gradeLevel: number;
  type: 'PDF' | 'AUDIO_STORY' | 'WORKSHEET' | 'VIDEO';
  descriptionEn: string;
  descriptionKn: string;
  fileSizeOrDuration: string;
  downloadUrl?: string;
  isKannadaMedium: boolean;
}

export type ConcernCategory = 
  | 'NOT_STUDYING'
  | 'EXCESSIVE_MOBILE'
  | 'EXCESSIVE_TV'
  | 'HOMEWORK_DIFFICULTY'
  | 'ATTENDANCE_CONCERN'
  | 'SUBJECT_DIFFICULTY'
  | 'BEHAVIOUR_CONCERN'
  | 'SCHOOL_RELATED'
  | 'OTHER'
  | 'ACADEMIC'
  | 'ATTENDANCE'
  | 'MIDDAY_MEAL'
  | 'HEALTH'
  | 'BUS_TRANSPORT';

export type ConcernPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ConcernStatus = 
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'ACTION_TAKEN'
  | 'FOLLOW_UP'
  | 'RESOLVED'
  | 'IN_REVIEW'; // backwards compatibility

export interface ConcernStatusHistoryItem {
  status: ConcernStatus;
  timestamp: string;
  note?: string;
  updatedBy: string;
}

export interface ParentConcern {
  id: string;
  parentId: string;
  parentName: string;
  parentPhone?: string;
  studentId: string;
  studentName: string;
  studentGrade?: string;
  category: ConcernCategory;
  priority?: ConcernPriority;
  subject: string;
  description: string;
  status: ConcernStatus;
  createdAt: string;
  updatedAt?: string;
  teacherResponse?: string;
  actionTaken?: string;
  followUpDate?: string;
  followUpStatus?: string;
  teacherNotes?: string; // Private internal notes for teacher only
  reviewedByTeacherId?: string;
  reviewedByTeacherName?: string;
  resolvedAt?: string;
  statusHistory?: ConcernStatusHistoryItem[];
}

export interface StudentSupportSummary {
  studentId: string;
  studentName: string;
  studentNameKn?: string;
  gradeLevel: string;
  attendanceRate: number;
  attendanceIndicator: string;
  attendanceIndicatorKn: string;
  recentTestAverage: number;
  strongestSubject: string;
  needsAttentionSubject?: string;
  learningActivityMetric: string;
  learningActivityMetricKn: string;
  voicePracticeScore: number;
  supportIndicators: string[];
  supportIndicatorsKn: string[];
  activeConcernsCount: number;
}

export interface VoiceAssessment {
  id: string;
  studentId: string;
  studentName: string;
  titleEn: string;
  titleKn: string;
  promptTextKn: string;
  audioDurationSec: number;
  scorePercentage: number;
  fluencyScore: number; // 1-10
  accuracyScore: number; // 1-10
  pronunciationNotesKn: string;
  pronunciationNotesEn: string;
  recordedDate: string;
  status: 'EVALUATED' | 'PENDING';
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  language: 'kn' | 'en';
  timestamp: string;
  isVoiceAudioAvailable?: boolean;
}

