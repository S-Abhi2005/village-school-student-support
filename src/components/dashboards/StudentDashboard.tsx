import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Award, 
  Flame, 
  Star, 
  Clock, 
  Play, 
  CheckCircle2, 
  Heart,
  HelpCircle,
  Bell,
  User as UserIcon,
  Bot,
  Mic,
  FileText,
  CalendarCheck,
  TrendingUp,
  ChevronRight,
  Download,
  Printer,
  Volume2,
  AlertCircle,
  Check,
  X,
  Share2,
  UtensilsCrossed,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  MOCK_STUDENTS, 
  MOCK_SUBJECTS, 
  MOCK_TESTS, 
  MOCK_STUDENT_MARKS 
} from '../../mock/schoolData';
import { ActionModalType } from './QuickActionModal';
import { onlineTestService, OnlineTest, StudentTestSubmission } from '../../services/onlineTestService';
import { StudentExamScreen } from '../online-test/StudentExamScreen';
import { StudentResultModal } from '../online-test/StudentResultModal';

interface StudentDashboardProps {
  onNavigate?: (tab: string) => void;
  onOpenActionModal?: (type: ActionModalType) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onOpenActionModal,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  // Active student profile (Kavya Gowda)
  const student = MOCK_STUDENTS[0];

  // Modals state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isUpcomingTestModalOpen, setIsUpcomingTestModalOpen] = useState(false);
  const [isScorecardModalOpen, setIsScorecardModalOpen] = useState(false);
  const [isInteractiveQuizOpen, setIsInteractiveQuizOpen] = useState(false);
  const [isExamPickerOpen, setIsExamPickerOpen] = useState(false);
  const [activeSecureExam, setActiveSecureExam] = useState<OnlineTest | null>(null);
  const [viewingResultModal, setViewingResultModal] = useState<{
    test: OnlineTest;
    submission: StudentTestSubmission;
  } | null>(null);

  // Subject selection for textbook view
  const [selectedSubject, setSelectedSubject] = useState<string>('KAN-05');

  // Interactive daily learning activity checklist
  const [dailyActivities, setDailyActivities] = useState([
    {
      id: 'act-1',
      time: '09:30 AM',
      titleKn: 'ಬೆಳಗಿನ ಪ್ರಾರ್ಥನೆ & ಕನ್ನಡ ನಾಡಗೀತೆ',
      titleEn: 'Morning Assembly & State Anthem',
      descKn: 'ಶಾಲಾ ಮೈದಾನದಲ್ಲಿ ಪ್ರಾರ್ಥನೆ ಮತ್ತು ದಿನಪತ್ರಿಕೆ ಓದುವಿಕೆ',
      descEn: 'Assembly prayer, pledge, and daily newspaper reading',
      completed: true,
      category: 'PRAYER',
      icon: '🙏',
    },
    {
      id: 'act-2',
      time: '10:15 AM',
      titleKn: 'ಕನ್ನಡ ವಾಚನ & ನಲಿಕಲಿ ಕಾರ್ಡ್ ಅಭ್ಯಾಸ',
      titleEn: 'Kannada Reading & Nali-Kali Story Card',
      descKn: '"ತೆನಾಲಿ ರಾಮ" ಕಥೆಯ ವಾಚನ ಮತ್ತು ಒತ್ತಕ್ಷರಗಳ ಅಭ್ಯಾಸ',
      descEn: 'Reading "Tenali Rama" story and practicing double consonants',
      completed: true,
      category: 'KANNADA',
      icon: '📖',
    },
    {
      id: 'act-3',
      time: '11:30 AM',
      titleKn: 'ಗಣಿತ: ೪ ರ ಮಗ್ಗಿ & ಸರಳ ಭಾಗಾಕಾರ',
      titleEn: 'Mathematics: 4x Tables & Division',
      descKn: '೪ ರ ಮಗ್ಗಿ ಕಂಠಪಾಠ ಮತ್ತು ೨೦ ಲೆಕ್ಕಗಳ ಅಭ್ಯಾಸ ಹಾಳೆ',
      descEn: 'Reciting 4x table and solving 20 classroom worksheet problems',
      completed: false,
      category: 'MATH',
      icon: '🔢',
    },
    {
      id: 'act-4',
      time: '01:00 PM',
      titleKn: 'ಬಿಸಿ ಮಧ್ಯಾಹ್ನದ ಊಟ & ಹಾಲಿನ ವಿತರಣೆ',
      titleEn: 'Mid-Day Meal Hot Lunch & Milk',
      descKn: 'ಬಿಸಿಬೇಳೆಭಾತ್, ತರಕಾರಿ ಸಾಂಬಾರ್ ಹಾಗೂ ಬೇಯಿಸಿದ ಮೊಟ್ಟೆ / ಬಾಳೆಹಣ್ಣು',
      descEn: 'Nutritious hot rice-sambar with boiled egg or banana',
      completed: false,
      category: 'MEAL',
      icon: '🍛',
    },
    {
      id: 'act-5',
      time: '02:00 PM',
      titleKn: 'ಪರಿಸರ ಅಧ್ಯಯನ: ಸಸ್ಯಗಳ ಎಲೆಗಳ ಸಂಗ್ರಹ',
      titleEn: 'EVS Science: Nature Walk & Leaf Collection',
      descKn: 'ಶಾಲಾ ಕೈತೋಟದ ಗಿಡಗಳ ಎಲೆಗಳನ್ನು ಗುರುತಿಸಿ ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ತಿಳಿಯುವುದು',
      descEn: 'Identifying leaves in school garden to learn photosynthesis',
      completed: false,
      category: 'SCIENCE',
      icon: '🌿',
    },
    {
      id: 'act-6',
      time: '03:15 PM',
      titleKn: 'ಯೋಗಾಸನ & ಖೋ-ಖೋ ಆಟ',
      titleEn: 'Physical Education & Kho-Kho Game',
      descKn: 'ಸೂರ್ಯನಮಸ್ಕಾರ ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ಗ್ರಾಮೀಣ ಆಟಗಳು',
      descEn: 'Surya Namaskar and traditional outdoor team games',
      completed: false,
      category: 'SPORTS',
      icon: '🏃‍♀️',
    },
  ]);

