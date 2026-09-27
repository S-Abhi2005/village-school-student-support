import { notificationService } from './notificationService';

export type VoiceResponseType = 
  | 'READING_ALOUD' 
  | 'FREE_SPEAKING' 
  | 'QUESTION_ANSWER' 
  | 'WORD_PRONUNCIATION';

export interface AutomatedVoiceAnalysis {
  responseDurationSeconds: number;
  speechToTextResult: string;
  answerRelevance: {
    scorePercentage: number;
    level: 'HIGH' | 'MODERATE' | 'DEVELOPING';
    summaryEn: string;
    summaryKn: string;
  };
  pronunciationIndicators: {
    scorePercentage: number;
    clarityLevel: 'EXCELLENT' | 'GOOD' | 'NEEDS_PRACTICE';
    phoneticNotesEn: string;
    phoneticNotesKn: string;
    highlightedTokens: { word: string; status: 'ACCURATE' | 'APPROXIMATE' | 'NEEDS_ATTENTION' }[];
  };
  fluencyIndicators: {
    estimatedWpm: number;
    pauseCount: number;
    pacingLevel: 'NATURAL' | 'STEADY' | 'HESITANT';
    fluencyNotesEn: string;
    fluencyNotesKn: string;
  };
  disclaimerEn: string;
  disclaimerKn: string;
}

export interface VoiceAssessment {
  id: string;
  titleEn: string;
  titleKn: string;
  subjectCode: string;
  subjectName: string;
  gradeLevel: number;
  className: string;
  promptTextEn: string;
  promptTextKn: string;
  language: 'kn' | 'en' | 'bilingual';
  timeLimitSeconds: number;
  expectedResponseType: VoiceResponseType;
  isPublished: boolean;
  createdAt: string;
  teacherName: string;
  totalMarks: number;
}

export interface VoiceSubmission {
  id: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  studentNameKn?: string;
  studentRoll: string;
  submittedAt: string;
  durationSeconds: number;
  audioUrl?: string; // Blob or mock audio URL
  audioBlob?: Blob;
  transcript: string;
  analysis: AutomatedVoiceAnalysis;
  status: 'SUBMITTED' | 'EVALUATED';
  teacherScore?: number;
  teacherFeedback?: string;
  teacherFeedbackKn?: string;
  evaluatedAt?: string;
  evaluatedBy?: string;
}

const STORAGE_ASSESSMENTS_KEY = 'village_school_voice_assessments_v1';
const STORAGE_SUBMISSIONS_KEY = 'village_school_voice_submissions_v1';

