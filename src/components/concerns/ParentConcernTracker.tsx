import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import { Badge } from '../../design-system/Badge';
import { Button } from '../../design-system/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import { ParentConcern, ConcernStatus } from '../../types';
import { CONCERN_CATEGORIES, WORKFLOW_STAGES } from '../../services/concernService';
import { 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Sparkles, 
  Plus, 
  MessageSquare, 
  ChevronRight, 
  Calendar,
  AlertCircle,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ParentConcernTrackerProps {
  concerns: ParentConcern[];
  onOpenSubmitModal: () => void;
}

export const ParentConcernTracker: React.FC<ParentConcernTrackerProps> = ({
  concerns,
  onOpenSubmitModal
}) => {
  const { language } = useLanguage();

  const getWorkflowStepIndex = (status: ConcernStatus) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'UNDER_REVIEW':
      case 'IN_REVIEW': return 1;
      case 'ACTION_TAKEN': return 2;
      case 'FOLLOW_UP': return 3;
      case 'RESOLVED': return 4;
      default: return 0;
    }
  };

  const getStatusBadgeVariant = (status: ConcernStatus) => {
    switch (status) {
      case 'RESOLVED': return 'success';
      case 'ACTION_TAKEN': return 'info';
      case 'FOLLOW_UP': return 'info';
      case 'UNDER_REVIEW':
      case 'IN_REVIEW': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <Card className="border-2 border-emerald-200/80 bg-gradient-to-b from-emerald-50/20 via-white to-white shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              {language === 'kn' ? 'ದ್ವಿಮುಖ ಪೋಷಕ-ಶಾಲಾ ಸಂವಹನ' : 'Two-Way Home-School Support'}
            </span>
          </div>
          <CardTitle className="text-base mt-1">
            {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಕಾಳಜಿ ಮತ್ತು ಶಾಲಾ ಫಾಲೋ-ಅಪ್' : 'Student Concerns & School Follow-Up'}
          </CardTitle>
          <CardDescription>
            {language === 'kn'
              ? 'ಮನೆಯಲ್ಲಿ ಓದುವಿಕೆ, ಮೊಬೈಲ್/ಟಿವಿ ಬಳಕೆ, ಮನೆಕೆಲಸ ಅಥವಾ ಹಾಜರಾತಿ ಕುರಿತು ಶಿಕ್ಷಕರಿಗೆ ತಿಳಿಸಿ'
              : 'Submit observations on study habits, mobile usage, homework difficulty, or attendance'}
          </CardDescription>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenSubmitModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          {language === 'kn' ? '+ ಹೊಸ ಕಾಳಜಿ ದಾಖಲಿಸಿ' : '+ Submit Concern'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {concerns.length === 0 ? (
          <div className="p-8 text-center bg-stone-50/60 rounded-2xl border border-stone-200/80 space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">
              {language === 'kn' ? 'ಯಾವುದೇ ಸಕ್ರಿಯ ಕಾಳಜಿಗಳಿಲ್ಲ' : 'No Open Student Concerns'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {language === 'kn'
                ? 'ಮಗುವಿನ ಕಲಿಕೆ, ಮನೆಕೆಲಸ ಅಥವಾ ನಡವಳಿಕೆ ಕುರಿತು ಯಾವುದೇ ಸಮಸ್ಯೆಗಳಿದ್ದರೆ ಇಲ್ಲಿ ಶಿಕ್ಷಕರಿಗೆ ಸಲ್ಲಿಸಬಹುದು.'
                : 'Have observations about daily study routines or homework? Submit a concern to receive personalized teacher follow-up.'}
            </p>
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={onOpenSubmitModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                {language === 'kn' ? 'ಕಾಳಜಿ ಸಲ್ಲಿಸಿ' : 'Submit First Concern'}
              </Button>
            </div>
          </div>
        ) : (
          concerns.map(c => {
            const catObj = CONCERN_CATEGORIES.find(cat => cat.key === c.category);
            const stepIndex = getWorkflowStepIndex(c.status);

            return (
              <div
                key={c.id}
                className="p-4 rounded-2xl border-2 border-slate-200 bg-white space-y-3 shadow-2xs hover:border-emerald-300 transition-all"
              >
                {/* Header row: Category, Priority, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {language === 'kn' ? catObj?.labelKn : catObj?.labelEn || c.category}
                    </span>
                    {c.priority && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.priority === 'URGENT' || c.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.priority === 'URGENT' && '🚨 '}
                        {c.priority}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">
                      • {c.studentName} ({c.studentGrade || 'Grade 5-A'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                    <Badge variant={getStatusBadgeVariant(c.status) as any} size="sm">
                      {c.status}
                    </Badge>
                  </div>
                </div>

                {/* WORKFLOW TRACKER STEPPER */}
                <div className="space-y-1.5 py-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'kn' ? 'ಪ್ರಗತಿ ಹಂತ (Current Status)' : 'Workflow Progression'}
                  </span>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {WORKFLOW_STAGES.map((stage, idx) => {
                      const isCompleted = stepIndex >= idx;
                      const isCurrent = stepIndex === idx;

                      return (
                        <div key={stage.status} className="space-y-1">
                          <div className={`h-1.5 rounded-full transition-all ${
                            isCompleted ? 'bg-emerald-600' : 'bg-slate-200'
                          }`} />
                          <span className={`text-[10px] block leading-tight font-semibold ${
                            isCurrent
                              ? 'text-emerald-800 font-extrabold'
                              : isCompleted
                              ? 'text-slate-600'
                              : 'text-slate-400'
                          }`}>
                            {language === 'kn' ? stage.labelKn.split(' ')[0] : stage.labelEn}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Parent's original description */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
                  <span className="font-extrabold text-slate-900 block text-[11px]">
                    {c.subject || 'Concern Description'}
                  </span>
                  <p className="leading-relaxed italic">
                    "{c.description}"
                  </p>
                </div>

                {/* Teacher Response (if provided) */}
                {c.teacherResponse && (
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[11px] text-emerald-800 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        {language === 'kn' ? 'ಶಿಕ್ಷಕರ ಪ್ರತಿಕ್ರಿಯೆ (Teacher Response):' : 'Class Teacher Response:'}
                      </span>
                      {c.reviewedByTeacherName && (
                        <span className="text-[10px] text-emerald-700 font-bold">
                          {c.reviewedByTeacherName}
                        </span>
                      )}
                    </div>
                    <p className="leading-relaxed mt-0.5">
                      {c.teacherResponse}
                    </p>
                  </div>
                )}

                {/* Action Taken (if provided) */}
                {c.actionTaken && (
                  <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-950 space-y-1">
                    <span className="font-extrabold text-[11px] text-purple-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                      {language === 'kn' ? 'ಶಾಲೆಯಲ್ಲಿ ಕೈಗೊಂಡ ಕ್ರಮ (Action Taken):' : 'School Action Taken:'}
                    </span>
                    <p className="leading-relaxed mt-0.5">
                      {c.actionTaken}
                    </p>
                  </div>
                )}

                {/* Follow-up Status & Date (if provided) */}
                {(c.followUpDate || c.followUpStatus) && (
                  <div className="p-2.5 rounded-xl bg-sky-50/80 border border-sky-200 flex flex-wrap items-center justify-between gap-2 text-xs text-sky-950">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                      <span>
                        <strong>{language === 'kn' ? 'ಫಾಲೋ-ಅಪ್ ದಿನಾಂಕ:' : 'Follow-up Date:'}</strong> {c.followUpDate || 'In Progress'}
                      </span>
                    </div>
                    {c.followUpStatus && (
                      <span className="text-[11px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                        {c.followUpStatus}
                      </span>
                    )}
                  </div>
                )}

                {/* Resolved banner */}
                {c.status === 'RESOLVED' && c.resolvedAt && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {language === 'kn'
                        ? `ಈ ಕಾಳಜಿಯನ್ನು ${c.resolvedAt} ರಂದು ಯಶಸ್ವಿಯಾಗಿ ಪರಿಹರಿಸಲಾಗಿದೆ.`
                        : `Concern marked resolved on ${c.resolvedAt}.`}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
