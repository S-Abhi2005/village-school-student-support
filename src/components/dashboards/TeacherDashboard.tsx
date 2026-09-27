import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  CalendarCheck, 
  Sparkles, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Plus, 
  Award, 
  ChevronRight,
  GraduationCap,
  Bell,
  User as UserIcon,
  MessageSquare,
  FileText,
  Upload,
  Search,
  SlidersHorizontal,
  TrendingUp,
  BarChart3,
  Eye,
  AlertTriangle,
  ExternalLink,
  Check,
  X,
  Volume2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown
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
  MOCK_SUBJECTS, 
  MOCK_TESTS, 
  MOCK_STUDENT_MARKS, 
  MOCK_PARENT_CONCERNS,
  MOCK_ATTENDANCE_TODAY
} from '../../mock/schoolData';
import { StudentProfile, TestItem, StudentMarkRecord, ParentConcern } from '../../types';
import { getReportViewRecords, ReportViewRecord } from '../../services/reportViewService';
import { ActionModalType } from './QuickActionModal';
import { onlineTestService, OnlineTest } from '../../services/onlineTestService';
import { TeacherTestCreationModal } from '../online-test/TeacherTestCreationModal';
import { TeacherSubmissionsModal } from '../online-test/TeacherSubmissionsModal';
import { concernService } from '../../services/concernService';
import { TeacherConcernSection } from '../concerns/TeacherConcernSection';
import { TeacherReportViewsCard } from './TeacherReportViewsCard';

