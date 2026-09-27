import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  OnlineTest, 
  TestQuestion, 
  SuspiciousExamEvent, 
  StudentTestSubmission, 
  onlineTestService 
} from '../../services/onlineTestService';
import { notificationService } from '../../services/notificationService';
import { 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Maximize2, 
  Lock, 
  X, 
  AlertCircle,
  Award,
  Sparkles
} from 'lucide-react';

interface StudentExamScreenProps {
  test: OnlineTest;
  studentId: string;
  studentName: string;
  studentNameKn?: string;
  rollNumber: string;
  onFinishExam: (submission: StudentTestSubmission) => void;
  onExitExam: () => void;
}

export const StudentExamScreen: React.FC<StudentExamScreenProps> = ({
  test,
  studentId,
  studentName,
  studentNameKn,
  rollNumber,
  onFinishExam,
  onExitExam,
}) => {
  const { language } = useLanguage();

  // Pre-exam security agreement screen
  const [hasStartedExam, setHasStartedExam] = useState(false);

  // Time remaining in seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(test.durationMinutes * 60);

  // Active question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Student answers mapping: questionId -> answer text or optionId
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Suspicious events logged
  const [suspiciousEvents, setSuspiciousEvents] = useState<SuspiciousExamEvent[]>([]);
  const [activeWarning, setActiveWarning] = useState<string | null>(null);

  // Confirmation dialogs
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState<StudentTestSubmission | null>(null);

  const examStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  // Randomize questions if enabled
  const orderedQuestions: TestQuestion[] = useMemo(() => {
    if (!test.randomizeQuestions) return test.questions;
    // Stable shuffle for this session
    return [...test.questions].sort(() => 0.5 - Math.random());
  }, [test]);

  // Native Android Platform-supported FLAG_SECURE protection
  useEffect(() => {
    if (hasStartedExam) {
      // Enable secure screen on Android native WebView / capacitor
      onlineTestService.setAndroidSecureScreen(true);
    }
    return () => {
      // Disable secure screen upon exit
      onlineTestService.setAndroidSecureScreen(false);
    };
  }, [hasStartedExam]);

  // Record suspicious security event helper
  const recordSuspiciousEvent = (
    type: SuspiciousExamEvent['type'],
    descriptionEn: string,
    descriptionKn: string
  ) => {
    const newEvent: SuspiciousExamEvent = {
      id: `se-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      descriptionEn,
      descriptionKn,
    };

    setSuspiciousEvents(prev => [...prev, newEvent]);
    setActiveWarning(
      language === 'kn'
        ? `ಗಮನಿಸಿ: ಪರೀಕ್ಷಾ ಸಮಗ್ರತೆ ನಿಯಮ ಉಲ್ಲಂಘನೆ ಪತ್ತೆಯಾಗಿದೆ (${descriptionKn}). ಇದನ್ನು ಶಿಕ್ಷಕರ ಪರಿಶೀಲನೆಗೆ ದಾಖಲಿಸಲಾಗಿದೆ.`
        : `Integrity notice: Event recorded (${descriptionEn}). Flagged for teacher review.`
    );

    // Notify teacher in real time
    notificationService.notifySuspiciousExamActivity({
      studentName,
      testTitle: test.titleEn,
      activityDetails: descriptionEn,
    });
  };

  // Fullscreen, tab switch, and visibility event handlers
  useEffect(() => {
    if (!hasStartedExam || submissionComplete) return;

    // 1. Visibility Change & Window Blur
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordSuspiciousEvent(
          'VISIBILITY_CHANGE',
          'Tab / window visibility changed during active test',
          'ಪರೀಕ್ಷೆಯ ಸಮಯದಲ್ಲಿ ಟ್ಯಾಬ್ / ವಿಂಡೋ ಬದಲಾವಣೆ ದಾಖಲಾಗಿದೆ'
        );
      }
    };

    const handleWindowBlur = () => {
      recordSuspiciousEvent(
        'WINDOW_BLUR',
        'Browser window lost focus during examination',
        'ಪರೀಕ್ಷಾ ಬ್ರೌಸರ್ ವಿಂಡೋ ಮೇಲಿನ ಗಮನ ತಪ್ಪಿದೆ'
      );
    };

    // 2. Fullscreen Exit detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordSuspiciousEvent(
          'FULLSCREEN_EXIT',
          'Fullscreen mode was exited during active test',
          'ಪರೀಕ್ಷೆಯ ಸಮಯದಲ್ಲಿ ಪೂರ್ಣ ಪರದೆ (Fullscreen) ನಿರ್ಗಮಿಸಲಾಗಿದೆ'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [hasStartedExam, submissionComplete, language]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!hasStartedExam || submissionComplete) return;

    timerIntervalRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleFinalSubmit('AUTO_SUBMITTED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [hasStartedExam, submissionComplete]);

  // Start exam & request fullscreen
  const handleStartExam = async () => {
    examStartTimeRef.current = Date.now();
    setHasStartedExam(true);

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // In some iframe / browser environments requestFullscreen might be blocked; continue gracefully
    }
  };

  // Submit test (manual or auto-expired)
  const handleFinalSubmit = (status: 'SUBMITTED' | 'AUTO_SUBMITTED' = 'SUBMITTED') => {
    setIsSubmitting(true);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    // Exit fullscreen safely
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    } catch {
      // ignore
    }

    const timeTakenSeconds = Math.round((Date.now() - examStartTimeRef.current) / 1000);

    // Auto calculate MCQ score
    let calculatedScore = 0;
    test.questions.forEach(q => {
      if (q.type === 'MULTIPLE_CHOICE' && q.correctOptionId) {
        if (answers[q.id] === q.correctOptionId) {
          calculatedScore += q.marks;
        }
      }
    });

    const hasSuspiciousEvents = suspiciousEvents.length > 0;
    const finalStatus = test.questions.some(q => q.type === 'DESCRIPTIVE') ? status : 'GRADED';
    const percentage = Math.round((calculatedScore / test.totalMarks) * 100);

    const submission: StudentTestSubmission = {
      id: `sub-${studentId}-${test.id}-${Date.now()}`,
      testId: test.id,
      studentId,
      studentName,
      studentNameKn,
      rollNumber,
      classId: test.classId,
      startedAt: new Date(examStartTimeRef.current).toISOString(),
      submittedAt: new Date().toISOString(),
      timeTakenSeconds,
      status: finalStatus,
      answers,
      score: calculatedScore,
      maxScore: test.totalMarks,
      percentage,
      grade:
        percentage >= 90
          ? 'A+'
          : percentage >= 80
          ? 'A'
          : percentage >= 60
          ? 'B'
          : percentage >= 40
          ? 'C'
          : 'D',
      suspiciousEvents,
      suspiciousCount: suspiciousEvents.length,
      securityStatus: hasSuspiciousEvents ? 'REVIEW_REQUIRED' : 'CLEAN',
      resultsPublished: false,
    };

    onlineTestService.saveOrUpdateSubmission(submission);
    setSubmissionComplete(submission);
    setIsSubmitting(false);
    setIsSubmitConfirmOpen(false);

    // Notify teacher in real time
    notificationService.notifyStudentTestSubmission({
      studentName,
      testTitle: test.titleEn,
      score: calculatedScore,
      totalMarks: test.totalMarks,
    });
  };

  // Format timer
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerColor =
    secondsRemaining < 120
      ? 'bg-rose-500 text-white animate-pulse'
      : secondsRemaining < 300
      ? 'bg-amber-500 text-slate-950 font-bold'
      : 'bg-emerald-800 text-white';

  const currentQ = orderedQuestions[currentQuestionIndex];
  const isAnswered = (qId: string) => Boolean(answers[qId]);

  // Prevent copy / paste / context menu
  const preventCopyPaste = (e: React.SyntheticEvent) => {
    e.preventDefault();
    recordSuspiciousEvent(
      'COPY_ATTEMPT',
      'Text copy or paste attempt intercepted',
      'ಪರೀಕ್ಷೆಯ ಸಮಯದಲ್ಲಿ ನಕಲು (Copy/Paste) ಪ್ರಯತ್ನ ತಡೆಹಿಡಿಯಲಾಗಿದೆ'
    );
  };

  // Watermark text for integrity
  const watermarkText = `${studentName} • ${rollNumber} • ${test.id} • ${new Date().toLocaleDateString()}`;

  // 1. Pre-Exam Security Agreement Screen
  if (!hasStartedExam) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black text-sm">
              <Lock className="w-5 h-5" />
            </span>
            <Badge variant="warning" size="sm">Secure Online Examination</Badge>
          </div>

          <h2 className="text-xl sm:text-2xl font-black">
            {language === 'kn' ? test.titleKn : test.titleEn}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Grade {test.gradeLevel} · {test.subjectName} · {test.questions.length} Questions · {test.totalMarks} Marks · {test.durationMinutes} Minutes
          </p>
        </div>

        {/* Security & Integrity Guidelines */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm pb-2 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>{language === 'kn' ? 'ಪರೀಕ್ಷಾ ಸಮಗ್ರತೆ ಮತ್ತು ಭದ್ರತಾ ನಿಯಮಗಳು' : 'Exam Integrity & Mobile Security'}</span>
          </div>

          <ul className="space-y-2.5 text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-slate-900 block">
                  {language === 'kn' ? 'ಪೂರ್ಣ ಪರದೆ ವಿಧಾನ (Fullscreen Mode):' : 'Fullscreen Examination:'}
                </strong>
                <span>
                  {language === 'kn'
                    ? 'ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭವಾದೊಡನೆ ಬ್ರೌಸರ್ ಪೂರ್ಣ ಪರದೆಗೆ ಬದಲಾಗುತ್ತದೆ. ಪರೀಕ್ಷೆ ಮುಗಿಯುವವರೆಗೆ ಇತರ ಆ್ಯಪ್‌ಗಳಿಗೆ ಬದಲಾಯಿಸಬೇಡಿ.'
                    : 'The test opens in fullscreen. Do not switch tabs or exit fullscreen during the exam.'}
                </span>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-slate-900 block">
                  {language === 'kn' ? 'ಆಂಡ್ರಾಯ್ಡ್ ನೇಟಿವ್ ಸ್ಕ್ರೀನ್ ರಕ್ಷಣೆ (Android FLAG_SECURE):' : 'Android Native Secure Screen:'}
                </strong>
                <span>
                  {language === 'kn'
                    ? 'ಆಂಡ್ರಾಯ್ಡ್ ಆ್ಯಪ್‌ನಲ್ಲಿ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಹಾಗೂ ಸ್ಕ್ರೀನ್ ರೆಕಾರ್ಡಿಂಗ್ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ (FLAG_SECURE ಸಕ್ರಿಯವಾಗಿರುತ್ತದೆ).'
                    : 'On Android native apps, platform-supported screenshot & recording protection (FLAG_SECURE) is automatically engaged.'}
                </span>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-slate-900 block">
                  {language === 'kn' ? 'ನಕಲು ತಡೆ ಮತ್ತು ವಿಂಡೋ ಪರಿಶೀಲನೆ:' : 'Anti-Copy & Activity Auditing:'}
                </strong>
                <span>
                  {language === 'kn'
                    ? 'ಪಠ್ಯ ನಕಲು (Copy/Paste) ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಯಾವುದೇ ಅನಿರೀಕ್ಷಿತ ವಿಂಡೋ ಬದಲಾವಣೆ ಶಿಕ್ಷಕರ ಪರಿಶೀಲನೆಗೆ ದಾಖಲಾಗುತ್ತದೆ.'
                    : 'Copy/paste is disabled. Any window focus changes will be recorded for teacher review without automatically disqualifying you.'}
                </span>
              </div>
            </li>
          </ul>

          {/* Legal / Technical Transparency Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-[11px] leading-relaxed">
            <span className="font-bold block mb-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>{language === 'kn' ? 'ಬ್ರೌಸರ್ ಭದ್ರತಾ ಮಾಹಿತಿ:' : 'Browser Security Notice:'}</span>
            </span>
            <span>
              {language === 'kn'
                ? 'ಗಮನಿಸಿ: ವೆಬ್ ಜಾವಾಸ್ಕ್ರಿಪ್ಟ್ ಬಾಹ್ಯ ಹಾರ್ಡ್‌ವೇರ್ ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ಗಳನ್ನು ಖಚಿತವಾಗಿ ತಡೆಯಲಾರದು. ಆದಾಗ್ಯೂ ಪರೀಕ್ಷಾ ಸಮಗ್ರತೆ ಮತ್ತು ಚಟುವಟಿಕೆಗಳ ಲೆಕ್ಕಪರಿಶೋಧನೆ ಸಕ್ರಿಯವಾಗಿರುತ್ತದೆ.'
                : 'Web browser JavaScript cannot guarantee screenshot prevention against external OS/hardware capture; comprehensive event auditing and watermark tracking are active.'}
            </span>
          </div>

          <div className="pt-3 flex items-center justify-between gap-3">
            <Button variant="outline" size="md" onClick={onExitExam} className="font-bold">
              {language === 'kn' ? 'ಹಿಂದಕ್ಕೆ' : 'Go Back'}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleStartExam}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-black px-6"
              leftIcon={<Maximize2 className="w-4 h-4" />}
            >
              {language === 'kn' ? 'ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ (Start Exam)' : 'Start Exam Now'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Submission Complete Screen
  if (submissionComplete) {
    return (
      <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-6 text-center animate-in zoom-in-95">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-2xl mx-auto shadow-sm">
            🎉
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {language === 'kn' ? 'ಪರೀಕ್ಷೆ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ!' : 'Test Submitted Successfully!'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'kn'
                ? 'ನಿಮ್ಮ ಉತ್ತರಗಳನ್ನು ವರ್ಗ ಶಿಕ್ಷಕಿ ಶ್ರೀಮತಿ ಸಾವಿತ್ರಿ ಹೆಗಡೆ ಅವರ ಪರಿಶೀಲನೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.'
                : 'Your answers have been securely recorded for teacher review and evaluation.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Time Taken</span>
              <span className="text-sm font-black text-slate-800 font-mono">
                {Math.floor(submissionComplete.timeTakenSeconds / 60)}m {submissionComplete.timeTakenSeconds % 60}s
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
              <Badge variant="success" size="sm">
                {submissionComplete.status}
              </Badge>
            </div>
          </div>

          {submissionComplete.suspiciousCount > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 text-left">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Notice: {submissionComplete.suspiciousCount} activity events logged for teacher review.</span>
              </span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Teacher will verify the session before publishing the final report card.
              </p>
            </div>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={() => onFinishExam(submissionComplete)}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-11"
          >
            {language === 'kn' ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ' : 'Return to Dashboard'}
          </Button>
        </div>
      </div>
    );
  }

  // 3. Active Protected Exam Screen
  return (
    <div
      onCopy={preventCopyPaste}
      onPaste={preventCopyPaste}
      onCut={preventCopyPaste}
      onContextMenu={preventCopyPaste}
      className="fixed inset-0 z-50 bg-slate-100 flex flex-col select-none overflow-hidden"
    >
      {/* Subtle anti-leak security watermark layer tiled in background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.035] flex flex-wrap items-center justify-center gap-16 p-8 overflow-hidden select-none font-mono text-xs rotate-[-15deg]">
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} className="whitespace-nowrap font-bold text-slate-900">
            {watermarkText}
          </span>
        ))}
      </div>

      {/* Top Header Bar: Title, Student info, Timer & Finish button */}
      <header className="relative z-10 bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
            📝
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-md">
              {language === 'kn' ? test.titleKn : test.titleEn}
            </h3>
            <p className="text-[10px] text-slate-400">
              {studentName} ({rollNumber}) · Grade {test.gradeLevel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live countdown timer */}
          <div className={`px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-xs ${timerColor}`}>
            <Clock className="w-4 h-4" />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSubmitConfirmOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-3.5"
            rightIcon={<Send className="w-3.5 h-3.5" />}
          >
            {language === 'kn' ? 'ಸಲ್ಲಿಸಿ' : 'Submit'}
          </Button>
        </div>
      </header>

      {/* Warning banner if suspicious activity recorded */}
      {activeWarning && (
        <div className="relative z-10 bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="truncate">{activeWarning}</span>
          </div>
          <button onClick={() => setActiveWarning(null)} className="p-0.5 hover:bg-amber-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Examination Canvas */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left / Main Question Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-between">
          <div className="space-y-5">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">
                {language === 'kn' ? 'ಪ್ರಶ್ನೆ' : 'Question'} {currentQuestionIndex + 1} of {orderedQuestions.length}
              </span>
              <Badge variant="info" size="sm">
                {currentQ.marks} {language === 'kn' ? 'ಅಂಕಗಳು' : 'Marks'}
              </Badge>
            </div>

            {/* Question Text */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-relaxed">
                {language === 'kn' ? currentQ.questionTextKn : currentQ.questionTextEn}
              </h2>
            </div>

            {/* Answer Input: MCQ options or Descriptive textarea */}
            {currentQ.type === 'MULTIPLE_CHOICE' && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt.id }))}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100 border-amber-500 text-slate-950 font-bold shadow-xs ring-2 ring-amber-400'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{language === 'kn' ? opt.textKn : opt.textEn}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {currentQ.type === 'DESCRIPTIVE' && (
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  {language === 'kn' ? 'ನಿಮ್ಮ ವಿವರಣಾತ್ಮಕ ಉತ್ತರವನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ:' : 'Type your descriptive answer below:'}
                </label>
                <textarea
                  rows={6}
                  value={answers[currentQ.id] || ''}
                  onChange={e => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                  placeholder={
                    language === 'kn'
                      ? 'ಉತ್ತರವನ್ನು ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಬರೆಯಿರಿ...'
                      : 'Provide a clear, age-appropriate answer...'
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Navigation Controls: Previous / Next */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-3 mt-6">
            <Button
              variant="outline"
              size="md"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              className="font-bold"
            >
              {language === 'kn' ? 'ಹಿಂದಿನ ಪ್ರಶ್ನೆ' : 'Previous'}
            </Button>

            {currentQuestionIndex + 1 < orderedQuestions.length ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5"
              >
                {language === 'kn' ? 'ಮುಂದಿನ ಪ್ರಶ್ನೆ' : 'Next Question'}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsSubmitConfirmOpen(true)}
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6"
              >
                {language === 'kn' ? 'ಪರೀಕ್ಷೆ ಮುಗಿಸಿ' : 'Finish & Submit'}
              </Button>
            )}
          </div>
        </main>

        {/* Right / Side Question Navigator Panel */}
        <aside className="w-full md:w-72 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              {language === 'kn' ? 'ಪ್ರಶ್ನೆಗಳ ಕೋಷ್ಟಕ' : 'Question Palette'}
            </h4>
            <Badge variant="neutral" size="sm">
              {Object.keys(answers).length} / {orderedQuestions.length} Done
            </Badge>
          </div>

          {/* Question Grid Pills */}
          <div className="grid grid-cols-5 gap-2">
            {orderedQuestions.map((q, idx) => {
              const active = idx === currentQuestionIndex;
              const answered = isAnswered(q.id);

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 font-black shadow-xs'
                      : answered
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="space-y-1.5 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-500" />
              <span>{language === 'kn' ? 'ಪ್ರಸ್ತುತ ಪ್ರಶ್ನೆ' : 'Current Question'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-300" />
              <span>{language === 'kn' ? 'ಉತ್ತರಿಸಲಾಗಿದೆ' : 'Answered'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-100" />
              <span>{language === 'kn' ? 'ಉತ್ತರಿಸಲಾಗಿಲ್ಲ' : 'Unanswered'}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Dialog Modal */}
      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsSubmitConfirmOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl z-10 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-base text-slate-900">
                {language === 'kn' ? 'ಪರೀಕ್ಷೆಯನ್ನು ಸಲ್ಲಿಸಬೇಕೆ?' : 'Submit this examination?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You have answered {Object.keys(answers).length} of {orderedQuestions.length} questions.
                Once submitted, answers cannot be edited.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="font-bold"
              >
                {language === 'kn' ? 'ಹಿಂತಿರುಗಿ' : 'Review'}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleFinalSubmit('SUBMITTED')}
                disabled={isSubmitting}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              >
                {language === 'kn' ? 'ಹೌದು, ಸಲ್ಲಿಸಿ' : 'Yes, Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