  // Quiz state for interactive "Start Test"
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const QUIZ_QUESTIONS = [
    {
      questionKn: 'ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು ಅವರ ಜನ್ಮಸ್ಥಳ ಯಾವುದು?',
      questionEn: 'What is the birthplace of Rashtrakavi Kuvempu?',
      optionsKn: ['ಕುಪ್ಪಳ್ಳಿ', 'ಬೆಂಗಳೂರು', 'ಮೈಸೂರು', 'ಧಾರವಾಡ'],
      optionsEn: ['Kuppalli', 'Bengaluru', 'Mysuru', 'Dharwad'],
      correctIndex: 0,
      explanationKn: 'ಕುವೆಂಪು ಅವರು ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆಯ ತೀರ್ಥಹಳ್ಳಿ ತಾಲೂಕಿನ ಕುಪ್ಪಳ್ಳಿಯಲ್ಲಿ ಜನಿಸಿದರು.',
      explanationEn: 'Kuvempu was born in Kuppalli, Thirthahalli taluk of Shivamogga district.',
    },
    {
      questionKn: 'ಗಣಿತ ಲೆಕ್ಕ: ೪ × ೬ ರ ಮೌಲ್ಯ ಎಷ್ಟು?',
      questionEn: 'Math Problem: What is 4 × 6?',
      optionsKn: ['೨೦', '೨೪', '೨೮', '೧೬'],
      optionsEn: ['20', '24', '28', '16'],
      correctIndex: 1,
      explanationKn: '೪ × ೬ = ೨೪ (ನಾಲ್ಕು ಆರಲಿ ಇಪ್ಪತ್ತನಾಲ್ಕು).',
      explanationEn: '4 × 6 = 24.',
    },
    {
      questionKn: 'ಸಸ್ಯಗಳು ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ಕ್ರಿಯೆಯಲ್ಲಿ ನಮಗೆ ನೀಡುವ ಅನಿಲ ಯಾವುದು?',
      questionEn: 'Which gas do plants release during photosynthesis?',
      optionsKn: ['ಆಮ್ಲಜನಕ (Oxygen)', 'ಇಂಗಾಲದ ಡೈಆಕ್ಸೈಡ್', 'ಸಾರಜನಕ', 'ಮೀಥೇನ್'],
      optionsEn: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Methane'],
      correctIndex: 0,
      explanationKn: 'ಸಸ್ಯಗಳು ನಮಗೆ ಉಸಿರಾಡಲು ಜೀವವಾಯುವಾದ ಆಮ್ಲಜನಕವನ್ನು ನೀಡುತ್ತವೆ.',
      explanationEn: 'Plants produce clean oxygen for us to breathe.',
    },
    {
      questionKn: 'ಕರ್ನಾಟಕದ ರಾಜ್ಯ ಪ್ರಾಣಿ ಯಾವುದು?',
      questionEn: 'What is the State Animal of Karnataka?',
      optionsKn: ['ಏಷ್ಯನ್ ಆನೆ (Elephant)', 'ಹುಲಿ', 'ಸಿಂಹ', 'ಜಿಂಕೆ'],
      optionsEn: ['Asian Elephant', 'Tiger', 'Lion', 'Deer'],
      correctIndex: 0,
      explanationKn: 'ಕರ್ನಾಟಕದ ರಾಜ್ಯ ಪ್ರಾಣಿ ಏಷ್ಯನ್ ಆನೆ.',
      explanationEn: 'The Asian Elephant is the State Animal of Karnataka.',
    },
  ];

