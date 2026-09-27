// Online Test System Service
// Supports Teacher test creation, Student secure examination,
// Integrity auditing (fullscreen, tab switch, copy/paste logging),
// and Parent notification dispatch upon publishing results.

export type QuestionType = 'MULTIPLE_CHOICE' | 'DESCRIPTIVE';

export interface QuestionOption {
  id: string;
  textEn: string;
  textKn: string;
}

export interface TestQuestion {
  id: string;
  type: QuestionType;
  questionTextEn: string;
  questionTextKn: string;
  options?: QuestionOption[];
  correctOptionId?: string;
  marks: number;
  sampleAnswerEn?: string;
  sampleAnswerKn?: string;
}

export interface OnlineTest {
  id: string;
  titleEn: string;
  titleKn: string;
  classId: string;
  className: string;
  subjectCode: string;
  subjectName: string;
  gradeLevel: number;
  totalMarks: number;
  passingMarks: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  isPublished: boolean;
  resultsPublished: boolean;
  randomizeQuestions: boolean;
  questions: TestQuestion[];
  createdAt: string;
  createdBy: string;
}

export interface SuspiciousExamEvent {
  id: string;
  timestamp: string;
  type: 'FULLSCREEN_EXIT' | 'VISIBILITY_CHANGE' | 'WINDOW_BLUR' | 'COPY_ATTEMPT' | 'PASTE_ATTEMPT' | 'EXAM_INTERRUPTED';
  descriptionEn: string;
  descriptionKn: string;
}

export interface StudentTestSubmission {
  id: string;
  testId: string;
  studentId: string;
  studentName: string;
  studentNameKn?: string;
  rollNumber: string;
  classId: string;
  startedAt: string;
  submittedAt?: string;
  timeTakenSeconds: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED' | 'GRADED';
  answers: Record<string, string>; // questionId -> selectedOptionId or text
  score?: number;
  maxScore: number;
  percentage?: number;
  grade?: 'A+' | 'A' | 'B' | 'C' | 'D';
  suspiciousEvents: SuspiciousExamEvent[];
  suspiciousCount: number;
  securityStatus: 'CLEAN' | 'REVIEW_REQUIRED';
  teacherFeedback?: string;
  resultsPublished: boolean;
  gradedAt?: string;
}

const STORAGE_KEY_TESTS = 'village_school_online_tests_v1';
const STORAGE_KEY_SUBMISSIONS = 'village_school_online_submissions_v1';

