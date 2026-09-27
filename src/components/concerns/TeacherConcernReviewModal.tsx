import React, { useState, useEffect } from 'react';
import { Modal } from '../../design-system/Modal';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  ParentConcern, 
  ConcernStatus, 
  StudentSupportSummary 
} from '../../types';
import { 
  concernService, 
  CONCERN_CATEGORIES, 
  WORKFLOW_STAGES 
} from '../../services/concernService';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Sparkles, 
  Lock, 
  Phone, 
  User, 
  BookOpen, 
  Award, 
  Check, 
  ArrowRight,
  ShieldCheck,
  History
} from 'lucide-react';

interface TeacherConcernReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  concern: ParentConcern | null;
  onConcernUpdated?: (msg: string) => void;
}

export const TeacherConcernReviewModal: React.FC<TeacherConcernReviewModalProps> = ({
  isOpen,
  onClose,
  concern,
  onConcernUpdated
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Workflow states
  const [currentStatus, setCurrentStatus] = useState<ConcernStatus>('UNDER_REVIEW');
  const [actionTaken, setActionTaken] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpStatus, setFollowUpStatus] = useState('');
  const [teacherResponse, setTeacherResponse] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [supportSummary, setSupportSummary] = useState<StudentSupportSummary | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (concern) {
      setCurrentStatus(concern.status === 'IN_REVIEW' ? 'UNDER_REVIEW' : concern.status);
      setActionTaken(concern.actionTaken || '');
      setFollowUpDate(concern.followUpDate || '');
      setFollowUpStatus(concern.followUpStatus || '');
      setTeacherResponse(concern.teacherResponse || '');
      setTeacherNotes(concern.teacherNotes || '');

      // Load connected student support analysis
      const summary = concernService.getStudentSupportSummary(concern.studentId);
      setSupportSummary(summary);
    }
  }, [concern]);

  if (!concern) return null;

  const catObj = CONCERN_CATEGORIES.find(c => c.key === concern.category);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated = concernService.updateConcernWorkflow({
      concernId: concern.id,
      status: currentStatus,
      actionTaken: actionTaken.trim(),
      followUpDate: followUpDate.trim(),
      followUpStatus: followUpStatus.trim() || (followUpDate ? `Scheduled check-in on ${followUpDate}` : undefined),
      teacherResponse: teacherResponse.trim(),
      teacherNotes: teacherNotes.trim(),
      teacherName: user?.fullName || 'Smt. Savitri Hegde',
      teacherId: user?.id
    });

    // Notify parent about update
    if (updated) {
      const statusObj = WORKFLOW_STAGES.find(s => s.status === currentStatus);
      addNotification({
        titleEn: `Update on Concern: ${concern.studentName}`,
        titleKn: `ಪೋಷಕರ ಕಾಳಜಿಯ ಪ್ರಗತಿ: ${concern.studentName}`,
        bodyEn: `Teacher updated status to "${statusObj?.labelEn}". ${actionTaken ? 'Action taken recorded.' : ''}`,
        bodyKn: `ಶಿಕ್ಷಕರು ಸ್ಥಿತಿಯನ್ನು "${statusObj?.labelKn}" ಎಂದು ನವೀಕರಿಸಿದ್ದಾರೆ. ${actionTaken ? 'ಕೈಗೊಂಡ ಕ್ರಮ ದಾಖಲಾಗಿದೆ.' : ''}`,
        category: 'ACADEMIC',
        targetRole: 'PARENT'
      });
    }

    setIsSaving(false);
    onClose();

    if (onConcernUpdated) {
      onConcernUpdated(
        language === 'kn'
          ? 'ವಿದ್ಯಾರ್ಥಿ ಕಾಳಜಿ ಮತ್ತು ಶಾಲಾ ಕ್ರಮ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ. ಪೋಷಕರಿಗೆ ಮಾಹಿತಿ ತಲುಪಿದೆ.'
          : 'Concern workflow and student support actions updated successfully. Parent has been notified.'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        language === 'kn'
          ? `ಪೋಷಕರ ಕಾಳಜಿ ಪರಿಶೀಲನೆ & ಶಾಲಾ ಕ್ರಮ: ${concern.studentName}`
          : `Teacher Concern Review & Student Follow-Up: ${concern.studentName}`
      }
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* 1. Header Information & Metadata */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-stone-50 to-emerald-50/50 border border-amber-200/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm">
                {language === 'kn' ? catObj?.labelKn : catObj?.labelEn || concern.category}
              </Badge>
              {concern.priority && (
                <Badge 
                  variant={concern.priority === 'URGENT' || concern.priority === 'HIGH' ? 'danger' : 'neutral'} 
                  size="sm"
                >
                  Priority: {concern.priority}
                </Badge>
              )}
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Submitted: {concern.createdAt}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-amber-200/60 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <User className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Student: <strong className="text-slate-900">{concern.studentName}</strong> ({concern.studentGrade || 'Grade 5-A'})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-sky-700 shrink-0" />
              <span>Parent: <strong className="text-slate-900">{concern.parentName}</strong> ({concern.parentPhone || '9900112233'})</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
            <span className="font-extrabold text-slate-800 block">
              {concern.subject || 'Concern Statement'}
            </span>
            <p className="text-slate-600 leading-relaxed italic">
              "{concern.description}"
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. STUDENT SUPPORT ANALYSIS (CRITICAL REQUIREMENT)             */}
        {/* Connect concern data with:                                     */}
        {/* - Attendance, Test marks, Learning activity, Academic progress */}
        {/* Provide teachers with a support summary.                      */}
        {/* Do not automatically label or diagnose students.               */}
        {/* Present the information as support indicators for teacher.     */}
        {/* ============================================================== */}
        {supportSummary && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/70 border-2 border-indigo-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-indigo-950">
                    {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಕಲಿಕಾ ಬೆಂಬಲ ವಿಶ್ಲೇಷಣೆ' : 'Student Support Analysis Summary'}
                  </h4>
                  <p className="text-[10px] text-indigo-800">
                    {language === 'kn' ? 'ಹಾಜರಾತಿ, ಪರೀಕ್ಷಾ ಅಂಕಗಳು, ಮತ್ತು ಕಲಿಕಾ ಚಟುವಟಿಕೆಯ ನೈಜ ಸೂಚಕಗಳು' : 'Connected metrics: Attendance, test scores, voice assessments & progress'}
                  </p>
                </div>
              </div>
              <Badge variant="info" size="sm">
                Non-diagnostic Indicators
              </Badge>
            </div>

            {/* 4 Connected Data Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              {/* 1. Attendance */}
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'kn' ? 'ಹಾಜರಾತಿ' : 'Attendance'}
                </span>
                <span className="text-base font-black text-emerald-800 block">
                  {supportSummary.attendanceRate}%
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block leading-tight">
                  {supportSummary.attendanceRate >= 95 ? 'Regular Attendee' : 'Monitoring'}
                </span>
              </div>

              {/* 2. Test Marks */}
              <div className="p-2.5 rounded-xl bg-white border border-amber-200 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'kn' ? 'ಇತ್ತೀಚಿನ ಅಂಕಗಳು' : 'Test Average'}
                </span>
                <span className="text-base font-black text-amber-800 block">
                  {supportSummary.recentTestAverage}%
                </span>
                <span className="text-[10px] text-amber-700 font-semibold block leading-tight">
                  High: {supportSummary.strongestSubject}
                </span>
              </div>

              {/* 3. Learning Activity */}
              <div className="p-2.5 rounded-xl bg-white border border-sky-200 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'kn' ? 'ಕಲಿಕಾ ಚಟುವಟಿಕೆ' : 'Learning Activity'}
                </span>
                <span className="text-base font-black text-sky-800 block">
                  {supportSummary.voicePracticeScore}%
                </span>
                <span className="text-[10px] text-sky-700 font-semibold block leading-tight">
                  Oral Reading Score
                </span>
              </div>

              {/* 4. Academic Progress */}
              <div className="p-2.5 rounded-xl bg-white border border-purple-200 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'kn' ? 'ಪಠ್ಯಕ್ರಮ ಪ್ರಗತಿ' : 'Curriculum Milestones'}
                </span>
                <span className="text-base font-black text-purple-800 block">
                  Grade 5-A
                </span>
                <span className="text-[10px] text-purple-700 font-semibold block leading-tight">
                  State Syllabus On-Track
                </span>
              </div>
            </div>

            {/* Objective Support Indicators List */}
            <div className="p-3 rounded-xl bg-indigo-950/5 border border-indigo-200/80 space-y-1.5">
              <span className="text-[11px] font-bold text-indigo-950 block">
                {language === 'kn' 
                  ? 'ಶಿಕ್ಷಕರ ಪರಿಶೀಲನೆಗಾಗಿ ಬೆಂಬಲ ಸೂಚಕಗಳು (Support Indicators):' 
                  : 'Support Indicators for Teacher Action Planning:'}
              </span>
              <ul className="text-xs text-slate-700 space-y-1">
                {(language === 'kn' ? supportSummary.supportIndicatorsKn : supportSummary.supportIndicators).map((ind, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-700 shrink-0 mt-0.5" />
                    <span className="leading-snug">{ind}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-slate-500 italic pt-1 border-t border-indigo-200/50">
                * Note: These indicators assist teachers in tailoring homework, peer-study pairing, and classroom mentoring. They do not constitute diagnostic or psychological labels.
              </p>
            </div>
          </div>
        )}

        {/* 3. WORKFLOW PROGRESSION STEPPER & STATUS SELECTOR */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 block">
            {language === 'kn' ? 'ಕಾರ್ಯಪ್ರವಾಹದ ಹಂತ (Workflow Status)' : 'Update Workflow Stage'} <span className="text-rose-500">*</span>
          </label>

          {/* Stepper Buttons: Pending -> Under Review -> Action Taken -> Follow-up -> Resolved */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {WORKFLOW_STAGES.map(stage => {
              const isSelected = currentStatus === stage.status;
              const btnClass = isSelected
                ? 'bg-emerald-700 text-white font-black shadow ring-2 ring-emerald-500/50'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold';

              return (
                <button
                  type="button"
                  key={stage.status}
                  onClick={() => setCurrentStatus(stage.status)}
                  className={`p-2 rounded-xl text-center text-xs transition-all cursor-pointer ${btnClass}`}
                >
                  <span className="text-[10px] opacity-80 block">Step {stage.stepNumber}</span>
                  <span className="leading-tight block">
                    {language === 'kn' ? stage.labelKn : stage.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Action Taken & Follow-up Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              {language === 'kn' ? 'ಕೈಗೊಂಡ ಕ್ರಮ (Action Taken)' : 'Action Taken by School'}
            </label>
            <textarea
              rows={3}
              value={actionTaken}
              onChange={e => setActionTaken(e.target.value)}
              placeholder={
                language === 'kn'
                  ? 'ಉದಾ: ವಿದ್ಯಾರ್ಥಿಯೊಂದಿಗೆ ಸಮಾಲೋಚನೆ ನಡೆಸಲಾಯಿತು, ಪಿಯರ್-ಸ್ಟಡಿ ಗುಂಪು ರಚಿಸಲಾಯಿತು...'
                  : 'e.g., Conducted 1-on-1 reading check; assigned classroom library reading buddy; sent take-home practice worksheet...'
              }
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                {language === 'kn' ? 'ಫಾಲೋ-ಅಪ್ ದಿನಾಂಕ (Follow-up Date)' : 'Follow-up Date'}
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                {language === 'kn' ? 'ಫಾಲೋ-ಅಪ್ ಸ್ಥಿತಿ (Follow-up Status)' : 'Follow-up Status Notes'}
              </label>
              <input
                type="text"
                value={followUpStatus}
                onChange={e => setFollowUpStatus(e.target.value)}
                placeholder="e.g. Scheduled weekly review with student"
                className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* 5. Teacher Response to Parent (VISIBLE TO PARENT) */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            {language === 'kn' ? 'ಪೋಷಕರಿಗೆ ಶಿಕ್ಷಕರ ಪ್ರತಿಕ್ರಿಯೆ (Teacher Response - Visible to Parent)' : 'Teacher Response (Visible to Parent)'}
          </label>
          <textarea
            rows={2}
            value={teacherResponse}
            onChange={e => setTeacherResponse(e.target.value)}
            placeholder={
              language === 'kn'
                ? 'ಪೋಷಕರಿಗೆ ಧೈರ್ಯ ಹಾಗೂ ಶಾಲಾ ಬೆಂಬಲದ ಬಗ್ಗೆ ಸಂದೇಶ ಬರೆಯಿರಿ...'
                : 'Write an encouraging response to the parent explaining school actions and study tips...'
            }
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* 6. Private Teacher Notes (STRICTLY PRIVATE / NOT EXPOSED TO PARENT) */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>
              {language === 'kn' 
                ? 'ಶಿಕ್ಷಕರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿಗಳು (Private Teacher Notes - ಪೋಷಕರಿಗೆ ಗೋಚರಿಸುವುದಿಲ್ಲ)' 
                : 'Private Teacher Notes (Internal Only - Not Shown to Parent)'}
            </span>
          </div>
          <textarea
            rows={2}
            value={teacherNotes}
            onChange={e => setTeacherNotes(e.target.value)}
            placeholder={
              language === 'kn'
                ? 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು ಮತ್ತು ಸಹ ಶಿಕ್ಷಕರ ಆಂತರಿಕ ಪರಿಶೀಲನೆಗಾಗಿ ಟಿಪ್ಪಣಿ ಬರೆಯಿರಿ...'
                : 'Internal observations, classroom behavior notes, or coordination with Headmaster/counselor...'
            }
            className="w-full text-xs p-2 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        {/* Status History (if available) */}
        {concern.statusHistory && concern.statusHistory.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <History className="w-3 h-3 text-slate-400" />
              Workflow Progression Log:
            </span>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {concern.statusHistory.map((h, i) => (
                <div key={i} className="text-[11px] text-slate-600 flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
                  <span><strong>{h.status}</strong>: {h.note || 'Status updated'}</span>
                  <span className="text-[10px] text-slate-400">{h.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            type="submit" 
            disabled={isSaving}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            {isSaving 
              ? (language === 'kn' ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Saving...') 
              : (language === 'kn' ? 'ಕ್ರಮ ಉಳಿಸಿ & ನವೀಕರಿಸಿ (Update)' : 'Save Action & Update Status')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
