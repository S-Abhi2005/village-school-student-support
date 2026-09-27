import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Volume2, 
  Award, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  User, 
  FileText, 
  TrendingUp, 
  ShieldAlert,
  Send,
  Check
} from 'lucide-react';
import { Modal } from '../../design-system/Modal';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  VoiceAssessment, 
  VoiceSubmission, 
  voiceAssessmentService 
} from '../../services/voiceAssessmentService';

interface TeacherVoiceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: VoiceAssessment;
  submission: VoiceSubmission;
  onEvaluated: (updated: VoiceSubmission) => void;
}

export const TeacherVoiceReviewModal: React.FC<TeacherVoiceReviewModalProps> = ({
  isOpen,
  onClose,
  assessment,
  submission,
  onEvaluated,
}) => {
  const { language } = useLanguage();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [score, setScore] = useState<number>(submission.teacherScore ?? 24);
  const [feedbackEn, setFeedbackEn] = useState(
    submission.teacherFeedback || 'Clear speech cadence and accurate Kannada vowel articulation. Well done!'
  );
  const [feedbackKn, setFeedbackKn] = useState(
    submission.teacherFeedbackKn || 'ಕನ್ನಡ ಸ್ವರಗಳ ಸುಂದರ ಉಚ್ಚಾರಣೆ ಮತ್ತು ಲಯಬದ್ಧ ಓದುವಿಕೆ. ಉತ್ತಮ ಪ್ರಯತ್ನ!'
  );
  const [isSaving, setIsSaving] = useState(false);

  const togglePlayAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      setTimeout(() => setIsPlayingAudio(false), (submission.durationSeconds * 1000) || 5000);
    }
  };

  const handleSaveEvaluation = () => {
    setIsSaving(true);
    const updated = voiceAssessmentService.evaluateSubmission({
      submissionId: submission.id,
      score,
      feedbackEn,
      feedbackKn,
      teacherName: 'Smt. Savitri Hegde',
    });

    if (updated) {
      onEvaluated(updated);
    }
    setIsSaving(false);
    onClose();
  };

  const analysis = submission.analysis;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 leading-snug">
              {language === 'kn' ? 'ಧ್ವನಿ ಮೌಲ್ಯಮಾಪನ ಪರಿಶೀಲನೆ' : 'Voice Assessment Review & Evaluation'}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {submission.studentName} ({submission.studentRoll}) • {assessment.titleEn}
            </span>
          </div>
        </div>
      }
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Student Audio Playback Studio Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md border border-slate-800">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={togglePlayAudio}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
                isPlayingAudio ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500 hover:bg-emerald-400 text-white'
              }`}
            >
              {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{submission.studentName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {submission.studentRoll}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'kn' ? 'ಧ್ವನಿ ಅವಧಿ:' : 'Duration:'} <strong className="text-emerald-400">{submission.durationSeconds}s</strong> • {submission.submittedAt}
              </p>
            </div>
          </div>

          {/* Animated Waveform */}
          <div className="flex items-center gap-1 h-8">
            {[6, 12, 18, 26, 32, 22, 14, 28, 30, 16, 10, 20, 28, 14, 8].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlayingAudio ? 'bg-amber-400 shadow-xs' : 'bg-slate-700'
                }`}
                style={{ height: `${isPlayingAudio ? Math.min(32, Math.max(6, (h * ((i % 3) + 1)))) : h / 2}px` }}
              />
            ))}
          </div>
        </div>

        {/* Speech-to-Text Transcript Display */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              {language === 'kn' ? 'ಧ್ವನಿ ಪ್ರತಿಲಿಪಿ (Speech-to-Text Transcript)' : 'Speech-to-Text Transcript'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Word Count: ~{submission.transcript.split(/\s+/).length} words
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 leading-relaxed font-sans shadow-2xs">
            "{submission.transcript}"
          </div>

          {/* Pronunciation Token Highlighting */}
          {analysis.pronunciationIndicators.highlightedTokens && (
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                {language === 'kn' ? 'ಶಬ್ದಕೋಶ ಉಚ್ಚಾರಣೆ ನಿಖರತೆ ಸೂಚಕಗಳು:' : 'Token-Level Pronunciation Indicators:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.pronunciationIndicators.highlightedTokens.map((t, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      t.status === 'ACCURATE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : t.status === 'APPROXIMATE'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {t.word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* AUTOMATED SUPPORT ANALYSIS PANEL */}
        {/* ============================================================== */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-white border border-indigo-200 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-indigo-950">
                {language === 'kn' ? 'ಸ್ವಯಂಚಾಲಿತ ಕಲಿಕಾ ವಿಶ್ಲೇಷಣೆ (Support Indicators)' : 'Automated Learning & Pronunciation Indicators'}
              </h4>
            </div>
            <Badge variant="info" size="sm">
              Objective Assistance
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Answer Relevance */}
            <div className="p-3 bg-white rounded-xl border border-indigo-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === 'kn' ? 'ವಿಷಯ ಹೊಂದಾಣಿಕೆ (Relevance)' : 'Answer Relevance'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-indigo-900">
                  {analysis.answerRelevance.scorePercentage}%
                </span>
                <span className="text-[11px] font-bold text-emerald-700">
                  {analysis.answerRelevance.level}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                {language === 'kn' ? analysis.answerRelevance.summaryKn : analysis.answerRelevance.summaryEn}
              </p>
            </div>

            {/* 2. Pronunciation Indicators */}
            <div className="p-3 bg-white rounded-xl border border-indigo-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === 'kn' ? 'ಉಚ್ಚಾರಣಾ ಸ್ಪಷ್ಟತೆ (Pronunciation)' : 'Pronunciation Clarity'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-emerald-900">
                  {analysis.pronunciationIndicators.scorePercentage}%
                </span>
                <span className="text-[11px] font-bold text-emerald-700">
                  {analysis.pronunciationIndicators.clarityLevel}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                {language === 'kn' ? analysis.pronunciationIndicators.phoneticNotesKn : analysis.pronunciationIndicators.phoneticNotesEn}
              </p>
            </div>

            {/* 3. Speaking Fluency Indicators */}
            <div className="p-3 bg-white rounded-xl border border-indigo-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === 'kn' ? 'ಮಾತಿನ ಲಯ & ನಿರರ್ಗಳತೆ (Fluency)' : 'Speaking Fluency'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-purple-900">
                  ~{analysis.fluencyIndicators.estimatedWpm} WPM
                </span>
                <span className="text-[11px] font-bold text-purple-700">
                  {analysis.fluencyIndicators.pacingLevel}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                {language === 'kn' ? analysis.fluencyIndicators.fluencyNotesKn : analysis.fluencyIndicators.fluencyNotesEn}
              </p>
            </div>
          </div>

          {/* CRITICAL ETHICAL DISCLAIMER: Do NOT present automated analysis as definitive judgment */}
          <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-2 text-[11px] text-amber-900 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>{language === 'kn' ? 'ಸೂಚನೆ:' : 'Important Note:'}</strong> {language === 'kn' ? analysis.disclaimerKn : analysis.disclaimerEn}
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TEACHER EVALUATION & SCORING */}
        {/* ============================================================== */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              {language === 'kn' ? 'ಶಿಕ್ಷಕರ ಅಂತಿಮ ಮೌಲ್ಯಮಾಪನ & ಹಿನ್ನುಡಿ' : 'Teacher Score & Feedback Entry'}
            </h4>
            <span className="text-xs font-semibold text-slate-500">
              Evaluator: Smt. Savitri Hegde
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {language === 'kn' ? `ಶಿಕ್ಷಕರ ಅಂಕ (ಗರಿಷ್ಠ ${assessment.totalMarks})` : `Teacher Score (Max ${assessment.totalMarks})`}
              </label>
              <input
                type="number"
                min={0}
                max={assessment.totalMarks}
                value={score}
                onChange={e => setScore(Number(e.target.value))}
                className="w-full text-sm font-bold p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {language === 'kn' ? 'ಶಿಕ್ಷಕರ ಅಭಿಪ್ರಾಯ (ಕನ್ನಡ)' : 'Teacher Feedback (Kannada)'}
              </label>
              <input
                type="text"
                value={feedbackKn}
                onChange={e => setFeedbackKn(e.target.value)}
                placeholder="ಉದಾ: ಕುವೆಂಪು ಕವನದ ಲಯಬದ್ಧ ಉಚ್ಚಾರಣೆ ಅತ್ಯುತ್ತಮವಾಗಿದೆ..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {language === 'kn' ? 'ಶಿಕ್ಷಕರ ಅಭಿಪ್ರಾಯ (English Remarks)' : 'Teacher Feedback (English)'}
            </label>
            <input
              type="text"
              value={feedbackEn}
              onChange={e => setFeedbackEn(e.target.value)}
              placeholder="e.g. Excellent voice projection and rhythmic delivery..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            {language === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleSaveEvaluation}
            disabled={isSaving}
            leftIcon={<Send className="w-4 h-4" />}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 shadow-sm"
          >
            {language === 'kn' ? 'ಫಲಿತಾಂಶ ಪ್ರಕಟಿಸಿ (ಪೋಷಕರಿಗೆ ತಲುಪಿಸಿ)' : 'Publish Evaluation to Parent & Student'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
