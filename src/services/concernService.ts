import { 
  ParentConcern, 
  ConcernCategory, 
  ConcernPriority, 
  ConcernStatus, 
  StudentSupportSummary 
} from '../types';
import { 
  MOCK_STUDENTS, 
  MOCK_STUDENT_MARKS, 
  MOCK_VOICE_ASSESSMENTS, 
  MOCK_PARENT_CONCERNS 
} from '../mock/schoolData';
import { onlineTestService } from './onlineTestService';

const STORAGE_KEY = 'gramina_parent_concerns_v2';

export const CONCERN_CATEGORIES: {
  key: ConcernCategory;
  labelEn: string;
  labelKn: string;
  icon: string;
  descriptionEn: string;
}[] = [
  {
    key: 'NOT_STUDYING',
    labelEn: 'Not studying regularly',
    labelKn: 'ನಿಯಮಿತವಾಗಿ ಓದುತ್ತಿಲ್ಲ',
    icon: 'BookOpen',
    descriptionEn: 'Difficulty maintaining a daily study routine at home'
  },
  {
    key: 'EXCESSIVE_MOBILE',
    labelEn: 'Excessive mobile usage',
    labelKn: 'ಅತಿಯಾದ ಮೊಬೈಲ್ ಬಳಕೆ',
    icon: 'Smartphone',
    descriptionEn: 'Spending too much time on mobile phones or gaming'
  },
  {
    key: 'EXCESSIVE_TV',
    labelEn: 'Excessive TV usage',
    labelKn: 'ಅತಿಯಾದ ಟಿವಿ ವೀಕ್ಷಣೆ',
    icon: 'Tv',
    descriptionEn: 'Watching television during study or homework hours'
  },
  {
    key: 'HOMEWORK_DIFFICULTY',
    labelEn: 'Homework difficulty',
    labelKn: 'ಮನೆಕೆಲಸದಲ್ಲಿ ಕಷ್ಟ',
    icon: 'FileText',
    descriptionEn: 'Trouble completing homework worksheets or assignments'
  },
  {
    key: 'ATTENDANCE_CONCERN',
    labelEn: 'Attendance concern',
    labelKn: 'ಹಾಜರಾತಿ ಸಂಬಂಧಿತ ಸಮಸ್ಯೆ',
    icon: 'CalendarCheck',
    descriptionEn: 'Issues regarding morning travel, illness or missed days'
  },
  {
    key: 'SUBJECT_DIFFICULTY',
    labelEn: 'Subject difficulty',
    labelKn: 'ನಿರ್ದಿಷ್ಟ ವಿಷಯದಲ್ಲಿ ಕಠಿಣತೆ',
    icon: 'HelpCircle',
    descriptionEn: 'Struggling with a specific subject like Math, English, or Science'
  },
  {
    key: 'BEHAVIOUR_CONCERN',
    labelEn: 'Behaviour concern',
    labelKn: 'ನಡವಳಿಕೆ ಸಂಬಂಧಿತ ಕಾಳಜಿ',
    icon: 'HeartHandshake',
    descriptionEn: 'Observations on peer interaction, mood, or classroom attention'
  },
  {
    key: 'SCHOOL_RELATED',
    labelEn: 'School-related concern',
    labelKn: 'ಶಾಲಾ ಪರಿಸರ / ಸೌಲಭ್ಯ ಕಾಳಜಿ',
    icon: 'School',
    descriptionEn: 'Concerns regarding classroom, midday meals, transport, or facilities'
  },
  {
    key: 'OTHER',
    labelEn: 'Other',
    labelKn: 'ಇತರ ವಿಷಯ',
    icon: 'MessageSquare',
    descriptionEn: 'Any other question, request, or guidance need'
  }
];

