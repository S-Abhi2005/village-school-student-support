import React, { useState } from 'react';
import { Modal } from '../../design-system/Modal';
import { Button } from '../../design-system/Button';
import { Input } from '../../design-system/Input';
import { Select } from '../../design-system/Select';
import { Badge } from '../../design-system/Badge';
import { Alert } from '../../design-system/Alert';
import { useLanguage } from '../../i18n/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { MOCK_STUDENTS } from '../../mock/schoolData';
import { Volume2, CheckCircle2, Send, CalendarCheck, Utensils } from 'lucide-react';

export type ActionModalType = 
  | 'MARK_ATTENDANCE' 
  | 'BROADCAST_NOTICE' 
  | 'CONFIRM_MEAL' 
  | 'REQUEST_MEETING' 
  | 'KANNADA_PRACTICE'
  | null;

interface QuickActionModalProps {
  type: ActionModalType;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  type,
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const { addNotification } = useNotifications();

  // Attendance state
  const [attendanceList, setAttendanceList] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({
    s1: 'PRESENT',
    s2: 'PRESENT',
    s3: 'PRESENT',
    s4: 'LATE',
    s5: 'PRESENT',
  });

  // Notice broadcast state
  const [noticeTitleKn, setNoticeTitleKn] = useState('');
  const [noticeBodyKn, setNoticeBodyKn] = useState('');
  const [targetAudience, setTargetAudience] = useState('ALL');
  const [sendVoiceCall, setSendVoiceCall] = useState(true);

  // Parent meeting request state
  const [meetingReason, setMeetingReason] = useState('Kannada Reading & Math Progress Discussion');
  const [preferredDate, setPreferredDate] = useState('2026-09-29');

  // Meal confirmation state
  const [mealCount, setMealCount] = useState(142);
  const [milkGlasses, setMilkGlasses] = useState(140);
  const [eggsBananas, setEggsBananas] = useState(138);