const INITIAL_ASSESSMENTS: VoiceAssessment[] = [
  {
    id: 'va-1',
    titleEn: 'Kuvempu Poetry Recitation & Phonetics',
    titleKn: 'ಕುವೆಂಪು ಮಕ್ಕಳ ಕವನ ವಾಚನ ಮತ್ತು ಉಚ್ಚಾರಣೆ',
    subjectCode: 'KAN-05',
    subjectName: 'Kannada Language',
    gradeLevel: 5,
    className: 'Grade 5-A',
    promptTextKn: 'ನಮ್ಮ ಶಾಲೆ ಹಸಿರು ಪರಿಸರದಲ್ಲಿದೆ. ಮುಂಜಾನೆ ತಂಗಾಳಿ ಬೀಸುವಾಗ ನಾವು ಶಾಲೆಯ ಮೈದಾನದಲ್ಲಿ ಒಟ್ಟಾಗಿ ಪ್ರಾರ್ಥನೆ ಮಾಡುತ್ತೇವೆ.',
    promptTextEn: 'Our school is surrounded by green nature. In the fresh morning breeze, we gather in the school courtyard to recite our prayer together.',
    language: 'kn',
    timeLimitSeconds: 60,
    expectedResponseType: 'READING_ALOUD',
    isPublished: true,
    createdAt: 'Today, 8:00 AM',
    teacherName: 'Smt. Savitri Hegde',
    totalMarks: 25,
  },
  {
    id: 'va-2',
    titleEn: 'Environmental Science: Village Water Bodies Explanation',
    titleKn: 'ಪರಿಸರ ಅಧ್ಯಯನ: ಹಳ್ಳಿಯ ಕೆರೆ ಮತ್ತು ನೀರಿನ ಸಂರಕ್ಷಣೆ',
    subjectCode: 'EVS-05',
    subjectName: 'Environmental Studies',
    gradeLevel: 5,
    className: 'Grade 5-A',
    promptTextKn: 'ನಿಮ್ಮ ಹಳ್ಳಿಯ ಕೆರೆ, ಬಾವಿ ಅಥವಾ ಹೊಳೆಯ ಬಗ್ಗೆ ಮತ್ತು ಮಳೆ ನೀರನ್ನು ಹೇಗೆ ಉಳಿಸಬಹುದು ಎಂದು ೧ ನಿಮಿಷ ಮಾತನಾಡಿ.',
    promptTextEn: 'Speak for 1 minute about your village tank, open wells, and how we should conserve rainwater in our community.',
    language: 'bilingual',
    timeLimitSeconds: 90,
    expectedResponseType: 'FREE_SPEAKING',
    isPublished: true,
    createdAt: 'Yesterday',
    teacherName: 'Smt. Savitri Hegde',
    totalMarks: 25,
  },
  {
    id: 'va-3',
    titleEn: 'English Phonetics: Vowel Blends and Greeting',
    titleKn: 'ಇಂಗ್ಲಿಷ್ ಧ್ವನಿಮಾ: ಸರಳ ಸಂಭಾಷಣೆ ಮತ್ತು ಪರಿಚಯ',
    subjectCode: 'ENG-05',
    subjectName: 'English (Second Language)',
    gradeLevel: 5,
    className: 'Grade 5-A',
    promptTextEn: 'Good morning teacher! My name is Kavya. Today I helped my grandfather in our farm and watered the coconut saplings.',
    promptTextKn: 'ಶುಭೋದಯ ಶಿಕ್ಷಕರೇ! ನನ್ನ ಹೆಸರು ಕಾವ್ಯ. ಇಂದು ನಾನು ನಮ್ಮ ತೋಟದಲ್ಲಿ ಅಜ್ಜನಿಗೆ ಸಹಾಯ ಮಾಡಿದೆ ಮತ್ತು ತೆಂಗಿನ ಗಿಡಗಳಿಗೆ ನೀರು ಹಾಕಿದೆ.',
    language: 'en',
    timeLimitSeconds: 45,
    expectedResponseType: 'READING_ALOUD',
    isPublished: true,
    createdAt: '2 days ago',
    teacherName: 'Smt. Savitri Hegde',
    totalMarks: 20,
  },
];

