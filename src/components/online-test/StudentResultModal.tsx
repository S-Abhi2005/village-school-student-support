import React from 'react';
import { Modal } from '../../design-system/Modal';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';
import { useLanguage } from '../../i18n/LanguageContext';
import { OnlineTest, StudentTestSubmission } from '../../services/onlineTestService';
import { Award, CheckCircle2, Clock, FileText, Check, X } from 'lucide-react';

interface StudentResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: OnlineTest;
  submission: StudentTestSubmission;
}

export const StudentResultModal: React.FC<StudentResultModalProps> = ({
  isOpen,
  onClose,
  test,
  submission,
}) => {
  const { language } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'kn' ? 'ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶ ಮತ್ತು ಮೌಲ್ಯಾಂಕನ' : 'Examination Results & Review'}
      maxWidth="lg"
    >
      <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
        {/* Header result banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning" size="sm">Grade {submission.grade || 'A'}</Badge>
              <span className="text-xs text-emerald-200">{test.subjectName}</span>
            </div>
            <h3 className="text-lg font-black text-white">
              {language === 'kn' ? test.titleKn : test.titleEn}
            </h3>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              Verified by Smt. Savitri Hegde · {submission.submittedAt?.slice(0, 10)}
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-emerald-700/60 sm:pl-5">
            <span className="text-xs text-emerald-200 block uppercase font-bold">Marks Scored</span>
            <div className="text-3xl font-black text-amber-300">
              {submission.score ?? 0} <span className="text-base text-white font-medium">/ {submission.maxScore}</span>
            </div>
            <span className="text-xs text-emerald-200 font-bold">{submission.percentage ?? 0}%</span>
          </div>
        </div>

        {/* Teacher Feedback Note */}
        {submission.teacherFeedback && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-900">
              <Award className="w-4 h-4 text-amber-600" />
              <span>{language === 'kn' ? 'ವರ್ಗ ಶಿಕ್ಷಕರ ಹಿನ್ನುಡಿ (Teacher Remarks):' : "Teacher's Evaluation Note:"}</span>
            </span>
            <p className="leading-relaxed italic pl-5">
              "{submission.teacherFeedback}"
            </p>
          </div>
        )}

        {/* Question-by-question breakdown */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
            {language === 'kn' ? 'ಪ್ರಶ್ನೋತ್ತರಗಳ ವಿಮರ್ಶೆ' : 'Question-by-Question Breakdown'}
          </h4>

          <div className="space-y-2.5 text-xs">
            {test.questions.map((q, idx) => {
              const studentAns = submission.answers[q.id];
              const isCorrect = q.type === 'MULTIPLE_CHOICE' && studentAns === q.correctOptionId;

              return (
                <div key={q.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900">
                      {idx + 1}. {language === 'kn' ? q.questionTextKn : q.questionTextEn}
                    </span>
                    <Badge variant={isCorrect ? 'success' : 'neutral'} size="sm">
                      {q.marks} Marks
                    </Badge>
                  </div>

                  {q.type === 'MULTIPLE_CHOICE' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      {q.options.map(opt => {
                        const isStudentChoice = opt.id === studentAns;
                        const isRightAnswer = opt.id === q.correctOptionId;

                        return (
                          <div
                            key={opt.id}
                            className={`p-2 rounded-xl border flex items-center justify-between ${
                              isRightAnswer
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                                : isStudentChoice && !isRightAnswer
                                ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <span>{language === 'kn' ? opt.textKn : opt.textEn}</span>
                            {isRightAnswer && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'DESCRIPTIVE' && (
                    <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-700 space-y-1">
                      <span className="font-bold text-slate-500 block">Your Answer:</span>
                      <p className="italic whitespace-pre-line">{studentAns || 'No answer submitted'}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="md" onClick={onClose} className="font-bold">
            {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