  const handleToggleActivity = (id: string) => {
    setDailyActivities(prev =>
      prev.map(a => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const handleAnswerQuiz = (index: number) => {
    setQuizSelectedOption(index);
    if (index === QUIZ_QUESTIONS[quizQuestionIndex].correctIndex) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizQuestionIndex + 1 < QUIZ_QUESTIONS.length) {
      setQuizQuestionIndex(prev => prev + 1);
      setQuizSelectedOption(null);
    } else {
      setIsQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setQuizQuestionIndex(0);
    setQuizSelectedOption(null);
    setQuizScore(0);
    setIsQuizFinished(false);
  };

  const studentMarks = MOCK_STUDENT_MARKS.filter(m => m.studentId === student.id);
  const latestMark = studentMarks[0] || {
    marksObtained: 24,
    totalMarks: 25,
    percentage: 96,
    grade: 'A+',
    testTitle: 'ಕನ್ನಡ ಘಟಕ ಪರೀಕ್ಷೆ - ೧',
    teacherRemarksKn: 'ಉತ್ತಮ ವಾಚನ ಹಾಗೂ ಸುಂದರ ಕೈಬರಹ. ಶಾಭಾಸ್!',
    teacherRemarks: 'Excellent reading fluency and neat handwriting.',
  };

  // If student started a protected online examination, render the full-screen secure exam canvas
  if (activeSecureExam) {
    return (
      <StudentExamScreen
        test={activeSecureExam}
        studentId={student.id}
        studentName={`${student.firstName} ${student.lastName}`}
        studentNameKn={`${student.firstNameKn} ${student.lastNameKn}`}
        rollNumber={student.rollNumber}
        onExitExam={() => setActiveSecureExam(null)}
        onFinishExam={(submission) => {
          setActiveSecureExam(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ============================================================== */}
      {/* 1. TOP SECTION: Name, Class, Profile, Notifications & Welcome */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden">
        {/* Playful background illustration accents */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Student Profile Identity */}
          <div className="flex items-start sm:items-center gap-4">
            {/* Student Avatar with Gold Star level badge */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-2xl shadow-md border-3 border-amber-300">
                👩‍🎓
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-xs">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-amber-300 text-xs font-bold border border-emerald-600/40 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'kn' ? 'ನಲಿಕಲಿ ಹಸಿರು ಕಾರ್ಡ್ · ಹಂತ ೩' : 'Nali-Kali Green Card · Level 3'}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-200 text-xs font-medium">
                  Roll: {student.rollNumber}
                </span>
              </div>

              {/* Student Name */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
                {language === 'kn' ? `${student.firstNameKn} ${student.lastNameKn}` : `${student.firstName} ${student.lastName}`}
              </h1>

              {/* Class & School Details */}
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-amber-200">
                  {language === 'kn' ? '೫ ನೇ ತರಗತಿ "ಅ" ವಿಭಾಗ' : 'Grade 5 Section A'}
                </span>
                <span>•</span>
                <span>Govt. Model Higher Primary School, Hosahalli</span>
              </p>
            </div>
          </div>

          {/* Quick Header Buttons: Notifications & Profile Dossier */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* Notification Bell Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2.5 rounded-2xl bg-emerald-900/80 hover:bg-emerald-700 text-white border border-emerald-600/50 cursor-pointer transition-colors shadow-xs"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-amber-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse border-2 border-emerald-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-700" />
                      <span>{language === 'kn' ? 'ಶಾಲಾ ಪ್ರಕಟಣೆಗಳು' : 'School Notices & Alerts'}</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {unreadCount} {language === 'kn' ? 'ಹೊಸತು' : 'new'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {notifications.slice(0, 4).map(n => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3 rounded-xl border text-xs transition-colors cursor-pointer ${
                          !n.isRead ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {language === 'kn' ? n.titleKn : n.titleEn}
                          </span>
                          <Badge variant={n.isUrgent ? 'danger' : 'neutral'} size="sm">
                            {n.category}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {language === 'kn' ? n.bodyKn : n.bodyEn}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{n.createdAt}</span>
                          {n.audioDurationSeconds && (
                            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                              <Volume2 className="w-3 h-3" />
                              <span>{language === 'kn' ? 'ಧ್ವನಿ ಪ್ರಕಟಣೆ' : 'Voice Alert'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        onNavigate && onNavigate('notices');
                      }}
                      className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      {language === 'kn' ? 'ಎಲ್ಲ ಪ್ರಕಟಣೆಗಳನ್ನು ನೋಡಿ →' : 'View All Notices →'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dossier Button */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <UserIcon className="w-4 h-4 text-slate-950" />
              <span>{language === 'kn' ? 'ನನ್ನ ಪ್ರೊಫೈಲ್' : 'My Profile'}</span>
            </button>
          </div>
        </div>

        {/* Inspiring Welcome Banner */}
        <div className="relative z-10 mt-5 pt-4 border-t border-emerald-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-400/20 text-amber-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <p className="text-xs sm:text-sm font-medium text-emerald-100">
              {language === 'kn'
                ? 'ನಮಸ್ಕಾರ ಕಾವ್ಯಾ! ನೀನು ಸತತ ೧೨ ದಿನಗಳಿಂದ ಶಾಲೆಗೆ ಹಾಜರಾಗಿ ೪೫ ನಕ್ಷತ್ರಗಳನ್ನು ಗಳಿಸಿದ್ದೀಯಾ! ಶಾಭಾಸ್!'
                : 'Namaskara Kavya! You have a 12-day school streak with 45 star badges earned. Keep shining!'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-emerald-900/80 text-amber-300 text-xs font-bold flex items-center gap-1 border border-emerald-600/40">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'kn' ? '೧೨ ದಿನಗಳ ಸರಣಿ' : '12-Day Streak'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. STATS CARDS: Attendance, Latest Marks, Upcoming Tests, Progress */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Attendance Card */}
        <div
          onClick={() => setIsAttendanceModalOpen(true)}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'kn' ? 'ಹಾಜರಾತಿ' : 'Attendance'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-slate-900">96.5%</h3>
              <Badge variant="success" size="sm">
                {language === 'kn' ? 'ಇಂದು ಹಾಜರ್' : 'Present'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'kn' ? '೧೨ ದಿನಗಳ ಸತತ ಹಾಜರಾತಿ · ಸಕ್ರಿಯ' : '12-day active attendance streak'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">
            <span>{language === 'kn' ? 'ತಿಂಗಳ ದಾಖಲೆ ನೋಡಿ' : 'View Calendar'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 2. Latest Marks Card */}
        <div
          onClick={() => setIsScorecardModalOpen(true)}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'kn' ? 'ಇತ್ತೀಚಿನ ಅಂಕಗಳು' : 'Latest Marks'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-slate-900">
                {latestMark.marksObtained} <span className="text-sm font-semibold text-slate-400">/ {latestMark.totalMarks}</span>
              </h3>
              <Badge variant="success" size="sm">
                Grade {latestMark.grade}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1 truncate font-medium">
              {latestMark.testTitle} ({latestMark.percentage}%)
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-amber-800 font-bold group-hover:translate-x-0.5 transition-transform">
            <span>{language === 'kn' ? 'ಪ್ರಗತಿ ಪತ್ರಿಕೆ ನೋಡಿ' : 'View Scorecard'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 3. Upcoming Tests Card */}
        <div
          onClick={() => setIsUpcomingTestModalOpen(true)}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-sky-500 hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'kn' ? 'ಮುಂದಿನ ಪರೀಕ್ಷೆ' : 'Upcoming Test'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 truncate">
              {language === 'kn' ? 'ಗಣಿತ ಘಟಕ ಪರೀಕ್ಷೆ' : 'Math Unit Test'}
            </h3>
            <p className="text-xs text-sky-700 font-bold mt-1 flex items-center gap-1">
              <span>ಅಕ್ಟೋಬರ್ ೨ (ಇನ್ನು ೫ ದಿನಗಳು)</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Grade 5 · 25 Marks · 45 Mins
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-sky-700 font-bold group-hover:translate-x-0.5 transition-transform">
            <span>{language === 'kn' ? 'ಪಠ್ಯಕ್ರಮ & ಅಭ್ಯಾಸ' : 'Syllabus & Prep'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 4. Learning Progress Card */}
        <div
          onClick={() => {
            onNavigate && onNavigate('tests-marks');
          }}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'kn' ? 'ಕಲಿಕಾ ಪ್ರಗತಿ' : 'Learning Progress'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-slate-900">78%</h3>
              <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                45 ⭐ {language === 'kn' ? 'ನಕ್ಷತ್ರ' : 'Stars'}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-indigo-600 h-full rounded-full transition-all"
                style={{ width: '78%' }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {language === 'kn' ? '೧ ನೇ ಅವಧಿಯ ೩೪/೪೨ ಪಾಠಗಳು ಪೂರ್ಣ' : '34/42 Term 1 topics mastered'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-700 font-bold group-hover:translate-x-0.5 transition-transform">
            <span>{language === 'kn' ? 'ಪೂರ್ಣ ವರದಿ ನೋಡಿ' : 'Full Progress'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. QUICK ACTIONS (Large Mobile Touch Targets) */}
      {/* ============================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>{language === 'kn' ? 'ತ್ವರಿತ ಕಲಿಕಾ ಚಟುವಟಿಕೆಗಳು' : 'Quick Actions & Learning Hub'}</span>
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">
            {language === 'kn' ? 'ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಕಲಿಯಿರಿ' : 'One-touch learning shortcuts'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Action 1: Start Test */}
          <button
            onClick={() => setIsExamPickerOpen(true)}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-center group min-h-[110px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/90 text-amber-700 flex items-center justify-center shadow-xs mb-2 group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-amber-700 text-amber-700 ml-0.5" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold leading-snug">
              {language === 'kn' ? 'ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ' : 'Start Test'}
            </span>
            <span className="text-[10px] text-amber-950/80 mt-0.5 font-semibold">
              {language === 'kn' ? 'ಆನ್‌ಲೈನ್ ಪರೀಕ್ಷೆ & ರಸಪ್ರಶ್ನೆ' : 'Online Exam & Quiz'}
            </span>
          </button>

          {/* Action 2: AI Learning Assistant */}
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('ai-tutor');
              }
            }}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-center group min-h-[110px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-amber-300 flex items-center justify-center shadow-xs mb-2 group-hover:scale-110 transition-transform border border-emerald-400/30">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold leading-snug">
              {language === 'kn' ? 'AI ಕಲಿಕಾ ಮಿತ್ರ' : 'AI Assistant'}
            </span>
            <span className="text-[10px] text-emerald-100 mt-0.5 font-semibold">
              {language === 'kn' ? 'ಕನ್ನಡ / ಇಂಗ್ಲಿಷ್' : 'Ask Any Question'}
            </span>
          </button>

          {/* Action 3: Voice Assessment */}
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('voice-assessment');
              }
            }}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-center group min-h-[110px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-xs mb-2 group-hover:scale-110 transition-transform border border-rose-300/30">
              <Mic className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold leading-snug">
              {language === 'kn' ? 'ಧ್ವನಿ ಓದುವಿಕೆ' : 'Voice Assessment'}
            </span>
            <span className="text-[10px] text-rose-100 mt-0.5 font-semibold">
              {language === 'kn' ? 'ಉಚ್ಛಾರಣೆ ಪರೀಕ್ಷೆ' : 'Pronunciation & Read'}
            </span>
          </button>

          {/* Action 4: Learning Materials */}
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('materials');
              }
            }}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-center group min-h-[110px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-xs mb-2 group-hover:scale-110 transition-transform border border-indigo-300/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold leading-snug">
              {language === 'kn' ? 'ಕಲಿಕಾ ಸಾಮಗ್ರಿಗಳು' : 'Learning Materials'}
            </span>
            <span className="text-[10px] text-indigo-100 mt-0.5 font-semibold">
              {language === 'kn' ? 'ವರ್ಕ್‌ಶೀಟ್ & ಕಥೆಗಳು' : 'Worksheets & Audio'}
            </span>
          </button>

          {/* Action 5: My Results */}
          <button
            onClick={() => setIsScorecardModalOpen(true)}
            className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-center group min-h-[110px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-amber-300 flex items-center justify-center shadow-xs mb-2 group-hover:scale-110 transition-transform border border-teal-300/30">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold leading-snug">
              {language === 'kn' ? 'ನನ್ನ ಫಲಿತಾಂಶಗಳು' : 'My Results'}
            </span>
            <span className="text-[10px] text-teal-100 mt-0.5 font-semibold">
              {language === 'kn' ? 'ಪ್ರಗತಿ ಪತ್ರಿಕೆ & ಅಂಕ' : 'Scorecards & Grades'}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. TODAY'S LEARNING ACTIVITY (Interactive Daily Checklist & Timeline) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Learning Activity Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-700" />
                  <span>{language === 'kn' ? 'ಇಂದಿನ ಶಾಲಾ ಕಲಿಕಾ ಚಟುವಟಿಕೆಗಳು' : "Today's Learning Activity Schedule"}</span>
                </CardTitle>
                <CardDescription>
                  {language === 'kn'
                    ? 'ದೈನಂದಿನ ವೇಳಾಪಟ್ಟಿ, ಪ್ರಾರ್ಥನೆ, ಪಾಠಗಳು ಮತ್ತು ಬಿಸಿ ಊಟದ ವಿವರ'
                    : 'Check off your completed daily tasks and earn gold stars'}
                </CardDescription>
              </div>
              <Badge variant="info" size="sm">
                {dailyActivities.filter(a => a.completed).length} / {dailyActivities.length} {language === 'kn' ? 'ಪೂರ್ಣ' : 'Done'}
              </Badge>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-3">
              {dailyActivities.map((act, idx) => (
                <div
                  key={act.id}
                  onClick={() => handleToggleActivity(act.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    act.completed
                      ? 'bg-emerald-50/60 border-emerald-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {/* Checkbox trigger button */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      act.completed
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border-2 border-slate-300 bg-white text-transparent hover:border-emerald-500'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{act.icon}</span>
                        <h4
                          className={`font-bold text-xs sm:text-sm ${
                            act.completed ? 'text-emerald-950 line-through' : 'text-slate-900'
                          }`}
                        >
                          {language === 'kn' ? act.titleKn : act.titleEn}
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {act.time}
                      </span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                      {language === 'kn' ? act.descKn : act.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Kannada Story Corner & Teacher Praise */}
        <div className="space-y-4">
          {/* Kannada Story Corner */}
          <Card className="border-amber-200 bg-gradient-to-b from-amber-50/60 to-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  {language === 'kn' ? 'ಕನ್ನಡ ಕಥಾ ಲೋಕ' : 'Kannada Story Corner'}
                </span>
                <span className="text-[11px] text-amber-900 font-bold">5 min read</span>
              </div>
              <CardTitle className="text-sm sm:text-base text-amber-950 mt-1.5">
                {language === 'kn' ? 'ತೆನಾಲಿ ರಾಮನ ಜಾಣ್ಮೆ ಮತ್ತು ರಸಗುಲ್ಲ' : 'Tenali Rama and the Royal Mangoes'}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 p-4 sm:p-5 pt-0">
              <p className="text-xs text-amber-900/90 leading-relaxed">
                {language === 'kn'
                  ? 'ವಿಜಯನಗರದ ರಾಜ ಕೃಷ್ಣದೇವರಾಯರ ಆಸ್ಥಾನದಲ್ಲಿ ತೆನಾಲಿ ರಾಮನು ತನ್ನ ಬುದ್ಧಿವಂತಿಕೆಯಿಂದ ಸಮಸ್ಯೆಯನ್ನು ಬಗೆಹರಿಸಿ, ಗ್ರಾಮದ ರೈತರಿಗೆ ನ್ಯಾಯ ಕೊಡಿಸಿದ ಕಥೆ.'
                  : 'A witty village tale of intellect and kindness from the court of Krishnadevaraya.'}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsInteractiveQuizOpen(true)}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs"
                  leftIcon={<Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />}
                >
                  {language === 'kn' ? 'ಕಥೆ & ರಸಪ್ರಶ್ನೆ' : 'Read & Quiz'}
                </Button>
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  +5 Stars
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Savitri's Personal Praise Note */}
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  ಸ
                </div>
                <div>
                  <h4 className="font-bold text-xs text-emerald-950">
                    {language === 'kn' ? 'ಸಾವಿತ್ರಿ ಟೀಚರ್ (ವರ್ಗ ಶಿಕ್ಷಕಿ)' : 'Smt. Savitri Hegde (Class Teacher)'}
                  </h4>
                  <p className="text-[10px] text-emerald-700 font-medium">Govt. School, Hosahalli</p>
                </div>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed italic bg-white/70 p-3 rounded-xl border border-emerald-200/60">
                {language === 'kn'
                  ? '"ಕಾವ್ಯಾ, ನೀನು ನಿನ್ನೆ ಗಣಿತದ ೪ ರ ಮಗ್ಗಿಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಒಪ್ಪಿಸಿದ್ದೀಯಾ ಹಾಗೂ ಸುಂದರ ಕನ್ನಡ ಕೈಬರಹಕ್ಕೆ ಪ್ರಥಮ ಸ್ಥಾನ ಪಡೆದಿದ್ದೀಯಾ. ಶಾಭಾಸ್!"'
                  : '"Kavya recited the 4x table flawlessly yesterday and won 1st place in Kannada calligraphy. Wonderful work!"'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. MODAL 1: INTERACTIVE QUIZ MODAL (Start Test) */}
      {/* ============================================================== */}
      {isInteractiveQuizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsInteractiveQuizOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl z-10 space-y-5 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Play className="w-4 h-4 fill-amber-700 text-amber-700" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {language === 'kn' ? 'ಕನ್ನಡ & ಗಣಿತ ಅಭ್ಯಾಸ ಪರೀಕ್ಷೆ' : 'Interactive Practice Test'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Grade 5 · Karnataka Primary</p>
                </div>
              </div>
              <button
                onClick={() => setIsInteractiveQuizOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isQuizFinished ? (
              <div className="space-y-4">
                {/* Progress bar */}
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>
                    Question {quizQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
                  </span>
                  <span className="text-emerald-700 font-bold">Score: {quizScore} ⭐</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{
                      width: `${((quizQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Question */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    {language === 'kn' ? 'ಪ್ರಶ್ನೆ' : 'Question'} {quizQuestionIndex + 1}
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                    {language === 'kn'
                      ? QUIZ_QUESTIONS[quizQuestionIndex].questionKn
                      : QUIZ_QUESTIONS[quizQuestionIndex].questionEn}
                  </h4>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {QUIZ_QUESTIONS[quizQuestionIndex].optionsKn.map((opt, optIdx) => {
                    const isSelected = quizSelectedOption === optIdx;
                    const isCorrect = optIdx === QUIZ_QUESTIONS[quizQuestionIndex].correctIndex;
                    const hasAnswered = quizSelectedOption !== null;

                    let btnClass = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';
                    if (hasAnswered) {
                      if (isCorrect) {
                        btnClass = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                      } else if (isSelected && !isCorrect) {
                        btnClass = 'bg-rose-100 border-rose-400 text-rose-950';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => !hasAnswered && handleAnswerQuiz(optIdx)}
                        disabled={hasAnswered}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                      >
                        <span>
                          {language === 'kn'
                            ? opt
                            : QUIZ_QUESTIONS[quizQuestionIndex].optionsEn[optIdx]}
                        </span>
                        {hasAnswered && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation if answered */}
                {quizSelectedOption !== null && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed animate-in fade-in">
                    <span className="font-bold text-emerald-800 block mb-0.5">
                      {language === 'kn' ? 'ಸರಿಯಾದ ವಿವರಣೆ:' : 'Explanation:'}
                    </span>
                    {language === 'kn'
                      ? QUIZ_QUESTIONS[quizQuestionIndex].explanationKn
                      : QUIZ_QUESTIONS[quizQuestionIndex].explanationEn}
                  </div>
                )}

                {/* Next button */}
                {quizSelectedOption !== null && (
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-11"
                    onClick={handleNextQuizQuestion}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {quizQuestionIndex + 1 < QUIZ_QUESTIONS.length
                      ? language === 'kn'
                        ? 'ಮುಂದಿನ ಪ್ರಶ್ನೆ →'
                        : 'Next Question →'
                      : language === 'kn'
                      ? 'ಫಲಿತಾಂಶ ನೋಡಿ'
                      : 'Finish Quiz'}
                  </Button>
                )}
              </div>
            ) : (
              /* Quiz Finished Screen */
              <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-3xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-2xl mx-auto shadow-md">
                  🏆
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    {language === 'kn' ? 'ಅದ್ಭುತ ಸಾಧನೆ, ಕಾವ್ಯಾ!' : 'Great Job, Kavya!'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'kn' ? 'ನೀವು ಪರೀಕ್ಷೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಳಿಸಿದ್ದೀರಿ!' : 'You have completed the quiz!'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 inline-block px-8">
                  <span className="text-xs text-amber-800 font-bold block">{language === 'kn' ? 'ನಿಮ್ಮ ಗಳಿಕೆ' : 'Your Score'}</span>
                  <span className="text-3xl font-black text-amber-950">
                    {quizScore} / {QUIZ_QUESTIONS.length}
                  </span>
                  <div className="mt-1 flex items-center justify-center gap-1 text-amber-500">
                    {Array.from({ length: quizScore }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleRestartQuiz}
                    className="h-11 font-bold"
                  >
                    {language === 'kn' ? 'ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ' : 'Try Again'}
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsInteractiveQuizOpen(false)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-11"
                  >
                    {language === 'kn' ? 'ಮುಗಿಸಿ' : 'Close'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL 2: STUDENT PROFILE DOSSIER */}
      {/* ============================================================== */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsProfileModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl z-10 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಪರಿಚಯ ಪತ್ರ' : 'Student Identity Dossier'}
              </h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                👩‍🎓
              </div>
              <div>
                <h4 className="font-black text-base text-slate-900">
                  {language === 'kn' ? `${student.firstNameKn} ${student.lastNameKn}` : `${student.firstName} ${student.lastName}`}
                </h4>
                <p className="text-xs text-emerald-800 font-semibold">
                  {student.admissionNumber} · Grade {student.className}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Hosahalli Grama, Mandya Taluk
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500">{language === 'kn' ? 'ಹಾಜರಾತಿ ಪ್ರಮಾಣ' : 'Attendance Rate'}</span>
                <span className="font-extrabold text-emerald-700">{student.attendanceRate}% (Excellent)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500">{language === 'kn' ? 'ನಲಿಕಲಿ ಹಂತ' : 'Nali-Kali Stage'}</span>
                <Badge variant="success" size="sm">{student.naliKaliLevel}</Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500">{language === 'kn' ? 'ಪೋಷಕರ ಹೆಸರು' : 'Parent Name'}</span>
                <span className="font-bold text-slate-800">{student.parentName}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500">{language === 'kn' ? 'ತುರ್ತು ಸಂಪರ್ಕ' : 'Emergency Contact'}</span>
                <span className="font-mono font-bold text-slate-800">{student.emergencyPhone}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500">{language === 'kn' ? 'ಬಿಸಿ ಊಟ ಯೋಜನೆ' : 'Mid-day Meal Beneficiary'}</span>
                <span className="font-bold text-emerald-700">✓ Eligible (Daily Hot Meal)</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full font-bold h-11"
            >
              {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODAL 3: SCORECARD DOSSIER (My Results) */}
      {/* ============================================================== */}
      {isScorecardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsScorecardModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಪ್ರಗತಿ ಪತ್ರಿಕೆ (Scorecard)' : 'Student Academic Progress Card'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Govt. Model Higher Primary School, Hosahalli</p>
                </div>
              </div>
              <button
                onClick={() => setIsScorecardModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scorecard Table */}
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-950 block">
                    {language === 'kn' ? 'ಒಟ್ಟಾರೆ ಫಲಿತಾಂಶ: ವಿಶಿಷ್ಟ ಶ್ರೇಣಿ (Distinction)' : 'Overall Result: Distinction (A+)'}
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Total Marks: 96 / 100 · 96.0%
                  </span>
                </div>
                <Badge variant="success" size="md">
                  Distinction
                </Badge>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                    <tr>
                      <th className="p-3">{language === 'kn' ? 'ವಿಷಯ / ಪರೀಕ್ಷೆ' : 'Subject'}</th>
                      <th className="p-3 text-center">{language === 'kn' ? 'ಗರಿಷ್ಠ' : 'Total'}</th>
                      <th className="p-3 text-center">{language === 'kn' ? 'ಗಳಿಸಿದ ಅಂಕ' : 'Score'}</th>
                      <th className="p-3 text-center">{language === 'kn' ? 'ಶ್ರೇಣಿ' : 'Grade'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">
                        ಕನ್ನಡ ಪ್ರಥಮ ಭಾಷೆ (Kannada)
                        <span className="block text-[10px] text-slate-400 font-normal">ಘಟಕ ಪರೀಕ್ಷೆ - ೧</span>
                      </td>
                      <td className="p-3 text-center text-slate-500">25</td>
                      <td className="p-3 text-center font-bold text-emerald-700">24</td>
                      <td className="p-3 text-center font-bold text-emerald-700">A+</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">
                        ಗಣಿತ (Mathematics)
                        <span className="block text-[10px] text-slate-400 font-normal">ಮಗ್ಗಿ & ಭಾಗಾಕಾರ ಅಭ್ಯಾಸ</span>
                      </td>
                      <td className="p-3 text-center text-slate-500">25</td>
                      <td className="p-3 text-center font-bold text-emerald-700">23</td>
                      <td className="p-3 text-center font-bold text-emerald-700">A</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">
                        ಪರಿಸರ ಅಧ್ಯಯನ (EVS Science)
                        <span className="block text-[10px] text-slate-400 font-normal">ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ & ಸಸ್ಯಗಳು</span>
                      </td>
                      <td className="p-3 text-center text-slate-500">25</td>
                      <td className="p-3 text-center font-bold text-emerald-700">25</td>
                      <td className="p-3 text-center font-bold text-emerald-700">A+</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">
                        ಇಂಗ್ಲಿಷ್ (English Reader)
                        <span className="block text-[10px] text-slate-400 font-normal">Reading & Vocabulary</span>
                      </td>
                      <td className="p-3 text-center text-slate-500">25</td>
                      <td className="p-3 text-center font-bold text-emerald-700">24</td>
                      <td className="p-3 text-center font-bold text-emerald-700">A+</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Teacher Remarks Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
                <span className="font-bold block">
                  {language === 'kn' ? 'ವರ್ಗ ಶಿಕ್ಷಕರ ಹಿನ್ನುಡಿ (Teacher Remarks):' : "Teacher's Final Remarks:"}
                </span>
                <p className="leading-relaxed">
                  {language === 'kn'
                    ? '"ಕಾವ್ಯಾ ಅತ್ಯಂತ ಶಿಸ್ತಿನ ಹಾಗೂ ಪ್ರತಿಭಾವಂತ ವಿದ್ಯಾರ್ಥಿನಿ. ಕನ್ನಡ ವಾಚನ ಮತ್ತು ಗಣಿತದಲ್ಲಿ ಅಪಾರ ಆಸಕ್ತಿ ಹೊಂದಿದ್ದಾಳೆ. ಇದೇ ಪ್ರಗತಿಯನ್ನು ಮುಂದುವರಿಸಿ."'
                    : '"Kavya demonstrates exceptional discipline, active participation, and fluency in Kannada and Mathematics. Keep it up!"'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsScorecardModalOpen(false)}
                className="font-bold h-11"
              >
                {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. MODAL 4: UPCOMING TEST SYLLABUS & PREPARATION */}
      {/* ============================================================== */}
      {isUpcomingTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsUpcomingTestModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl z-10 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-sky-100 text-sky-800">
                  <Clock className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {language === 'kn' ? 'ಮುಂದಿನ ಪರೀಕ್ಷೆಯ ಪಠ್ಯಕ್ರಮ' : 'Upcoming Test Syllabus'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Mathematics Unit Test 2</p>
                </div>
              </div>
              <button
                onClick={() => setIsUpcomingTestModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-950 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold">{language === 'kn' ? 'ದಿನಾಂಕ' : 'Date'}: October 2, 2026</span>
                <Badge variant="info" size="sm">25 Marks</Badge>
              </div>
              <p className="text-[11px] text-sky-800 font-medium">Duration: 45 Minutes · Room 5</p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                {language === 'kn' ? 'ಪರೀಕ್ಷೆಯ ಮುಖ್ಯ ವಿಷಯಗಳು:' : 'Key Syllabus Topics:'}
              </h4>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>೪, ೬, ೮ ರ ಮಗ್ಗಿಗಳು (Multiplication Tables 4, 6, 8)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ಸರಳ ಭಾಗಾಕಾರದ ಲೆಕ್ಕಗಳು (Simple 2-digit Division)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ಭಿನ್ನರಾಶಿ ಪರಿಕಲ್ಪನೆ (Understanding 1/2, 1/4, 3/4)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ದೈನಂದಿನ ಜೀವನದ ಗಣಿತ ಸಮಸ್ಯೆಗಳು (Word Problems)</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsUpcomingTestModalOpen(false)}
                className="h-11 font-bold"
              >
                {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsUpcomingTestModalOpen(false);
                  setIsInteractiveQuizOpen(true);
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold h-11"
              >
                {language === 'kn' ? 'ಈಗಲೇ ಅಭ್ಯಾಸ ಮಾಡಿ' : 'Practice Now'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. MODAL 5: ATTENDANCE CALENDAR MODAL */}
      {/* ============================================================== */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsAttendanceModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl z-10 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <CalendarCheck className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {language === 'kn' ? 'ಮಾಸಿಕ ಹಾಜರಾತಿ ವಿವರ' : 'Monthly Attendance Record'}
                  </h3>
                  <p className="text-[11px] text-slate-400">September 2026</p>
                </div>
              </div>
              <button
                onClick={() => setIsAttendanceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-slate-500 block text-[11px]">{language === 'kn' ? 'ಹಾಜರಾದ ದಿನಗಳು' : 'Days Attended'}</span>
                <span className="text-xl font-black text-emerald-800">22 / 23</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">{language === 'kn' ? 'ಹಾಜರಾತಿ ಶೇಕಡಾವಾರು' : 'Percentage'}</span>
                <span className="text-xl font-black text-slate-900">96.5%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">
                {language === 'kn' ? 'ಸರ್ಕಾರಿ ನಿಯಮಾವಳಿ ಪ್ರಕಾರ:' : 'Govt. Primary Attendance Rule:'}
              </p>
              <p className="text-[11px] leading-relaxed text-slate-500">
                {language === 'kn'
                  ? 'ಕನಿಷ್ಠ ೭೫% ಹಾಜರಾತಿ ಕಡ್ಡಾಯ. ಕಾವ್ಯಾ ಅವರ ೯೬.೫% ಹಾಜರಾತಿಯು ಆದರ್ಶಮಯವಾಗಿದೆ ಮತ್ತು ಬಿಸಿ ಊಟದ ಸೌಲಭ್ಯಕ್ಕೆ ಪೂರ್ಣ ಅರ್ಹರಾಗಿದ್ದಾರೆ.'
                  : 'Minimum 75% required. Kavya holds a 96.5% exemplary record and qualifies for all state student incentives.'}
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => setIsAttendanceModalOpen(false)}
              className="w-full font-bold h-11"
            >
              {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 10. MODAL 6: EXAM PICKER MODAL (Choose Online Exam or Practice Quiz) */}
      {/* ============================================================== */}
      {isExamPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsExamPickerOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl z-10 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold">
                  <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {language === 'kn' ? 'ಪರೀಕ್ಷೆ ಆಯ್ಕೆಮಾಡಿ (Select Exam)' : 'Choose Examination'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Grade 5-A · Active Assessments</p>
                </div>
              </div>
              <button
                onClick={() => setIsExamPickerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Online Tests available */}
              {onlineTestService.getTests().map(ot => {
                const submissions = onlineTestService.getSubmissionsForTest(ot.id);
                const mySub = submissions.find(s => s.studentId === student.id);
                const hasAttempted = Boolean(mySub);
                const isResultReady = ot.resultsPublished || mySub?.status === 'GRADED';

                return (
                  <div
                    key={ot.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all bg-slate-50/60 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="info" size="sm">{ot.subjectCode}</Badge>
                      <span className="text-xs text-slate-500 font-mono font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {ot.durationMinutes} Mins · {ot.totalMarks} Marks
                      </span>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                      {language === 'kn' ? ot.titleKn : ot.titleEn}
                    </h4>

                    <div className="pt-2 flex items-center justify-between">
                      {hasAttempted ? (
                        isResultReady ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setIsExamPickerOpen(false);
                              setViewingResultModal({ test: ot, submission: mySub! });
                            }}
                            className="bg-emerald-100 text-emerald-950 hover:bg-emerald-200 font-bold text-xs"
                            leftIcon={<Award className="w-3.5 h-3.5 text-emerald-700" />}
                          >
                            {language === 'kn' ? 'ಫಲಿತಾಂಶ ನೋಡಿ' : 'View Result'}
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Submitted · Pending Grade</span>
                          </span>
                        )
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setIsExamPickerOpen(false);
                            setActiveSecureExam(ot);
                          }}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                          leftIcon={<Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />}
                        >
                          {language === 'kn' ? 'ಆನ್‌ಲೈನ್ ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ' : 'Take Online Exam'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Practice Quiz */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-emerald-950">
                    {language === 'kn' ? 'ಕನ್ನಡ & ಗಣಿತ ಅಭ್ಯಾಸ ರಸಪ್ರಶ್ನೆ' : 'Tenali Rama Story Practice Quiz'}
                  </h4>
                  <p className="text-[11px] text-emerald-800">4 Quick Questions · Earn 5 Stars</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsExamPickerOpen(false);
                    setIsInteractiveQuizOpen(true);
                  }}
                  className="bg-white text-emerald-900 border border-emerald-300 font-bold text-xs shrink-0"
                >
                  {language === 'kn' ? 'ಅಭ್ಯಾಸ ಮಾಡಿ' : 'Practice'}
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsExamPickerOpen(false)}
                className="font-bold"
              >
                {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Student Result Modal */}
      {viewingResultModal && (
        <StudentResultModal
          isOpen={Boolean(viewingResultModal)}
          onClose={() => setViewingResultModal(null)}
          test={viewingResultModal.test}
          submission={viewingResultModal.submission}
        />
      )}
    </div>
  );
};