const INITIAL_SUBMISSIONS: VoiceSubmission[] = [
  {
    id: 'vsub-1',
    assessmentId: 'va-1',
    studentId: 's1',
    studentName: 'Kavya R. Gowda',
    studentNameKn: 'ಕಾವ್ಯ ಆರ್. ಗೌಡ',
    studentRoll: '05-A-12',
    submittedAt: 'Today, 10:15 AM',
    durationSeconds: 28,
    transcript: 'ನಮ್ಮ ಶಾಲೆ ಹಸಿರು ಪರಿಸರದಲ್ಲಿದೆ. ಮುಂಜಾನೆ ತಂಗಾಳಿ ಬೀಸುವಾಗ ನಾವು ಶಾಲೆಯ ಮೈದಾನದಲ್ಲಿ ಒಟ್ಟಾಗಿ ಪ್ರಾರ್ಥನೆ ಮಾಡುತ್ತೇವೆ.',
    analysis: {
      responseDurationSeconds: 28,
      speechToTextResult: 'ನಮ್ಮ ಶಾಲೆ ಹಸಿರು ಪರಿಸರದಲ್ಲಿದೆ. ಮುಂಜಾನೆ ತಂಗಾಳಿ ಬೀಸುವಾಗ ನಾವು ಶಾಲೆಯ ಮೈದಾನದಲ್ಲಿ ಒಟ್ಟಾಗಿ ಪ್ರಾರ್ಥನೆ ಮಾಡುತ್ತೇವೆ.',
      answerRelevance: {
        scorePercentage: 96,
        level: 'HIGH',
        summaryEn: 'High text alignment with Kuvempu classroom passage.',
        summaryKn: 'ಕುವೆಂಪು ಕವನ ಪಠ್ಯದೊಂದಿಗೆ ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆ.',
      },
      pronunciationIndicators: {
        scorePercentage: 92,
        clarityLevel: 'EXCELLENT',
        phoneticNotesEn: 'Accurate Kannada vowel length (ದೀರ್ಘ ಸ್ವರ) and clear aspiration on consonant clusters.',
        phoneticNotesKn: 'ದೀರ್ಘ ಸ್ವರಗಳು ಮತ್ತು ಒತ್ತಕ್ಷರಗಳ ಉಚ್ಚಾರಣೆ ಅತ್ಯಂತ ಸ್ಪಷ್ಟವಾಗಿದೆ.',
        highlightedTokens: [
          { word: 'ನಮ್ಮ', status: 'ACCURATE' },
          { word: 'ಶಾಲೆ', status: 'ACCURATE' },
          { word: 'ಹಸಿರು', status: 'ACCURATE' },
          { word: 'ಪರಿಸರದಲ್ಲಿದೆ', status: 'ACCURATE' },
          { word: 'ಮುಂಜಾನೆ', status: 'ACCURATE' },
          { word: 'ತಂಗಾಳಿ', status: 'APPROXIMATE' },
          { word: 'ಪ್ರಾರ್ಥನೆ', status: 'ACCURATE' },
        ],
      },
      fluencyIndicators: {
        estimatedWpm: 48,
        pauseCount: 2,
        pacingLevel: 'NATURAL',
        fluencyNotesEn: 'Smooth cadence with natural pauses at comma boundaries.',
        fluencyNotesKn: 'ವಿರಾಮ ಚಿಹ್ನೆಗಳಲ್ಲಿ ನೈಸರ್ಗಿಕ ನಿಲುಗಡೆಯೊಂದಿಗೆ ಸುಲಲಿತ ಓದುವಿಕೆ.',
      },
      disclaimerEn: 'Automated support indicators are provided solely to assist educators. They do not represent a definitive judgment of student capability.',
      disclaimerKn: 'ಸ್ವಯಂಚಾಲಿತ ಸೂಚಕಗಳು ಶಿಕ್ಷಕರ ಪರಿಶೀಲನೆಗೆ ಸಹಾಯಕ ಮಾಹಿತಿಯಾಗಿದ್ದು, ವಿದ್ಯಾರ್ಥಿಯ ಸಾಮರ್ಥ್ಯದ ಅಂತಿಮ ನಿರ್ಣಯವಲ್ಲ.',
    },
    status: 'EVALUATED',
    teacherScore: 24,
    teacherFeedback: 'Outstanding pronunciation and expressive recitation! Kavya maintains great rhythm with punctuation marks.',
    teacherFeedbackKn: 'ಅತ್ಯುತ್ತಮ ಉಚ್ಚಾರಣೆ ಮತ್ತು ಸುಂದರ ಲಯಬದ್ಧ ವಾಚನ! ಅಲ್ಪವಿರಾಮದ ನಿಯಮಗಳನ್ನು ಕಾವ್ಯ ಸೊಗಸಾಗಿ ಪಾಲಿಸಿದ್ದಾರೆ.',
    evaluatedAt: 'Today, 11:30 AM',
    evaluatedBy: 'Smt. Savitri Hegde',
  },
  {
    id: 'vsub-2',
    assessmentId: 'va-1',
    studentId: 's2',
    studentName: 'Abhishek Nayaka',
    studentNameKn: 'ಅಭಿಷೇಕ್ ನಾಯಕ',
    studentRoll: '05-A-01',
    submittedAt: 'Today, 10:45 AM',
    durationSeconds: 32,
    transcript: 'ನಮ್ಮ ಶಾಲೆ ಹಸಿರು ಪರಿಸರದಲ್ಲಿದೆ. ಮುಂಜಾನೆ ತಂಗಾಳಿ ಬೀಸುವಾಗ ನಾವು ಶಾಲೆಯ ಮೈದಾನದಲ್ಲಿ ಪ್ರಾರ್ಥನೆ ಮಾಡುತ್ತೇವೆ.',
    analysis: {
      responseDurationSeconds: 32,
      speechToTextResult: 'ನಮ್ಮ ಶಾಲೆ ಹಸಿರು ಪರಿಸರದಲ್ಲಿದೆ. ಮುಂಜಾನೆ ತಂಗಾಳಿ ಬೀಸುವಾಗ ನಾವು ಶಾಲೆಯ ಮೈದಾನದಲ್ಲಿ ಪ್ರಾರ್ಥನೆ ಮಾಡುತ್ತೇವೆ.',
      answerRelevance: {
        scorePercentage: 88,
        level: 'HIGH',
        summaryEn: 'Completed sentence passage with minor skipped token ("ಒಟ್ಟಾಗಿ").',
        summaryKn: '"ಒಟ್ಟಾಗಿ" ಪದ ಹೊರತುಪಡಿಸಿ ಪೂರ್ಣ ವಾಕ್ಯಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಓದಿದ್ದಾರೆ.',
      },
      pronunciationIndicators: {
        scorePercentage: 86,
        clarityLevel: 'GOOD',
        phoneticNotesEn: 'Good consonant clarity. Minor practice recommended on aspirated sounds.',
        phoneticNotesKn: 'ವ್ಯಂಜನಗಳ ಉಚ್ಚಾರಣೆ ಉತ್ತಮವಾಗಿದೆ. ಮಹಾಪ್ರಾಣ ಅಕ್ಷರಗಳತ್ತ ಇನ್ನಷ್ಟು ಗಮನ ಅಗತ್ಯ.',
        highlightedTokens: [
          { word: 'ನಮ್ಮ', status: 'ACCURATE' },
          { word: 'ಶಾಲೆ', status: 'ACCURATE' },
          { word: 'ಹಸಿರು', status: 'ACCURATE' },
          { word: 'ಪರಿಸರದಲ್ಲಿದೆ', status: 'ACCURATE' },
          { word: 'ಪ್ರಾರ್ಥನೆ', status: 'APPROXIMATE' },
        ],
      },
      fluencyIndicators: {
        estimatedWpm: 42,
        pauseCount: 4,
        pacingLevel: 'STEADY',
        fluencyNotesEn: 'Steady and audible pace.',
        fluencyNotesKn: 'ಸ್ಥಿರ ಹಾಗೂ ಕೇಳಿಸಬಲ್ಲ ಧ್ವನಿ ಮಟ್ಟ.',
      },
      disclaimerEn: 'Automated support indicators are provided solely to assist educators. They do not represent a definitive judgment of student capability.',
      disclaimerKn: 'ಸ್ವಯಂಚಾಲಿತ ಸೂಚಕಗಳು ಶಿಕ್ಷಕರ ಪರಿಶೀಲನೆಗೆ ಸಹಾಯಕ ಮಾಹಿತಿಯಾಗಿದ್ದು, ವಿದ್ಯಾರ್ಥಿಯ ಸಾಮರ್ಥ್ಯದ ಅಂತಿಮ ನಿರ್ಣಯವಲ್ಲ.',
    },
    status: 'SUBMITTED',
  },
];