  // Status feedback
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!type) return null;

  const handleToggleAttendance = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendanceList(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = () => {
    setSuccessMsg(language === 'kn' ? 'ಹಾಜರಾತಿ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ!' : 'Attendance successfully marked!');
    addNotification({
      titleEn: "Today's Attendance Submitted",
      titleKn: "ಇಂದಿನ ಹಾಜರಾತಿ ನಮೂದಿಸಲಾಗಿದೆ",
      bodyEn: "Class 5-A attendance registered. Absentee parent SMS alerts generated.",
      bodyKn: "೫-ಎ ತರಗತಿ ಹಾಜರಾತಿ ದಾಖಲಾಗಿದೆ. ಗೈರುಹಾಜರಾದ ವಿದ್ಯಾರ್ಥಿಗಳ ಪೋಷಕರಿಗೆ SMS ರವಾನಿಸಲಾಗಿದೆ.",
      category: 'ATTENDANCE',
    });
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleBroadcastNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitleKn.trim()) return;

    addNotification({
      titleEn: `Broadcast: ${noticeTitleKn}`,
      titleKn: `ಪ್ರಕಟಣೆ: ${noticeTitleKn}`,
      bodyEn: noticeBodyKn || 'Important school community update.',
      bodyKn: noticeBodyKn || 'ಶಾಲೆಯ ಮಹತ್ವದ ಸೂಚನೆ.',
      category: 'ANNOUNCEMENT',
      isUrgent: true,
      audioDurationSeconds: sendVoiceCall ? 45 : undefined,
    });

    setSuccessMsg(language === 'kn' ? 'ಪ್ರಕಟಣೆ ಮತ್ತು ಧ್ವನಿ ಸಂದೇಶ ರವಾನೆಯಾಗಿದೆ!' : 'Notice and Voice SMS broadcasted!');
    setTimeout(() => {
      setSuccessMsg(null);
      setNoticeTitleKn('');
      setNoticeBodyKn('');
      onClose();
    }, 1200);
  };

  const handleConfirmMeal = () => {
    setSuccessMsg(language === 'kn' ? 'ಬಿಸಿಯೂಟ ದಾಖಲೆ ದೃಢೀಕರಿಸಲಾಗಿದೆ!' : 'Mid-day meal register confirmed!');
    addNotification({
      titleEn: "PM-POSHAN Meal Register Verified",
      titleKn: "ಪಿಎಂ-ಪೋಷಣ್ ಬಿಸಿಯೂಟ ವಿವರ ದೃಢೀಕರಿಸಲಾಗಿದೆ",
      bodyEn: `${mealCount} hot meals served today with Ksheera Bhagya milk.`,
      bodyKn: `ಇಂದು ${mealCount} ಬಿಸಿಯೂಟ ಮತ್ತು ${milkGlasses} ಲೋಟ ಹಾಲು ವಿತರಣೆ ದಾಖಲಾಗಿದೆ.`,
      category: 'HEALTH',
    });
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleRequestMeeting = () => {
    setSuccessMsg(language === 'kn' ? 'ಶಿಕ್ಷಕರ ಸಭೆ ವಿನಂತಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!' : 'Meeting request sent to Teacher!');
    addNotification({
      titleEn: "Parent-Teacher Meeting Requested",
      titleKn: "ಪೋಷಕ-ಶಿಕ್ಷಕರ ಸಮಾಲೋಚನೆಗೆ ವಿನಂತಿ",
      bodyEn: `Requested for ${preferredDate}: ${meetingReason}`,
      bodyKn: `ದಿನಾಂಕ ${preferredDate} ಕ್ಕೆ ಸಭೆ ವಿನಂತಿಸಲಾಗಿದೆ: ${meetingReason}`,
      category: 'ACADEMIC',
    });
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        type === 'MARK_ATTENDANCE'
          ? language === 'kn' ? 'ತರಗತಿ ಹಾಜರಾತಿ ನಮೂದಿಸಿ (೫-ಎ)' : 'Mark Class Attendance (Grade 5-A)'
          : type === 'BROADCAST_NOTICE'
          ? language === 'kn' ? 'ಧ್ವನಿ ಮತ್ತು ಲಿಖಿತ ಪ್ರಕಟಣೆ ಕಳುಹಿಸಿ' : 'Broadcast Audio & Text Notice'
          : type === 'CONFIRM_MEAL'
          ? language === 'kn' ? 'ಬಿಸಿಯೂಟ ವಿತರಣೆ ದೃಢೀಕರಣ' : 'Mid-Day Meal Verification'
          : type === 'REQUEST_MEETING'
          ? language === 'kn' ? 'ಶಿಕ್ಷಕರ ಭೇಟಿಗೆ ವಿನಂತಿ' : 'Request Teacher Consultation'
          : language === 'kn' ? 'ಕನ್ನಡ ಅಭ್ಯಾಸ ಪರೀಕ್ಷೆ' : 'Kannada Reading & Practice'
      }
      subtitle={
        type === 'MARK_ATTENDANCE'
          ? language === 'kn' ? 'ಗೈರಾದ ಪೋಷಕರಿಗೆ ಸ್ವಯಂಚಾಲಿತ ಧ್ವನಿ ಕರೆ/SMS ಹೋಗುತ್ತದೆ' : 'Absentees will trigger instant parent SMS/voice alerts'
          : type === 'BROADCAST_NOTICE'
          ? language === 'kn' ? 'ಗ್ರಾಮದ ಎಲ್ಲಾ ಪೋಷಕರ ಫೋನ್‌ಗಳಿಗೆ ತಲುಪುತ್ತದೆ' : 'Delivered to all village parent mobiles'
          : undefined
      }
      maxWidth={type === 'MARK_ATTENDANCE' ? 'lg' : 'md'}
    >
      {successMsg && (
        <Alert variant="success" className="mb-4">
          {successMsg}
        </Alert>
      )}

      {/* 1. Mark Attendance Modal */}
      {type === 'MARK_ATTENDANCE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span>{language === 'kn' ? 'ದಿನಾಂಕ: ಇಂದಿನ ದಿನ' : 'Date: Today'}</span>
            <span>{language === 'kn' ? 'ಒಟ್ಟು ವಿದ್ಯಾರ್ಥಿಗಳು: ೫' : 'Total Students: 5 (Sample Section)'}</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {MOCK_STUDENTS.map(st => {
              const currentStatus = attendanceList[st.id] || 'PRESENT';
              return (
                <div key={st.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-xs text-slate-900">
                      {st.rollNumber} · {language === 'kn' ? `${st.firstNameKn} ${st.lastNameKn}` : `${st.firstName} ${st.lastName}`}
                    </p>
                    <p className="text-[11px] text-slate-500">{st.naliKaliLevel}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleAttendance(st.id, 'PRESENT')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                        currentStatus === 'PRESENT'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {language === 'kn' ? 'ಹಾಜರು' : 'Present'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAttendance(st.id, 'LATE')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                        currentStatus === 'LATE'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {language === 'kn' ? 'ತಡವಾಗಿ' : 'Late'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAttendance(st.id, 'ABSENT')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                        currentStatus === 'ABSENT'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {language === 'kn' ? 'ಗೈರು' : 'Absent'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAttendance} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              {language === 'kn' ? 'ಹಾಜರಾತಿ ದಾಖಲಿಸಿ' : 'Save Attendance'}
            </Button>
          </div>
        </div>
      )}

      {/* 2. Broadcast Notice Modal */}
      {type === 'BROADCAST_NOTICE' && (
        <form onSubmit={handleBroadcastNotice} className="space-y-4">
          <Input
            label={language === 'kn' ? 'ಪ್ರಕಟಣೆಯ ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್)' : 'Notice Headline'}
            placeholder={language === 'kn' ? 'ಉದಾ: ನಾಳೆ ಪೋಷಕರ ವಿಶೇಷ ಸಭೆ' : 'e.g. Special SDMC Meeting Tomorrow'}
            value={noticeTitleKn}
            onChange={e => setNoticeTitleKn(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              {language === 'kn' ? 'ವಿವರವಾದ ಸಂದೇಶ' : 'Detailed Message'}
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent min-h-[90px]"
              placeholder={language === 'kn' ? 'ಪೋಷಕರಿಗೆ ತಲುಪಿಸಬೇಕಾದ ಮುಖ್ಯ ಮಾಹಿತಿ...' : 'Message for parents and village elders...'}
              value={noticeBodyKn}
              onChange={e => setNoticeBodyKn(e.target.value)}
              rows={3}
            />
          </div>

          <Select
            label={language === 'kn' ? 'ಸ್ವೀಕರಿಸುವವರು' : 'Target Audience'}
            value={targetAudience}
            onChange={e => setTargetAudience(e.target.value)}
            options={[
              { value: 'ALL', label: language === 'kn' ? 'ಎಲ್ಲಾ ಪೋಷಕರು ಮತ್ತು ಶಿಕ್ಷಕರು (All)' : 'All Parents & Community' },
              { value: 'PARENTS_ONLY', label: language === 'kn' ? 'ಪೋಷಕರು ಮಾತ್ರ (Parents Only)' : 'Parents Only' },
              { value: 'GRADE_5', label: language === 'kn' ? '೫ನೇ ತರಗತಿ ಪೋಷಕರು (Grade 5)' : 'Grade 5 Parents' },
            ]}
          />

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-700" />
              <div className="text-xs">
                <p className="font-semibold text-emerald-900">
                  {language === 'kn' ? 'ಸ್ವಯಂಚಾಲಿತ ಕನ್ನಡ ಧ್ವನಿ ಕರೆ ಪ್ರಸಾರ' : 'Include Kannada Voice Broadcast'}
                </p>
                <p className="text-[10px] text-emerald-700">
                  {language === 'kn' ? 'ಓದಲು ಬಾರದ ಪೋಷಕರಿಗೆ ಕರೆ ಹೋಗುತ್ತದೆ' : 'For parents with low reading literacy'}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sendVoiceCall}
              onChange={e => setSendVoiceCall(e.target.checked)}
              className="w-4 h-4 text-emerald-700 rounded accent-emerald-700 cursor-pointer"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" type="submit" leftIcon={<Send className="w-3.5 h-3.5" />}>
              {language === 'kn' ? 'ಪ್ರಸಾರ ಮಾಡಿ' : 'Broadcast Now'}
            </Button>
          </div>
        </form>
      )}

      {/* 3. Confirm Meal Modal */}
      {type === 'CONFIRM_MEAL' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'kn'
              ? 'ಪ್ರಧಾನಮಂತ್ರಿ ಪೋಷಣ್ (PM-POSHAN) ಯೋಜನೆಯ ಅಡಿಯಲ್ಲಿ ಇಂದಿನ ಬಿಸಿಯೂಟ ಮತ್ತು ಕ್ಷೀರಭಾಗ್ಯ ಹಾಲು ವಿತರಣೆಯನ್ನು ದೃಢೀಕರಿಸಿ:'
              : 'Verify the count of mid-day meals and milk distribution under PM-POSHAN scheme:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                {language === 'kn' ? 'ಬಿಸಿಯೂಟ ಊಟಗಳು' : 'Meals Served'}
              </label>
              <input
                type="number"
                value={mealCount}
                onChange={e => setMealCount(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-sm font-bold text-slate-800"
              />
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                {language === 'kn' ? 'ಹಾಲು (ಲೋಟಗಳು)' : 'Milk Glasses'}
              </label>
              <input
                type="number"
                value={milkGlasses}
                onChange={e => setMilkGlasses(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-sm font-bold text-slate-800"
              />
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                {language === 'kn' ? 'ಮೊಟ್ಟೆ/ಬಾಳೆಹಣ್ಣು' : 'Eggs/Bananas'}
              </label>
              <input
                type="number"
                value={eggsBananas}
                onChange={e => setEggsBananas(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-sm font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmMeal} leftIcon={<Utensils className="w-3.5 h-3.5" />}>
              {language === 'kn' ? 'ದೃಢೀಕರಿಸಿ' : 'Confirm Register'}
            </Button>
          </div>
        </div>
      )}

      {/* 4. Request Meeting Modal */}
      {type === 'REQUEST_MEETING' && (
        <div className="space-y-4">
          <Input
            label={language === 'kn' ? 'ಭೇಟಿಯ ಉದ್ದೇಶ' : 'Purpose of Consultation'}
            value={meetingReason}
            onChange={e => setMeetingReason(e.target.value)}
          />

          <Input
            type="date"
            label={language === 'kn' ? 'ಆದ್ಯತೆಯ ದಿನಾಂಕ' : 'Preferred Date'}
            value={preferredDate}
            onChange={e => setPreferredDate(e.target.value)}
          />

          <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-900">
            {language === 'kn'
              ? 'ಶ್ರೀಮತಿ ಸಾವಿತ್ರಿ ಹೆಗಡೆ (ತರಗತಿ ಶಿಕ್ಷಕರು) ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಶಾಲೆ ಮುಗಿದ ನಂತರ ೪:೦೦ ಗಂಟೆಗೆ ನಿಮ್ಮೊಂದಿಗೆ ಮಾತನಾಡಲಿದ್ದಾರೆ.'
              : 'Smt. Savitri Hegde will review your request and confirm a phone call or school visit after 4:00 PM.'}
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleRequestMeeting}>
              {language === 'kn' ? 'ವಿನಂತಿ ಸಲ್ಲಿಸಿ' : 'Send Request'}
            </Button>
          </div>
        </div>
      )}

      {/* 5. Kannada Practice Quiz Modal */}
      {type === 'KANNADA_PRACTICE' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              {language === 'kn' ? 'ಕನ್ನಡ ವರ್ಣಮಾಲೆ ಅಭ್ಯಾಸ · ಹಂತ ೧' : 'Kannada Varnamale Practice · Step 1'}
            </span>
            <div className="text-4xl font-extrabold text-amber-950 my-3 font-serif">
              ಕ · ಖ · ಗ · ಘ · ಙ
            </div>
            <p className="text-xs text-amber-900">
              {language === 'kn' ? 'ಚಿತ್ರವನ್ನು ನೋಡಿ ಸರಿಯಾದ ಅಕ್ಷರವನ್ನು ಗುರುತಿಸಿ' : 'Identify the correct initial letter'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => {
                setSuccessMsg(language === 'kn' ? 'ಸರಿಯಾದ ಉತ್ತರ! ⭐ ನಕ್ಷತ್ರ ಗಳಿಸಿದ್ದೀರಿ!' : 'Correct Answer! ⭐ Star Earned!');
                setTimeout(() => {
                  setSuccessMsg(null);
                  onClose();
                }, 1200);
              }}
              className="p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 font-bold text-center text-slate-800 cursor-pointer"
            >
              ಕ - ಕಮಲ (Kamala / Lotus)
            </button>
            <button
              onClick={() => {
                setSuccessMsg(language === 'kn' ? 'ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ!' : 'Try again!');
              }}
              className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold text-center text-slate-800 cursor-pointer"
            >
              ಗ - ಗಂಟೆ (Gante / Bell)
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