// Seed initial tests
const SEED_TESTS: OnlineTest[] = [
  {
    id: 'online-test-1',
    titleEn: 'Grade 5 Kannada Literature & Grammar Assessment',
    titleKn: '೫ ನೇ ತರಗತಿ ಕನ್ನಡ ಸಾಹಿತ್ಯ ಮತ್ತು ವ್ಯಾಕರಣ ಮೌಲ್ಯಮಾಪನ',
    classId: 'c1',
    className: 'Grade 5-A',
    subjectCode: 'KAN-05',
    subjectName: 'Kannada Language',
    gradeLevel: 5,
    totalMarks: 25,
    passingMarks: 10,
    durationMinutes: 30,
    startTime: '2026-09-27T08:00',
    endTime: '2026-09-30T18:00',
    isPublished: true,
    resultsPublished: true,
    randomizeQuestions: true,
    createdAt: '2026-09-26',
    createdBy: 'Smt. Savitri Hegde',
    questions: [
      {
        id: 'q1',
        type: 'MULTIPLE_CHOICE',
        questionTextEn: 'Who is the author of the epic poem "Sri Ramayana Darshanam"?',
        questionTextKn: '"ಶ್ರೀ ರಾಮಾಯಣ ದರ್ಶನಂ" ಮಹಾಕಾವ್ಯದ ಕರ್ತೃ ಯಾರು?',
        options: [
          { id: 'opt-1', textEn: 'Rashtrakavi Kuvempu', textKn: 'ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು' },
          { id: 'opt-2', textEn: 'Da. Ra. Bendre', textKn: 'ದ. ರಾ. ಬೇಂದ್ರೆ' },
          { id: 'opt-3', textEn: 'Masti Venkatesha Iyengar', textKn: 'ಮಾಸ್ತಿ ವೆಂಕಟೇಶ ಅಯ್ಯಂಗಾರ್' },
          { id: 'opt-4', textEn: 'G. S. Shivarudrappa', textKn: 'ಜಿ. ಎಸ್. ಶಿವರುದ್ರಪ್ಪ' },
        ],
        correctOptionId: 'opt-1',
        marks: 5,
      },
      {
        id: 'q2',
        type: 'MULTIPLE_CHOICE',
        questionTextEn: 'In Kannada grammar, what are letters like "ಕ, ಖ, ಗ, ಘ" called?',
        questionTextKn: 'ಕನ್ನಡ ವ್ಯಾಕರಣದಲ್ಲಿ "ಕ, ಖ, ಗ, ಘ" ಅಕ್ಷರಗಳನ್ನು ಏನೆಂದು ಕರೆಯುತ್ತಾರೆ?',
        options: [
          { id: 'opt-1', textEn: 'Swaragalu (Vowels)', textKn: 'ಸ್ವರಗಳು' },
          { id: 'opt-2', textEn: 'Vyanjanagalu (Consonants)', textKn: 'ವರ್ಗೀಯ ವ್ಯಂಜನಗಳು' },
          { id: 'opt-3', textEn: 'Yogavaahakagalu', textKn: 'ಯೋಗವಾಹಕಗಳು' },
          { id: 'opt-4', textEn: 'Alpapranagalu', textKn: 'ಅಲ್ಪಪ್ರಾಣಗಳು ಮಾತ್ರ' },
        ],
        correctOptionId: 'opt-2',
        marks: 5,
      },
      {
        id: 'q3',
        type: 'MULTIPLE_CHOICE',
        questionTextEn: 'What is the opposite word (ವಿರುದ್ಧ ಪದ) of "ಹಿತ" (Beneficial)?',
        questionTextKn: '"ಹಿತ" ಪದದ ವಿರುದ್ಧ ಪದ ಯಾವುದು?',
        options: [
          { id: 'opt-1', textEn: 'Ahita', textKn: 'ಅಹಿತ' },
          { id: 'opt-2', textEn: 'Sahita', textKn: 'ಸಹಿತ' },
          { id: 'opt-3', textEn: 'Vihita', textKn: 'ವಿಹಿತ' },
          { id: 'opt-4', textEn: 'Prahita', textKn: 'ಪ್ರಹಿತ' },
        ],
        correctOptionId: 'opt-1',
        marks: 5,
      },
      {
        id: 'q4',
        type: 'DESCRIPTIVE',
        questionTextEn: 'Write two inspiring thoughts taught by Kuvempu in his "Vishwa Manava Sandesha".',
        questionTextKn: 'ಕುವೆಂಪು ಅವರ "ವಿಶ್ವಮಾನವ ಸಂದೇಶ"ದಲ್ಲಿ ನೀಡಲಾದ ಎರಡು ಮುಖ್ಯ ಆಶಯಗಳನ್ನು ಬರೆಯಿರಿ.',
        marks: 10,
        sampleAnswerEn: '1. Treat all human beings equally without caste or regional barrier. 2. Love nature and foster peace.',
        sampleAnswerKn: '೧. ಜಾತಿ-ಮತಗಳ ಬೇಧವಿಲ್ಲದೆ ಎಲ್ಲ ಮಾನವರನ್ನು ಸಮಾನವಾಗಿ ಕಾಣುವುದು. ೨. ಪ್ರಕೃತಿಯನ್ನು ಪ್ರೀತಿಸಿ ಶಾಂತಿಯುತ ವಿಶ್ವಮಾನವರಾಗಿ ಬಾಳುವುದು.',
      },
    ],
  },
  {
    id: 'online-test-2',
    titleEn: 'Grade 5 Mathematics: Tables, Fractions & Word Problems',
    titleKn: '೫ ನೇ ತರಗತಿ ಗಣಿತ: ಮಗ್ಗಿಗಳು, ಭಿನ್ನರಾಶಿ ಮತ್ತು ಸಮಸ್ಯೆಗಳು',
    classId: 'c1',
    className: 'Grade 5-A',
    subjectCode: 'MAT-05',
    subjectName: 'Mathematics',
    gradeLevel: 5,
    totalMarks: 25,
    passingMarks: 10,
    durationMinutes: 45,
    startTime: '2026-09-28T09:00',
    endTime: '2026-10-02T17:00',
    isPublished: true,
    resultsPublished: false,
    randomizeQuestions: true,
    createdAt: '2026-09-27',
    createdBy: 'Smt. Savitri Hegde',
    questions: [
      {
        id: 'mq1',
        type: 'MULTIPLE_CHOICE',
        questionTextEn: 'Calculate: 8 × 7 = ?',
        questionTextKn: '೮ × ೭ ರ ಗುಣಲಬ್ಧ ಎಷ್ಟು?',
        options: [
          { id: 'mopt-1', textEn: '54', textKn: '೫೪' },
          { id: 'mopt-2', textEn: '56', textKn: '೫೬' },
          { id: 'mopt-3', textEn: '64', textKn: '೬೪' },
          { id: 'mopt-4', textEn: '48', textKn: '೪೮' },
        ],
        correctOptionId: 'mopt-2',
        marks: 5,
      },
      {
        id: 'mq2',
        type: 'MULTIPLE_CHOICE',
        questionTextEn: 'What fraction represents 2 parts out of 4 equal parts of a circle?',
        questionTextKn: 'ಒಂದು ವೃತ್ತದ ೪ ಸಮಾನ ಭಾಗಗಳಲ್ಲಿ ೨ ಭಾಗಗಳನ್ನು ಯಾವ ಭಿನ್ನರಾಶಿ ಸೂಚಿಸುತ್ತದೆ?',
        options: [
          { id: 'mopt-1', textEn: '1/4 (Quarter)', textKn: '೧/೪ (ಕಾಲು)' },
          { id: 'mopt-2', textEn: '1/2 (Half)', textKn: '೨/೪ ಅಥವಾ ೧/೨ (ಅರ್ಧ)' },
          { id: 'mopt-3', textEn: '3/4 (Three quarters)', textKn: '೩/೪ (ಮುಕ್ಕಾಲು)' },
          { id: 'mopt-4', textEn: '1/3', textKn: '೧/೩' },
        ],
        correctOptionId: 'mopt-2',
        marks: 5,
      },
      {
        id: 'mq3',
        type: 'DESCRIPTIVE',
        questionTextEn: 'Ramesh bought 3 baskets with 15 mangoes in each. How many mangoes does he have in total? Show steps.',
        questionTextKn: 'ರಮೇಶನು ತಲಾ ೧೫ ಮಾವಿನ ಹಣ್ಣುಗಳಿರುವ ೩ ಬುಟ್ಟಿಗಳನ್ನು ಕೊಂಡನು. ಅವನ ಬಳಿ ಒಟ್ಟು ಎಷ್ಟು ಹಣ್ಣುಗಳಿವೆ? ಲೆಕ್ಕದ ಹಂತಗಳನ್ನು ಬರೆಯಿರಿ.',
        marks: 15,
        sampleAnswerEn: 'Total mangoes = 3 baskets × 15 mangoes/basket = 45 mangoes.',
        sampleAnswerKn: 'ಬುಟ್ಟಿಗಳ ಸಂಖ್ಯೆ = ೩. ಪ್ರತಿ ಬುಟ್ಟಿಯಲ್ಲಿರುವ ಹಣ್ಣುಗಳು = ೧೫. ಒಟ್ಟು ಹಣ್ಣುಗಳು = ೩ × ೧೫ = ೪೫ ಮಾವಿನ ಹಣ್ಣುಗಳು.',
      },
    ],
  },
];

