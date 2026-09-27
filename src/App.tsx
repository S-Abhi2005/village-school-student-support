import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './components/landing/LandingPage';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { TeacherDashboard } from './components/dashboards/TeacherDashboard';
import { ParentDashboard } from './components/dashboards/ParentDashboard';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { 
  AttendanceView, 
  KannadaLearningView, 
  MidDayMealView, 
  ParentVoiceView 
} from './components/views/SecondaryViews';
import { TestsAndMarksView } from './components/views/TestsAndMarksView';
import { AIChatTutorView } from './components/views/AIChatTutorView';
import { 
  LearningMaterialsView, 
  ParentConcernsView, 
  VoiceAssessmentView, 
  AdminManagementView 
} from './components/views/AdditionalViews';
import { VoiceAssessmentModuleView } from './components/voice-assessment/VoiceAssessmentModuleView';
import { NotificationCenterView } from './components/views/NotificationCenterView';
import { QuickActionModal, ActionModalType } from './components/dashboards/QuickActionModal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './design-system/Card';
import { Table } from './design-system/Table';
import { Badge } from './design-system/Badge';
import { Button } from './design-system/Button';
import { MOCK_CLASSES, MOCK_SUBJECTS, MOCK_NOTIFICATIONS } from './mock/schoolData';
import { BookOpen, Bell, Users, Plus, Volume2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [modalType, setModalType] = useState<ActionModalType>(null);

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        if (role === 'SUPER_ADMIN') return <SuperAdminDashboard />;
        if (role === 'TEACHER') return <TeacherDashboard />;
        if (role === 'PARENT') return <ParentDashboard />;
        return <StudentDashboard />;

      case 'attendance':
        return <AttendanceView onOpenActionModal={setModalType} />;

      case 'tests-marks':
        return <TestsAndMarksView />;

      case 'materials':
        return <LearningMaterialsView />;

      case 'voice-assessment':
        return <VoiceAssessmentModuleView />;

      case 'ai-tutor':
        return <AIChatTutorView />;

      case 'concerns':
        return <ParentConcernsView />;

      case 'manage-teachers':
        return <AdminManagementView subTab="TEACHERS" />;

      case 'manage-parents':
        return <AdminManagementView subTab="PARENTS" />;

      case 'manage-curriculum':
        return <AdminManagementView subTab="CLASSES" />;

      case 'system-settings':
        return <AdminManagementView subTab="SETTINGS" />;

      case 'kannada-learning':
        return <KannadaLearningView onOpenActionModal={setModalType} />;

      case 'midday-meal':
        return <MidDayMealView onOpenActionModal={setModalType} />;

      case 'parent-voice':
        return <ParentVoiceView onOpenActionModal={setModalType} />;

      case 'classes':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {language === 'kn' ? 'ಶಾಲೆಯ ತರಗತಿಗಳು ಮತ್ತು ವಿಭಾಗಗಳು' : 'Classes & Class Sections'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'kn' ? '೧ ರಿಂದ ೭ ನೇ ತರಗತಿಗಳ ಪೂರ್ಣ ವಿವರ' : 'Grades 1 to 7 Full Roster'}
                </p>
              </div>
            </div>
            <Card>
              <Table
                columns={[
                  {
                    key: 'gradeLevel',
                    header: language === 'kn' ? 'ತರಗತಿ' : 'Grade',
                    render: c => <span className="font-bold text-slate-900">Grade {c.gradeLevel}-{c.section}</span>,
                  },
                  {
                    key: 'roomNumber',
                    header: language === 'kn' ? 'ಕೊಠಡಿ' : 'Room',
                    render: c => <span className="text-xs text-slate-700">{c.roomNumber}</span>,
                  },
                  {
                    key: 'medium',
                    header: language === 'kn' ? 'ಮಾಧ್ಯಮ' : 'Medium',
                    render: c => <span className="text-xs text-slate-600">{c.medium}</span>,
                  },
                  {
                    key: 'studentCount',
                    header: language === 'kn' ? 'ದಾಖಲಾತಿ' : 'Students',
                    render: c => <span className="font-semibold text-slate-800">{c.studentCount}</span>,
                  },
                  {
                    key: 'classTeacherName',
                    header: language === 'kn' ? 'ವರ್ಗ ಶಿಕ್ಷಕರು' : 'Class Teacher',
                    render: c => <span className="text-xs text-slate-700">{c.classTeacherName}</span>,
                  },
                ]}
                data={MOCK_CLASSES}
                keyExtractor={c => c.id}
              />
            </Card>
          </div>
        );

      case 'subjects':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {language === 'kn' ? 'ವಿಷಯಗಳು ಮತ್ತು ಪಠ್ಯಕ್ರಮ' : 'Curriculum & Subjects'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'kn' ? 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪಠ್ಯಕ್ರಮದ ವಿಷಯಗಳು' : 'Karnataka State Curriculum Standards'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_SUBJECTS.map(sub => (
                <Card key={sub.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={sub.isLanguage ? 'info' : 'neutral'} size="sm">
                        {sub.code}
                      </Badge>
                      <span className="text-xs text-slate-400">{sub.weeklyPeriods} periods</span>
                    </div>
                    <CardTitle className="mt-2">
                      {language === 'kn' ? sub.nameKn : sub.nameEn}
                    </CardTitle>
                    <CardDescription>{sub.nameEn}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'notices':
      case 'notifications':
        return <NotificationCenterView onNavigate={setActiveTab} />;

      default:
        if (role === 'SUPER_ADMIN') return <SuperAdminDashboard />;
        if (role === 'TEACHER') return <TeacherDashboard onNavigate={setActiveTab} onOpenActionModal={setModalType} />;
        if (role === 'PARENT') return <ParentDashboard onNavigate={setActiveTab} onOpenActionModal={setModalType} />;
        return <StudentDashboard onNavigate={setActiveTab} onOpenActionModal={setModalType} />;
    }
  };

  return (
    <AppLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      {renderActiveView()}

      <QuickActionModal
        type={modalType}
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
      />
    </AppLayout>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <MainAppContent />
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