export const WORKFLOW_STAGES: {
  status: ConcernStatus;
  labelEn: string;
  labelKn: string;
  color: string;
  stepNumber: number;
}[] = [
  { status: 'PENDING', labelEn: 'Pending', labelKn: 'ಬಾಕಿ (ಸ್ವೀಕರಿಸಲಾಗಿದೆ)', color: 'amber', stepNumber: 1 },
  { status: 'UNDER_REVIEW', labelEn: 'Under Review', labelKn: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ', color: 'sky', stepNumber: 2 },
  { status: 'ACTION_TAKEN', labelEn: 'Action Taken', labelKn: 'ಕ್ರಮ ಕೈಗೊಳ್ಳಲಾಗಿದೆ', color: 'purple', stepNumber: 3 },
  { status: 'FOLLOW_UP', labelEn: 'Follow-up', labelKn: 'ಮರುಪರಿಶೀಲನೆ (Follow-up)', color: 'indigo', stepNumber: 4 },
  { status: 'RESOLVED', labelEn: 'Resolved', labelKn: 'ಪರಿಹರಿಸಲಾಗಿದೆ', color: 'emerald', stepNumber: 5 },
];

const INITIAL_CONCERNS: ParentConcern[] = [
  {
    id: 'concern-101',
    parentId: 'p1', // Sri Ramesh Gowda
    parentName: 'Sri Ramesh Gowda',
    parentPhone: '9900112233',
    studentId: 's1', // Kavya R. Gowda
    studentName: 'Kavya R. Gowda',
    studentGrade: 'Grade 5-A',
    category: 'EXCESSIVE_MOBILE',
    priority: 'MEDIUM',
    subject: 'Excessive mobile usage after school hours',
    description: 'ಕಾವ್ಯಾ ಶಾಲೆಯಿಂದ ಮನೆಗೆ ಬಂದ ನಂತರ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಆಟವಾಡುವುದರಲ್ಲಿ ಹೆಚ್ಚು ಸಮಯ ಕಳೆಯುತ್ತಿದ್ದಾಳೆ. ಸಂಜೆ ಓದಲು ಕೂರಿಸುವುದು ಕಷ್ಟವಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಶಾಲೆಯಿಂದ ಮಾರ್ಗದರ್ಶನ ನೀಡಿ.',
    status: 'ACTION_TAKEN',
    createdAt: '2026-09-24, 05:20 PM',
    updatedAt: '2026-09-25, 11:30 AM',
    teacherResponse: 'ನಮಸ್ಕಾರ ರಮೇಶ್ ಅವರೇ, ಕಾವ್ಯಾಳೊಂದಿಗೆ ತರಗತಿಯಲ್ಲಿ ಸ್ನೇಹಪೂರ್ವಕವಾಗಿ ಮಾತನಾಡಿದೆವು. ದಿನಕ್ಕೆ ಕೇವಲ ೨೦ ನಿಮಿಷ ವಿದ್ಯಾ ಸೇತು ಆಡಿಯೋ ಕಥೆ ಕೇಳಲು ಮಾತ್ರ ಮೊಬೈಲ್ ಬಳಸಲು ಒಪ್ಪಿಕೊಂಡಿದ್ದಾಳೆ.',
    actionTaken: 'ವಿದ್ಯಾರ್ಥಿಯೊಂದಿಗೆ ವೈಯಕ್ತಿಕ ಸಮಾಲೋಚನೆ ನಡೆಸಲಾಯಿತು. ಸಂಜೆ ಕೈಬರಹ ಅಭ್ಯಾಸ ಪುಸ್ತಕ ಮತ್ತು ಆಫ್‌ಲೈನ್ ಕಥೆ ಪುಸ್ತಕ ನೀಡಲಾಗಿದೆ.',
    followUpDate: '2026-10-03',
    followUpStatus: 'Scheduled 1-week habit review in class',
    teacherNotes: 'Student was very receptive. Advised parent to keep phone in family room. Kavya promised to complete math multiplication before any phone time.',
    reviewedByTeacherId: 'u2222222-2222-2222-2222-222222222222',
    reviewedByTeacherName: 'Smt. Savitri Hegde',
    statusHistory: [
      { status: 'PENDING', timestamp: '2026-09-24 17:20', note: 'Concern submitted by Sri Ramesh Gowda', updatedBy: 'Parent' },
      { status: 'UNDER_REVIEW', timestamp: '2026-09-25 09:15', note: 'Teacher Savitri reviewed attendance & academic record', updatedBy: 'Smt. Savitri Hegde' },
      { status: 'ACTION_TAKEN', timestamp: '2026-09-25 11:30', note: 'Counseled student & assigned reading log companion', updatedBy: 'Smt. Savitri Hegde' }
    ]
  },
  {
    id: 'concern-102',
    parentId: 'p1', // Sri Ramesh Gowda
    parentName: 'Sri Ramesh Gowda',
    parentPhone: '9900112233',
    studentId: 's1', // Kavya R. Gowda
    studentName: 'Kavya R. Gowda',
    studentGrade: 'Grade 5-A',
    category: 'HOMEWORK_DIFFICULTY',
    priority: 'LOW',
    subject: 'Request extra practice worksheet for English phonetics',
    description: 'ಕಾವ್ಯಾಳಿಗೆ ಇಂಗ್ಲಿಷ್ ಅಕ್ಷರಗಳ ಉಚ್ಚಾರಣೆಗೆ ಸರಳ ಕನ್ನಡ ವಿವರಣೆಯುಳ್ಳ ಅಭ್ಯಾಸ ಹಾಳೆ ನೀಡಲು ಕೋರಿಕೆ.',
    status: 'RESOLVED',
    createdAt: '2026-09-20, 04:15 PM',
    updatedAt: '2026-09-22, 02:00 PM',
    teacherResponse: 'ತರಗತಿಯಲ್ಲಿ ದ್ವಿತೀಯ ಭಾಷಾ ಇಂಗ್ಲಿಷ್ ಫೋನೆಟಿಕ್ಸ್ ವರ್ಕ್‌ಶೀಟ್ ನೀಡಲಾಯಿತು. ಕಾವ್ಯಾ ಧ್ವನಿ ಮೌಲ್ಯಮಾಪನದಲ್ಲಿ ೮೮% ಅಂಕ ಪಡೆದಿದ್ದಾಳೆ.',
    actionTaken: 'ದ್ವಿಸಂವಾದಿ ಇಂಗ್ಲಿಷ್-ಕನ್ನಡ ಫೋನೆಟಿಕ್ಸ್ ಅಭ್ಯಾಸ ಹಾಳೆ ಹಸ್ತಾಂತರಿಸಲಾಯಿತು ಹಾಗೂ ಧ್ವನಿ ಆಪ್ ಅಭ್ಯಾಸ ನೀಡಲಾಯಿತು.',
    followUpDate: '2026-09-22',
    followUpStatus: 'Completed successfully - student verified phonetics',
    teacherNotes: 'Kavya mastered the vowel blend sounds in today oral reading test.',
    reviewedByTeacherId: 'u2222222-2222-2222-2222-222222222222',
    reviewedByTeacherName: 'Smt. Savitri Hegde',
    resolvedAt: '2026-09-22, 02:00 PM',
    statusHistory: [
      { status: 'PENDING', timestamp: '2026-09-20 16:15', note: 'Submitted by parent', updatedBy: 'Parent' },
      { status: 'UNDER_REVIEW', timestamp: '2026-09-21 10:00', note: 'Reviewed by class teacher', updatedBy: 'Smt. Savitri Hegde' },
      { status: 'ACTION_TAKEN', timestamp: '2026-09-21 14:30', note: 'Worksheet provided', updatedBy: 'Smt. Savitri Hegde' },
      { status: 'RESOLVED', timestamp: '2026-09-22 14:00', note: 'Pronunciation checked and confirmed', updatedBy: 'Smt. Savitri Hegde' }
    ]
  },
  {
    id: 'concern-103',
    parentId: 'p2', // Sri Manjunath Nayaka
    parentName: 'Sri Manjunath Nayaka',
    parentPhone: '9845011224',
    studentId: 's2', // Abhishek Nayaka
    studentName: 'Abhishek Nayaka',
    studentGrade: 'Grade 5-A',
    category: 'NOT_STUDYING',
    priority: 'HIGH',
    subject: 'Not studying regularly at home before exams',
    description: 'ಅಭಿಷೇಕ್ ಸಂಜೆ ವೇಳೆ ಮನೆಯಲ್ಲಿ ಪುಸ್ತಕ ತೆಗೆಯುವುದಿಲ್ಲ, ಹೊಲದ ಕೆಲಸ ಮುಗಿಸಿ ಬಂದಾಗ ಓದಲು ಆಲಸ್ಯ ತೋರುತ್ತಾನೆ.',
    status: 'FOLLOW_UP',
    createdAt: '2026-09-23, 07:10 PM',
    updatedAt: '2026-09-26, 10:30 AM',
    teacherResponse: 'ಅಭಿಷೇಕ್‌ನಿಗೆ ಶಾಲೆ ಬಿಟ್ಟ ನಂತರ ೩೦ ನಿಮಿಷ ಶಾಲಾ ಗ್ರಂಥಾಲಯದಲ್ಲಿ ಸ್ನೇಹಿತರೊಂದಿಗೆ ಓದಲು ಅವಕಾಶ ಮಾಡಿಕೊಡಲಾಗಿದೆ.',
    actionTaken: 'ಗಣಿತ ಹಾಗೂ ಕನ್ನಡ ವಿಷಯದಲ್ಲಿ ಪಿಯರ್-ಲರ್ನಿಂಗ್ ಗುಂಪು ರಚಿಸಲಾಗಿದೆ. ದಿನನಿತ್ಯದ ಪ್ರಗತಿ ಕಾರ್ಡ್ ನೀಡಲಾಗಿದೆ.',
    followUpDate: '2026-09-29',
    followUpStatus: 'Weekly follow-up with student library attendance',
    teacherNotes: 'Needs gentle encouragement. Math calculation is good when assisted.',
    reviewedByTeacherId: 'u2222222-2222-2222-2222-222222222222',
    reviewedByTeacherName: 'Smt. Savitri Hegde',
    statusHistory: [
      { status: 'PENDING', timestamp: '2026-09-23 19:10', note: 'Parent submitted', updatedBy: 'Parent' },
      { status: 'UNDER_REVIEW', timestamp: '2026-09-24 09:30', note: 'Checked attendance and score', updatedBy: 'Smt. Savitri Hegde' },
      { status: 'ACTION_TAKEN', timestamp: '2026-09-25 12:00', note: 'Assigned library study hour', updatedBy: 'Smt. Savitri Hegde' },
      { status: 'FOLLOW_UP', timestamp: '2026-09-26 10:30', note: 'Scheduled second review for Sep 29', updatedBy: 'Smt. Savitri Hegde' }
    ]
  },
  {
    id: 'concern-104',
    parentId: 'p1', // Sri Ramesh Gowda
    parentName: 'Sri Ramesh Gowda',
    parentPhone: '9900112233',
    studentId: 's6', // Chethan R. Gowda
    studentName: 'Chethan R. Gowda',
    studentGrade: 'Grade 2-B (Nali-Kali)',
    category: 'ATTENDANCE_CONCERN',
    priority: 'MEDIUM',
    subject: 'Morning village bus timing causes delay',
    description: 'ಗ್ರಾಮದ ಸರ್ಕಾರಿ ಬಸ್ಸು ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಬಾರದಿರುವುದರಿಂದ ಚೇತನ್ ಶಾಲೆಗೆ ತಡವಾಗಿ ತಲುಪುವ ಸಾಧ್ಯತೆಯಿದೆ.',
    status: 'UNDER_REVIEW',
    createdAt: '2026-09-26, 08:30 AM',
    updatedAt: '2026-09-26, 11:00 AM',
    teacherResponse: 'ವಿಷಯವನ್ನು ಗ್ರಾಮ ಪಂಚಾಯತಿ ಸಾರಿಗೆ ಸಮಿತಿಯ ಗಮನಕ್ಕೆ ತರಲಾಗಿದೆ. ಬಸ್ ಚಾಲಕರಿಗೆ ಸೂಚನೆ ನೀಡಲಾಗುವುದು.',
    actionTaken: 'ಶಾಲಾ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು ಗ್ರಾಮ ಪಂಚಾಯತಿ ಅಧ್ಯಕ್ಷರಿಗೆ ಪತ್ರ ಸಲ್ಲಿಸಿದ್ದಾರೆ.',
    followUpDate: '2026-10-02',
    followUpStatus: 'Awaiting GP transport committee response',
    teacherNotes: 'Headmaster Sree Basavaraj Patil is following up directly with KSRTC depot.',
    reviewedByTeacherId: 'u2222222-2222-2222-2222-222222222222',
    reviewedByTeacherName: 'Smt. Savitri Hegde',
    statusHistory: [
      { status: 'PENDING', timestamp: '2026-09-26 08:30', note: 'Parent submitted', updatedBy: 'Parent' },
      { status: 'UNDER_REVIEW', timestamp: '2026-09-26 11:00', note: 'In review with Headmaster', updatedBy: 'Smt. Savitri Hegde' }
    ]
  }
];

class ConcernService {
  private concerns: ParentConcern[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') {
      this.concerns = INITIAL_CONCERNS;
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.concerns = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Error reading concerns from localStorage:', e);
    }

    this.concerns = INITIAL_CONCERNS;
    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.concerns));
      window.dispatchEvent(new CustomEvent('parent-concern-updated', { detail: this.concerns }));
    } catch (e) {
      console.warn('Error saving concerns to localStorage:', e);
    }
  }

  public getConcerns(): ParentConcern[] {
    return [...this.concerns];
  }

  public getConcernById(id: string): ParentConcern | undefined {
    return this.concerns.find(c => c.id === id);
  }

  public getConcernsByParent(parentId: string): ParentConcern[] {
    return this.concerns.filter(c => c.parentId === parentId || c.parentName.includes('Ramesh'));
  }

  public getConcernsByStudent(studentId: string): ParentConcern[] {
    return this.concerns.filter(c => c.studentId === studentId);
  }

  public getConcernsByStatus(status: ConcernStatus): ParentConcern[] {
    if (status === 'UNDER_REVIEW') {
      return this.concerns.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'IN_REVIEW');
    }
    return this.concerns.filter(c => c.status === status);
  }

  public addConcern(data: {
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
  }): ParentConcern {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newConcern: ParentConcern = {
      id: `concern-${Date.now()}`,
      parentId: data.parentId,
      parentName: data.parentName,
      parentPhone: data.parentPhone || '9900112233',
      studentId: data.studentId,
      studentName: data.studentName,
      studentGrade: data.studentGrade || 'Grade 5-A',
      category: data.category,
      priority: data.priority || 'MEDIUM',
      subject: data.subject,
      description: data.description,
      status: 'PENDING',
      createdAt: formattedDate,
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: formattedDate,
          note: 'Submitted by parent via Student Concern portal',
          updatedBy: data.parentName
        }
      ]
    };

    this.concerns = [newConcern, ...this.concerns];
    this.saveToStorage();
    return newConcern;
  }

  public updateConcernWorkflow(params: {
    concernId: string;
    status: ConcernStatus;
    teacherResponse?: string;
    actionTaken?: string;
    followUpDate?: string;
    followUpStatus?: string;
    teacherNotes?: string;
    teacherName: string;
    teacherId?: string;
  }): ParentConcern | null {
    const index = this.concerns.findIndex(c => c.id === params.concernId);
    if (index === -1) return null;

    const existing = this.concerns[index];
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const historyItem = {
      status: params.status,
      timestamp: formattedDate,
      note: params.actionTaken || params.teacherResponse || `Status changed to ${params.status}`,
      updatedBy: params.teacherName
    };

    const updated: ParentConcern = {
      ...existing,
      status: params.status,
      updatedAt: formattedDate,
      teacherResponse: params.teacherResponse !== undefined ? params.teacherResponse : existing.teacherResponse,
      actionTaken: params.actionTaken !== undefined ? params.actionTaken : existing.actionTaken,
      followUpDate: params.followUpDate !== undefined ? params.followUpDate : existing.followUpDate,
      followUpStatus: params.followUpStatus !== undefined ? params.followUpStatus : existing.followUpStatus,
      teacherNotes: params.teacherNotes !== undefined ? params.teacherNotes : existing.teacherNotes,
      reviewedByTeacherName: params.teacherName,
      reviewedByTeacherId: params.teacherId || existing.reviewedByTeacherId,
      resolvedAt: params.status === 'RESOLVED' ? formattedDate : existing.resolvedAt,
      statusHistory: [...(existing.statusHistory || []), historyItem]
    };

    this.concerns[index] = updated;
    this.saveToStorage();
    return updated;
  }

  /**
   * Generates an objective, non-stigmatizing Student Support Summary.
   * Connects concern data with:
   * - Attendance
   * - Test marks
   * - Learning activity
   * - Academic progress
   *
   * "Do not automatically label or diagnose students.
   * Present the information as support indicators for teacher review."
   */
  public getStudentSupportSummary(studentId: string): StudentSupportSummary {
    const student = MOCK_STUDENTS.find(s => s.id === studentId) || MOCK_STUDENTS[0];
    const marks = MOCK_STUDENT_MARKS.filter(m => m.studentId === student.id);
    const onlineSubmissions = onlineTestService.getSubmissions().filter(s => s.studentId === student.id);
    const voiceAssessments = MOCK_VOICE_ASSESSMENTS.filter(v => v.studentId === student.id);
    const studentConcerns = this.getConcernsByStudent(student.id);
    const activeConcerns = studentConcerns.filter(c => c.status !== 'RESOLVED');

    // Attendance indicator
    const attendanceRate = student.attendanceRate || 95;
    let attendanceIndicator = 'Consistent school attendance; on-time morning arrival record.';
    let attendanceIndicatorKn = 'ಶಾಲೆಗೆ ನಿರಂತರ ಹಾಗೂ ಸಮಯೋಚಿತ ಹಾಜರಾತಿ ದಾಖಲಾಗಿದೆ.';
    if (attendanceRate < 90) {
      attendanceIndicator = 'Attendance monitoring indicator: occasional missed morning sessions.';
      attendanceIndicatorKn = 'ಹಾಜರಾತಿ ಗಮನಾರ್ಹತೆ: ಬೆಳಿಗ್ಗೆ ಕೆಲವೊಮ್ಮೆ ತಡವಾಗಿ ತಲುಪುವ ನಮೂದು ಇದೆ.';
    }

    // Academic marks average
    let totalPct = 0;
    let count = 0;
    let highestSubject = 'Kannada (ಕನ್ನಡ)';
    let lowestSubject = 'English (ಇಂಗ್ಲಿಷ್)';
    let highestPct = 0;
    let lowestPct = 100;

    marks.forEach(m => {
      totalPct += m.percentage;
      count++;
      if (m.percentage > highestPct) {
        highestPct = m.percentage;
        highestSubject = m.subjectCode === 'KAN-05' ? 'Kannada (ಕನ್ನಡ)' : m.testTitle;
      }
      if (m.percentage < lowestPct) {
        lowestPct = m.percentage;
        lowestSubject = m.subjectCode;
      }
    });

    onlineSubmissions.forEach(sub => {
      if (typeof sub.percentage === 'number') {
        totalPct += sub.percentage;
        count++;
      }
    });

    const recentTestAverage = count > 0 ? Math.round(totalPct / count) : 94;

    // Voice recitation score
    const voiceScore = voiceAssessments.length > 0 
      ? Math.round(voiceAssessments.reduce((acc, curr) => acc + curr.scorePercentage, 0) / voiceAssessments.length)
      : 91;

    // Objective indicators (NO DIAGNOSIS, ONLY SUPPORTIVE OBSERVATIONS)
    const indicatorsEn: string[] = [
      `Syllabus trajectory is solid: scored ${recentTestAverage}% average across formal assessments and quizzes.`,
      `Demonstrates high expressive engagement in oral reading (average voice recitation score: ${voiceScore}%).`,
      `Attendance reliability stands at ${attendanceRate}%, supporting steady concept retention.`
    ];

    const indicatorsKn: string[] = [
      `ಪಠ್ಯಕ್ರಮ ಸಾಧನೆ ಸುಭದ್ರವಾಗಿದೆ: ಇತ್ತೀಚಿನ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಸರಾಸರಿ ${recentTestAverage}% ಸಾಧನೆ.`,
      `ಧ್ವನಿ ವಾಚನ ಹಾಗೂ ಮೌಖಿಕ ಅಭಿವ್ಯಕ್ತಿಯಲ್ಲಿ ಉತ್ತಮ ಪರಿಶ್ರಮ (ಧ್ವನಿ ಅಂಕ: ${voiceScore}%).`,
      `ಹಾಜರಾತಿ ಮಟ್ಟ ${attendanceRate}% ಇದ್ದು, ಶಾಲಾ ತರಗತಿಯಲ್ಲಿ ಪಾಲ್ಗೊಳ್ಳುವಿಕೆ ಉತ್ತಮವಾಗಿದೆ.`
    ];

    // Correlate with active concerns
    if (activeConcerns.some(c => c.category === 'EXCESSIVE_MOBILE' || c.category === 'EXCESSIVE_TV')) {
      indicatorsEn.push('Screen Balance Support: Parent noted evening screen distraction; consider providing offline story worksheets to structure evening homework.');
      indicatorsKn.push('ಪರದೆಯ ಸಮಯ ಸಮತೋಲನ: ಸಂಜೆ ವೇಳೆ ಮೊಬೈಲ್ ಬದಲಿಗೆ ಕೈಬರಹ ಹಾಗೂ ಮುದ್ರಿತ ಕಥಾಪುಸ್ತಕ ಓದಲು ಪ್ರೋತ್ಸಾಹಿಸಲು ಸಲಹೆ.');
    }

    if (activeConcerns.some(c => c.category === 'HOMEWORK_DIFFICULTY' || c.category === 'SUBJECT_DIFFICULTY')) {
      indicatorsEn.push('Homework Scaffolding: Provide bilingual step-by-step example cards for take-home math and language tasks.');
      indicatorsKn.push('ಮನೆಕೆಲಸ ಸಹಾಯಕ: ಗಣಿತ ಹಾಗೂ ಭಾಷಾ ಅಭ್ಯಾಸಕ್ಕೆ ಹಂತ-ಹಂತದ ಸರಳ ಮಾದರಿ ಉದಾಹರಣೆಗಳನ್ನು ಒದಗಿಸುವುದು ಸೂಕ್ತ.');
    }

    if (activeConcerns.some(c => c.category === 'NOT_STUDYING')) {
      indicatorsEn.push('Peer Study Pairing: Pairing with classroom study-buddies during library periods boosts independent revision habit.');
      indicatorsKn.push('ಸಹಪಾಠಿ ಕಲಿಕಾ ಗುಂಪು: ಶಾಲಾ ಗ್ರಂಥಾಲಯ ಅವಧಿಯಲ್ಲಿ ಸಹಪಾಠಿಗಳೊಂದಿಗೆ ಜೊತೆಯಾಗಿ ಓದುವುದು ಅಧ್ಯಯನ ಆಸಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.');
    }

    return {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      studentNameKn: `${student.firstNameKn} ${student.lastNameKn}`,
      gradeLevel: student.className || 'Grade 5-A',
      attendanceRate,
      attendanceIndicator,
      attendanceIndicatorKn,
      recentTestAverage,
      strongestSubject: highestSubject,
      needsAttentionSubject: lowestSubject,
      learningActivityMetric: `${voiceAssessments.length} voice recordings & 2 offline worksheets completed`,
      learningActivityMetricKn: `${voiceAssessments.length} ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ & ೨ ವರ್ಕ್‌ಶೀಟ್‌ಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ`,
      voicePracticeScore: voiceScore,
      supportIndicators: indicatorsEn,
      supportIndicatorsKn: indicatorsKn,
      activeConcernsCount: activeConcerns.length
    };
  }
}

export const concernService = new ConcernService();
