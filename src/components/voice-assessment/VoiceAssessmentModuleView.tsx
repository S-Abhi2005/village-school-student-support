import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Plus, 
  Volume2, 
  Play, 
  Pause, 
  CheckCircle2, 
  Award, 
  Clock, 
  Search, 
  Filter, 
  Sparkles, 
  FileText, 
  User, 
  Check, 
  AlertCircle,
  Eye,
  Radio,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  voiceAssessmentService, 
  VoiceAssessment, 
  VoiceSubmission 
} from '../../services/voiceAssessmentService';
import { TeacherCreateVoiceAssessmentModal } from './TeacherCreateVoiceAssessmentModal';
import { StudentVoiceRecordingModal } from './StudentVoiceRecordingModal';
import { TeacherVoiceReviewModal } from './TeacherVoiceReviewModal';

export const VoiceAssessmentModuleView: React.FC = () => {
  const { language } = useLanguage();
  const { role, user } = useAuth();

  const [assessments, setAssessments] = useState<VoiceAssessment[]>(() => voiceAssessmentService.getAssessments());
  const [submissions, setSubmissions] = useState<VoiceSubmission[]>(() => voiceAssessmentService.getSubmissions());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeRecordingAssessment, setActiveRecordingAssessment] = useState<VoiceAssessment | null>(null);
  const [reviewingSubmissionPair, setReviewingSubmissionPair] = useState<{
    assessment: VoiceAssessment;
    submission: VoiceSubmission;
  } | null>(null);

  // Audio preview player state for parents / list view
  const [playingSubmissionId, setPlayingSubmissionId] = useState<string | null>(null);

  // Listen to updates
  useEffect(() => {
    const handleUpdate = () => {
      setAssessments([...voiceAssessmentService.getAssessments()]);
      setSubmissions([...voiceAssessmentService.getSubmissions()]);
    };

    window.addEventListener('voice-assessment-updated', handleUpdate);
    return () => window.removeEventListener('voice-assessment-updated', handleUpdate);
  }, []);

  const handlePlayVoice = (subId: string) => {
    if (playingSubmissionId === subId) {
      setPlayingSubmissionId(null);
    } else {
      setPlayingSubmissionId(subId);
      setTimeout(() => setPlayingSubmissionId(null), 5000);
    }
  };

  // Filter assessments
  const filteredAssessments = assessments.filter(a => {
    if (selectedSubject !== 'ALL' && a.subjectCode !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.titleEn.toLowerCase().includes(q) ||
        a.titleKn.toLowerCase().includes(q) ||
        a.promptTextEn.toLowerCase().includes(q) ||
        a.promptTextKn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {language === 'kn' ? 'ಧ್ವನಿ ಮತ್ತು ಓದುವಿಕೆ ಮೌಲ್ಯಮಾಪನ' : 'Voice & Pronunciation Assessment'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  {language === 'kn'
                    ? 'ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ವಾಚನ, ಉಚ್ಚಾರಣೆ ಮತ್ತು ನಿರರ್ಗಳತೆಯ ಮೌಲ್ಯಮಾಪನ'
                    : 'Oral reading, speech fluency analysis, and personalized teacher evaluation'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(role === 'SUPER_ADMIN' || role === 'TEACHER') && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                {language === 'kn' ? 'ಹೊಸ ಧ್ವನಿ ಪರೀಕ್ಷೆ' : 'Create Voice Assessment'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Subjects', labelKn: 'ಎಲ್ಲಾ ವಿಷಯಗಳು' },
            { id: 'KAN-05', label: 'Kannada (ಕನ್ನಡ)', labelKn: 'ಕನ್ನಡ' },
            { id: 'ENG-05', label: 'English (ಇಂಗ್ಲಿಷ್)', labelKn: 'ಇಂಗ್ಲಿಷ್' },
            { id: 'EVS-05', label: 'Environmental Studies', labelKn: 'ಪರಿಸರ' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSubject(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSubject === s.id
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {language === 'kn' ? s.labelKn : s.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={language === 'kn' ? 'ಶೀರ್ಷಿಕೆ ಹುಡುಕಿ...' : 'Search assessments...'}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. TEACHER VIEW: ASSESSMENTS LIST & SUBMISSIONS REVIEW */}
      {/* ============================================================== */}
      {(role === 'SUPER_ADMIN' || role === 'TEACHER') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssessments.map(assessment => {
              const assSubmissions = submissions.filter(s => s.assessmentId === assessment.id);
              const evaluatedCount = assSubmissions.filter(s => s.status === 'EVALUATED').length;
              const pendingCount = assSubmissions.length - evaluatedCount;

              return (
                <Card key={assessment.id} className="flex flex-col justify-between border-slate-200 hover:border-slate-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="info" size="sm">
                        {assessment.subjectName}
                      </Badge>
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {assessment.timeLimitSeconds}s
                      </span>
                    </div>

                    <CardTitle className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                      {language === 'kn' ? assessment.titleKn : assessment.titleEn}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      {assessment.className} • {assessment.teacherName}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 line-clamp-2 italic font-sans leading-relaxed">
                      "{assessment.promptTextKn || assessment.promptTextEn}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                      <span className="font-semibold text-slate-600">
                        {assSubmissions.length} Submissions
                      </span>
                      {pendingCount > 0 ? (
                        <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {pendingCount} Need Review
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          All Evaluated
                        </span>
                      )}
                    </div>

                    {/* Submissions Drawer / List */}
                    {assSubmissions.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Student Recordings:
                        </span>
                        {assSubmissions.slice(0, 3).map(sub => (
                          <div
                            key={sub.id}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800">{sub.studentName}</span>
                              {sub.status === 'EVALUATED' ? (
                                <Badge variant="success" size="sm">
                                  {sub.teacherScore}/{assessment.totalMarks}
                                </Badge>
                              ) : (
                                <Badge variant="warning" size="sm">Pending</Badge>
                              )}
                            </div>

                            <button
                              onClick={() => setReviewingSubmissionPair({ assessment, submission: sub })}
                              className="text-xs text-rose-700 hover:text-rose-900 font-bold cursor-pointer"
                            >
                              Review &rarr;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full bg-rose-50 text-rose-800 hover:bg-rose-100 font-bold text-xs"
                        leftIcon={<Eye className="w-3.5 h-3.5 text-rose-700" />}
                        onClick={() => {
                          if (assSubmissions.length > 0) {
                            setReviewingSubmissionPair({ assessment, submission: assSubmissions[0] });
                          } else {
                            alert(language === 'kn' ? 'ಯಾವುದೇ ಸಲ್ಲಿಕೆಗಳಿಲ್ಲ.' : 'No student recordings submitted yet.');
                          }
                        }}
                      >
                        {language === 'kn' ? 'ರೆಕಾರ್ಡಿಂಗ್ ಪರಿಶೀಲನೆ (Review Submissions)' : 'Review Voice Submissions'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. STUDENT VIEW: VOICE RECORDING ASSIGNMENTS */}
      {/* ============================================================== */}
      {role === 'STUDENT' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssessments.map(assessment => {
              const mySubmission = submissions.find(
                s => s.assessmentId === assessment.id && s.studentId === 's1'
              );

              return (
                <Card key={assessment.id} className="flex flex-col justify-between border-slate-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="info" size="sm">
                        {assessment.subjectName}
                      </Badge>
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {assessment.timeLimitSeconds}s
                      </span>
                    </div>

                    <CardTitle className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                      {language === 'kn' ? assessment.titleKn : assessment.titleEn}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Assigned by {assessment.teacherName}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-3">
                    {/* Prompt snippet */}
                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-slate-800 leading-relaxed font-sans line-clamp-3">
                      "{assessment.promptTextKn}"
                    </div>

                    {/* Status Pill & Evaluation Result */}
                    {mySubmission ? (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">
                            {language === 'kn' ? 'ನಿಮ್ಮ ಧ್ವನಿ ಸಲ್ಲಿಕೆ:' : 'Your Recording:'}
                          </span>
                          {mySubmission.status === 'EVALUATED' ? (
                            <Badge variant="success" size="sm">
                              Score: {mySubmission.teacherScore}/{assessment.totalMarks}
                            </Badge>
                          ) : (
                            <Badge variant="warning" size="sm">
                              {language === 'kn' ? 'ಮೌಲ್ಯಮಾಪನ ಬಾಕಿ' : 'Awaiting Teacher Review'}
                            </Badge>
                          )}
                        </div>

                        {mySubmission.teacherFeedback && (
                          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900">
                            <strong>{language === 'kn' ? 'ಶಿಕ್ಷಕರ ಅಭಿಪ್ರಾಯ:' : 'Teacher Feedback:'}</strong> "
                            {language === 'kn' ? mySubmission.teacherFeedbackKn : mySubmission.teacherFeedback}"
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'kn' ? 'ಹೊಸ ಪರೀಕ್ಷೆ ಸಿದ್ಧವಾಗಿದೆ. ಮೈಕ್ರೋಫೋನ್ ಮೂಲಕ ಉತ್ತರಿಸಿ!' : 'Ready to attempt. Record your response!'}</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => setActiveRecordingAssessment(assessment)}
                        leftIcon={<Mic className="w-4 h-4" />}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold"
                      >
                        {mySubmission 
                          ? (language === 'kn' ? 'ಮತ್ತೆ ರೆಕಾರ್ಡ್ ಮಾಡಿ (Re-record)' : 'Re-record Response') 
                          : (language === 'kn' ? 'ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಮಾಡಿ (Start Recording)' : 'Start Voice Recording')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. PARENT VIEW: PUBLISHED VOICE ASSESSMENTS & AUDIO PLAYBACK */}
      {/* ============================================================== */}
      {role === 'PARENT' && (
        <div className="space-y-6">
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-sky-950">
                  {language === 'kn' ? 'ಮಗುವಿನ ಧ್ವನಿ ವಾಚನ ಮತ್ತು ಉಚ್ಚಾರಣಾ ವರದಿಗಳು' : 'Child Voice & Pronunciation Results'}
                </h4>
                <p className="text-xs text-sky-800">
                  {language === 'kn'
                    ? 'ಕಾವ್ಯ ಗೌಡ ಅವರ ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ವಾಚನ ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಮತ್ತು ಶಿಕ್ಷಕಿ ಸಾವಿತ್ರಿ ಹೆಗಡೆ ಅವರ ಹಿನ್ನುಡಿ'
                    : 'Kavya R. Gowda’s speech recordings, speech analysis, and teacher feedback'}
                </p>
              </div>
            </div>
            <Badge variant="success" size="sm">
              Term 1 Academic
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {submissions
              .filter(s => s.studentId === 's1' && s.status === 'EVALUATED')
              .map(sub => {
                const ass = assessments.find(a => a.id === sub.assessmentId);

                return (
                  <Card key={sub.id} className="border-emerald-200 shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <Badge variant="info" size="sm">
                          {ass?.subjectName || 'Kannada'}
                        </Badge>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          {sub.teacherScore}/{ass?.totalMarks || 25} Marks (Grade A+)
                        </span>
                      </div>

                      <CardTitle className="text-base font-bold text-slate-900 mt-2">
                        {language === 'kn' ? ass?.titleKn : ass?.titleEn}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Evaluated by {sub.evaluatedBy} • {sub.evaluatedAt}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-4">
                      {/* Audio Playback Bar */}
                      <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-3 shadow-md">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handlePlayVoice(sub.id)}
                            className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
                              playingSubmissionId === sub.id ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500 text-white'
                            }`}
                          >
                            {playingSubmissionId === sub.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                          </button>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {language === 'kn' ? 'ಕಾವ್ಯ ಅವರ ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಕೇಳಿ' : 'Listen to Kavya’s Voice Response'}
                            </span>
                            <span className="text-[11px] text-slate-400">Duration: {sub.durationSeconds}s</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[8, 16, 24, 18, 12, 28, 20, 10, 6].map((h, i) => (
                            <div
                              key={i}
                              className={`w-1 rounded-full ${playingSubmissionId === sub.id ? 'bg-amber-400' : 'bg-slate-700'}`}
                              style={{ height: `${h}px` }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Transcript */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans italic">
                        "{sub.transcript}"
                      </div>

                      {/* Teacher Feedback */}
                      <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-700" />
                          {language === 'kn' ? 'ಶಿಕ್ಷಕಿ ಸಾವಿತ್ರಿ ಹೆಗಡೆ ಅವರ ಹಿನ್ನುಡಿ:' : 'Teacher Feedback:'}
                        </span>
                        <p className="text-xs text-amber-950 font-semibold leading-relaxed">
                          "{language === 'kn' ? sub.teacherFeedbackKn : sub.teacherFeedback}"
                        </p>
                      </div>

                      {/* Learning Indicators Badges */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                          <span className="text-slate-500 block">Pronunciation:</span>
                          <strong>{sub.analysis.pronunciationIndicators.clarityLevel} ({sub.analysis.pronunciationIndicators.scorePercentage}%)</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900">
                          <span className="text-slate-500 block">Speaking Pace:</span>
                          <strong>{sub.analysis.fluencyIndicators.pacingLevel} (~{sub.analysis.fluencyIndicators.estimatedWpm} WPM)</strong>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Modals */}
      {/* 1. Create Assessment Modal */}
      <TeacherCreateVoiceAssessmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(newAss) => {
          setAssessments(voiceAssessmentService.getAssessments());
        }}
      />

      {/* 2. Student Recording Modal */}
      {activeRecordingAssessment && (
        <StudentVoiceRecordingModal
          isOpen={true}
          onClose={() => setActiveRecordingAssessment(null)}
          assessment={activeRecordingAssessment}
          onSubmitted={(sub) => {
            setSubmissions(voiceAssessmentService.getSubmissions());
            setActiveRecordingAssessment(null);
          }}
        />
      )}

      {/* 3. Teacher Review Modal */}
      {reviewingSubmissionPair && (
        <TeacherVoiceReviewModal
          isOpen={true}
          onClose={() => setReviewingSubmissionPair(null)}
          assessment={reviewingSubmissionPair.assessment}
          submission={reviewingSubmissionPair.submission}
          onEvaluated={(updated) => {
            setSubmissions(voiceAssessmentService.getSubmissions());
            setReviewingSubmissionPair(null);
          }}
        />
      )}
    </div>
  );
};
