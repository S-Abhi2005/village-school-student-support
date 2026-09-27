import React, { useState } from 'react';
import { Modal } from '../../design-system/Modal';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';
import { Table } from '../../design-system/Table';
import { useLanguage } from '../../i18n/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  OnlineTest, 
  StudentTestSubmission, 
  onlineTestService 
} from '../../services/onlineTestService';
import { 
  Award, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Send, 
  Eye, 
  X, 
  ChevronRight, 
  AlertTriangle, 
  FileText, 
  Check, 
  User,
  Sparkles,
  Lock
} from 'lucide-react';

interface TeacherSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: OnlineTest;
  onUpdateTest: (test: OnlineTest) => void;
}

export const TeacherSubmissionsModal: React.FC<TeacherSubmissionsModalProps> = ({
  isOpen,
  onClose,
  test,
  onUpdateTest,
}) => {
  const { language } = useLanguage();
  const { addNotification } = useNotifications();

  const [submissions, setSubmissions] = useState<StudentTestSubmission[]>(() =>
    onlineTestService.getSubmissionsForTest(test.id)
  );

  const [selectedSubmission, setSelectedSubmission] = useState<StudentTestSubmission | null>(null);
  const [editingScore, setEditingScore] = useState<number>(0);
  const [editingFeedback, setEditingFeedback] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // When opening a report dossier
  const handleOpenDossier = (sub: StudentTestSubmission) => {
    setSelectedSubmission(sub);
    setEditingScore(sub.score || 0);
    setEditingFeedback(sub.teacherFeedback || '');
  };

  const handleSaveGrade = () => {
    if (!selectedSubmission) return;

    const updated = onlineTestService.gradeSubmission(
      selectedSubmission.id,
      editingScore,
      editingFeedback
    );

    if (updated) {
      setSelectedSubmission(updated);
      setSubmissions(onlineTestService.getSubmissionsForTest(test.id));
      setSuccessToast(language === 'kn' ? 'ಅಂಕಗಳು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಣಗೊಂಡಿವೆ!' : 'Marks updated successfully!');
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  // Publish results and broadcast notifications to parents
  const handlePublishResults = () => {
    const res = onlineTestService.publishResults(test.id, (sub, t) => {
      // Dispatches parent notification
      const studentNameDisplay = language === 'kn' && sub.studentNameKn ? sub.studentNameKn : sub.studentName;
      const testTitleDisplay = language === 'kn' ? t.titleKn : t.titleEn;

      addNotification({
        category: 'ACADEMIC',
        targetRole: 'PARENT',
        titleKn: `ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶ ಪ್ರಕಟಣೆ: ${testTitleDisplay}`,
        titleEn: `Exam Results Published: ${t.titleEn}`,
        bodyKn: `ನಿಮ್ಮ ಮಗು ${studentNameDisplay} ಅವರ ${t.subjectName} ಪರೀಕ್ಷೆಯ ಫಲಿತಾಂಶ ಪ್ರಕಟವಾಗಿದೆ. ಗಳಿಸಿದ ಅಂಕ: ${sub.score ?? 0}/${t.totalMarks} (${sub.percentage ?? 0}%, ಶ್ರೇಣಿ: ${sub.grade || 'N/A'}). ಶಿಕ್ಷಕಿ ಶ್ರೀಮತಿ ಸಾವಿತ್ರಿ ಹೆಗಡೆ ಪರಿಶೀಲಿಸಿದ್ದಾರೆ.`,
        bodyEn: `Official exam result published for ${sub.studentName} in ${t.subjectName}. Score: ${sub.score ?? 0}/${t.totalMarks} (${sub.percentage ?? 0}%, Grade: ${sub.grade || 'N/A'}). Verified by class teacher.`,
      });
    });

    if (res) {
      onUpdateTest(res.test);
      setSubmissions(res.submissions);
      setSuccessToast(
        language === 'kn'
          ? 'ಫಲಿತಾಂಶಗಳು ಯಶಸ್ವಿಯಾಗಿ ಪ್ರಕಟವಾಗಿವೆ! ಪೋಷಕರಿಗೆ ನೋಟಿಫಿಕೇಶನ್ ತಲುಪಿದೆ.'
          : 'Results published successfully! Notifications dispatched to parents.'
      );
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}m ${remainder}s`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'kn' ? `ಪರೀಕ್ಷಾ ಸಲ್ಲಿಕೆಗಳು: ${test.titleKn}` : `Submissions: ${test.titleEn}`}
      maxWidth="xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
        {successToast && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-950">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Test Summary Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="info" size="sm">{test.subjectCode}</Badge>
              <span className="font-bold text-slate-800">{test.className}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">{test.questions.length} Questions</span>
              <span className="text-slate-400">•</span>
              <span className="font-bold text-amber-900">{test.totalMarks} Marks</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Created by {test.createdBy} · Pass Marks: {test.passingMarks}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {test.resultsPublished ? (
              <Badge variant="success" size="md">
                <Check className="w-3.5 h-3.5 mr-1 inline" />
                {language === 'kn' ? 'ಫಲಿತಾಂಶ ಪ್ರಕಟವಾಗಿದೆ' : 'Results Published'}
              </Badge>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handlePublishResults}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                {language === 'kn' ? 'ಪೋಷಕರಿಗೆ ಫಲಿತಾಂಶ ಪ್ರಕಟಿಸಿ' : 'Publish Results to Parents'}
              </Button>
            )}
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-slate-900">
              {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಗಳ ಸಲ್ಲಿಕೆ ವಿವರ' : 'Student Submissions'} ({submissions.length})
            </h4>
            <span className="text-xs text-slate-400">
              {submissions.filter(s => s.status === 'GRADED').length} Graded
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              {language === 'kn' ? 'ಇನ್ನೂ ಯಾವುದೇ ವಿದ್ಯಾರ್ಥಿಗಳು ಈ ಪರೀಕ್ಷೆ ತೆಗೆದುಕೊಂಡಿಲ್ಲ.' : 'No student submissions yet.'}
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                  <tr>
                    <th className="p-3">{language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ' : 'Student'}</th>
                    <th className="p-3 text-center">{language === 'kn' ? 'ಅಂಕಗಳು' : 'Score'}</th>
                    <th className="p-3 text-center">{language === 'kn' ? 'ತೆಗೆದುಕೊಂಡ ಸಮಯ' : 'Time Taken'}</th>
                    <th className="p-3 text-center">{language === 'kn' ? 'ಸ್ಥಿತಿ' : 'Attempt Status'}</th>
                    <th className="p-3 text-center">{language === 'kn' ? 'ಭದ್ರತಾ ಪರಿಶೀಲನೆ' : 'Integrity / Security'}</th>
                    <th className="p-3 text-right">{language === 'kn' ? 'ವರದಿ' : 'Report'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                            {sub.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {language === 'kn' && sub.studentNameKn ? sub.studentNameKn : sub.studentName}
                            </p>
                            <p className="text-[10px] text-slate-400">Roll: {sub.rollNumber}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        {sub.score !== undefined ? (
                          <div>
                            <span className="font-black text-slate-900">{sub.score}</span>
                            <span className="text-slate-400"> / {sub.maxScore}</span>
                            <Badge variant={sub.percentage! >= 80 ? 'success' : 'neutral'} size="sm" className="ml-1.5">
                              {sub.percentage}% ({sub.grade})
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Pending Grade</span>
                        )}
                      </td>

                      <td className="p-3 text-center font-mono text-[11px] text-slate-600">
                        {formatSeconds(sub.timeTakenSeconds)}
                      </td>

                      <td className="p-3 text-center">
                        <Badge
                          variant={sub.status === 'GRADED' ? 'success' : sub.status === 'AUTO_SUBMITTED' ? 'warning' : 'info'}
                          size="sm"
                        >
                          {sub.status === 'AUTO_SUBMITTED' ? 'Auto-Submitted (Time expired)' : sub.status}
                        </Badge>
                      </td>

                      <td className="p-3 text-center">
                        {sub.securityStatus === 'REVIEW_REQUIRED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                            <span>Review Required ({sub.suspiciousCount})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Clean (0 events)</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDossier(sub)}
                          className="h-8 text-xs font-bold"
                          leftIcon={<Eye className="w-3 h-3 text-amber-700" />}
                        >
                          {language === 'kn' ? 'ಪೂರ್ಣ ವರದಿ' : 'Report'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* TEACHER EXAM REPORT DOSSIER MODAL */}
        {selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setSelectedSubmission(null)}
            />
            <div className="relative bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-lg">
                    📋
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">
                      {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಪರೀಕ್ಷಾ ಲೆಕ್ಕಪರಿಶೋಧನೆ ವರದಿ' : 'Teacher Exam & Security Report'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {selectedSubmission.studentName} · Roll: {selectedSubmission.rollNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Core metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Score</span>
                  <span className="text-lg font-black text-slate-900">
                    {selectedSubmission.score ?? 0} / {selectedSubmission.maxScore}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Time Taken</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    {formatSeconds(selectedSubmission.timeTakenSeconds)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Attempt Status</span>
                  <Badge variant="info" size="sm" className="mt-1">
                    {selectedSubmission.status}
                  </Badge>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Suspicious Count</span>
                  <span className={`text-lg font-black ${selectedSubmission.suspiciousCount > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                    {selectedSubmission.suspiciousCount} Events
                  </span>
                </div>
              </div>

              {/* Activity Details / Integrity Log */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>{language === 'kn' ? 'ಪರೀಕ್ಷಾ ಸಮಗ್ರತೆ ಮತ್ತು ಭದ್ರತಾ ಲಾಗ್ (Security Audit Log)' : 'Exam Integrity & Activity Details'}</span>
                  </h5>
                  <Badge
                    variant={selectedSubmission.securityStatus === 'CLEAN' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {selectedSubmission.securityStatus === 'CLEAN' ? 'CLEAN RECORD' : 'REVIEW REQUIRED'}
                  </Badge>
                </div>

                {selectedSubmission.suspiciousEvents.length === 0 ? (
                  <p className="text-xs text-emerald-800 flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>No interruptions, tab-switches or fullscreen exits detected. Clean exam session.</span>
                  </p>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] text-amber-900 italic">
                      Note: Suspicious events are marked for teacher evaluation. They do not automatically penalize the student.
                    </p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {selectedSubmission.suspiciousEvents.map(se => (
                        <div
                          key={se.id}
                          className="p-2 rounded-xl bg-white border border-amber-300 text-xs flex items-start gap-2"
                        >
                          <span className="font-mono text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold shrink-0">
                            {se.timestamp}
                          </span>
                          <span className="font-bold text-amber-950 shrink-0">[{se.type}]</span>
                          <span className="text-slate-700 flex-1 leading-tight">
                            {language === 'kn' ? se.descriptionKn : se.descriptionEn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Questions & Student Answers */}
              <div className="space-y-3">
                <h5 className="font-black text-xs text-slate-800 uppercase tracking-wider">
                  {language === 'kn' ? 'ಪ್ರಶ್ನೋತ್ತರಗಳ ವಿಮರ್ಶೆ' : 'Answers Review & Teacher Grading'}
                </h5>

                <div className="space-y-2.5">
                  {test.questions.map((q, idx) => {
                    const studentAns = selectedSubmission.answers[q.id];
                    return (
                      <div key={q.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {idx + 1}. {language === 'kn' ? q.questionTextKn : q.questionTextEn}
                          </span>
                          <Badge variant="info" size="sm">{q.marks} Marks</Badge>
                        </div>

                        {q.type === 'MULTIPLE_CHOICE' && q.options && (
                          <div className="pt-1 space-y-1 text-[11px]">
                            {q.options.map(opt => {
                              const isStudentSelected = opt.id === studentAns;
                              const isCorrect = opt.id === q.correctOptionId;
                              return (
                                <div
                                  key={opt.id}
                                  className={`p-1.5 rounded-lg border flex items-center justify-between ${
                                    isStudentSelected && isCorrect
                                      ? 'bg-emerald-100 border-emerald-400 font-bold text-emerald-950'
                                      : isStudentSelected && !isCorrect
                                      ? 'bg-rose-100 border-rose-300 text-rose-950 font-bold'
                                      : isCorrect
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                      : 'bg-white border-slate-200 text-slate-600'
                                  }`}
                                >
                                  <span>{language === 'kn' ? opt.textKn : opt.textEn}</span>
                                  {isStudentSelected && (
                                    <span className="text-[10px] text-slate-500 font-bold">
                                      (Student Choice)
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.type === 'DESCRIPTIVE' && (
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Student Written Answer:</span>
                            <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                              {studentAns || <span className="italic text-slate-400">No answer submitted</span>}
                            </p>
                            {q.sampleAnswerKn && (
                              <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-100">
                                Guide: {language === 'kn' ? q.sampleAnswerKn : q.sampleAnswerEn}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Adjust Marks & Feedback */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">
                    {language === 'kn' ? 'ಅಂತಿಮ ಅಂಕಗಳು (Total Score):' : 'Final Score:'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max={test.totalMarks}
                    value={editingScore}
                    onChange={e => setEditingScore(parseInt(e.target.value) || 0)}
                    className="w-20 bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-black text-xs"
                  />
                  <span className="text-slate-400">/ {test.totalMarks} Marks</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'kn' ? 'ಶಿಕ್ಷಕರ ಅಭಿಪ್ರಾಯ / ಹಿನ್ನುಡಿ (Teacher Remarks)' : 'Teacher Feedback Remarks'}
                  </label>
                  <textarea
                    rows={2}
                    value={editingFeedback}
                    onChange={e => setEditingFeedback(e.target.value)}
                    placeholder="Enter personalized feedback for student and parent..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveGrade}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  {language === 'kn' ? 'ಶ್ರೇಣಿ & ಹಿನ್ನುಡಿ ಉಳಿಸಿ' : 'Save Grade & Feedback'}
                </Button>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" size="md" onClick={() => setSelectedSubmission(null)} className="font-bold">
                  {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close Report'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