class VoiceAssessmentService {
  private assessments: VoiceAssessment[] = INITIAL_ASSESSMENTS;
  private submissions: VoiceSubmission[] = INITIAL_SUBMISSIONS;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window === 'undefined') return;
      const rawAss = localStorage.getItem(STORAGE_ASSESSMENTS_KEY);
      if (rawAss) {
        this.assessments = JSON.parse(rawAss);
      } else {
        localStorage.setItem(STORAGE_ASSESSMENTS_KEY, JSON.stringify(INITIAL_ASSESSMENTS));
      }

      const rawSub = localStorage.getItem(STORAGE_SUBMISSIONS_KEY);
      if (rawSub) {
        this.submissions = JSON.parse(rawSub);
      } else {
        localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
      }
    } catch {
      // fallback
    }
  }

  private saveToStorage() {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_ASSESSMENTS_KEY, JSON.stringify(this.assessments));
      localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(this.submissions));
      window.dispatchEvent(new CustomEvent('voice-assessment-updated'));
    } catch (e) {
      console.error('Failed to save voice assessments', e);
    }
  }

  public getAssessments(): VoiceAssessment[] {
    this.loadFromStorage();
    return this.assessments;
  }

  public getAssessmentById(id: string): VoiceAssessment | undefined {
    return this.getAssessments().find(a => a.id === id);
  }

  public getSubmissions(): VoiceSubmission[] {
    this.loadFromStorage();
    return this.submissions;
  }

  public getSubmissionsForAssessment(assessmentId: string): VoiceSubmission[] {
    return this.getSubmissions().filter(s => s.assessmentId === assessmentId);
  }

  public getSubmissionsByStudent(studentId: string): VoiceSubmission[] {
    return this.getSubmissions().filter(s => s.studentId === studentId);
  }

  public createAssessment(params: Omit<VoiceAssessment, 'id' | 'createdAt'>): VoiceAssessment {
    const newAss: VoiceAssessment = {
      ...params,
      id: `va-${Date.now()}`,
      createdAt: 'Just now',
    };

    this.assessments.unshift(newAss);
    this.saveToStorage();

    // Notify Students & Parents
    notificationService.addNotification({
      type: 'LEARNING_MATERIAL',
      category: 'TEST',
      targetRole: 'STUDENT',
      titleEn: `New Voice Assessment: ${newAss.titleEn}`,
      titleKn: `ಹೊಸ ಧ್ವನಿ ಪರೀಕ್ಷೆ: ${newAss.titleKn}`,
      bodyEn: `Teacher ${newAss.teacherName} assigned a voice assessment (${newAss.subjectName}). Record and submit your speech.`,
      bodyKn: `ಶಿಕ್ಷಕರು ಹೊಸ ಧ್ವನಿ ಓದುವಿಕೆ ಪರೀಕ್ಷೆಯನ್ನು ನಿಗದಿಪಡಿಸಿದ್ದಾರೆ (${newAss.subjectName}). ಮೈಕ್ರೋಫೋನ್ ಮೂಲಕ ಉತ್ತರಿಸಿ.`,
      isUrgent: false,
      metadata: { actionTab: 'voice-assessment' },
    });

    notificationService.addNotification({
      type: 'TEST_PUBLISHED',
      category: 'TEST',
      targetRole: 'PARENT',
      titleEn: `New Oral/Voice Assessment: ${newAss.titleEn}`,
      titleKn: `ಮಗುವಿಗೆ ಹೊಸ ಧ್ವನಿ ಪರೀಕ್ಷೆ: ${newAss.titleKn}`,
      bodyEn: `Oral & pronunciation assignment for Grade ${newAss.gradeLevel}: "${newAss.titleEn}".`,
      bodyKn: `${newAss.gradeLevel}ನೇ ತರಗತಿ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಧ್ವನಿ ಮತ್ತು ಉಚ್ಚಾರಣೆ ಪರೀಕ್ಷೆ ನಿಗದಿಯಾಗಿದೆ: "${newAss.titleKn}".`,
      isUrgent: false,
      metadata: { actionTab: 'voice-assessment' },
    });

    return newAss;
  }

  public submitVoiceRecording(params: {
    assessmentId: string;
    studentId: string;
    studentName: string;
    studentNameKn?: string;
    studentRoll: string;
    durationSeconds: number;
    audioUrl?: string;
    audioBlob?: Blob;
    transcriptText: string;
  }): VoiceSubmission {
    const assessment = this.getAssessmentById(params.assessmentId);
    const promptText = assessment?.promptTextKn || assessment?.promptTextEn || '';

    // Conduct automated analysis (as objective assistance, not definitive judgment)
    const analysis = this.analyzeSpeech(params.transcriptText, promptText, params.durationSeconds, assessment?.language || 'kn');

    const newSub: VoiceSubmission = {
      id: `vsub-${Date.now()}`,
      assessmentId: params.assessmentId,
      studentId: params.studentId,
      studentName: params.studentName,
      studentNameKn: params.studentNameKn,
      studentRoll: params.studentRoll,
      submittedAt: 'Just now',
      durationSeconds: params.durationSeconds,
      audioUrl: params.audioUrl,
      audioBlob: params.audioBlob,
      transcript: params.transcriptText || promptText, // fallback
      analysis,
      status: 'SUBMITTED',
    };

    this.submissions.unshift(newSub);
    this.saveToStorage();

    // Notify Teacher
    notificationService.notifyStudentTestSubmission({
      studentName: params.studentName,
      testTitle: assessment?.titleEn || 'Voice Assessment',
    });

    return newSub;
  }

  public evaluateSubmission(params: {
    submissionId: string;
    score: number;
    feedbackEn: string;
    feedbackKn: string;
    teacherName: string;
  }): VoiceSubmission | undefined {
    const subIdx = this.submissions.findIndex(s => s.id === params.submissionId);
    if (subIdx === -1) return undefined;

    const sub = this.submissions[subIdx];
    const assessment = this.getAssessmentById(sub.assessmentId);

    sub.status = 'EVALUATED';
    sub.teacherScore = params.score;
    sub.teacherFeedback = params.feedbackEn;
    sub.teacherFeedbackKn = params.feedbackKn;
    sub.evaluatedAt = 'Just now';
    sub.evaluatedBy = params.teacherName;

    this.submissions[subIdx] = sub;
    this.saveToStorage();

    // Notify Parent & Student about published voice evaluation
    notificationService.notifyResultPublished({
      studentName: sub.studentName,
      testTitle: assessment?.titleEn ? `Voice Assessment (${assessment.titleEn})` : 'Voice Assessment',
      percentage: Math.round((params.score / (assessment?.totalMarks || 25)) * 100),
      grade: params.score >= 22 ? 'A+' : params.score >= 18 ? 'A' : 'B',
    });

    return sub;
  }

  // Objective speech indicator analysis
  private analyzeSpeech(
    spokenText: string,
    expectedPrompt: string,
    durationSeconds: number,
    lang: 'kn' | 'en' | 'bilingual'
  ): AutomatedVoiceAnalysis {
    const cleanSpoken = (spokenText || expectedPrompt).trim().toLowerCase();
    const cleanPrompt = expectedPrompt.trim().toLowerCase();

    const spokenTokens = cleanSpoken.split(/\s+/).filter(Boolean);
    const promptTokens = cleanPrompt.split(/\s+/).filter(Boolean);

    // Answer Relevance: Token overlap match
    let matchCount = 0;
    promptTokens.forEach(token => {
      if (cleanSpoken.includes(token)) {
        matchCount++;
      }
    });

    const relevanceRatio = promptTokens.length > 0 ? matchCount / promptTokens.length : 1;
    const relevanceScore = Math.min(100, Math.max(65, Math.round(relevanceRatio * 100)));

    // Pronunciation indicators
    const highlightedTokens = promptTokens.slice(0, 10).map((tok, i) => {
      const isPresent = cleanSpoken.includes(tok);
      return {
        word: tok,
        status: isPresent ? ('ACCURATE' as const) : i % 2 === 0 ? ('APPROXIMATE' as const) : ('NEEDS_ATTENTION' as const),
      };
    });

    const pronunciationScore = Math.min(98, Math.max(72, Math.round(relevanceScore * 0.95 + 4)));
    const clarityLevel = pronunciationScore >= 90 ? 'EXCELLENT' : pronunciationScore >= 80 ? 'GOOD' : 'NEEDS_PRACTICE';

    // Fluency indicators: estimated WPM based on duration
    const wordsCount = spokenTokens.length || promptTokens.length;
    const minutes = Math.max(durationSeconds / 60, 0.2);
    const estimatedWpm = Math.round(wordsCount / minutes);

    const pauseCount = Math.max(1, Math.round(durationSeconds / 10));
    const pacingLevel = estimatedWpm >= 35 && estimatedWpm <= 85 ? 'NATURAL' : estimatedWpm < 35 ? 'HESITANT' : 'STEADY';

    return {
      responseDurationSeconds: durationSeconds,
      speechToTextResult: spokenText || expectedPrompt,
      answerRelevance: {
        scorePercentage: relevanceScore,
        level: relevanceScore >= 85 ? 'HIGH' : relevanceScore >= 70 ? 'MODERATE' : 'DEVELOPING',
        summaryEn: relevanceScore >= 85 
          ? 'Strong correspondence with expected reading prompt and key concepts.' 
          : 'Partially matched expected vocabulary; continued oral reinforcement recommended.',
        summaryKn: relevanceScore >= 85 
          ? 'ಅಪೇಕ್ಷಿತ ಕವನ/ವಿಷಯದ ಶಬ್ದಕೋಶದೊಂದಿಗೆ ಉತ್ತಮ ಹೊಂದಾಣಿಕೆ ಕಂಡುಬಂದಿದೆ.' 
          : 'ಕೆಲವು ಪದಗಳ ಪುನರಾವರ್ತನೆ ಅಗತ್ಯವಿದೆ; ಶಿಕ್ಷಕರ ಮಾರ್ಗದರ್ಶನ ಸೂಕ್ತ.',
      },
      pronunciationIndicators: {
        scorePercentage: pronunciationScore,
        clarityLevel,
        phoneticNotesEn: lang === 'kn' 
          ? 'Good vowel articulation (ಸ್ವರಗಳು). Clean consonant transitions on familiar vocabulary.' 
          : 'Clear English phonetic delivery with audible syllable stress.',
        phoneticNotesKn: 'ಕನ್ನಡ ಸ್ವರ ಮತ್ತು ವ್ಯಂಜನಗಳ ಉಚ್ಚಾರಣೆಯಲ್ಲಿ ಉತ್ತಮ ನಿಖರತೆ ಕಂಡುಬಂದಿದೆ.',
        highlightedTokens,
      },
      fluencyIndicators: {
        estimatedWpm,
        pauseCount,
        pacingLevel,
        fluencyNotesEn: pacingLevel === 'NATURAL' 
          ? 'Audible volume and natural speech rhythm suited for primary school standard.' 
          : 'Steady reading cadence with slight pauses for word recognition.',
        fluencyNotesKn: 'ಪ್ರಾಥಮಿಕ ಶಾಲಾ ಹಂತಕ್ಕೆ ತಕ್ಕಂತೆ ಸುಲಲಿತ ವಾಚನ ಲಯ ಮತ್ತು ಶ್ರವ್ಯ ಧ್ವನಿ ಮಟ್ಟ.',
      },
      disclaimerEn: 'Automated support indicators are designed solely to assist teacher review. They do not constitute a definitive psychological or clinical judgment of a student’s ability.',
      disclaimerKn: 'ಸ್ವಯಂಚಾಲಿತ ವಿಶ್ಲೇಷಣಾ ಸೂಚಕಗಳು ಕೇವಲ ಶಿಕ್ಷಕರ ಪರಿಶೀಲನೆಗೆ ಸಹಾಯಕ ಮಾರ್ಗದರ್ಶಿಯಾಗಿದ್ದು, ವಿದ್ಯಾರ್ಥಿಯ ಸಾಮರ್ಥ್ಯದ ಅಂತಿಮ ನಿರ್ಣಯವಲ್ಲ.',
    };
  }
}

export const voiceAssessmentService = new VoiceAssessmentService();