// Seed initial submissions
const SEED_SUBMISSIONS: StudentTestSubmission[] = [
  {
    id: 'sub-s1-1',
    testId: 'online-test-1',
    studentId: 's1', // Kavya Gowda
    studentName: 'Kavya R. Gowda',
    studentNameKn: 'ಕಾವ್ಯಾ ಆರ್. ಗೌಡ',
    rollNumber: '01-A-14',
    classId: 'c1',
    startedAt: '2026-09-27T09:10:00',
    submittedAt: '2026-09-27T09:32:15',
    timeTakenSeconds: 1335, // ~22 mins
    status: 'GRADED',
    answers: {
      q1: 'opt-1',
      q2: 'opt-2',
      q3: 'opt-1',
      q4: '೧. ಜಾತಿ ಮತಗಳ ಭೇದವಿಲ್ಲದೆ ಎಲ್ಲರನ್ನೂ ಪ್ರೀತಿಸುವುದು. ೨. ನಿಸರ್ಗವನ್ನು ಗೌರವಿಸಿ ವಿಶ್ವಮಾನವರಾಗುವುದು.',
    },
    score: 24,
    maxScore: 25,
    percentage: 96,
    grade: 'A+',
    suspiciousEvents: [],
    suspiciousCount: 0,
    securityStatus: 'CLEAN',
    teacherFeedback: 'ಅತ್ಯುತ್ತಮ ಉತ್ತರಗಳು! ಕುವೆಂಪು ವಿಶ್ವಮಾನವ ಸಂದೇಶವನ್ನು ಸುಂದರವಾಗಿ ಬರೆದಿದ್ದೀರಿ. ಶಾಭಾಸ್!',
    resultsPublished: true,
    gradedAt: '2026-09-27T10:00:00',
  },
  {
    id: 'sub-s2-1',
    testId: 'online-test-1',
    studentId: 's2', // Sagar Naik
    studentName: 'Sagar Naik',
    studentNameKn: 'ಸಾಗರ್ ನಾಯಕ್',
    rollNumber: '01-A-18',
    classId: 'c1',
    startedAt: '2026-09-27T09:12:00',
    submittedAt: '2026-09-27T09:38:40',
    timeTakenSeconds: 1600,
    status: 'GRADED',
    answers: {
      q1: 'opt-1',
      q2: 'opt-2',
      q3: 'opt-3',
      q4: 'ಎಲ್ಲರೂ ಒಂದಾಗಿ ಬದುಕಬೇಕು.',
    },
    score: 18,
    maxScore: 25,
    percentage: 72,
    grade: 'B',
    suspiciousEvents: [
      {
        id: 'se-1',
        timestamp: '09:22:10 AM',
        type: 'VISIBILITY_CHANGE',
        descriptionEn: 'Tab / browser window was hidden for 14 seconds.',
        descriptionKn: 'ಟ್ಯಾಬ್ / ವಿಂಡೋ ಬದಲಾವಣೆ ಪತ್ತೆಯಾಗಿದೆ (೧೪ ಸೆಕೆಂಡುಗಳು).',
      },
      {
        id: 'se-2',
        timestamp: '09:28:45 AM',
        type: 'FULLSCREEN_EXIT',
        descriptionEn: 'Fullscreen mode was exited during exam.',
        descriptionKn: 'ಪರೀಕ್ಷಾ ಸಮಯದಲ್ಲಿ ಪೂರ್ಣ ಪರದೆ (Fullscreen) ನಿರ್ಗಮಿಸಲಾಗಿದೆ.',
      },
    ],
    suspiciousCount: 2,
    securityStatus: 'REVIEW_REQUIRED',
    teacherFeedback: 'ಉತ್ತಮ ಪ್ರಯತ್ನ, ಆದರೆ ಪರೀಕ್ಷೆಯ ನಿಯಮಗಳನ್ನು ಪಾಲಿಸಬೇಕು. ಪೂರ್ಣ ಪರದೆಯಿಂದ ಹೊರಹೋಗಬಾರದು.',
    resultsPublished: true,
    gradedAt: '2026-09-27T10:05:00',
  },
];

