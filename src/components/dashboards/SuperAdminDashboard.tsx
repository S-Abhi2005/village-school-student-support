import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  UtensilsCrossed, 
  Megaphone, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Volume2, 
  Search,
  BookOpen
} from 'lucide-react';
import { StatCard } from '../../design-system/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';
import { Table } from '../../design-system/Table';
import { useLanguage } from '../../i18n/LanguageContext';
import { MOCK_CLASSES, MOCK_NOTIFICATIONS } from '../../mock/schoolData';
import { QuickActionModal, ActionModalType } from './QuickActionModal';

export const SuperAdminDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const [modalType, setModalType] = useState<ActionModalType>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const filteredClasses = MOCK_CLASSES.filter(c =>
    c.roomNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.classTeacherName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.gradeLevel.toString().includes(searchFilter)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-900/60 text-emerald-200 text-xs font-semibold mb-3 border border-emerald-600/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'kn' ? 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರ ಆಡಳಿತ ಮಂಡಳಿ' : 'Headmaster Administration Portal'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {language === 'kn' 
              ? 'ನಮಸ್ಕಾರ, ಶ್ರೀ ಬಸವರಾಜ್ ಪಾಟೀಲ್' 
              : 'Welcome, Sri Basavaraj Patil (Headmaster)'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 leading-relaxed">
            {language === 'kn'
              ? 'ಹೊಸಹಳ್ಳಿ ಶಾಲೆಯ ೭ ತರಗತಿಗಳು, ೧೬೭ ವಿದ್ಯಾರ್ಥಿಗಳು ಮತ್ತು ೮ ಶಿಕ್ಷಕರ ಸಮಗ್ರ ದೈನಂದಿನ ಪ್ರಗತಿ ಪರಿಶೀಲನೆ.'
              : 'Daily operational overview for 7 grades, 167 students, and 8 teaching faculty at Hosahalli School.'}
          </p>
        </div>

        {/* Quick actions top bar */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setModalType('BROADCAST_NOTICE')}
            leftIcon={<Megaphone className="w-3.5 h-3.5" />}
          >
            {language === 'kn' ? 'ಪ್ರಕಟಣೆ ಹೊರಡಿಸಿ' : 'New School Notice'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-white border-emerald-500/40 hover:bg-emerald-700/60 bg-emerald-900/40"
            onClick={() => setModalType('CONFIRM_MEAL')}
            leftIcon={<UtensilsCrossed className="w-3.5 h-3.5" />}
          >
            {language === 'kn' ? 'ಬಿಸಿಯೂಟ ದಾಖಲೆ' : 'Mid-Day Meal Verification'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-white border-emerald-500/40 hover:bg-emerald-700/60 bg-emerald-900/40"
            onClick={() => setModalType('MARK_ATTENDANCE')}
            leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}
          >
            {language === 'kn' ? 'ಹಾಜರಾತಿ ವೀಕ್ಷಿಸಿ' : 'Review Attendance'}
          </Button>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={language === 'kn' ? 'ಒಟ್ಟು ವಿದ್ಯಾರ್ಥಿಗಳು' : 'Total Students Enrolled'}
          value="167"
          subtitle={language === 'kn' ? '೮೯ ಬಾಲಕಿಯರು · ೭೮ ಬಾಲಕರು' : '89 Girls · 78 Boys'}
          icon={<Users className="w-5 h-5 text-emerald-700" />}
          trend={{ value: '+4 this term', isPositive: true }}
          accentColor="emerald"
        />
        <StatCard
          title={language === 'kn' ? 'ಇಂದಿನ ಒಟ್ಟು ಹಾಜರಾತಿ' : "Today's Attendance"}
          value="94.6%"
          subtitle={language === 'kn' ? '೧೫೮ ಹಾಜರು · ೯ ಗೈರು' : '158 Present · 9 Absent'}
          icon={<CalendarCheck className="w-5 h-5 text-emerald-700" />}
          trend={{ value: 'Above target (90%)', isPositive: true }}
          accentColor="emerald"
        />
        <StatCard
          title={language === 'kn' ? 'ಬಿಸಿಯೂಟ & ಹಾಲು' : 'Mid-Day Meal Served'}
          value="158 / 167"
          subtitle={language === 'kn' ? 'ಪಿಎಂ ಪೋಷಣ್ & ಕ್ಷೀರಭಾಗ್ಯ' : 'PM-POSHAN & Ksheera Bhagya'}
          icon={<UtensilsCrossed className="w-5 h-5 text-amber-600" />}
          accentColor="amber"
        />
        <StatCard
          title={language === 'kn' ? 'ನಲಿಕಲಿ ಕಲಿಕಾ ಹಂತಗಳು' : 'Nali-Kali Milestones'}
          value="72 / 72"
          subtitle={language === 'kn' ? '೧ ರಿಂದ ೩ ನೇ ತರಗತಿ ಪ್ರಗತಿ' : 'Grades 1-3 Multi-grade'}
          icon={<Sparkles className="w-5 h-5 text-amber-600" />}
          trend={{ value: '100% card tracked', isPositive: true }}
          accentColor="amber"
        />
      </div>

      {/* Main Grid: Classes & Sections Table + School Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>
                  {language === 'kn' ? 'ತರಗತಿವಾರು ದಾಖಲಾತಿ ಮತ್ತು ಶಿಕ್ಷಕರು' : 'Class Sections & Teacher Directory'}
                </CardTitle>
                <CardDescription>
                  {language === 'kn'
                    ? 'ಹೊಸಹಳ್ಳಿ ಶಾಲೆಯ ೧ ರಿಂದ ೭ ನೇ ತರಗತಿಗಳ ವಿಭಾಗ ಮಾಹಿತಿ ಮತ್ತು ನಲಿಕಲಿ ಸ್ಥಿತಿ'
                    : 'Overview of all grades, student strength, and appointed class teachers'}
                </CardDescription>
              </div>

              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder={language === 'kn' ? 'ಹುಡುಕಿ...' : 'Filter classes...'}
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-slate-50"
                />
              </div>
            </CardHeader>

            <Table
              columns={[
                {
                  key: 'gradeLevel',
                  header: language === 'kn' ? 'ತರಗತಿ' : 'Grade',
                  render: c => (
                    <div className="font-bold text-slate-900">
                      Grade {c.gradeLevel}-{c.section}
                    </div>
                  ),
                },
                {
                  key: 'medium',
                  header: language === 'kn' ? 'ಮಾಧ್ಯಮ' : 'Medium',
                  render: c => (
                    <span className="text-xs text-slate-600 font-medium">
                      {c.medium === 'KANNADA' ? 'ಕನ್ನಡ (KN)' : c.medium}
                    </span>
                  ),
                },
                {
                  key: 'isNaliKali',
                  header: language === 'kn' ? 'ಪದ್ಧತಿ' : 'Methodology',
                  render: c =>
                    c.isNaliKali ? (
                      <Badge variant="warning" size="sm">
                        ನಲಿಕಲಿ (Nali-Kali)
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-500">Standard</span>
                    ),
                },
                {
                  key: 'studentCount',
                  header: language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಗಳು' : 'Strength',
                  render: c => <span className="font-semibold text-slate-800">{c.studentCount}</span>,
                },
                {
                  key: 'classTeacherName',
                  header: language === 'kn' ? 'ವರ್ಗ ಶಿಕ್ಷಕರು' : 'Class Teacher',
                  render: c => <span className="text-slate-700">{c.classTeacherName}</span>,
                },
              ]}
              data={filteredClasses}
              keyExtractor={c => c.id}
            />
          </Card>
        </div>

        {/* Right side: School Announcements & Voice Call alerts */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {language === 'kn' ? 'ಶಾಲಾ ಪ್ರಕಟಣೆಗಳು' : 'Recent Announcements'}
                </CardTitle>
                <CardDescription>
                  {language === 'kn' ? 'ಧ್ವನಿ ಕರೆ ಮತ್ತು SMS ಪ್ರಸಾರ' : 'Bilingual voice SMS updates'}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalType('BROADCAST_NOTICE')}
                leftIcon={<Plus className="w-3 h-3" />}
              >
                {language === 'kn' ? 'ಹೊಸದು' : 'Add'}
              </Button>
            </CardHeader>

            <CardContent className="space-y-3 p-4">
              {MOCK_NOTIFICATIONS.map(notif => (
                <div
                  key={notif.id}
                  className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-semibold text-xs text-slate-900 leading-snug">
                      {language === 'kn' ? notif.titleKn : notif.titleEn}
                    </h5>
                    {notif.isUrgent && (
                      <Badge variant="danger" size="sm">
                        {language === 'kn' ? 'ತುರ್ತು' : 'Urgent'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {language === 'kn' ? notif.bodyKn : notif.bodyEn}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                    <span>{notif.createdAt}</span>
                    {notif.audioDurationSeconds && (
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <Volume2 className="w-3 h-3" />
                        <span>Voice {notif.audioDurationSeconds}s</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Infrastructure & SDMC Card */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>{language === 'kn' ? 'ಶಾಲಾ ಅಭಿವೃದ್ಧಿ ಸಮಿತಿ (SDMC) ವರದಿ' : 'SDMC School Community'}</span>
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              {language === 'kn'
                ? 'ಗ್ರಾಮ ಪಂಚಾಯತ್ ಸಹಯೋಗದೊಂದಿಗೆ ಕುಡಿಯುವ ನೀರು ಮತ್ತು ಡಿಜಿಟಲ್ ತರಗತಿ ಸೌರ ಬ್ಯಾಟರಿ ಸ್ಥಾಪನೆ ಪೂರ್ಣಗೊಂಡಿದೆ.'
                : 'Panchayat collaboration: Clean drinking water and solar classroom backup operational.'}
            </p>
          </div>
        </div>
      </div>

      {/* Action modal */}
      <QuickActionModal
        type={modalType}
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
      />
    </div>
  );
};
