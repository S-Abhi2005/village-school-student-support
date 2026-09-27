import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import { Table } from '../../design-system/Table';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';
import { Alert } from '../../design-system/Alert';
import { Modal } from '../../design-system/Modal';
import { Input } from '../../design-system/Input';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { MOCK_TESTS, MOCK_STUDENT_MARKS, MOCK_STUDENTS } from '../../mock/schoolData';
import { TestItem, StudentMarkRecord } from '../../types';
import { 
  FileText, 
  Plus, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  Percent, 
  Volume2, 
  Search,
  Lock,
  Play,
  Clock,
  ShieldCheck,
  Eye,
  Check,
  Users,
  Send,
  AlertTriangle
} from 'lucide-react';
import { 
  OnlineTest, 
  StudentTestSubmission, 
  onlineTestService 
} from '../../services/onlineTestService';
import { notificationService } from '../../services/notificationService';
import { TeacherTestCreationModal } from '../online-test/TeacherTestCreationModal';
import { TeacherSubmissionsModal } from '../online-test/TeacherSubmissionsModal';
import { StudentExamScreen } from '../online-test/StudentExamScreen';
import { StudentResultModal } from '../online-test/StudentResultModal';

export const TestsAndMarksView: React.FC = () => {
  const { language } = useLanguage();
  const { role, user } = useAuth();

  const [tests, setTests] = useState<TestItem[]>(MOCK_TESTS);
  const [marks, setMarks] = useState<StudentMarkRecord[]>(MOCK_STUDENT_MARKS);
  const [activeTab, setActiveTab] = useState<'ONLINE_TESTS' | 'TESTS' | 'MARKS'>('ONLINE_TESTS');
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [isEnterMarksOpen, setIsEnterMarksOpen] = useState(false);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);

  // Online Test States
  const [onlineTests, setOnlineTests] = useState<OnlineTest[]>(() => onlineTestService.getTests());
  const [isTeacherCreateOnlineTestOpen, setIsTeacherCreateOnlineTestOpen] = useState(false);
  const [selectedTestForSubmissions, setSelectedTestForSubmissions] = useState<OnlineTest | null>(null);

  // Active student exam screen state
  const [activeExamTest, setActiveExamTest] = useState<OnlineTest | null>(null);

  // Result viewing modal state
  const [viewingResult, setViewingResult] = useState<{
    test: OnlineTest;
    submission: StudentTestSubmission;
  } | null>(null);

  // Refresh online tests & submissions on mount
  useEffect(() => {
    setOnlineTests(onlineTestService.getTests());
  }, []);

  // New test form state
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newTitleKn, setNewTitleKn] = useState('');
  const [newSubject, setNewSubject] = useState('KAN-05');
  const [newTotalMarks, setNewTotalMarks] = useState(25);
  const [newDuration, setNewDuration] = useState(45);

  // Enter marks form state
  const [selectedTestId, setSelectedTestId] = useState(MOCK_TESTS[0].id);
  const [selectedStudentId, setSelectedStudentId] = useState(MOCK_STUDENTS[0].id);
  const [obtainedMarks, setObtainedMarks] = useState(24);
  const [marksRemarksKn, setMarksRemarksKn] = useState('');

  // Active student identity for exams (default Kavya s1)
  const currentStudent = MOCK_STUDENTS[0];

  // Role based filtering: Parent sees only their linked children; Student sees only their own
  const visibleMarks = marks.filter(m => {
    if (role === 'STUDENT') {
      return m.studentId === 's1'; // Kavya
    }
    if (role === 'PARENT') {
      return m.studentId === 's1'; // Linked child Kavya
    }
    return true; // Super admin and teacher see all
  });

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleEn.trim() && !newTitleKn.trim()) return;

    const newTest: TestItem = {
      id: `test-${Date.now()}`,
      titleEn: newTitleEn || newTitleKn,
      titleKn: newTitleKn || newTitleEn,
      subjectCode: newSubject,
      subjectName: newSubject === 'KAN-05' ? 'Kannada' : newSubject === 'MAT-05' ? 'Mathematics' : 'Science',
      gradeLevel: 5,
      totalMarks: newTotalMarks,
      passingMarks: Math.round(newTotalMarks * 0.4),
      testDate: new Date().toISOString().split('T')[0],
      durationMinutes: newDuration,
      questionsCount: 10,
      isVoiceEnabled: newSubject === 'KAN-05',
    };

    setTests(prev => [newTest, ...prev]);
    setIsCreateTestOpen(false);
    setNewTitleEn('');
    setNewTitleKn('');
    setSuccessAlert(language === 'kn' ? 'ಹೊಸ ಪರೀಕ್ಷೆ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!' : 'New test created successfully!');
    setTimeout(() => setSuccessAlert(null), 3000);
  };

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTest = tests.find(t => t.id === selectedTestId) || tests[0];
    const targetStudent = MOCK_STUDENTS.find(s => s.id === selectedStudentId) || MOCK_STUDENTS[0];

    const percentage = Math.round((obtainedMarks / targetTest.totalMarks) * 100);
    const grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 
      percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 60 ? 'B' : percentage >= 40 ? 'C' : 'D';

    const newMarkRecord: StudentMarkRecord = {
      id: `m-${Date.now()}`,
      testId: targetTest.id,
      testTitle: targetTest.titleEn,
      studentId: targetStudent.id,
      studentName: `${targetStudent.firstName} ${targetStudent.lastName}`,
      subjectCode: targetTest.subjectCode,
      marksObtained: obtainedMarks,
      totalMarks: targetTest.totalMarks,
      percentage,
      grade,
      teacherRemarks: marksRemarksKn || 'Good effort, continue practicing regularly.',
      teacherRemarksKn: marksRemarksKn || 'ಉತ್ತಮ ಪರಿಶ್ರಮ, ನಿರಂತರ ಅಭ್ಯಾಸ ಮುಂದುವರಿಸಿ.',
      recordedAt: new Date().toISOString().split('T')[0],
    };

    setMarks(prev => [newMarkRecord, ...prev]);
    setIsEnterMarksOpen(false);
    setMarksRemarksKn('');
    setSuccessAlert(language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಅಂಕಗಳನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ!' : 'Student marks recorded successfully!');
    setTimeout(() => setSuccessAlert(null), 3000);
  };

  // If a student starts an exam, render the full-screen secure exam canvas
  if (activeExamTest) {
    return (
      <StudentExamScreen
        test={activeExamTest}
        studentId={currentStudent.id}
        studentName={`${currentStudent.firstName} ${currentStudent.lastName}`}
        studentNameKn={`${currentStudent.firstNameKn} ${currentStudent.lastNameKn}`}
        rollNumber={currentStudent.rollNumber}
        onExitExam={() => setActiveExamTest(null)}
        onFinishExam={(sub) => {
          setActiveExamTest(null);
          setOnlineTests(onlineTestService.getTests());
          setSuccessAlert(
            language === 'kn'
              ? 'ಪರೀಕ್ಷೆ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ! ಶಿಕ್ಷಕರು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿದ ನಂತರ ಫಲಿತಾಂಶ ಲಭ್ಯವಾಗುತ್ತದೆ.'
              : 'Exam submitted successfully! Results will be available once published by the teacher.'
          );
          setTimeout(() => setSuccessAlert(null), 5000);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'kn' ? 'ಆನ್‌ಲೈನ್ ಪರೀಕ್ಷಾ ವ್ಯವಸ್ಥೆ & ಮೌಲ್ಯಮಾಪನ' : 'Online Examination & Assessment System'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'kn'
              ? 'ಸುರಕ್ಷಿತ ಮೊಬೈಲ್ ಪರೀಕ್ಷೆಗಳು, ನಕಲು ತಡೆ ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಪೋಷಕರ ವರದಿ'
              : 'Secure mobile exams with anti-cheat integrity auditing and parent notifications'}
          </p>
        </div>

        {/* Teacher / Admin action buttons */}
        {(role === 'SUPER_ADMIN' || role === 'TEACHER') && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEnterMarksOpen(true)}
              leftIcon={<Award className="w-3.5 h-3.5 text-amber-600" />}
            >
              {language === 'kn' ? 'ಅಂಕ ನಮೂದು' : 'Enter Marks'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsTeacherCreateOnlineTestOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              {language === 'kn' ? 'ಹೊಸ ಆನ್‌ಲೈನ್ ಪರೀಕ್ಷೆ ರಚಿಸಿ' : 'Create Online Test'}
            </Button>
          </div>
        )}
      </div>

      {successAlert && (
        <Alert variant="success" onDismiss={() => setSuccessAlert(null)}>
          {successAlert}
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit text-xs">
        <button
          onClick={() => setActiveTab('ONLINE_TESTS')}
          className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ONLINE_TESTS'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-amber-900" />
          <span>{language === 'kn' ? 'ಆನ್‌ಲೈನ್ ಪರೀಕ್ಷೆಗಳು (Online Tests)' : 'Online Exam System'}</span>
        </button>

        <button
          onClick={() => setActiveTab('TESTS')}
          className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'TESTS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'kn' ? 'ನಿಗದಿತ ಪರೀಕ್ಷೆಗಳು (Scheduled)' : 'Scheduled Tests'}
        </button>

        <button
          onClick={() => setActiveTab('MARKS')}
          className={`px-3 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'MARKS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'kn' ? 'ಅಂಕಗಳ ವರದಿ (Scorecards)' : 'Marks & Progress Cards'}
        </button>
      </div>

      {/* 1. ONLINE TESTS TAB CONTENT */}
      {activeTab === 'ONLINE_TESTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {role === 'STUDENT'
                  ? language === 'kn' ? 'ನನ್ನ ತರಗತಿಯ ಪರೀಕ್ಷೆಗಳು (My Class Exams)' : 'Available Class Exams'
                  : language === 'kn' ? 'ರಚಿಸಲಾದ ಆನ್‌ಲೈನ್ ಪರೀಕ್ಷೆಗಳು' : 'Created Online Examinations'}
              </span>
            </h3>

            {role === 'STUDENT' && (
              <Badge variant="info" size="sm">
                Grade 5-A · Active Session
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onlineTests.map(ot => {
              const testSubmissions = onlineTestService.getSubmissionsForTest(ot.id);
              const studentSubmission = testSubmissions.find(s => s.studentId === currentStudent.id);
              const hasAttempted = Boolean(studentSubmission);
              const isGraded = studentSubmission?.status === 'GRADED';
              const reviewRequiredCount = testSubmissions.filter(s => s.securityStatus === 'REVIEW_REQUIRED').length;

              return (
                <Card key={ot.id} className="flex flex-col justify-between p-5 space-y-4 border-slate-200 hover:border-amber-400 transition-all shadow-xs">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="info" size="sm">{ot.subjectCode}</Badge>
                        <Badge variant={ot.isPublished ? 'success' : 'neutral'} size="sm">
                          {ot.isPublished ? (language === 'kn' ? 'ಪ್ರಕಟವಾಗಿದೆ' : 'Published') : 'Draft'}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {ot.durationMinutes}m
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {language === 'kn' ? ot.titleKn : ot.titleEn}
                    </h4>

                    <p className="text-xs text-slate-500">
                      {ot.className} · {ot.subjectName} · {ot.questions.length} Questions
                    </p>

                    <div className="p-2.5 rounded-xl bg-slate-50 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Marks</span>
                        <span className="font-extrabold text-slate-800">{ot.totalMarks} Marks</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Pass</span>
                        <span className="font-extrabold text-emerald-700">{ot.passingMarks} Marks</span>
                      </div>
                    </div>

                    {/* Teacher Stats Pills */}
                    {(role === 'SUPER_ADMIN' || role === 'TEACHER') && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>{testSubmissions.length} Submissions</span>
                        {reviewRequiredCount > 0 ? (
                          <span className="text-amber-800 font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-700" />
                            <span>{reviewRequiredCount} Review Needed</span>
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">Integrity: Clean</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions depending on Role */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {role === 'STUDENT' ? (
                      hasAttempted ? (
                        ot.resultsPublished || isGraded ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              setViewingResult({
                                test: ot,
                                submission: studentSubmission!,
                              })
                            }
                            className="w-full bg-emerald-100 text-emerald-950 hover:bg-emerald-200 font-bold text-xs"
                            leftIcon={<Award className="w-3.5 h-3.5 text-emerald-700" />}
                          >
                            {language === 'kn' ? 'ಫಲಿತಾಂಶ & ವಿಮರ್ಶೆ ನೋಡಿ' : 'View Result & Grades'}
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-500 font-bold flex items-center gap-1.5 w-full justify-center bg-slate-100 py-1.5 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>{language === 'kn' ? 'ಸಲ್ಲಿಕೆಯಾಗಿದೆ · ಮೌಲ್ಯಮಾಪನ ಬಾಕಿ' : 'Submitted · Awaiting Grade'}</span>
                          </span>
                        )
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setActiveExamTest(ot)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs"
                          leftIcon={<Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />}
                        >
                          {language === 'kn' ? 'ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ (Start Exam)' : 'Start Online Exam'}
                        </Button>
                      )
                    ) : (
                      /* Teacher / Admin Actions */
                      <div className="flex items-center justify-between w-full gap-2">
                        {!ot.isPublished && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onlineTestService.publishTest(ot.id);
                              setOnlineTests(onlineTestService.getTests());
                              notificationService.notifyNewTestPublished(ot.titleEn, ot.gradeLevel);
                            }}
                            className="text-xs font-bold"
                          >
                            {language === 'kn' ? 'ಪ್ರಕಟಿಸಿ' : 'Publish'}
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedTestForSubmissions(ot)}
                          className="w-full bg-amber-100 text-amber-950 hover:bg-amber-200 font-bold text-xs"
                          leftIcon={<Eye className="w-3.5 h-3.5 text-amber-800" />}
                        >
                          {language === 'kn' ? 'ಸಲ್ಲಿಕೆಗಳು & ವರದಿ (Submissions)' : 'Submissions & Audit Reports'}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SCHEDULED TESTS TAB CONTENT */}
      {activeTab === 'TESTS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tests.map(test => (
            <Card key={test.id} className="flex flex-col justify-between p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="info" size="sm">
                    {test.subjectCode}
                  </Badge>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {test.testDate}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 mt-2.5 leading-snug">
                  {language === 'kn' ? test.titleKn : test.titleEn}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Grade {test.gradeLevel} · {test.subjectName}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">{language === 'kn' ? 'ಗರಿಷ್ಠ ಅಂಕ' : 'Total Marks'}</span>
                    <span className="font-bold text-slate-800">{test.totalMarks} Marks</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">{language === 'kn' ? 'ಅವಧಿ' : 'Duration'}</span>
                    <span className="font-bold text-slate-800">{test.durationMinutes} Mins</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {test.isVoiceEnabled && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <Volume2 className="w-3 h-3" />
                    <span>Voice Reading Quiz</span>
                  </span>
                )}
                {role === 'STUDENT' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveTab('ONLINE_TESTS')}
                    className="ml-auto"
                  >
                    {language === 'kn' ? 'ಪರೀಕ್ಷೆ ತೆಗೆದುಕೊಳ್ಳಿ' : 'Take Online Exam'}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="ml-auto">
                    {language === 'kn' ? 'ಪ್ರಶ್ನೆಪತ್ರಿಕೆ ವೀಕ್ಷಿಸಿ' : 'View Papers'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 3. MARKS / PROGRESS CARD TAB */}
      {activeTab === 'MARKS' && (
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'kn' ? 'ಮೌಲ್ಯಮಾಪನ ಅಂಕಗಳು ಮತ್ತು ಶಿಕ್ಷಕರ ಹಿನ್ನುಡಿ' : 'Student Academic Scorecards & Teacher Notes'}
            </CardTitle>
            <CardDescription>
              {language === 'kn'
                ? 'ಪ್ರತಿ ವಿದ್ಯಾರ್ಥಿಯ ವಿಷಯವಾರು ಪ್ರಗತಿ, ಶ್ರೇಣಿ ಮತ್ತು ಕಲಿಕಾ ಸಲಹೆ'
                : 'Performance breakdowns, earned letter grades, and personalized remarks'}
            </CardDescription>
          </CardHeader>
          <Table
            columns={[
              {
                key: 'studentName',
                header: language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು' : 'Student Name',
                render: m => <span className="font-bold text-xs text-slate-900">{m.studentName}</span>,
              },
              {
                key: 'testTitle',
                header: language === 'kn' ? 'ಪರೀಕ್ಷೆ' : 'Test / Assessment',
                render: m => (
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{m.testTitle}</p>
                    <p className="text-[10px] text-slate-400">{m.subjectCode} · {m.recordedAt}</p>
                  </div>
                ),
              },
              {
                key: 'marksObtained',
                header: language === 'kn' ? 'ಗಳಿಸಿದ ಅಂಕ' : 'Score',
                render: m => (
                  <span className="font-bold text-xs text-slate-800">
                    {m.marksObtained} / {m.totalMarks}
                  </span>
                ),
              },
              {
                key: 'percentage',
                header: language === 'kn' ? 'ಶೇಕಡಾವಾರು' : 'Percentage',
                render: m => (
                  <span className="font-semibold text-xs text-emerald-700">
                    {m.percentage}%
                  </span>
                ),
              },
              {
                key: 'grade',
                header: language === 'kn' ? 'ಶ್ರೇಣಿ' : 'Grade',
                render: m => (
                  <Badge variant={m.grade === 'A+' || m.grade === 'A' ? 'success' : 'neutral'} size="sm">
                    Grade {m.grade}
                  </Badge>
                ),
              },
              {
                key: 'teacherRemarks',
                header: language === 'kn' ? 'ಶಿಕ್ಷಕರ ಅಭಿಪ್ರಾಯ' : 'Teacher Feedback',
                render: m => (
                  <span className="text-xs text-slate-600 line-clamp-1 italic">
                    "{language === 'kn' ? m.teacherRemarksKn : m.teacherRemarks}"
                  </span>
                ),
              },
            ]}
            data={visibleMarks}
            keyExtractor={m => m.id}
          />
        </Card>
      )}

      {/* Modals */}
      {/* 1. Teacher Create Online Test Modal */}
      <TeacherTestCreationModal
        isOpen={isTeacherCreateOnlineTestOpen}
        onClose={() => setIsTeacherCreateOnlineTestOpen(false)}
        onTestCreated={(newTest) => {
          setOnlineTests(onlineTestService.getTests());
          setSuccessAlert(
            language === 'kn'
              ? `ಆನ್‌ಲೈನ್ ಪರೀಕ್ಷೆ "${newTest.titleKn}" ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!`
              : `Online test "${newTest.titleEn}" created successfully!`
          );
          setTimeout(() => setSuccessAlert(null), 4000);
        }}
      />

      {/* 2. Teacher Submissions & Reports Modal */}
      {selectedTestForSubmissions && (
        <TeacherSubmissionsModal
          isOpen={Boolean(selectedTestForSubmissions)}
          onClose={() => setSelectedTestForSubmissions(null)}
          test={selectedTestForSubmissions}
          onUpdateTest={(updated) => {
            setSelectedTestForSubmissions(updated);
            setOnlineTests(onlineTestService.getTests());
          }}
        />
      )}

      {/* 3. Student View Published Result Modal */}
      {viewingResult && (
        <StudentResultModal
          isOpen={Boolean(viewingResult)}
          onClose={() => setViewingResult(null)}
          test={viewingResult.test}
          submission={viewingResult.submission}
        />
      )}

      {/* Traditional Create Test Modal */}
      <Modal
        isOpen={isCreateTestOpen}
        onClose={() => setIsCreateTestOpen(false)}
        title={language === 'kn' ? 'ಹೊಸ ಸಾಂಪ್ರದಾಯಿಕ ಪರೀಕ್ಷೆ ರಚನೆ' : 'Create Scheduled Assessment'}
      >
        <form onSubmit={handleCreateTest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'kn' ? 'ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)' : 'Title (Kannada)'}
            </label>
            <Input
              placeholder="ಘಟಕ ಪರೀಕ್ಷೆ - ೩"
              value={newTitleKn}
              onChange={e => setNewTitleKn(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'kn' ? 'ಶೀರ್ಷಿಕೆ (English)' : 'Title (English)'}
            </label>
            <Input
              placeholder="Unit Assessment 3"
              value={newTitleEn}
              onChange={e => setNewTitleEn(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'kn' ? 'ವಿಷಯ' : 'Subject'}
              </label>
              <select
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
              >
                <option value="KAN-05">KAN-05 (Kannada)</option>
                <option value="MAT-05">MAT-05 (Maths)</option>
                <option value="EVS-05">EVS-05 (Science)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'kn' ? 'ಗರಿಷ್ಠ ಅಂಕ' : 'Total Marks'}
              </label>
              <Input
                type="number"
                value={newTotalMarks}
                onChange={e => setNewTotalMarks(parseInt(e.target.value) || 25)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsCreateTestOpen(false)}>
              {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {language === 'kn' ? 'ಉಳಿಸಿ' : 'Save Test'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enter Marks Modal */}
      <Modal
        isOpen={isEnterMarksOpen}
        onClose={() => setIsEnterMarksOpen(false)}
        title={language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಅಂಕಗಳ ನಮೂದು' : 'Enter Student Marks'}
      >
        <form onSubmit={handleSaveMarks} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'kn' ? 'ಪರೀಕ್ಷೆ ಆಯ್ಕೆ' : 'Select Test'}
            </label>
            <select
              value={selectedTestId}
              onChange={e => setSelectedTestId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
            >
              {tests.map(t => (
                <option key={t.id} value={t.id}>
                  {language === 'kn' ? t.titleKn : t.titleEn} ({t.totalMarks} Marks)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಆಯ್ಕೆ' : 'Select Student'}
            </label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
            >
              {MOCK_STUDENTS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.rollNumber} - {language === 'kn' ? `${s.firstNameKn} ${s.lastNameKn}` : `${s.firstName} ${s.lastName}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'kn' ? 'ಗಳಿಸಿದ ಅಂಕಗಳು' : 'Marks Obtained'}
            </label>
            <Input
              type="number"
              value={obtainedMarks}
              onChange={e => setObtainedMarks(parseInt(e.target.value) || 0)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'kn' ? 'ಶಿಕ್ಷಕರ ಅಭಿಪ್ರಾಯ / ಪ್ರಶಂಸೆ' : 'Teacher Feedback'}
            </label>
            <Input
              placeholder="ಉತ್ತಮ ಪರಿಶ್ರಮ, ನಿರಂತರ ಅಭ್ಯಾಸ ಮುಂದುವರಿಸಿ..."
              value={marksRemarksKn}
              onChange={e => setMarksRemarksKn(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsEnterMarksOpen(false)}>
              {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {language === 'kn' ? 'ದಾಖಲಿಸಿ' : 'Record Marks'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
