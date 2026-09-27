import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  CalendarCheck, 
  UtensilsCrossed, 
  Volume2, 
  BookOpen, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  Award, 
  MessageSquare,
  Sparkles,
  Bell,
  User as UserIcon,
  ChevronDown,
  FileText,
  Printer,
  Download,
  AlertCircle,
  TrendingUp,
  HeartHandshake,
  Check,
  Send,
  Phone,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  School,
  X,
  Mic,
  Play,
  Pause
} from 'lucide-react';
import { StatCard } from '../../design-system/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';
import { Modal } from '../../design-system/Modal';
import { Input } from '../../design-system/Input';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  MOCK_STUDENTS, 
  MOCK_PARENTS, 
  MOCK_STUDENT_MARKS, 
  MOCK_PARENT_CONCERNS,
  MOCK_NOTIFICATIONS,
  MOCK_VOICE_ASSESSMENTS
} from '../../mock/schoolData';
import { StudentProfile, StudentMarkRecord, ParentConcern } from '../../types';
import { recordReportView } from '../../services/reportViewService';
import { ActionModalType } from './QuickActionModal';
import { onlineTestService, OnlineTest, StudentTestSubmission } from '../../services/onlineTestService';
import { StudentResultModal } from '../online-test/StudentResultModal';
import { concernService } from '../../services/concernService';
import { voiceAssessmentService } from '../../services/voiceAssessmentService';
import { ParentConcernTracker } from '../concerns/ParentConcernTracker';
import { ParentSubmitConcernModal } from '../concerns/ParentSubmitConcernModal';