export const onlineTestService = {
  // Load tests from localStorage or initialize
  getTests(): OnlineTest[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TESTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    this.saveTests(SEED_TESTS);
    return SEED_TESTS;
  },

  saveTests(tests: OnlineTest[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(tests));
    } catch {
      // ignore
    }
  },

  getTestById(id: string): OnlineTest | undefined {
    return this.getTests().find(t => t.id === id);
  },

  createTest(test: Omit<OnlineTest, 'id' | 'createdAt'>): OnlineTest {
    const tests = this.getTests();
    const newTest: OnlineTest = {
      ...test,
      id: `online-test-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    tests.unshift(newTest);
    this.saveTests(tests);
    return newTest;
  },

  updateTest(updatedTest: OnlineTest): void {
    const tests = this.getTests().map(t => (t.id === updatedTest.id ? updatedTest : t));
    this.saveTests(tests);
  },

  publishTest(testId: string): OnlineTest | undefined {
    const tests = this.getTests();
    const target = tests.find(t => t.id === testId);
    if (target) {
      target.isPublished = true;
      this.saveTests(tests);
      return target;
    }
    return undefined;
  },

  // Submissions management
  getSubmissions(): StudentTestSubmission[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    this.saveSubmissions(SEED_SUBMISSIONS);
    return SEED_SUBMISSIONS;
  },

  saveSubmissions(submissions: StudentTestSubmission[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
    } catch {
      // ignore
    }
  },

  getSubmissionsForTest(testId: string): StudentTestSubmission[] {
    return this.getSubmissions().filter(s => s.testId === testId);
  },

  getStudentSubmissions(studentId: string): StudentTestSubmission[] {
    return this.getSubmissions().filter(s => s.studentId === studentId);
  },

  saveOrUpdateSubmission(submission: StudentTestSubmission): void {
    const submissions = this.getSubmissions();
    const index = submissions.findIndex(s => s.id === submission.id);
    if (index >= 0) {
      submissions[index] = submission;
    } else {
      submissions.unshift(submission);
    }
    this.saveSubmissions(submissions);
  },

  gradeSubmission(
    submissionId: string,
    score: number,
    feedback?: string
  ): StudentTestSubmission | undefined {
    const submissions = this.getSubmissions();
    const target = submissions.find(s => s.id === submissionId);
    if (!target) return undefined;

    target.score = score;
    target.percentage = Math.round((score / target.maxScore) * 100);
    target.grade =
      target.percentage >= 90
        ? 'A+'
        : target.percentage >= 80
        ? 'A'
        : target.percentage >= 60
        ? 'B'
        : target.percentage >= 40
        ? 'C'
        : 'D';
    target.teacherFeedback = feedback;
    target.status = 'GRADED';
    target.gradedAt = new Date().toISOString();
    this.saveSubmissions(submissions);
    return target;
  },

  // Publish results for test -> mark resultsPublished and notify parents
  publishResults(
    testId: string,
    onNotifyParent?: (submission: StudentTestSubmission, test: OnlineTest) => void
  ): { test: OnlineTest; submissions: StudentTestSubmission[] } | undefined {
    const tests = this.getTests();
    const targetTest = tests.find(t => t.id === testId);
    if (!targetTest) return undefined;

    targetTest.resultsPublished = true;
    this.saveTests(tests);

    const submissions = this.getSubmissions();
    const updatedSubmissions = submissions.map(sub => {
      if (sub.testId === testId) {
        sub.resultsPublished = true;
        if (onNotifyParent) {
          onNotifyParent(sub, targetTest);
        }
      }
      return sub;
    });

    this.saveSubmissions(updatedSubmissions);
    return {
      test: targetTest,
      submissions: updatedSubmissions.filter(s => s.testId === testId),
    };
  },

  // Android Native Secure Screen bridge helper
  // For the native Android implementation, use platform-supported secure-screen protection
  // against screenshots and screen recording during protected exam screens (FLAG_SECURE)
  setAndroidSecureScreen(enabled: boolean): void {
    try {
      if (typeof window !== 'undefined') {
        const win = window as any;
        if (win.AndroidBridge && typeof win.AndroidBridge.setSecureScreen === 'function') {
          win.AndroidBridge.setSecureScreen(enabled);
        } else if (win.Android && typeof win.Android.setFlagSecure === 'function') {
          win.Android.setFlagSecure(enabled);
        }
      }
    } catch (e) {
      console.warn('Android native FLAG_SECURE call not available or failed:', e);
    }
  },
};
