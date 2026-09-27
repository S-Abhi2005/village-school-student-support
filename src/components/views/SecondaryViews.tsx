import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import { Table } from '../../design-system/Table';
import { Badge } from '../../design-system/Badge';
import { Button } from '../../design-system/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import { MOCK_STUDENTS, MOCK_CLASSES, MOCK_SUBJECTS, MOCK_NOTIFICATIONS, MOCK_ATTENDANCE_TODAY } from '../../mock/schoolData';
import { 
  Sparkles, 
  CalendarCheck, 
  Users, 
  UtensilsCrossed, 
  PhoneCall, 
  Volume2, 
  BookOpen, 
  CheckCircle2, 
  Bell, 
  Plus, 
  Search,
  Check,
  Play
} from 'lucide-react';

interface ViewProps {
  onOpenActionModal?: (action: any) => void;
}

// 1. Attendance Tab View
export const AttendanceView: React.FC<ViewProps> = ({ onOpenActionModal }) => {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'LATE'>('ALL');
  const [records, setRecords] = useState(MOCK_ATTENDANCE_TODAY);
  const [voiceSmsSent, setVoiceSmsSent] = useState(false);

  const filtered = records.filter(r => filter === 'ALL' || r.status === filter);

  const toggleStudent = (id: string) => {
    setRecords(prev =>
      prev.map(r => {
        if (r.id === id) {
          const nextStatus = r.status === 'PRESENT' ? 'LATE' : r.status === 'LATE' ? 'ABSENT' : 'PRESENT';
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
  };

  const handleBroadcastAbsenteeSMS = () => {
    setVoiceSmsSent(true);
    setTimeout(() => setVoiceSmsSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'kn' ? 'ದೈನಂದಿನ ಶಾಲಾ ಹಾಜರಾತಿ ಪುಸ್ತಕ' : 'Daily School Attendance Register'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'kn'
              ? 'ಹೊಸಹಳ್ಳಿ ಶಾಲೆ · ದಿನಾಂಕ: ಇಂದಿನ ದಿನ · ೫ ನೇ ತರಗತಿ - ಎ ವಿಭಾಗ'
              : 'Hosahalli School · Grade 5 Section A · Daily Verification'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBroadcastAbsenteeSMS}
            leftIcon={<Volume2 className="w-3.5 h-3.5 text-emerald-700" />}
          >
            {voiceSmsSent
              ? language === 'kn' ? 'ಧ್ವನಿ SMS ರವಾನೆಯಾಗಿದೆ!' : 'Voice SMS Dispatched!'
              : language === 'kn' ? 'ಗೈರಾದ ಪೋಷಕರಿಗೆ ಧ್ವನಿ ಕರೆ' : 'Send Absentee Voice SMS'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onOpenActionModal && onOpenActionModal('MARK_ATTENDANCE')}
            leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}
          >
            {language === 'kn' ? 'ಹಾಜರಾತಿ ನಮೂದಿಸಿ' : 'Mark Attendance'}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg w-fit text-xs">
        {(['ALL', 'PRESENT', 'LATE', 'ABSENT'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              filter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'ALL'
              ? language === 'kn' ? 'ಎಲ್ಲಾ (All)' : 'All'
              : tab === 'PRESENT'
              ? language === 'kn' ? 'ಹಾಜರು (Present)' : 'Present'
              : tab === 'LATE'
              ? language === 'kn' ? 'ತಡವಾಗಿ (Late)' : 'Late'
              : language === 'kn' ? 'ಗೈರು (Absent)' : 'Absent'}
          </button>
        ))}
      </div>

      <Card>
        <Table
          columns={[
            {
              key: 'rollNumber',
              header: language === 'kn' ? 'ಕ್ರ.ಸಂ' : 'Roll No',
              render: r => <span className="font-bold text-slate-800">{r.rollNumber}</span>,
            },
            {
              key: 'studentName',
              header: language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು' : 'Student Name',
              render: r => <span className="font-semibold text-slate-900">{r.studentName}</span>,
            },
            {
              key: 'status',
              header: language === 'kn' ? 'ಸ್ಥಿತಿ (ಕ್ಲಿಕ್ ಮಾಡಿ ಬದಲಾಯಿಸಿ)' : 'Status (Click to toggle)',
              render: r => (
                <button
                  onClick={() => toggleStudent(r.id)}
                  className="cursor-pointer"
                  title="Click to toggle status"
                >
                  <Badge
                    variant={r.status === 'PRESENT' ? 'success' : r.status === 'LATE' ? 'warning' : 'danger'}
                    size="sm"
                    dot
                  >
                    {r.status}
                  </Badge>
                </button>
              ),
            },
            {
              key: 'remarks',
              header: language === 'kn' ? 'ವಿವರಣೆ' : 'Teacher Remarks',
              render: r => <span className="text-slate-500 text-xs">{r.remarks || '—'}</span>,
            },
            {
              key: 'parentNotified',
              header: language === 'kn' ? 'ಪೋಷಕರಿಗೆ ಮಾಹಿತಿ' : 'Parent Alert',
              render: r => (
                <span className="flex items-center gap-1 text-emerald-700 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SMS Sent</span>
                </span>
              ),
            },
          ]}
          data={filtered}
          keyExtractor={r => r.id}
        />
      </Card>
    </div>
  );
};

// 2. Kannada Nali-Kali Learning View
export const KannadaLearningView: React.FC<ViewProps> = ({ onOpenActionModal }) => {
  const { language } = useLanguage();
  const [activeLetter, setActiveLetter] = useState<string>('ಕ');

  const varnamale = [
    { char: 'ಅ', wordKn: 'ಅರಸ (King)', wordEn: 'Arasa', soundDesc: 'Short Vowel' },
    { char: 'ಆ', wordKn: 'ಆನೆ (Elephant)', wordEn: 'Aane', soundDesc: 'Long Vowel' },
    { char: 'ಇ', wordKn: 'ಇಲಿ (Rat)', wordEn: 'Ili', soundDesc: 'Short Vowel' },
    { char: 'ಈ', wordKn: 'ಈಜು (Swim)', wordEn: 'Eeju', soundDesc: 'Long Vowel' },
    { char: 'ಉ', wordKn: 'ಉಡುಗೊರೆ (Gift)', wordEn: 'Udugore', soundDesc: 'Short Vowel' },
    { char: 'ಕ', wordKn: 'ಕಮಲ (Lotus)', wordEn: 'Kamala', soundDesc: 'Consonant' },
    { char: 'ಖ', wordKn: 'ಖಡ್ಗ (Sword)', wordEn: 'Khadga', soundDesc: 'Consonant' },
    { char: 'ಗ', wordKn: 'ಗಂಟೆ (Bell)', wordEn: 'Gante', soundDesc: 'Consonant' },
    { char: 'ಘ', wordKn: 'ಘಂಟಾನಾದ (Chime)', wordEn: 'Ghanta', soundDesc: 'Consonant' },
    { char: 'ಚ', wordKn: 'ಚಮಚ (Spoon)', wordEn: 'Chamacha', soundDesc: 'Consonant' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'kn' ? 'ಕನ್ನಡ ನಲಿಕಲಿ ಕಲಿಕಾ ಕೇಂದ್ರ' : 'Kannada Nali-Kali Learning Hub'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'kn'
              ? 'ವರ್ಣಮಾಲೆ, ಮೈಲಿಗಲ್ಲು ಮೆಟ್ಟಿಲುಗಳು ಮತ್ತು ಮಕ್ಕಳ ಜಾನಪದ ಕಥನ'
              : 'Multi-grade Karnataka Nali-Kali milestone methodology and phonetics'}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onOpenActionModal && onOpenActionModal('KANNADA_PRACTICE')}
          leftIcon={<Play className="w-3.5 h-3.5" />}
        >
          {language === 'kn' ? 'ಅಭ್ಯಾಸ ರಸಪ್ರಶ್ನೆ ಪ್ರಾರಂಭಿಸಿ' : 'Start Practice Quiz'}
        </Button>
      </div>

      {/* Interactive Varnamale Letter Cards */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'kn' ? 'ಕನ್ನಡ ಅಕ್ಷರಮಾಲೆ ವಾಚನ (ವರ್ಣಮಾಲೆ)' : 'Interactive Kannada Alphabets (Varnamale)'}
          </CardTitle>
          <CardDescription>
            {language === 'kn'
              ? 'ಅಕ್ಷರದ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಉಚ್ಚಾರಣೆ ಮತ್ತು ಉದಾಹರಣೆ ಪದವನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ'
              : 'Click any letter to practice pronunciation and vocabulary'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {varnamale.map(item => (
              <div
                key={item.char}
                onClick={() => setActiveLetter(item.char)}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  activeLetter === item.char
                    ? 'border-emerald-600 bg-emerald-50 shadow-xs ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="text-3xl font-extrabold text-slate-900 mb-1">{item.char}</div>
                <div className="text-xs font-bold text-emerald-800">{item.wordKn}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{item.soundDesc}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-200/80 text-amber-900 font-extrabold text-xl flex items-center justify-center">
                {activeLetter}
              </div>
              <div className="text-xs">
                <p className="font-bold text-amber-950">
                  {language === 'kn' ? `ಆಯ್ಕೆಮಾಡಿದ ಅಕ್ಷರ: ${activeLetter}` : `Selected Letter: ${activeLetter}`}
                </p>
                <p className="text-amber-800">
                  {language === 'kn' ? 'ಸ್ಪಷ್ಟವಾಗಿ ೩ ಬಾರಿ ಉಚ್ಚರಿಸಿ ಅಭ್ಯಾಸ ಮಾಡಿ.' : 'Pronounce clearly 3 times.'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenActionModal && onOpenActionModal('KANNADA_PRACTICE')}
              leftIcon={<Volume2 className="w-3.5 h-3.5 text-amber-800" />}
            >
              {language === 'kn' ? 'ಧ್ವನಿ ಕೇಳಿ' : 'Listen Sound'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// 3. Mid-Day Meal Register View
export const MidDayMealView: React.FC<ViewProps> = ({ onOpenActionModal }) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'kn' ? 'ಪ್ರಧಾನಮಂತ್ರಿ ಪೋಷಣ್ (ಬಿಸಿಯೂಟ) ಮತ್ತು ಕ್ಷೀರಭಾಗ್ಯ' : 'PM-POSHAN Mid-Day Meal & Milk Scheme'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'kn'
              ? 'ಸರ್ಕಾರಿ ಶಾಲೆಗಳ ಪೌಷ್ಟಿಕ ಆಹಾರ ವಿತರಣೆ ಮತ್ತು ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ'
              : 'Transparent daily nutritional meal distribution and quality tracking'}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onOpenActionModal && onOpenActionModal('CONFIRM_MEAL')}
          leftIcon={<UtensilsCrossed className="w-3.5 h-3.5" />}
        >
          {language === 'kn' ? 'ಇಂದಿನ ಊಟದ ದಾಖಲೆ ದೃಢೀಕರಿಸಿ' : 'Confirm Meal Register'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 bg-white">
          <span className="text-xs text-slate-500 font-medium">{language === 'kn' ? 'ಇಂದಿನ ಮೆನು' : "Today's Menu"}</span>
          <div className="text-sm font-bold text-slate-900 mt-1">
            {language === 'kn' ? 'ಬಿಸಿ ಅನ್ನ, ಸಾಂಬಾರು, ತರಕಾರಿ ಪಲ್ಯ' : 'Hot Rice, Vegetable Sambar, Palya'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{language === 'kn' ? 'ತಾಜಾ ಬೇಳೆ ಮತ್ತು ತರಕಾರಿಗಳು' : 'Fresh pulses & farm vegetables'}</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white">
          <span className="text-xs text-slate-500 font-medium">{language === 'kn' ? 'ಕ್ಷೀರಭಾಗ್ಯ ಹಾಲು' : 'Ksheera Bhagya Milk'}</span>
          <div className="text-sm font-bold text-slate-900 mt-1">150 ml / Student</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Served at 11:30 AM</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white">
          <span className="text-xs text-slate-500 font-medium">{language === 'kn' ? 'ವಿಶೇಷ ಪೂರಕ ಆಹಾರ' : 'Nutritional Supplement'}</span>
          <div className="text-sm font-bold text-slate-900 mt-1">Boiled Egg or Fresh Banana</div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">100% Student Beneficiaries</p>
        </div>
      </div>
    </div>
  );
};

// 4. Parent Voice & SMS View
export const ParentVoiceView: React.FC<ViewProps> = ({ onOpenActionModal }) => {
  const { language } = useLanguage();

  const callLogs = [
    { id: '1', parentName: 'Sri Ramesh Gowda', phone: '9900112233', student: 'Kavya Gowda (5-A)', type: 'Attendance SMS & Audio', time: 'Today 8:50 AM', status: 'DELIVERED' },
    { id: '2', parentName: 'Sri Manjunath Nayaka', phone: '9845112244', student: 'Abhishek Nayaka (5-A)', type: 'SDMC Notice Voice Call', time: 'Today 8:52 AM', status: 'ANSWERED' },
    { id: '3', parentName: 'Smt. Yashodha Bai', phone: '9988776655', student: 'Bhavani Devi (5-A)', type: 'Health Camp Audio Notice', time: 'Yesterday', status: 'DELIVERED' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'kn' ? 'ಪೋಷಕರ ಧ್ವನಿ ಕರೆ ಮತ್ತು SMS ಕೇಂದ್ರ' : 'Parent Voice & SMS Communication Hub'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'kn'
              ? 'ಕನ್ನಡ ಭಾಷೆಯಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತ ಧ್ವನಿ ಸಂದೇಶಗಳು ಮತ್ತು ಪೋಷಕರ ಸಮಾಲೋಚನೆ ದಾಖಲೆ'
              : 'Automated native Kannada voice broadcasting for low-literacy rural families'}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onOpenActionModal && onOpenActionModal('BROADCAST_NOTICE')}
          leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
        >
          {language === 'kn' ? 'ಹೊಸ ಧ್ವನಿ ಸಂದೇಶ ರವಾನಿಸಿ' : 'Broadcast Voice Notice'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'kn' ? 'ಇತ್ತೀಚಿನ ಧ್ವನಿ ಕರೆ ಮತ್ತು SMS ವಿವರ' : 'Recent Dispatch Records'}</CardTitle>
          <CardDescription>{language === 'kn' ? 'ಗ್ರಾಮೀಣ ನೆಟ್‌ವರ್ಕ್‌ನಲ್ಲಿ ತಲುಪಿದ ಪ್ರಮಾಣ: ೯೭.೬%' : 'Rural network delivery rate: 97.6%'}</CardDescription>
        </CardHeader>
        <Table
          columns={[
            {
              key: 'parentName',
              header: language === 'kn' ? 'ಪೋಷಕರ ಹೆಸರು' : 'Parent / Guardian',
              render: l => (
                <div>
                  <p className="font-semibold text-xs text-slate-900">{l.parentName}</p>
                  <p className="text-[10px] text-slate-400">{l.phone}</p>
                </div>
              ),
            },
            {
              key: 'student',
              header: language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ' : 'Student',
              render: l => <span className="text-xs text-slate-700">{l.student}</span>,
            },
            {
              key: 'type',
              header: language === 'kn' ? 'ಸಂದೇಶ ಪ್ರಕಾರ' : 'Message Type',
              render: l => <span className="text-xs text-slate-600">{l.type}</span>,
            },
            {
              key: 'time',
              header: language === 'kn' ? 'ಸಮಯ' : 'Time',
              render: l => <span className="text-xs text-slate-500">{l.time}</span>,
            },
            {
              key: 'status',
              header: language === 'kn' ? 'ಸ್ಥಿತಿ' : 'Status',
              render: l => (
                <Badge variant={l.status === 'ANSWERED' ? 'success' : 'info'} size="sm" dot>
                  {l.status}
                </Badge>
              ),
            },
          ]}
          data={callLogs}
          keyExtractor={l => l.id}
        />
      </Card>
    </div>
  );
};