interface ParentDashboardProps {
  onNavigate?: (tab: string) => void;
  onOpenActionModal?: (modal: ActionModalType) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  onNavigate,
  onOpenActionModal,
}) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, addNotification } = useNotifications();

  // Sri Ramesh Gowda (Parent p1) has 2 children in school:
  // s1 (Kavya R. Gowda - Grade 5-A) and s6 (Chethan R. Gowda - Grade 2-B Nali-Kali)
  const parentProfile = MOCK_PARENTS[0];
  const myChildren: StudentProfile[] = parentProfile.children || [MOCK_STUDENTS[0], MOCK_STUDENTS[5]];

  // State: selected child
  const [selectedChildId, setSelectedChildId] = useState<string>(myChildren[0].id);
  const selectedChild = myChildren.find(c => c.id === selectedChildId) || myChildren[0];

  // Modals
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [isSubmitConcernOpen, setIsSubmitConcernOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [isContactTeacherOpen, setIsContactTeacherOpen] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [viewingOnlineExamResult, setViewingOnlineExamResult] = useState<{
    test: OnlineTest;
    submission: StudentTestSubmission;
  } | null>(null);

  // Audio voice note player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Success toast feedback
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Concern form states
  const [concernCategory, setConcernCategory] = useState<'ACADEMIC' | 'ATTENDANCE' | 'MIDDAY_MEAL' | 'HEALTH' | 'BUS_TRANSPORT'>('ACADEMIC');
  const [concernSubject, setConcernSubject] = useState('');
  const [concernMessage, setConcernMessage] = useState('');

  // Local concerns list from concernService
  const [myConcerns, setMyConcerns] = useState<ParentConcern[]>(() => {
    return concernService.getConcernsByParent('p1');
  });

  useEffect(() => {
    const handleConcernUpdate = () => {
      setMyConcerns(concernService.getConcernsByParent('p1'));
    };
    window.addEventListener('parent-concern-updated', handleConcernUpdate);
    return () => window.removeEventListener('parent-concern-updated', handleConcernUpdate);
  }, []);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter student marks strictly for the selected child
  const childMarks = MOCK_STUDENT_MARKS.filter(m => m.studentId === selectedChild.id);
  const latestMark = childMarks.length > 0 ? childMarks[0] : null;

  // Published Online Test Submissions for the selected child
  const publishedOnlineSubmissions = onlineTestService
    .getSubmissions()
    .filter(s => s.studentId === selectedChild.id && s.resultsPublished);

  // Evaluated Voice Assessment Submissions for the selected child
  const childVoiceSubmissions = voiceAssessmentService
    .getSubmissions()
    .filter(s => s.studentId === selectedChild.id && s.status === 'EVALUATED');

  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Filter voice assessments strictly for the selected child
  const childVoiceAssessments = MOCK_VOICE_ASSESSMENTS.filter(v => v.studentId === selectedChild.id);

  // Handle opening the student report card
  // CRITICAL REQUIREMENT: "When the parent opens a student report: record a report-view event and notify the relevant teacher."
  const handleOpenReportCard = () => {
    setIsReportCardOpen(true);
    const reportTitle = `${selectedChild.className} Term 1 Comprehensive Progress Report`;
    recordReportView(
      selectedChild.id,
      `${selectedChild.firstName} ${selectedChild.lastName}`,
      selectedChild.rollNumber,
      'p1',
      user?.fullName || 'Sri Ramesh Gowda',
      selectedChild.emergencyPhone || '9900112233',
      'PROGRESS_REPORT',
      reportTitle
    );

    setFeedbackToast(
      language === 'kn' 
        ? `ಶಿಕ್ಷಕಿ ಶ್ರೀಮತಿ ಸಾವಿತ್ರಿ ಹೆಗಡೆ ಅವರಿಗೆ ನೀವು ಪ್ರಗತಿ ಪತ್ರಿಕೆ ವೀಕ್ಷಿಸಿದ್ದೀರಿ ಎಂದು ಮಾಹಿತಿ ರವಾನಿಸಲಾಗಿದೆ.` 
        : `Class Teacher Smt. Savitri Hegde has been notified that you reviewed ${selectedChild.firstName}'s Progress Report.`
    );
    setTimeout(() => setFeedbackToast(null), 5000);
  };

  const handleOpenMarksReport = () => {
    setIsMarksModalOpen(true);
    const reportTitle = `${selectedChild.className} Subject Evaluation & Marks Report`;
    recordReportView(
      selectedChild.id,
      `${selectedChild.firstName} ${selectedChild.lastName}`,
      selectedChild.rollNumber,
      'p1',
      user?.fullName || 'Sri Ramesh Gowda',
      selectedChild.emergencyPhone || '9900112233',
      'MARKS_REPORT',
      reportTitle
    );
    setFeedbackToast(
      language === 'kn' 
        ? `ಶಿಕ್ಷಕರಿಗೆ ನೀವು ${selectedChild.firstName} ಅವರ ಅಂಕಗಳ ವರದಿ ವೀಕ್ಷಿಸಿದ್ದೀರಿ ಎಂದು ಮಾಹಿತಿ ತಲುಪಿದೆ.` 
        : `Class Teacher has been notified that you reviewed ${selectedChild.firstName}'s Marks Report.`
    );
    setTimeout(() => setFeedbackToast(null), 5000);
  };

  const handleOpenAttendanceReport = () => {
    setIsAttendanceModalOpen(true);
    const reportTitle = `${selectedChild.className} Monthly Attendance & Punctuality Report`;
    recordReportView(
      selectedChild.id,
      `${selectedChild.firstName} ${selectedChild.lastName}`,
      selectedChild.rollNumber,
      'p1',
      user?.fullName || 'Sri Ramesh Gowda',
      selectedChild.emergencyPhone || '9900112233',
      'ATTENDANCE_REPORT',
      reportTitle
    );
    setFeedbackToast(
      language === 'kn' 
        ? `ಶಿಕ್ಷಕರಿಗೆ ನೀವು ${selectedChild.firstName} ಅವರ ಹಾಜರಾತಿ ವರದಿ ಪರಿಶೀಲಿಸಿದ್ದೀರಿ ಎಂದು ತಿಳಿಸಲಾಗಿದೆ.` 
        : `Class Teacher has been notified that you reviewed ${selectedChild.firstName}'s Attendance Report.`
    );
    setTimeout(() => setFeedbackToast(null), 5000);
  };

  const handleOpenTestReport = (test: OnlineTest, submission: StudentTestSubmission) => {
    setViewingOnlineExamResult({ test, submission });
    const reportTitle = `${test.titleEn} Test Report`;
    recordReportView(
      selectedChild.id,
      `${selectedChild.firstName} ${selectedChild.lastName}`,
      selectedChild.rollNumber,
      'p1',
      user?.fullName || 'Sri Ramesh Gowda',
      selectedChild.emergencyPhone || '9900112233',
      'TEST_REPORT',
      reportTitle
    );
    setFeedbackToast(
      language === 'kn' 
        ? `ಶಿಕ್ಷಕರಿಗೆ ನೀವು ${selectedChild.firstName} ಅವರ "${test.titleEn}" ಪರೀಕ್ಷಾ ವರದಿ ವೀಕ್ಷಿಸಿದ್ದೀರಿ ಎಂದು ಮಾಹಿತಿ ರವಾನಿಸಲಾಗಿದೆ.` 
        : `Class Teacher has been notified that you viewed ${selectedChild.firstName}'s ${test.titleEn} Test Report.`
    );
    setTimeout(() => setFeedbackToast(null), 5000);
  };

  const handleToggleVoice = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      setTimeout(() => setIsPlayingAudio(false), 6000);
    }
  };

  const handleSubmitConcern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concernSubject.trim() || !concernMessage.trim()) return;

    const newC: ParentConcern = {
      id: `concern-${Date.now()}`,
      parentId: 'p1',
      parentName: user?.fullName || 'Sri Ramesh Gowda',
      studentId: selectedChild.id,
      studentName: `${selectedChild.firstName} ${selectedChild.lastName} (${selectedChild.className})`,
      category: concernCategory,
      subject: concernSubject,
      description: concernMessage,
      status: 'PENDING',
      createdAt: 'Just now',
    };

    setMyConcerns([newC, ...myConcerns]);
    setIsSubmitConcernOpen(false);
    setConcernSubject('');
    setConcernMessage('');

    addNotification({
      titleEn: `New Parent Concern Submitted`,
      titleKn: `ಹೊಸ ಪೋಷಕರ ಸಮಸ್ಯೆ ಸ್ವೀಕೃತವಾಗಿದೆ`,
      bodyEn: `${user?.fullName || 'Sri Ramesh Gowda'} submitted a concern for ${selectedChild.firstName}: "${concernSubject}".`,
      bodyKn: `${user?.fullNameKn || 'ಶ್ರೀ ರಮೇಶ್ ಗೌಡ'} ಅವರು ${selectedChild.firstNameKn} ಅವರ ಬಗ್ಗೆ ಶಾಲಾ ಮುಖ್ಯಸ್ಥರಿಗೆ ಮನವಿ ಸಲ್ಲಿಸಿದ್ದಾರೆ.`,
      category: 'ACADEMIC',
      isUrgent: true,
    });

    setFeedbackToast(
      language === 'kn'
        ? 'ನಿಮ್ಮ ಮನವಿ ಶಾಲಾ ಮುಖ್ಯಸ್ಥರಿಗೆ ತಲುಪಿದೆ. ಶೀಘ್ರದಲ್ಲಿ ಸಂಪರ್ಕಿಸಲಾಗುವುದು.'
        : 'Your concern has been submitted to the class teacher and headmaster.'
    );
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP SECTION: Parent Name, Child Selector, Notification Bell, Profile */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-sky-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-200 text-xs font-semibold border border-emerald-500/40">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-300" />
                <span>{language === 'kn' ? 'ಗ್ರಾಮೀಣ ಪೋಷಕರ ಮಾಹಿತಿ ವೇದಿಕೆ' : 'Parent Support Portal'}</span>
              </span>
              <span className="text-emerald-200/70 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-emerald-200/90 font-medium">
                {language === 'kn' ? 'ಗ್ರಾಮ: ಹೊಸಹಳ್ಳಿ, ಚನ್ನರಾಯಪಟ್ಟಣ ತಾಲೂಕು' : 'Hosahalli Village, Hassan'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'kn' ? 'ನಮಸ್ಕಾರ, ಶ್ರೀ ರಮೇಶ್ ಗೌಡ' : 'Welcome, Sri Ramesh Gowda'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {language === 'kn'
                ? `ನಿಮ್ಮ ಮಗು ${selectedChild.firstNameKn} ${selectedChild.lastNameKn} (${selectedChild.className}) ಇಂದಿನ ಹಾಜರಾತಿ, ಕಲಿಕೆ ಮತ್ತು ಊಟದ ವಿವರಗಳು.`
                : `Daily attendance, learning progress, and teacher voice notes for ${selectedChild.firstName} ${selectedChild.lastName} (${selectedChild.className}).`}
            </p>
          </div>

          {/* Child Selector + Notification Bell + Profile */}
          <div className="flex flex-wrap items-center gap-3">
            {/* CHILD SELECTOR */}
            <div className="bg-emerald-950/80 border border-emerald-400/40 rounded-xl p-1.5 flex items-center gap-2 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-200 pl-2">
                {language === 'kn' ? 'ಮಗು:' : 'Child:'}
              </span>
              <select
                value={selectedChildId}
                onChange={e => setSelectedChildId(e.target.value)}
                className="bg-emerald-900 text-white font-bold text-xs py-1.5 px-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                {myChildren.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} ({c.className})
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-950 border border-emerald-400/40 text-emerald-100 transition-all cursor-pointer shadow-xs"
                title="School Notifications & Messages"
              >
                <Bell className="w-5 h-5 text-emerald-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-900 text-[10px] font-bold flex items-center justify-center border-2 border-emerald-950">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-800" />
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        {language === 'kn' ? 'ಶಾಲಾ ಸಂದೇಶಗಳು & ಸೂಚನೆಗಳು' : 'Parent Notices'}
                      </span>
                    </div>
                    <Badge variant="success" size="sm">{notifications.length} alerts</Badge>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.map(n => (
                      <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800">{language === 'kn' ? n.titleKn : n.titleEn}</p>
                          <Badge variant="neutral" size="sm">{n.category}</Badge>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{language === 'kn' ? n.bodyKn : n.bodyEn}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.createdAt}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button 
                      onClick={() => setShowNotifMenu(false)}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                    >
                      {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Parent Profile Quick Badge */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-950 border border-emerald-400/40 text-emerald-100 transition-all cursor-pointer shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-inner">
                  RG
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-emerald-100 leading-tight">Sri Ramesh Gowda</p>
                  <p className="text-[10px] text-emerald-300">Father · Hosahalli</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-300" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-150">
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-700 text-white font-bold text-base flex items-center justify-center shadow-md">
                        RG
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Sri Ramesh Gowda</h4>
                        <p className="text-xs text-emerald-800 font-medium">Agriculture / Farmer (ರೈತರು)</p>
                        <p className="text-[11px] text-slate-500 font-mono">Ph: 9900112233</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <span className="text-slate-500">Village:</span>
                      <span className="font-semibold text-slate-800">Hosahalli, Mandya/Hassan</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <span className="text-slate-500">Enrolled Children:</span>
                      <span className="font-semibold text-emerald-800">{myChildren.length} (Kavya & Chethan)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <span className="text-slate-500">Preferred Alerts:</span>
                      <span className="font-semibold text-slate-800">Kannada Voice Call & SMS</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => setShowProfileMenu(false)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close Menu'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Listen Voice Summary Banner Button */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToggleVoice}
            leftIcon={<Volume2 className="w-3.5 h-3.5" />}
          >
            {isPlayingAudio
              ? language === 'kn' ? 'ಧ್ವನಿ ನುಡಿಯುತ್ತಿದೆ...' : 'Playing Voice Note...'
              : language === 'kn' ? 'ಇಂದಿನ ಶಾಲಾ ಧ್ವನಿ ಸಾರಾಂಶ ಕೇಳಿ' : "Listen to Today's Kannada Audio Summary"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-white border-emerald-400/40 hover:bg-emerald-800/80 bg-emerald-950/40"
            onClick={() => setIsContactTeacherOpen(true)}
            leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
          >
            {language === 'kn' ? 'ಶಿಕ್ಷಕರೊಂದಿಗೆ ಮಾತನಾಡಿ' : 'Contact Class Teacher'}
          </Button>
        </div>
      </div>

      {feedbackToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-emerald-700 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. CARDS: Attendance, Latest Marks, Upcoming Test, Overall Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card */}
        <Card hoverEffect onClick={() => setIsAttendanceModalOpen(true)} className="cursor-pointer border-emerald-200">
          <CardContent className="pt-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {language === 'kn' ? 'ಇಂದಿನ ಶಾಲೆ ಹಾಜರಾತಿ' : "Today's Attendance"}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-emerald-700">
                {language === 'kn' ? 'ಹಾಜರು (Present)' : 'Present'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {language === 'kn' ? 'ಬೆಳಿಗ್ಗೆ ೮:೪೨ ಕ್ಕೆ ಶಾಲೆ ತಲುಪಿದ್ದಾರೆ' : 'Arrived at 8:42 AM safely'}
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span>Annual: {selectedChild.attendanceRate}%</span>
              <span className="text-emerald-700">View Month &rarr;</span>
            </div>
          </CardContent>
        </Card>

        {/* Latest Marks Card */}
        <Card hoverEffect onClick={handleOpenMarksReport} className="cursor-pointer border-amber-200">
          <CardContent className="pt-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {language === 'kn' ? 'ಇತ್ತೀಚಿನ ಪರೀಕ್ಷಾ ಅಂಕಗಳು' : 'Latest Test Score'}
              </span>
              <Badge variant="success" size="sm">Grade A+</Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900">
                {latestMark ? `${latestMark.marksObtained} / ${latestMark.totalMarks}` : '24 / 25'}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                ({latestMark ? latestMark.percentage : 96}%)
              </span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-1">
              {latestMark ? latestMark.testTitle : 'Kannada Unit Assessment'}
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span>Excellent Work</span>
              <span className="text-amber-700">View All &rarr;</span>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Test Card */}
        <Card hoverEffect onClick={handleOpenMarksReport} className="cursor-pointer border-sky-200">
          <CardContent className="pt-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {language === 'kn' ? 'ಮುಂದಿನ ಪರೀಕ್ಷೆ' : 'Upcoming Test'}
              </span>
              <Badge variant="info" size="sm">In 5 Days</Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-extrabold text-slate-900">
                {language === 'kn' ? 'ಮಧ್ಯವಾರ್ಷಿಕ ಗಣಿತ' : 'Math Mid-Term'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Monday, Oct 5 • 50 Marks (ಭಿನ್ನರಾಶಿ & ಮಗ್ಗಿ)
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span>Revision in progress</span>
              <span className="text-sky-700">Syllabus &rarr;</span>
            </div>
          </CardContent>
        </Card>

        {/* Overall Progress Card */}
        <Card hoverEffect onClick={handleOpenReportCard} className="cursor-pointer border-purple-200">
          <CardContent className="pt-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {language === 'kn' ? 'ಒಟ್ಟಾರೆ ಕಲಿಕಾ ಪ್ರಗತಿ' : 'Overall Progress'}
              </span>
              <Badge variant="success" size="sm">Top 5%</Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-purple-900">
                {selectedChild.naliKaliLevel}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {language === 'kn' ? 'ನಿರರ್ಗಳ ವಾಚನ ಮತ್ತು ಗಣಿತ ಚತುರತೆ' : 'Fluent reading & arithmetic'}
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-purple-700 font-bold">
              <span>Report Card Ready</span>
              <span>Open &rarr;</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. QUICK ACTIONS ROW FOR PARENTS */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'kn' ? 'ಪೋಷಕರ ತ್ವರಿತ ಸೌಲಭ್ಯಗಳು' : 'Parent Quick Action Hub'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'kn' ? 'ಮಗುವಿನ ಪ್ರಗತಿ, ಅಂಕಗಳು ಮತ್ತು ಶಿಕ್ಷಕರ ಸಂಪರ್ಕ' : 'Simple direct actions for village parents'}
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {selectedChild.firstName} ({selectedChild.className})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
            {/* Action 1: View Report (Triggers teacher notification!) */}
            <button
              onClick={handleOpenReportCard}
              className="p-3.5 rounded-xl border border-purple-200 hover:border-purple-500 hover:bg-purple-50/50 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer bg-white shadow-2xs"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-purple-900 leading-tight">
                {language === 'kn' ? 'ಪ್ರಗತಿ ಪತ್ರಿಕೆ ವೀಕ್ಷಿಸಿ' : 'View Report Card'}
              </span>
              <span className="text-[10px] text-purple-700 font-medium">Term 1 Official</span>
            </button>

            {/* Action 2: Submit Concern */}
            <button
              onClick={() => setIsSubmitConcernOpen(true)}
              className="p-3.5 rounded-xl border border-rose-200 hover:border-rose-500 hover:bg-rose-50/50 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer bg-white shadow-2xs"
            >
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-rose-900 leading-tight">
                {language === 'kn' ? 'ಸಲಹೆ / ದೂರು ಸಲ್ಲಿಸಿ' : 'Submit Concern'}
              </span>
              <span className="text-[10px] text-rose-700 font-medium">To Headmaster</span>
            </button>

            {/* Action 3: View Attendance */}
            <button
              onClick={handleOpenAttendanceReport}
              className="p-3.5 rounded-xl border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer bg-white shadow-2xs"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-900 leading-tight">
                {language === 'kn' ? 'ಹಾಜರಾತಿ ವೀಕ್ಷಿಸಿ' : 'View Attendance'}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">{selectedChild.attendanceRate}% Rate</span>
            </button>

            {/* Action 4: View Marks */}
            <button
              onClick={handleOpenMarksReport}
              className="p-3.5 rounded-xl border border-amber-200 hover:border-amber-500 hover:bg-amber-50/50 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer bg-white shadow-2xs"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-amber-900 leading-tight">
                {language === 'kn' ? 'ಅಂಕಗಳ ಪಟ್ಟಿ' : 'View Marks'}
              </span>
              <span className="text-[10px] text-amber-700 font-medium">All Unit Tests</span>
            </button>

            {/* Action 5: Contact Teacher */}
            <button
              onClick={() => setIsContactTeacherOpen(true)}
              className="p-3.5 rounded-xl border border-sky-200 hover:border-sky-500 hover:bg-sky-50/50 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer bg-white shadow-2xs"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PhoneCall className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-sky-900 leading-tight">
                {language === 'kn' ? 'ಶಿಕ್ಷಕರನ್ನು ಸಂಪರ್ಕಿಸಿ' : 'Contact Teacher'}
              </span>
              <span className="text-[10px] text-sky-700 font-medium">Call Smt. Savitri</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 4. SECTIONS GRID: Child Performance & Attendance Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Child Performance Subject Scorecard (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>
                  {language === 'kn' 
                    ? `${selectedChild.firstNameKn} ಅವರ ಶೈಕ್ಷಣಿಕ ಸಾಧನೆ` 
                    : `${selectedChild.firstName}'s Subject Mastery & Grades`}
                </CardTitle>
                <CardDescription>
                  {language === 'kn'
                    ? 'ಕರ್ನಾಟಕ ಪಠ್ಯಕ್ರಮದ ವಿಷಯವಾರು ಅಂಕಗಳು ಮತ್ತು ಶಿಕ್ಷಕರ ಪ್ರಶಂಸೆ'
                    : 'Karnataka State Syllabus subjects and classroom observations'}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOpenReportCard}
                leftIcon={<FileText className="w-3.5 h-3.5 text-purple-700" />}
              >
                {language === 'kn' ? 'ಪೂರ್ಣ ಪ್ರಗತಿ ಪತ್ರಿಕೆ' : 'Open Report Card'}
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Published Online Examination Results (Connected to Online Test System) */}
              {publishedOnlineSubmissions.length > 0 && (
                <div className="space-y-2 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      {language === 'kn' ? 'ಪ್ರಕಟಿತ ಆನ್‌ಲೈನ್ ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶಗಳು' : 'Published Online Examination Results'}
                    </span>
                    <Badge variant="success" size="sm">Verified by Teacher</Badge>
                  </div>

                  {publishedOnlineSubmissions.map(sub => {
                    const testItem = onlineTestService.getTestById(sub.testId);
                    if (!testItem) return null;

                    return (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50/70 to-white space-y-2 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {testItem.subjectCode} • {testItem.subjectName}
                            </span>
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 mt-1">
                              {language === 'kn' ? testItem.titleKn : testItem.titleEn}
                            </h4>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm sm:text-base font-black text-emerald-800">
                              {sub.score ?? 0} / {sub.maxScore}
                            </span>
                            <span className="block text-[10px] font-bold text-emerald-700">
                              {sub.percentage}% (Grade {sub.grade})
                            </span>
                          </div>
                        </div>

                        {/* Exam Status Information */}
                        <div className="p-2 rounded-xl bg-white/90 border border-emerald-200 text-[11px] text-slate-700 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-500">
                              {language === 'kn' ? 'ಪರೀಕ್ಷಾ ದಿನಾಂಕ:' : 'Exam Date:'} {sub.submittedAt?.slice(0, 10)}
                            </span>
                            <span className="font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{language === 'kn' ? 'ಮೌಲ್ಯಮಾಪನ ಪೂರ್ಣಗೊಂಡಿದೆ' : 'Teacher Evaluated'}</span>
                            </span>
                          </div>
                          <p className="text-slate-600">
                            {language === 'kn'
                              ? `ಪರೀಕ್ಷಾ ಸ್ಥಿತಿ: ಪೂರ್ಣಗೊಂಡಿದೆ ಹಾಗೂ ಶ್ರೀಮತಿ ಸಾವಿತ್ರಿ ಹೆಗಡೆ ಪರಿಶೀಲಿಸಿ ಪ್ರಕಟಿಸಿದ್ದಾರೆ (${sub.securityStatus === 'CLEAN' ? 'ಭದ್ರತಾ ಪರಿಶೀಲನೆ: ಯಶಸ್ವಿ' : 'ಪರಿಶೀಲನೆ ಮುಗಿದಿದೆ'}).`
                              : `Status: Completed & Verified by Class Teacher Smt. Savitri Hegde (${sub.securityStatus === 'CLEAN' ? 'Integrity: Verified Clean' : 'Audited'}).`}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-500 italic">
                            "{sub.teacherFeedback || 'ಅತ್ಯುತ್ತಮ ಶೈಕ್ಷಣಿಕ ಪರಿಶ್ರಮ.'}"
                          </span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenTestReport(testItem, sub)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-7 py-0.5"
                          >
                            {language === 'kn' ? 'ವಿವರವಾದ ವರದಿ ನೋಡಿ' : 'View Exam Report'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Published Voice & Pronunciation Assessments */}
              {childVoiceSubmissions.length > 0 && (
                <div className="space-y-2 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-rose-600" />
                      {language === 'kn' ? 'ಧ್ವನಿ ಮತ್ತು ಉಚ್ಚಾರಣಾ ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶಗಳು' : 'Published Voice & Pronunciation Results'}
                    </span>
                    <Badge variant="success" size="sm">Audio Verified</Badge>
                  </div>

                  {childVoiceSubmissions.map(vsub => {
                    const ass = voiceAssessmentService.getAssessmentById(vsub.assessmentId);
                    return (
                      <div
                        key={vsub.id}
                        className="p-3.5 rounded-2xl border-2 border-rose-200 bg-gradient-to-r from-rose-50/50 via-white to-amber-50/30 space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                              {ass?.subjectName || 'Kannada'} • Oral Recitation
                            </span>
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 mt-1">
                              {language === 'kn' ? ass?.titleKn : ass?.titleEn}
                            </h4>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm sm:text-base font-black text-rose-900">
                              {vsub.teacherScore ?? 24} / {ass?.totalMarks || 25}
                            </span>
                            <span className="block text-[10px] font-bold text-emerald-700">
                              Grade A+ (96%)
                            </span>
                          </div>
                        </div>

                        {/* Audio Player and Transcript */}
                        <div className="p-2.5 bg-slate-900 text-white rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (playingVoiceId === vsub.id) {
                                  setPlayingVoiceId(null);
                                } else {
                                  setPlayingVoiceId(vsub.id);
                                  setTimeout(() => setPlayingVoiceId(null), 4000);
                                }
                              }}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
                                playingVoiceId === vsub.id ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white'
                              }`}
                            >
                              {playingVoiceId === vsub.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                            </button>
                            <div>
                              <span className="text-xs font-bold text-white block">
                                {language === 'kn' ? 'ಮಗುವಿನ ಧ್ವನಿ ಕೇಳಿ' : 'Listen to Voice Recording'}
                              </span>
                              <span className="text-[10px] text-slate-400">Duration: {vsub.durationSeconds}s</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {[6, 12, 18, 14, 22, 16, 8, 4].map((h, i) => (
                              <div
                                key={i}
                                className={`w-1 rounded-full ${playingVoiceId === vsub.id ? 'bg-amber-400' : 'bg-slate-700'}`}
                                style={{ height: `${h}px` }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 italic">
                          "{vsub.transcript}"
                        </div>

                        {/* Teacher Feedback */}
                        {vsub.teacherFeedback && (
                          <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 font-medium">
                            <strong>{language === 'kn' ? 'ಶಿಕ್ಷಕಿ ಸಾವಿತ್ರಿ ಹೆಗಡೆ ಅವರ ಹಿನ್ನುಡಿ:' : 'Teacher Feedback:'}</strong> "
                            {language === 'kn' ? vsub.teacherFeedbackKn : vsub.teacherFeedback}"
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <span className="text-slate-500">
                            Pronunciation: <strong className="text-emerald-700">{vsub.analysis.pronunciationIndicators.clarityLevel}</strong>
                          </span>
                          {onNavigate && (
                            <button
                              onClick={() => onNavigate('voice-assessment')}
                              className="text-xs text-rose-700 hover:text-rose-900 font-bold cursor-pointer"
                            >
                              {language === 'kn' ? 'ಪೂರ್ಣ ಲ್ಯಾಬ್ ನೋಡಿ →' : 'Open Voice Lab →'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Kannada Language */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">ಕ</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Kannada (ಕನ್ನಡ ಪ್ರಥಮ ಭಾಷೆ)</h4>
                      <p className="text-[10px] text-slate-400">Unit Test 1: 24/25 • Kuvempu Poetry</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-700">96%</span>
                    <Badge variant="success" size="sm" className="ml-2">A+</Badge>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full" style={{ width: '96%' }} />
                </div>
                <p className="text-[11px] text-slate-600 italic pt-0.5">
                  "ಅತ್ಯುತ್ತಮ ಉಚ್ಚಾರಣೆ, ಸುಂದರ ಕೈಬರಹ ಮತ್ತು ಕಥೆ ವಾಚನದಲ್ಲಿ ನಿರರ್ಗಳತೆ."
                </p>
              </div>

              {/* Mathematics */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">೧</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Mathematics (ಗಣಿತ)</h4>
                      <p className="text-[10px] text-slate-400">Mid-Term: 46/50 • Multiplication & Division</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-sky-700">92%</span>
                    <Badge variant="success" size="sm" className="ml-2">A+</Badge>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-sky-600 rounded-full" style={{ width: '92%' }} />
                </div>
                <p className="text-[11px] text-slate-600 italic pt-0.5">
                  "ಮಾನಸಿಕ ಲೆಕ್ಕಾಚಾರ ಮತ್ತು ಮಗ್ಗಿಗಳ ಕೋಷ್ಟಕದಲ್ಲಿ ಚುರುಕಾದ ಪ್ರತಿಕ್ರಿಯೆ."
                </p>
              </div>

              {/* Environmental Science (EVS) */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">ಪ</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Environmental Science (ಪರಿಸರ ಅಧ್ಯಯನ)</h4>
                      <p className="text-[10px] text-slate-400">Quiz Assessment: 23/25 • Village Tanks & Plants</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-700">92%</span>
                    <Badge variant="success" size="sm" className="ml-2">A</Badge>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '92%' }} />
                </div>
                <p className="text-[11px] text-slate-600 italic pt-0.5">
                  "ಸಸ್ಯಗಳ ಚಿತ್ರ ಮತ್ತು ಗ್ರಾಮದ ಜಲಮೂಲಗಳ ಕುರಿತ ಪ್ರಾಯೋಗಿಕ ಜ್ಞಾನ ಅತ್ಯುತ್ತಮ."
                </p>
              </div>

              {/* English (Second Language) */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center">E</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">English (ದ್ವಿತೀಯ ಭಾಷೆ ಇಂಗ್ಲಿಷ್)</h4>
                      <p className="text-[10px] text-slate-400">Unit Test 1: 22/25 • Phonics & Sentences</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-indigo-700">88%</span>
                    <Badge variant="info" size="sm" className="ml-2">A</Badge>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '88%' }} />
                </div>
                <p className="text-[11px] text-slate-600 italic pt-0.5">
                  "ಸರಳ ವಾಕ್ಯಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಓದುತ್ತಾರೆ. ಪದಗಳ ಬರವಣಿಗೆ ಅಭ್ಯಾಸ ಮುಂದುವರಿಯಲಿ."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Visual Chart & Weekly Tracker (1 col) */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {language === 'kn' ? 'ವಾರದ ಹಾಜರಾತಿ ಕ್ಯಾಲೆಂಡರ್' : 'Weekly Attendance'}
                </CardTitle>
                <Badge variant="success" size="sm">100% This Week</Badge>
              </div>
              <CardDescription>
                {selectedChild.firstName}'s Presence tracker
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="grid grid-cols-5 gap-2 text-center">
                {[
                  { day: 'Mon (ಸೋ)', date: 'Sep 21', status: 'PRESENT' },
                  { day: 'Tue (ಮಂ)', date: 'Sep 22', status: 'PRESENT' },
                  { day: 'Wed (ಬು)', date: 'Sep 23', status: 'PRESENT' },
                  { day: 'Thu (ಗು)', date: 'Sep 24', status: 'PRESENT' },
                  { day: 'Fri (ಶು)', date: 'Sep 25', status: 'PRESENT' },
                ].map(item => (
                  <div key={item.day} className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold text-slate-600 block">{item.day}</span>
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto my-1">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] text-emerald-800 font-semibold block">{item.date}</span>
                  </div>
                ))}
              </div>

              {/* Mid-day Meal Confirmation Box */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1">
                <div className="flex items-center justify-between font-bold text-xs text-amber-950">
                  <span className="flex items-center gap-1.5">
                    <UtensilsCrossed className="w-4 h-4 text-amber-700" />
                    {language === 'kn' ? 'ಬಿಸಿಯೂಟ ಮತ್ತು ಕ್ಷೀರಭಾಗ್ಯ ಹಾಲು' : 'Mid-Day Meal & Milk'}
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                    Served Today
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  ಇಂದು ಮಧ್ಯಾಹ್ನ ಬಿಸಿ ಅನ್ನ, ತರಕಾರಿ ಸಾಂಬಾರು, ಬೇಯಿಸಿದ ಮೊಟ್ಟೆ ಮತ್ತು ೧೫೦ ಮಿಲಿ ಕ್ಷೀರಭಾಗ್ಯ ಹಾಲು ಸ್ವೀಕರಿಸಿದ್ದಾರೆ.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleOpenAttendanceReport}
              >
                {language === 'kn' ? 'ಸಂಪೂರ್ಣ ತಿಂಗಳ ಹಾಜರಾತಿ ನೋಡಿ' : 'View Full Month Log'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 5. SECTIONS ROW 2: Teacher Announcements Diary, Learning Activity & Parent Concerns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teacher Daily Diary & Voice Announcements (1 col) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {language === 'kn' ? 'ಶಿಕ್ಷಕರ ದೈನಂದಿನ ಡೈರಿ & ಸಂದೇಶ' : 'Teacher Announcements'}
              </CardTitle>
              <Badge variant="warning" size="sm">Today</Badge>
            </div>
            <CardDescription>
              From Smt. Savitri Hegde (Class Teacher)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-950">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                  <span>ಶ್ರೀಮತಿ ಸಾವಿತ್ರಿ ಹೆಗಡೆ</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold">10:30 AM</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                "ನಮಸ್ಕಾರ ರಮೇಶ್ ಅವರೇ, {selectedChild.firstNameKn} ಇಂದು ತರಗತಿಯಲ್ಲಿ ಅತ್ಯಂತ ಚುರುಕಾಗಿ ಪಾಠ ಕೇಳಿದ್ದಾಳೆ. ಸಂಜೆ ಮನೆಯಲ್ಲಿ ೫ ಸಾಲು ಕನ್ನಡ ಕೈಬರಹ ಬರೆಸಲು ಕೋರಿಕೆ."
              </p>
              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                <button
                  onClick={handleToggleVoice}
                  className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold hover:text-emerald-950 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>
                    {isPlayingAudio
                      ? language === 'kn' ? 'ಧ್ವನಿ ಪ್ಲೇ ಆಗುತ್ತಿದೆ...' : 'Playing (0:24)...'
                      : language === 'kn' ? 'ಧ್ವನಿ ಆಲಿಸಿ (0:24)' : 'Listen Voice Audio'}
                  </span>
                </button>
                <span className="text-[10px] text-emerald-700 font-medium">ಕನ್ನಡ ಧ್ವನಿ</span>
              </div>
            </div>

            {/* School SDMC Notice */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <h5 className="font-bold text-xs text-slate-800">
                {language === 'kn' ? 'ಶುಕ್ರವಾರ ಪೋಷಕರ ಸಭೆ (SDMC)' : 'SDMC Monthly Parent Meeting'}
              </h5>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                ಶುಕ್ರವಾರ ಮಧ್ಯಾಹ್ನ ೨:೦೦ ಗಂಟೆಗೆ ಶಾಲೆಗೆ ಬಂದು ಮಕ್ಕಳ ಪ್ರಗತಿ ಪತ್ರಿಕೆಗೆ ಸಹಿ ಹಾಕಲು ಕೋರಿದೆ.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Learning Activity & Voice Practice (1 col) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {language === 'kn' ? 'ಮನೆಯಲ್ಲಿ ಕಲಿಕಾ ಚಟುವಟಿಕೆಗಳು' : 'Learning Activity & Reading'}
              </CardTitle>
              <Badge variant="info" size="sm">Nali-Kali</Badge>
            </div>
            <CardDescription>
              Voice assessments & worksheets completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {/* Voice recitation item */}
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-950">
                  {language === 'kn' ? 'ಕನ್ನಡ ಕವನ ವಾಚನ: "ನನ್ನ ಮನೆ"' : 'Kannada Poem Recitation'}
                </span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  94% Score
                </span>
              </div>
              <p className="text-[11px] text-amber-900 leading-snug">
                ಕುವೆಂಪು ಅವರ ಪದ್ಯವನ್ನು ಸ್ಪಷ್ಟ ಉಚ್ಚಾರಣೆಯೊಂದಿಗೆ ಓದಿದ್ದಾರೆ. ಶಿಕ್ಷಕರಿಂದ ಅತ್ಯುತ್ತಮ ಪ್ರಶಂಸೆ.
              </p>
            </div>

            {/* Completed Worksheets */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <span className="font-bold text-xs text-slate-800 block">
                {language === 'kn' ? 'ಪೂರ್ಣಗೊಂಡ ಮನೆಕೆಲಸಗಳು' : 'Completed Worksheets'}
              </span>
              <ul className="text-xs text-slate-600 space-y-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>೪ ಮತ್ತು ೬ ರ ಮಗ್ಗಿ ಗುಣಾಕಾರ ಅಭ್ಯಾಸ</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ಪರಿಸರ ವಿಜ್ಞಾನ: ಸಸ್ಯಗಳ ಭಾಗಗಳ ರೇಖಾಚಿತ್ರ</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Parent Concerns Box (1 col) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {language === 'kn' ? 'ನಿಮ್ಮ ಸಲಹೆ & ಕುಂದುಕೊರತೆ ಸ್ಥಿತಿ' : 'Your Concerns & Replies'}
              </CardTitle>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setIsSubmitConcernOpen(true)}
              >
                {language === 'kn' ? '+ ಹೊಸ ಸಲಹೆ' : '+ New'}
              </Button>
            </div>
            <CardDescription>
              Two-way communication with school headmaster
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {myConcerns.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No concerns submitted yet.</p>
            ) : (
              myConcerns.map(c => (
                <div key={c.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <Badge variant={c.status === 'RESOLVED' ? 'success' : 'warning'} size="sm">
                      {c.status}
                    </Badge>
                    <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">{c.subject}</h5>
                  <p className="text-[11px] text-slate-600">{c.description}</p>

                  {c.teacherResponse && (
                    <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                      <span className="font-bold text-[10px] text-emerald-800 block">Teacher Reply / ಪರಿಹಾರ:</span>
                      <p className="text-[11px] mt-0.5">{c.teacherResponse}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5B. DEDICATED STUDENT CONCERN AND SCHOOL FOLLOW-UP SECTION */}
      <ParentConcernTracker
        concerns={myConcerns}
        onOpenSubmitModal={() => setIsSubmitConcernOpen(true)}
      />

      {/* ============================================================== */}
      {/* 6. OFFICIAL STUDENT PROGRESS REPORT CARD MODAL */}
      {/* ============================================================== */}
      <Modal
        isOpen={isReportCardOpen}
        onClose={() => setIsReportCardOpen(false)}
        title={
          language === 'kn'
            ? `ವಿದ್ಯಾರ್ಥಿ ಪ್ರಗತಿ ಪತ್ರಿಕೆ: ${selectedChild.firstNameKn} ${selectedChild.lastNameKn}`
            : `Official Student Progress Report: ${selectedChild.firstName} ${selectedChild.lastName}`
        }
      >
        <div className="space-y-5">
          {/* Government School Emblem & Header */}
          <div className="border-2 border-emerald-700/60 rounded-2xl p-5 bg-gradient-to-b from-stone-50 via-white to-stone-50 shadow-xs relative">
            <div className="text-center space-y-1 pb-4 border-b-2 border-emerald-800/30">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
                GOVERNMENT OF KARNATAKA • DEPARTMENT OF SCHOOL EDUCATION
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                ಸರ್ಕಾರಿ ಮಾದರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಹೊಸಹಳ್ಳಿ
              </h3>
              <p className="text-xs text-slate-600">
                Govt. Model Higher Primary School, Hosahalli, Hassan District
              </p>
              <div className="inline-flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-1">
                <span>DISE Code: <strong>29220405201</strong></span>
                <span>•</span>
                <span>Academic Year: <strong>2026-2027</strong></span>
                <span>•</span>
                <span>Term: <strong>Term 1 (ಪ್ರಥಮ ಸತ್ರ)</strong></span>
              </div>
            </div>

            {/* Student Dossier Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 text-xs border-b border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Student Name</span>
                <span className="font-extrabold text-slate-900">{selectedChild.firstName} {selectedChild.lastName}</span>
                <span className="text-[10px] text-emerald-800 block">({selectedChild.firstNameKn} {selectedChild.lastNameKn})</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Class & Section</span>
                <span className="font-bold text-slate-800">{selectedChild.className}</span>
                <span className="text-[10px] text-slate-500 block">Roll: {selectedChild.rollNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Admission No</span>
                <span className="font-mono font-bold text-slate-800">{selectedChild.admissionNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Attendance Rate</span>
                <span className="font-extrabold text-emerald-700">{selectedChild.attendanceRate}%</span>
                <span className="text-[10px] text-emerald-800 block">High Honor</span>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="py-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">
                Scholastic Performance (ವಿಷಯವಾರು ಸಾಧನೆ)
              </h4>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                      <th className="p-2.5">Subject (ವಿಷಯ)</th>
                      <th className="p-2.5 text-center">Max Marks</th>
                      <th className="p-2.5 text-center">Obtained</th>
                      <th className="p-2.5 text-center">Percentage</th>
                      <th className="p-2.5 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">ಕನ್ನಡ (Kannada - 1st Lang)</td>
                      <td className="p-2.5 text-center text-slate-500">25</td>
                      <td className="p-2.5 text-center font-bold text-slate-900">24</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700">96%</td>
                      <td className="p-2.5 text-center"><Badge variant="success" size="sm">A+</Badge></td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">ಗಣಿತ (Mathematics)</td>
                      <td className="p-2.5 text-center text-slate-500">50</td>
                      <td className="p-2.5 text-center font-bold text-slate-900">46</td>
                      <td className="p-2.5 text-center font-bold text-sky-700">92%</td>
                      <td className="p-2.5 text-center"><Badge variant="success" size="sm">A+</Badge></td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">ಪರಿಸರ ಅಧ್ಯಯನ (EVS Science)</td>
                      <td className="p-2.5 text-center text-slate-500">25</td>
                      <td className="p-2.5 text-center font-bold text-slate-900">23</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700">92%</td>
                      <td className="p-2.5 text-center"><Badge variant="success" size="sm">A</Badge></td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">ಇಂಗ್ಲಿಷ್ (English - 2nd Lang)</td>
                      <td className="p-2.5 text-center text-slate-500">25</td>
                      <td className="p-2.5 text-center font-bold text-slate-900">22</td>
                      <td className="p-2.5 text-center font-bold text-indigo-700">88%</td>
                      <td className="p-2.5 text-center"><Badge variant="info" size="sm">A</Badge></td>
                    </tr>
                    <tr className="bg-emerald-50/70 font-extrabold text-emerald-950">
                      <td className="p-2.5">ಒಟ್ಟು ಅಂಕಗಳು (GRAND TOTAL)</td>
                      <td className="p-2.5 text-center">125</td>
                      <td className="p-2.5 text-center text-base">115</td>
                      <td className="p-2.5 text-center text-base text-emerald-700">92.0%</td>
                      <td className="p-2.5 text-center"><Badge variant="success" size="sm">A+ DISTINCTION</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Teacher Remarks & Endorsements */}
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1 text-xs">
              <span className="font-bold text-amber-950 block">Class Teacher Remarks (ತರಗತಿ ಶಿಕ್ಷಕರ ಪ್ರಶಂಸನಾ ನುಡಿ):</span>
              <p className="text-amber-900 leading-relaxed italic">
                "{selectedChild.firstNameKn} ಅವರು ಕನ್ನಡ ಪದ್ಯ ವಾಚನ, ಗಣಿತ ಮಗ್ಗಿಗಳು ಹಾಗೂ ಸಹಪಠ್ಯ ಚಟುವಟಿಕೆಗಳಲ್ಲಿ ಅತ್ಯಂತ ಮುಂಚೂಣಿಯಲ್ಲಿದ್ದಾರೆ. ಮನೆಕೆಲಸವನ್ನು ನಿತ್ಯವೂ ನಿಯಮಿತವಾಗಿ ಪೂರ್ಣಗೊಳಿಸುತ್ತಾರೆ. ಪ್ರಥಮ ದರ್ಜೆ ಉತ್ತೀರ್ಣರಾಗಿದ್ದಾರೆ."
              </p>
            </div>

            {/* Signature Blocks */}
            <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs text-slate-600">
              <div>
                <p className="font-bold text-slate-900">Smt. Savitri Hegde</p>
                <span className="text-[10px] text-slate-400">Class Teacher (ವರ್ಗ ಶಿಕ್ಷಕರು)</span>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full border-2 border-emerald-800 text-emerald-800 flex items-center justify-center font-bold text-[9px] mx-auto uppercase">
                  SEAL<br/>DISE
                </div>
                <span className="text-[10px] text-slate-400">School Official Seal</span>
              </div>
              <div>
                <p className="font-bold text-slate-900">Sri Basavaraj Patil</p>
                <span className="text-[10px] text-slate-400">Headmaster (ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು)</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Teacher Smt. Savitri Hegde has been notified that you viewed this report
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => window.print()}
              >
                Print Report
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => setIsReportCardOpen(false)}
              >
                Close Report
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* 7. SUBMIT CONCERN MODAL (CONNECTED TO STUDENT CONCERN SYSTEM)  */}
      {/* ============================================================== */}
      <ParentSubmitConcernModal
        isOpen={isSubmitConcernOpen}
        onClose={() => setIsSubmitConcernOpen(false)}
        childrenList={myChildren}
        initialSelectedChildId={selectedChild.id}
        onConcernSubmitted={msg => {
          setFeedbackToast(msg);
          setTimeout(() => setFeedbackToast(null), 4000);
        }}
      />

      {/* ============================================================== */}
      {/* 8. ATTENDANCE HISTORY MODAL */}
      {/* ============================================================== */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title={
          language === 'kn'
            ? `ಮಾಸಿಕ ಹಾಜರಾತಿ ವಿವರ: ${selectedChild.firstNameKn}`
            : `Monthly Attendance Record: ${selectedChild.firstName}`
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-emerald-950 block">Current Attendance Honor: 96.4%</span>
              <span className="text-emerald-800">22 of 23 working days attended this month</span>
            </div>
            <Badge variant="success" size="sm">Eligible for Scholarship</Badge>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-center text-xs">
            {Array.from({ length: 24 }).map((_, i) => {
              const day = i + 1;
              const isAbsent = day === 14;
              return (
                <div 
                  key={day} 
                  className={`p-2 rounded-lg border text-[11px] ${
                    isAbsent 
                      ? 'bg-rose-50 border-rose-300 text-rose-800' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <span className="font-bold block">Sep {day}</span>
                  <span className="text-[10px] font-semibold mt-0.5 block">
                    {isAbsent ? 'ABSENT' : 'PRESENT'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setIsAttendanceModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* 9. MARKS MODAL */}
      {/* ============================================================== */}
      <Modal
        isOpen={isMarksModalOpen}
        onClose={() => setIsMarksModalOpen(false)}
        title={
          language === 'kn'
            ? `ಪರೀಕ್ಷಾ ಅಂಕಗಳು: ${selectedChild.firstNameKn}`
            : `Complete Examination Records: ${selectedChild.firstName}`
        }
      >
        <div className="space-y-3">
          {childMarks.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No examination records recorded yet.</p>
          ) : (
            childMarks.map(m => (
              <div key={m.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                  <span>{m.testTitle}</span>
                  <span className="text-emerald-700">{m.marksObtained}/{m.totalMarks} ({m.percentage}%) - {m.grade}</span>
                </div>
                <p className="text-[11px] text-slate-600 italic">
                  "{m.teacherRemarksKn || m.teacherRemarks}"
                </p>
                <span className="text-[10px] text-slate-400 block pt-1">Recorded: {m.recordedAt}</span>
              </div>
            ))
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setIsMarksModalOpen(false)}>
              Close Marks
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* 10. CONTACT TEACHER MODAL */}
      {/* ============================================================== */}
      <Modal
        isOpen={isContactTeacherOpen}
        onClose={() => setIsContactTeacherOpen(false)}
        title={language === 'kn' ? 'ತರಗತಿ ಶಿಕ್ಷಕರನ್ನು ಸಂಪರ್ಕಿಸಿ' : 'Contact Class Teacher'}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-200 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center text-sm">
              SH
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Smt. Savitri Hegde</h4>
              <p className="text-xs text-amber-800 font-medium">Class Teacher: Grade 5-A</p>
              <p className="text-xs text-slate-600 mt-1">Official Mobile: <strong>9845098765</strong></p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-sky-50 text-xs text-sky-900 space-y-1">
            <span className="font-bold block">ಶಾಲಾ ಸಮಾಲೋಚನಾ ಸಮಯ (Calling Hours):</span>
            <p className="text-[11px]">ಸೋಮವಾರದಿಂದ ಶುಕ್ರವಾರ: ಬೆಳಿಗ್ಗೆ ೮:೩೦ ರಿಂದ ೯:೧೫ ಮತ್ತು ಸಂಜೆ ೪:೧೫ ರಿಂದ ೫:೩೦.</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <a
              href="tel:9845098765"
              className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 text-center shadow"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{language === 'kn' ? 'ನೇರ ಕರೆ ಮಾಡಿ (9845098765)' : 'Call Teacher Now'}</span>
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsContactTeacherOpen(false);
                if (onOpenActionModal) onOpenActionModal('REQUEST_MEETING');
              }}
            >
              {language === 'kn' ? 'ಸಮಾಲೋಚನೆಗೆ ವಿನಂತಿಸಿ' : 'Request Callback'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Online Exam Result Dossier Modal for Parent */}
      {viewingOnlineExamResult && (
        <StudentResultModal
          isOpen={Boolean(viewingOnlineExamResult)}
          onClose={() => setViewingOnlineExamResult(null)}
          test={viewingOnlineExamResult.test}
          submission={viewingOnlineExamResult.submission}
        />
      )}
    </div>
  );
};