interface TeacherDashboardProps {
  onNavigate?: (tab: string) => void;
  onOpenActionModal?: (modal: ActionModalType) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  onNavigate,
  onOpenActionModal 
}) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  // State for Report View Notifications from parents
  const [reportViews, setReportViews] = useState<ReportViewRecord[]>([]);

  // Modals & Popovers
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [isEnterMarksOpen, setIsEnterMarksOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPerformance, setFilterPerformance] = useState<'ALL' | 'DISTINCTION' | 'GOOD' | 'NEEDS_SUPPORT'>('ALL');
  
  // Create Test Form State
  const [testTitleKn, setTestTitleKn] = useState('');
  const [testSubject, setTestSubject] = useState('KAN-05');
  const [testTotalMarks, setTestTotalMarks] = useState(25);
  const [testDate, setTestDate] = useState('2026-10-02');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Online Test States
  const [onlineTestsList, setOnlineTestsList] = useState<OnlineTest[]>(() => onlineTestService.getTests());
  const [isTeacherOnlineTestCreationOpen, setIsTeacherOnlineTestCreationOpen] = useState(false);
  const [selectedOnlineTestForSubmissions, setSelectedOnlineTestForSubmissions] = useState<OnlineTest | null>(null);

  // Enter Marks Form State
  const [selectedStudentForMarks, setSelectedStudentForMarks] = useState('s1');
  const [selectedTestForMarks, setSelectedTestForMarks] = useState('test-1');
  const [enteredScore, setEnteredScore] = useState(24);
  const [enteredRemarkKn, setEnteredRemarkKn] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Load and listen to parent report view events
  useEffect(() => {
    setReportViews(getReportViewRecords());

    const handleReportViewEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ReportViewRecord>;
      if (customEvent.detail) {
        setReportViews(prev => {
          const filtered = prev.filter(r => r.id !== customEvent.detail.id);
          return [customEvent.detail, ...filtered];
        });
      } else {
        setReportViews(getReportViewRecords());
      }
    };

    window.addEventListener('report-view-updated', handleReportViewEvent);
    return () => window.removeEventListener('report-view-updated', handleReportViewEvent);
  }, []);

  // Click outside listener for header popovers
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

  // Filter students
  const filteredStudents = MOCK_STUDENTS.filter(s => {
    if (s.className && !s.className.includes('5-A') && s.classId !== 'c5') return false;
    const nameMatch = `${s.firstName} ${s.lastName} ${s.firstNameKn} ${s.lastNameKn}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    if (!nameMatch) return false;

    if (filterPerformance === 'DISTINCTION') return s.attendanceRate >= 95;
    if (filterPerformance === 'GOOD') return s.attendanceRate >= 90 && s.attendanceRate < 95;
    if (filterPerformance === 'NEEDS_SUPPORT') return s.attendanceRate < 90;
    return true;
  });

  const [allConcerns, setAllConcerns] = useState<ParentConcern[]>(() => concernService.getConcerns());

  useEffect(() => {
    const handleConcernUpdate = () => {
      setAllConcerns(concernService.getConcerns());
    };
    window.addEventListener('parent-concern-updated', handleConcernUpdate);
    return () => window.removeEventListener('parent-concern-updated', handleConcernUpdate);
  }, []);

  // Calculate statistics
  const totalStudents = 28;
  const presentToday = 26;
  const attendanceRate = ((presentToday / totalStudents) * 100).toFixed(1);
  const testsCount = 14;
  const pendingConcerns = allConcerns.filter(c => c.status !== 'RESOLVED').length;

  const handleCreateTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitleKn) return;
    setSuccessToast(language === 'kn' ? 'ಹೊಸ ಪರೀಕ್ಷೆ ವೇಳಾಪಟ್ಟಿ ನಿಗದಿಯಾಗಿದೆ!' : 'New test scheduled successfully!');
    setIsCreateTestOpen(false);
    setTestTitleKn('');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleEnterMarksSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessToast(language === 'kn' ? 'ಅಂಕಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನಮೂದಿಸಲಾಗಿದೆ!' : 'Marks entered & parent SMS drafted!');
    setIsEnterMarksOpen(false);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP SECTION: Welcome, Teacher Name, Class/Subject, Notification Bell, Profile Menu */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-stone-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 text-amber-200 text-xs font-semibold border border-amber-600/40">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'kn' ? 'ವರ್ಗ ಶಿಕ್ಷಕಿ: ೫ ನೇ ತರಗತಿ (ವಿಭಾಗ ಎ)' : 'Class Teacher: Grade 5-A'}</span>
              </span>
              <span className="text-amber-200/70 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-amber-200/90 font-medium">
                {language === 'kn' ? 'ವಿಷಯ: ಕನ್ನಡ ಸಾಹಿತ್ಯ & ಪರಿಸರ ವಿಜ್ಞಾನ' : 'Subjects: Kannada Literature & EVS'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'kn' ? 'ನಮಸ್ಕಾರ, ಶ್ರೀಮತಿ ಸಾವಿತ್ರಿ ಹೆಗಡೆ' : 'Welcome back, Smt. Savitri Hegde'}
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed">
              {language === 'kn'
                ? 'ಇಂದು ನಿಮ್ಮ ತರಗತಿಯಲ್ಲಿ ೨೬/೨೮ ವಿದ್ಯಾರ್ಥಿಗಳು ಹಾಜರಾಗಿದ್ದಾರೆ. ಪೋಷಕರಿಂದ ೨ ಹೊಸ ಸಲಹೆಗಳು ಬಂದಿವೆ.'
                : '26 of 28 students present today. 4 teaching periods scheduled with active Nali-Kali groups.'}
            </p>
          </div>

          {/* Top Right Action & Menu Bar */}
          <div className="flex items-center gap-3 self-start md:self-center">
            {/* Live Parent Report Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2.5 rounded-xl bg-amber-950/70 hover:bg-amber-950 border border-amber-500/30 text-amber-100 transition-all cursor-pointer shadow-xs"
                title="Teacher Notifications & Parent Activity"
              >
                <Bell className="w-5 h-5 text-amber-300" />
                {(reportViews.length > 0 || unreadCount > 0) && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-amber-900 animate-pulse">
                    {reportViews.length + unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-800" />
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                        {language === 'kn' ? 'ಶಿಕ್ಷಕರ ಎಚ್ಚರಿಕೆಗಳು & ಪೋಷಕರ ವೀಕ್ಷಣೆ' : 'Teacher Alerts & Parent Views'}
                      </span>
                    </div>
                    <Badge variant="warning" size="sm">{reportViews.length} report views</Badge>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {/* Live Report Views */}
                    {reportViews.map(rv => (
                      <div key={rv.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                            <Eye className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900">
                              {rv.parentName} <span className="font-normal text-slate-500">viewed report of</span> {rv.studentName}
                            </p>
                            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                              {rv.reportTitle} ({rv.term})
                            </p>
                            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                              <span>{rv.viewedAt}</span>
                              <span className="text-emerald-700 font-bold">SMS Sent</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Standard Alerts */}
                    {notifications.slice(0, 3).map(n => (
                      <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                        <p className="text-xs font-bold text-slate-800">{language === 'kn' ? n.titleKn : n.titleEn}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{language === 'kn' ? n.bodyKn : n.bodyEn}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.createdAt}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button 
                      onClick={() => setShowNotifMenu(false)}
                      className="text-xs font-semibold text-amber-800 hover:text-amber-950"
                    >
                      {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close Alerts'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-amber-950/70 hover:bg-amber-950 border border-amber-500/30 text-amber-100 transition-all cursor-pointer shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-xs shadow-inner">
                  SH
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-amber-100 leading-tight">Smt. Savitri Hegde</p>
                  <p className="text-[10px] text-amber-300/80">Govt. Teacher · Grade 5</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-amber-300" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-150">
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-stone-50 border-b border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-amber-700 text-white font-bold text-base flex items-center justify-center shadow-md">
                        SH
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Smt. Savitri Hegde</h4>
                        <p className="text-xs text-amber-800 font-medium">B.Ed, M.A. Kannada</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-mono">EMP-KA-8842</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <span className="text-slate-500">School:</span>
                      <span className="font-semibold text-slate-800">Govt. Model HPS, Hosahalli</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <span className="text-slate-500">DISE Code:</span>
                      <span className="font-mono font-semibold text-slate-800">29220405201</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <span className="text-slate-500">Assigned:</span>
                      <span className="font-semibold text-slate-800">Grade 5-A (28 Students)</span>
                    </div>
                  </div>

                  <div className="p-3 border-t border-slate-100 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onNavigate) onNavigate('manage-teachers');
                      }}
                    >
                      {language === 'kn' ? 'ಪೂರ್ಣ ಪ್ರೊಫೈಲ್ ವಿವರ' : 'View Full Faculty Record'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. STATISTICS CARDS: Total Students, Today's Attendance, Tests Conducted, Pending Concerns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={language === 'kn' ? 'ಒಟ್ಟು ವಿದ್ಯಾರ್ಥಿಗಳು (೫-ಎ)' : 'Total Students (Grade 5-A)'}
          value="28"
          subtitle={language === 'kn' ? '೧೫ ಹೆಣ್ಣುಮಕ್ಕಳು · ೧೩ ಗಂಡುಮಕ್ಕಳು' : '15 Girls · 13 Boys (100% Enrolled)'}
          icon={<Users className="w-5 h-5 text-amber-700" />}
          accentColor="amber"
        />
        <StatCard
          title={language === 'kn' ? 'ಇಂದಿನ ಹಾಜರಾತಿ ಪ್ರಮಾಣ' : "Today's Attendance"}
          value={`${presentToday} / ${totalStudents}`}
          subtitle={language === 'kn' ? `${attendanceRate}% ಹಾಜರಾತಿ · ೨ ತಡವಾಗಿ ಬಂದಿದ್ದಾರೆ` : `${attendanceRate}% Present · 2 Late Arrivals`}
          icon={<CalendarCheck className="w-5 h-5 text-emerald-700" />}
          trend={{ value: 'Absent parents notified via SMS', isPositive: true }}
          accentColor="emerald"
        />
        <StatCard
          title={language === 'kn' ? 'ನಡೆಸಿದ ಪರೀಕ್ಷೆಗಳು' : 'Tests Conducted'}
          value={`${testsCount}`}
          subtitle={language === 'kn' ? '೩ ಘಟಕ ಪರೀಕ್ಷೆಗಳು · ೧ ಮಧ್ಯವಾರ್ಷಿಕ' : '3 Unit Tests · 1 Mid-Term Test'}
          icon={<Award className="w-5 h-5 text-indigo-700" />}
          trend={{ value: '100% Passing Rate', isPositive: true }}
          accentColor="sky"
        />
        <StatCard
          title={language === 'kn' ? 'ಪೋಷಕರ ಬಾಕಿ ಸಮಸ್ಯೆಗಳು' : 'Pending Parent Concerns'}
          value={`${pendingConcerns}`}
          subtitle={language === 'kn' ? '೧ ಕಲಿಕೆ ಸಂಬಂಧಿ · ೧ ಆರೋಗ್ಯ ವಿಚಾರಣೆ' : '1 Academic · 1 Health Inquiry'}
          icon={<MessageSquare className="w-5 h-5 text-rose-700" />}
          accentColor="amber"
        />
      </div>

      {/* 3. CHARTS ROW: Attendance Trend, Class Performance, Subject-wise, Test Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Trend Chart */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'kn' ? 'ವಾರದ ಹಾಜರಾತಿ ಪ್ರವೃತ್ತಿ' : 'Attendance Trend'}
              </span>
              <Badge variant="success" size="sm">93.2% Avg</Badge>
            </div>
            <CardTitle className="text-sm mt-1">
              {language === 'kn' ? 'ಸೋಮ - ಶುಕ್ರ ಹಾಜರಾತಿ' : 'Monday to Friday Rate'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-28 flex items-end justify-between gap-2 pt-4 px-1 border-b border-slate-100">
              {[
                { day: 'Mon', rate: 96 },
                { day: 'Tue', rate: 93 },
                { day: 'Wed', rate: 96 },
                { day: 'Thu', rate: 89 },
                { day: 'Fri', rate: 93 },
              ].map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-emerald-700">{d.rate}%</span>
                  <div 
                    className="w-full bg-emerald-500/80 group-hover:bg-emerald-600 rounded-t-md transition-all"
                    style={{ height: `${(d.rate - 70) * 3}%` }}
                  />
                  <span className="text-[10px] font-semibold text-slate-400">{d.day}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              {language === 'kn' ? 'ಗುರುವಾರ ಹೊರತುಪಡಿಸಿ ೯೨%+ ಸ್ಥಿರ ಹಾಜರಾತಿ' : 'Consistently above 92% school benchmark'}
            </p>
          </CardContent>
        </Card>

        {/* Class Performance Distribution Chart */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'kn' ? 'ವರ್ಗ ಸಾಧನೆ ಹಂಚಿಕೆ' : 'Class Performance'}
              </span>
              <Badge variant="info" size="sm">Term 1</Badge>
            </div>
            <CardTitle className="text-sm mt-1">
              {language === 'kn' ? 'ಗ್ರೇಡ್ ಹಂಚಿಕೆ (೨೮ ವಿದ್ಯಾರ್ಥಿಗಳು)' : 'Grade Distribution (N=28)'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-2 pt-1">
              {[
                { label: 'A+ (Distinction >85%)', count: 10, pct: 36, color: 'bg-emerald-500' },
                { label: 'A (First Class 70-84%)', count: 12, pct: 43, color: 'bg-sky-500' },
                { label: 'B (Second Class 50-69%)', count: 5, pct: 18, color: 'bg-amber-500' },
                { label: 'C (Remedial Support <50%)', count: 1, pct: 3, color: 'bg-rose-500' },
              ].map(g => (
                <div key={g.label} className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">{g.label}</span>
                    <span className="text-slate-500">{g.count} std ({g.pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${g.color}`} style={{ width: `${g.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Performance */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'kn' ? 'ವಿಷಯವಾರು ಸರಾಸರಿ ಅಂಕ' : 'Subject Performance'}
              </span>
              <Badge variant="neutral" size="sm">5th Std</Badge>
            </div>
            <CardTitle className="text-sm mt-1">
              {language === 'kn' ? 'ವಿಷಯ ಪ್ರಾವೀಣ್ಯತೆ (%)' : 'Subject Mastery Index'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-2 pt-1">
              {[
                { name: 'Kannada (ಕನ್ನಡ)', score: 88, color: 'bg-amber-600' },
                { name: 'Mathematics (ಗಣಿತ)', score: 79, color: 'bg-sky-600' },
                { name: 'EVS Science (ಪರಿಸರ)', score: 85, color: 'bg-emerald-600' },
                { name: 'English (ಇಂಗ್ಲಿಷ್)', score: 74, color: 'bg-indigo-600' },
              ].map(s => (
                <div key={s.name} className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">{s.name}</span>
                    <span className="font-bold text-slate-900">{s.score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${s.color}`} style={{ width: `${s.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Performance Trajectory */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'kn' ? 'ಪರೀಕ್ಷೆ ಹೋಲಿಕೆ ವರದಿ' : 'Test Performance'}
              </span>
              <Badge variant="success" size="sm">+4% Growth</Badge>
            </div>
            <CardTitle className="text-sm mt-1">
              {language === 'kn' ? 'ಘಟಕ ಪರೀಕ್ಷೆಗಳ ಪ್ರಗತಿ' : 'Term Assessments'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-2.5">
              <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Unit Test 1 (Kannada)</span>
                <span className="font-bold text-emerald-700">82.4% Avg</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Mid-Term (Mathematics)</span>
                <span className="font-bold text-sky-700">84.0% Avg</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900">Unit Test 2 (EVS Science)</span>
                <span className="font-bold text-emerald-800">86.5% Avg</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              100% of enrolled students appeared for all 3 examinations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 4. QUICK ACTIONS ROW */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'kn' ? 'ತ್ವರಿತ ಶಿಕ್ಷಕ ಕ್ರಮಗಳು' : 'Teacher Quick Action Hub'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'kn' ? 'ದೈನಂದಿನ ಶೈಕ್ಷಣಿಕ ಕಾರ್ಯಗಳನ್ನು ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ನಿರ್ವಹಿಸಿ' : 'Perform common classroom actions in one click'}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              Grade 5-A Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
            {/* Action 1: Mark Attendance */}
            <button
              onClick={() => {
                if (onOpenActionModal) onOpenActionModal('MARK_ATTENDANCE');
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer bg-white"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-900 leading-tight">
                {language === 'kn' ? 'ಹಾಜರಾತಿ ದಾಖಲಿಸಿ' : 'Mark Attendance'}
              </span>
            </button>

            {/* Action 2: Create Test */}
            <button
              onClick={() => setIsTeacherOnlineTestCreationOpen(true)}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer bg-white"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-amber-900 leading-tight">
                {language === 'kn' ? 'ಹೊಸ ಪರೀಕ್ಷೆ ರಚಿಸಿ' : 'Create Test'}
              </span>
            </button>

            {/* Action 3: Enter Marks */}
            <button
              onClick={() => setIsEnterMarksOpen(true)}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer bg-white"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-indigo-900 leading-tight">
                {language === 'kn' ? 'ಅಂಕಗಳನ್ನು ನಮೂದಿಸಿ' : 'Enter Marks'}
              </span>
            </button>

            {/* Action 4: View Students */}
            <button
              onClick={() => {
                if (onNavigate) onNavigate('classes');
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer bg-white"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-sky-900 leading-tight">
                {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಗಳ ಪಟ್ಟಿ' : 'View Students'}
              </span>
            </button>

            {/* Action 5: View Concerns */}
            <button
              onClick={() => {
                if (onNavigate) onNavigate('concerns');
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer bg-white"
            >
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-rose-900 leading-tight">
                {language === 'kn' ? 'ಪೋಷಕರ ದೂರುಗಳು' : 'View Concerns'}
              </span>
            </button>

            {/* Action 6: Upload Material */}
            <button
              onClick={() => {
                if (onNavigate) onNavigate('materials');
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer bg-white"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-teal-900 leading-tight">
                {language === 'kn' ? 'ಕಲಿಕಾ ಸಾಮಗ್ರಿ ಅಪ್‌ಲೋಡ್' : 'Upload Material'}
              </span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 5. RECENT ACTIVITY GRID (Latest test results, Parent concerns, Student activity, Parent report-view notifications) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Parent Report-View Notifications (CRITICAL REQUIREMENT) */}
        <Card className="border-2 border-emerald-300 bg-gradient-to-b from-emerald-50/40 via-white to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                {language === 'kn' ? 'ಪೋಷಕರ ವರದಿ ವೀಕ್ಷಣೆ' : 'Parent Report Views'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <CardTitle className="text-sm">
              {language === 'kn' ? 'ನೈಜ ಸಮಯದ ಅಪ್ಡೇಟ್' : 'Real-time Acknowledgments'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {reportViews.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No report view logs yet.
              </p>
            ) : (
              reportViews.slice(0, 3).map(rv => (
                <div key={rv.id} className="p-2.5 rounded-lg border border-emerald-200/80 bg-white space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{rv.parentName}</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                      {rv.viewCount > 1 ? `${rv.viewCount}x viewed` : 'Viewed'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Opened report of: <strong className="text-emerald-800">{rv.studentName}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>{rv.viewedAt}</span>
                    <span className="text-slate-500">{rv.parentPhone}</span>
                  </p>
                </div>
              ))
            )}
            <p className="text-[10px] text-emerald-800 font-medium text-center">
              ✓ Automated confirmation SMS sent to registered parent phones
            </p>
          </CardContent>
        </Card>

        {/* Latest Test Results */}
        <Card>
          <CardHeader className="pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              {language === 'kn' ? 'ಇತ್ತೀಚಿನ ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶ' : 'Latest Test Results'}
            </span>
            <CardTitle className="text-sm">
              Unit Assessment 1 (Kannada)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-0">
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/70 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-950">
                <span>Kannada Varnamale & Recitation</span>
                <span className="text-amber-800">24 / 25 Max</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-snug">
                24 out of 28 students scored above 80%. Top scorer: Kavya R. Gowda (24/25).
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 text-xs space-y-1">
              <span className="font-semibold text-slate-800">EVS Discovery Quiz</span>
              <p className="text-[11px] text-slate-500">26/28 students submitted plant diagrams.</p>
            </div>
          </CardContent>
        </Card>

        {/* New Parent Concerns */}
        <Card>
          <CardHeader className="pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
              {language === 'kn' ? 'ಹೊಸ ಪೋಷಕರ ಸಲಹೆಗಳು' : 'New Parent Concerns'}
            </span>
            <CardTitle className="text-sm">
              {pendingConcerns} Open Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-0">
            {MOCK_PARENT_CONCERNS.slice(0, 2).map(c => (
              <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{c.parentName}</span>
                  <Badge variant={c.status === 'RESOLVED' ? 'success' : 'warning'} size="sm">
                    {c.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-1">{c.subject}</p>
                <p className="text-[10px] text-slate-400">{c.studentName} • {c.createdAt}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Student Activity */}
        <Card>
          <CardHeader className="pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಕಲಿಕಾ ಚಟುವಟಿಕೆ' : 'Student Learning Activity'}
            </span>
            <CardTitle className="text-sm">
              Today's Submissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-0">
            <div className="p-2.5 rounded-lg bg-sky-50/70 border border-sky-200/70 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-sky-950">
                <span>Kavya R. Gowda</span>
                <span className="text-emerald-700">94% Voice Score</span>
              </div>
              <p className="text-[11px] text-sky-900">
                Completed Kuvempu's "Nanna Mane" poem reading practice.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Abhishek Nayaka</span>
                <span className="text-slate-500">10:45 AM</span>
              </div>
              <p className="text-[11px] text-slate-600">Finished 4x Multiplication Worksheet.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. STUDENT TABLE WITH ALL REQUIRED COLUMNS & PROFILE VIEW BUTTON */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">
              {language === 'kn' ? '೫ ನೇ ತರಗತಿ ವಿದ್ಯಾರ್ಥಿಗಳ ಶೈಕ್ಷಣಿಕ ದಾಖಲೆ' : 'Grade 5-A Student Performance & Attendance'}
            </CardTitle>
            <CardDescription>
              {language === 'kn'
                ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು, ಹಾಜರಾತಿ %, ಇತ್ತೀಚಿನ ಅಂಕಗಳು, ಪ್ರಗತಿ ಸ್ಥಿತಿ ಮತ್ತು ಪ್ರೊಫೈಲ್'
                : 'Comprehensive classroom metrics, attendance honor, and academic development'}
            </CardDescription>
          </div>

          {/* Table Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಹುಡುಕಿ...' : 'Search student...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white w-44 sm:w-56 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <select
              value={filterPerformance}
              onChange={e => setFilterPerformance(e.target.value as any)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="ALL">{language === 'kn' ? 'ಎಲ್ಲಾ ಹಂತಗಳು' : 'All Performance'}</option>
              <option value="DISTINCTION">{language === 'kn' ? 'ಪ್ರಥಮ ದರ್ಜೆ (>95%)' : 'Distinction (>95%)'}</option>
              <option value="GOOD">{language === 'kn' ? 'ಉತ್ತಮ (90-94%)' : 'Good (90-94%)'}</option>
              <option value="NEEDS_SUPPORT">{language === 'kn' ? 'ಗಮನ ಬೇಕು (<90%)' : 'Needs Support (<90%)'}</option>
            </select>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">{language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು & ಕ್ರ.ಸಂ' : 'Student Name & Roll'}</th>
                <th className="py-3 px-4">{language === 'kn' ? 'ಹಾಜರಾತಿ' : 'Attendance'}</th>
                <th className="py-3 px-4">{language === 'kn' ? 'ಇತ್ತೀಚಿನ ಪರೀಕ್ಷಾ ಅಂಕ' : 'Latest Test Score'}</th>
                <th className="py-3 px-4">{language === 'kn' ? 'ಸಾಧನೆ ಸ್ಥಿತಿ' : 'Performance Status'}</th>
                <th className="py-3 px-4">{language === 'kn' ? 'ಕಡೆಯ ಚಟುವಟಿಕೆ' : 'Last Activity'}</th>
                <th className="py-3 px-4 text-right">{language === 'kn' ? 'ಕ್ರಮ' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s, idx) => {
                // Find marks for this student
                const studentMarks = MOCK_STUDENT_MARKS.filter(m => m.studentId === s.id);
                const latestMark = studentMarks.length > 0 ? studentMarks[0] : null;

                const isDistinction = s.attendanceRate >= 95;
                const isGood = s.attendanceRate >= 90 && s.attendanceRate < 95;

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">
                            {language === 'kn' ? `${s.firstNameKn} ${s.lastNameKn}` : `${s.firstName} ${s.lastName}`}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {s.rollNumber} • {s.admissionNumber}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Attendance */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={s.attendanceRate >= 95 ? 'success' : s.attendanceRate >= 90 ? 'info' : 'warning'} 
                          size="sm"
                        >
                          {s.attendanceRate}%
                        </Badge>
                        <span className="text-[10px] text-emerald-700 font-medium">Present Today</span>
                      </div>
                    </td>

                    {/* Latest Test Score */}
                    <td className="py-3 px-4">
                      {latestMark ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">
                              {latestMark.marksObtained}/{latestMark.totalMarks}
                            </span>
                            <span className="text-[10px] text-slate-500">({latestMark.percentage}%)</span>
                            <Badge variant="success" size="sm">{latestMark.grade}</Badge>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{latestMark.testTitle}</p>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-slate-800">22/25 (88%)</span>
                          <p className="text-[10px] text-slate-400">Unit Test 1</p>
                        </div>
                      )}
                    </td>

                    {/* Performance Status */}
                    <td className="py-3 px-4">
                      {isDistinction ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3 text-emerald-600" />
                          {language === 'kn' ? 'ಪ್ರಥಮ ದರ್ಜೆ (Distinction)' : 'Distinction'}
                        </span>
                      ) : isGood ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">
                          {language === 'kn' ? 'ಉತ್ತಮ (Good)' : 'Good'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          {language === 'kn' ? 'ಗಮನ ಬೇಕು (Support)' : 'Needs Support'}
                        </span>
                      )}
                    </td>

                    {/* Last Activity */}
                    <td className="py-3 px-4">
                      <div>
                        <span className="text-[11px] text-slate-700 font-medium">
                          {idx === 0 ? 'Voice reading test (94%)' :
                           idx === 1 ? 'Math tables worksheet' :
                           idx === 2 ? 'Kannada handwriting copy' :
                           'Library book reading'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Today, 10:30 AM</span>
                      </div>
                    </td>

                    {/* View Profile Button */}
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<UserIcon className="w-3 h-3 text-amber-700" />}
                        onClick={() => setSelectedStudent(s)}
                      >
                        {language === 'kn' ? 'ಪ್ರೊಫೈಲ್' : 'View Profile'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 7. PARENT REPORT-VIEW REAL-TIME TRACKING */}
      <TeacherReportViewsCard />

      {/* 8. PARENT CONCERNS & STUDENT FOLLOW-UP WORKFLOW SECTION */}
      <TeacherConcernSection />

      {/* STUDENT PROFILE DOSSIER MODAL */}
      <Modal
        isOpen={selectedStudent !== null}
        onClose={() => setSelectedStudent(null)}
        title={
          selectedStudent
            ? `${language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ವಿವರ:' : 'Student Dossier:'} ${selectedStudent.firstName} ${selectedStudent.lastName}`
            : ''
        }
      >
        {selectedStudent && (
          <div className="space-y-4">
            {/* Header Bio */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-700 text-white font-bold text-base flex items-center justify-center shadow">
                  {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {selectedStudent.firstName} {selectedStudent.lastName} ({selectedStudent.firstNameKn} {selectedStudent.lastNameKn})
                  </h4>
                  <p className="text-xs text-amber-800 font-medium">
                    {selectedStudent.className} • Roll {selectedStudent.rollNumber}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">Adm: {selectedStudent.admissionNumber}</p>
                </div>
              </div>
              <Badge variant="success" size="sm">Active Student</Badge>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Attendance</span>
                <span className="text-base font-extrabold text-emerald-700">{selectedStudent.attendanceRate}%</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Nali-Kali Milestone</span>
                <span className="text-xs font-bold text-amber-900 mt-1 block">{selectedStudent.naliKaliLevel}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Mid-day Meal</span>
                <span className="text-xs font-bold text-emerald-700 mt-1 block">Active Beneficiary</span>
              </div>
            </div>

            {/* Parent Contact Details */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
              <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Parent & Emergency Contact</span>
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Parent Name:</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.parentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Primary Contact Phone:</span>
                  <a href={`tel:${selectedStudent.parentPhone}`} className="font-mono text-emerald-700 font-bold hover:underline">
                    {selectedStudent.parentPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Academic Test Marks */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Term Test Scores & Teacher Remarks</span>
              </h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {MOCK_STUDENT_MARKS.filter(m => m.studentId === selectedStudent.id).map(m => (
                  <div key={m.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{m.testTitle}</span>
                      <span className="text-emerald-700">{m.marksObtained}/{m.totalMarks} ({m.percentage}%) - {m.grade}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 italic">"{m.teacherRemarksKn || m.teacherRemarks}"</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStudent(null);
                  if (onOpenActionModal) onOpenActionModal('MARK_ATTENDANCE');
                }}
              >
                Mark Specific Attendance
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedStudent(null)}
              >
                Close Dossier
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE TEST MODAL */}
      <Modal
        isOpen={isCreateTestOpen}
        onClose={() => setIsCreateTestOpen(false)}
        title={language === 'kn' ? 'ಹೊಸ ಪರೀಕ್ಷೆ ನಿಗದಿಪಡಿಸಿ' : 'Schedule New Class Test'}
      >
        <form onSubmit={handleCreateTestSubmit} className="space-y-4">
          <Input
            label={language === 'kn' ? 'ಪರೀಕ್ಷೆಯ ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)' : 'Test Title (Kannada)'}
            placeholder="ಉದಾ: ಘಟಕ ಪರೀಕ್ಷೆ ೪: ಕನ್ನಡ ಗದ್ಯ & ಪದ್ಯ ವಾಚನ"
            value={testTitleKn}
            onChange={e => setTestTitleKn(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
              <select
                value={testSubject}
                onChange={e => setTestSubject(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="KAN-05">Kannada (ಕನ್ನಡ)</option>
                <option value="MAT-05">Mathematics (ಗಣಿತ)</option>
                <option value="EVS-05">Environmental Science (ಪರಿಸರ)</option>
                <option value="ENG-05">English (ದ್ವಿತೀಯ ಭಾಷೆ)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Total Marks</label>
              <input
                type="number"
                value={testTotalMarks}
                onChange={e => setTestTotalMarks(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                min={10}
                max={100}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Test Date</label>
            <input
              type="date"
              value={testDate}
              onChange={e => setTestDate(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateTestOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Schedule & Notify Parents
            </Button>
          </div>
        </form>
      </Modal>

      {/* ENTER MARKS MODAL */}
      <Modal
        isOpen={isEnterMarksOpen}
        onClose={() => setIsEnterMarksOpen(false)}
        title={language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಅಂಕಗಳನ್ನು ನಮೂದಿಸಿ' : 'Enter Student Assessment Marks'}
      >
        <form onSubmit={handleEnterMarksSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Select Student</label>
            <select
              value={selectedStudentForMarks}
              onChange={e => setSelectedStudentForMarks(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
            >
              {MOCK_STUDENTS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.rollNumber} - {s.firstName} {s.lastName} ({s.firstNameKn} {s.lastNameKn})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Select Assessment</label>
            <select
              value={selectedTestForMarks}
              onChange={e => setSelectedTestForMarks(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
            >
              {MOCK_TESTS.map(t => (
                <option key={t.id} value={t.id}>
                  {t.titleKn || t.titleEn} (Max: {t.totalMarks})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Marks Obtained</label>
              <input
                type="number"
                value={enteredScore}
                onChange={e => setEnteredScore(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                min={0}
                max={50}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Calculated Grade</label>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs text-center">
                {enteredScore >= 22 ? 'A+ (Distinction)' : enteredScore >= 18 ? 'A (Good)' : 'B (Average)'}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Teacher Remarks (ಕನ್ನಡ)</label>
            <textarea
              rows={3}
              value={enteredRemarkKn}
              onChange={e => setEnteredRemarkKn(e.target.value)}
              placeholder="ಉದಾ: ಅತ್ಯುತ್ತಮ ಪ್ರದರ್ಶನ. ಸುಂದರ ಕೈಬರಹ ಮತ್ತು ನಿಖರ ಉತ್ತರಗಳು."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEnterMarksOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Marks & Send SMS
            </Button>
          </div>
        </form>
      </Modal>

      {/* Online Test Creation Modal */}
      <TeacherTestCreationModal
        isOpen={isTeacherOnlineTestCreationOpen}
        onClose={() => setIsTeacherOnlineTestCreationOpen(false)}
        onTestCreated={(newTest) => {
          setOnlineTestsList(onlineTestService.getTests());
          setSuccessToast(
            language === 'kn'
              ? `ಆನ್‌ಲೈನ್ ಪರೀಕ್ಷೆ "${newTest.titleKn}" ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!`
              : `Online test "${newTest.titleEn}" created successfully!`
          );
          setTimeout(() => setSuccessToast(null), 3000);
        }}
      />

      {/* Online Test Submissions & Exam Integrity Reports Modal */}
      {selectedOnlineTestForSubmissions && (
        <TeacherSubmissionsModal
          isOpen={Boolean(selectedOnlineTestForSubmissions)}
          onClose={() => setSelectedOnlineTestForSubmissions(null)}
          test={selectedOnlineTestForSubmissions}
          onUpdateTest={(updated) => {
            setSelectedOnlineTestForSubmissions(updated);
            setOnlineTestsList(onlineTestService.getTests());
          }}
        />
      )}
    </div>
  );
};
