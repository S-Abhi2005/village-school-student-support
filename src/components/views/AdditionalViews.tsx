import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import { Table } from '../../design-system/Table';
import { Badge } from '../../design-system/Badge';
import { Button } from '../../design-system/Button';
import { Alert } from '../../design-system/Alert';
import { Modal } from '../../design-system/Modal';
import { Input } from '../../design-system/Input';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  MOCK_LEARNING_MATERIALS, 
  MOCK_PARENT_CONCERNS, 
  MOCK_VOICE_ASSESSMENTS, 
  MOCK_TEACHERS, 
  MOCK_PARENTS, 
  MOCK_STUDENTS, 
  MOCK_CLASSES, 
  MOCK_SUBJECTS 
} from '../../mock/schoolData';
import { 
  LearningMaterial, 
  ParentConcern, 
  VoiceAssessment, 
  TeacherProfile, 
  ParentProfile, 
  SchoolClass 
} from '../../types';
import { 
  BookOpen, 
  Download, 
  Headphones, 
  FileText, 
  CheckCircle2, 
  Plus, 
  MessageSquare, 
  Send, 
  Mic, 
  Volume2, 
  Play, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  UserPlus, 
  Sparkles
} from 'lucide-react';
import { concernService } from '../../services/concernService';
import { ParentConcernTracker } from '../concerns/ParentConcernTracker';
import { ParentSubmitConcernModal } from '../concerns/ParentSubmitConcernModal';
import { TeacherConcernSection } from '../concerns/TeacherConcernSection';

// ==========================================
// 1. LEARNING MATERIALS VIEW
// ==========================================
export const LearningMaterialsView: React.FC = () => {
  const { language } = useLanguage();
  const { role } = useAuth();
  const [materials, setMaterials] = useState<LearningMaterial[]>(MOCK_LEARNING_MATERIALS);
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New material form
  const [titleKn, setTitleKn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [subjectCode, setSubjectCode] = useState('KAN-05');
  const [materialType, setMaterialType] = useState<'PDF' | 'AUDIO_STORY' | 'WORKSHEET' | 'VIDEO'>('PDF');
  const [descriptionKn, setDescriptionKn] = useState('');

  const filteredMaterials = materials.filter(m => {
    if (selectedSubject !== 'ALL' && m.subjectCode !== selectedSubject) return false;
    if (selectedType !== 'ALL' && m.type !== selectedType) return false;
    return true;
  });

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleKn && !titleEn) return;

    const newMat: LearningMaterial = {
      id: `mat-${Date.now()}`,
      titleEn: titleEn || titleKn,
      titleKn: titleKn || titleEn,
      subjectCode,
      gradeLevel: 5,
      type: materialType,
      fileSizeOrDuration: materialType === 'AUDIO_STORY' ? '5 mins · 4.2 MB' : '1.8 MB',
      downloadUrl: '#',
      descriptionKn: descriptionKn || 'ಗ್ರಾಮೀಣ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಕಲಿಕಾ ಸಾಮಗ್ರಿ',
      descriptionEn: 'Digital learning asset for village students',
      isKannadaMedium: true
    };

    setMaterials([newMat, ...materials]);
    setIsAddModalOpen(false);
    setTitleKn('');
    setTitleEn('');
    setDescriptionKn('');
    setSuccessMsg(language === 'kn' ? 'ಹೊಸ ಕಲಿಕಾ ಸಾಮಗ್ರಿ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!' : 'New learning material added successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'kn' ? 'ಕಲಿಕಾ ಸಾಮಗ್ರಿಗಳು ಮತ್ತು ಶ್ರವ್ಯ ಪಾಠಗಳು' : 'Learning Materials & Audio Lessons'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'kn' 
              ? 'ಕನ್ನಡ ನಲಿಕಲಿ, ಗಣಿತ, ಪರಿಸರ ವಿಜ್ಞಾನ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ವರ್ಕ್‌ಶೀಟ್‌ಗಳು' 
              : 'Kannada Nali-Kali, Math, Science & audio workbooks for offline and mobile study'}
          </p>
        </div>

        {(role === 'SUPER_ADMIN' || role === 'TEACHER') && (
          <Button 
            variant="primary" 
            size="sm" 
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            {language === 'kn' ? 'ಹೊಸ ಸಾಮಗ್ರಿ ಅಪ್‌ಲೋಡ್' : 'Upload Material'}
          </Button>
        )}
      </div>

      {successMsg && (
        <Alert variant="success" title={successMsg} onDismiss={() => setSuccessMsg(null)}>
          {language === 'kn' ? 'ದಾಖಲೆ ನವೀಕರಿಸಲಾಗಿದೆ.' : 'Record updated.'}
        </Alert>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 items-center p-3 bg-white rounded-xl border border-slate-200">
        <span className="text-xs font-semibold text-slate-500 mr-2">
          {language === 'kn' ? 'ಫಿಲ್ಟರ್:' : 'Filter:'}
        </span>
        <select 
          value={selectedSubject} 
          onChange={e => setSelectedSubject(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white"
        >
          <option value="ALL">{language === 'kn' ? 'ಎಲ್ಲಾ ವಿಷಯಗಳು' : 'All Subjects'}</option>
          <option value="KAN-05">Kannada (ಕನ್ನಡ)</option>
          <option value="MAT-05">Mathematics (ಗಣಿತ)</option>
          <option value="EVS-05">Science / EVS (ಪರಿಸರ ಅಧ್ಯಯನ)</option>
        </select>

        <select 
          value={selectedType} 
          onChange={e => setSelectedType(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white"
        >
          <option value="ALL">{language === 'kn' ? 'ಎಲ್ಲಾ ಮಾದರಿಗಳು' : 'All Types'}</option>
          <option value="PDF">PDF Worksheets</option>
          <option value="AUDIO_STORY">Audio Story (ಧ್ವನಿ ಕಥೆ)</option>
          <option value="WORKSHEET">Interactive Worksheet</option>
          <option value="VIDEO">Video Demo</option>
        </select>
      </div>

      {/* Material Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map(m => (
          <Card key={m.id} className="flex flex-col justify-between">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    m.type === 'AUDIO_STORY' ? 'bg-amber-100 text-amber-800' :
                    m.type === 'WORKSHEET' ? 'bg-purple-100 text-purple-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {m.type === 'AUDIO_STORY' ? <Headphones className="w-5 h-5" /> : 
                     m.type === 'WORKSHEET' ? <Sparkles className="w-5 h-5" /> : 
                     <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 block uppercase tracking-wider">
                      {m.subjectCode} • {m.type}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">Grade {m.gradeLevel}</span>
                  </div>
                </div>
                <Badge variant="neutral" size="sm">{m.fileSizeOrDuration}</Badge>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {language === 'kn' ? m.titleKn : m.titleEn}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {language === 'kn' ? m.descriptionKn : m.descriptionEn}
                </p>
              </div>

              {m.type === 'AUDIO_STORY' && (
                <div className="mt-3 py-1.5 px-2.5 rounded-lg bg-amber-50/80 border border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                    {language === 'kn' ? 'ಕನ್ನಡ ಧ್ವನಿ ವಿವರಣೆ ಲಭ್ಯ' : 'Kannada Voice Guide'}
                  </span>
                  <span className="font-bold text-[11px] text-amber-700">~5 mins</span>
                </div>
              )}
            </CardContent>

            <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={<Play className="w-3.5 h-3.5 text-emerald-600" />}
                onClick={() => alert(`Starting preview: ${language === 'kn' ? m.titleKn : m.titleEn}`)}
              >
                {language === 'kn' ? 'ವೀಕ್ಷಿಸಿ / ಆಲಿಸಿ' : 'View / Listen'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={() => alert(`Downloading offline bundle for village mobile: ${m.titleEn}`)}
              >
                {language === 'kn' ? 'ಡೌನ್‌ಲೋಡ್' : 'Download'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={language === 'kn' ? 'ಹೊಸ ಕಲಿಕಾ ಸಾಮಗ್ರಿ ಸೇರಿಸಿ' : 'Upload New Learning Material'}
      >
        <form onSubmit={handleAddMaterial} className="space-y-4">
          <Input 
            label={language === 'kn' ? 'ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)' : 'Title (Kannada)'}
            placeholder="ಉದಾ: ನಲಿಕಲಿ ಕನ್ನಡ ವರ್ಣಮಾಲೆ ಮತ್ತು ಸರಳ ಪದಗಳು"
            value={titleKn}
            onChange={e => setTitleKn(e.target.value)}
            required
          />
          <Input 
            label={language === 'kn' ? 'ಶೀರ್ಷಿಕೆ (ಇಂಗ್ಲಿಷ್)' : 'Title (English)'}
            placeholder="e.g. Nali-Kali Kannada Varnamale & Simple Words"
            value={titleEn}
            onChange={e => setTitleEn(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {language === 'kn' ? 'ವಿಷಯ' : 'Subject'}
              </label>
              <select 
                value={subjectCode} 
                onChange={e => setSubjectCode(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="KAN-05">Kannada (ಕನ್ನಡ)</option>
                <option value="MAT-05">Mathematics (ಗಣಿತ)</option>
                <option value="EVS-05">Science / EVS (ಪರಿಸರ)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {language === 'kn' ? 'ಮಾದರಿ' : 'Type'}
              </label>
              <select 
                value={materialType} 
                onChange={e => setMaterialType(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="PDF">PDF Worksheet</option>
                <option value="AUDIO_STORY">Audio Story</option>
                <option value="WORKSHEET">Worksheet</option>
                <option value="VIDEO">Video Demo</option>
              </select>
            </div>
          </div>
          <Input 
            label={language === 'kn' ? 'ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ' : 'Brief Description'}
            placeholder="ಕಲಿಕೆಯ ಮುಖ್ಯ ಅಂಶಗಳು..."
            value={descriptionKn}
            onChange={e => setDescriptionKn(e.target.value)}
          />
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {language === 'kn' ? 'ಉಳಿಸಿ' : 'Save Material'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ==========================================
// 2. PARENT CONCERNS & GRIEVANCE BOX VIEW
// ==========================================
export const ParentConcernsView: React.FC = () => {
  const { language } = useLanguage();
  const { role } = useAuth();
  const [concerns, setConcerns] = useState<ParentConcern[]>(() => {
    return role === 'PARENT' 
      ? concernService.getConcernsByParent('p1') 
      : concernService.getConcerns();
  });
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    const handleUpdate = () => {
      setConcerns(role === 'PARENT' ? concernService.getConcernsByParent('p1') : concernService.getConcerns());
    };
    window.addEventListener('parent-concern-updated', handleUpdate);
    return () => window.removeEventListener('parent-concern-updated', handleUpdate);
  }, [role]);

  if (role !== 'PARENT') {
    return (
      <div className="space-y-6">
        <TeacherConcernSection />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successMsg && (
        <Alert variant="success" title={successMsg} onDismiss={() => setSuccessMsg(null)}>
          {language === 'kn' ? 'ಮಾಹಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ.' : 'Details updated.'}
        </Alert>
      )}

      <ParentConcernTracker
        concerns={concerns}
        onOpenSubmitModal={() => setIsSubmitOpen(true)}
      />

      <ParentSubmitConcernModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        childrenList={MOCK_PARENTS[0]?.children || [MOCK_STUDENTS[0], MOCK_STUDENTS[5]]}
        initialSelectedChildId="s1"
        onConcernSubmitted={msg => {
          setSuccessMsg(msg);
          setTimeout(() => setSuccessMsg(null), 4000);
        }}
      />
    </div>
  );
};

// ==========================================
// 3. VOICE ASSESSMENT VIEW
// ==========================================
export const VoiceAssessmentView: React.FC = () => {
  const { language } = useLanguage();
  const [assessments] = useState<VoiceAssessment[]>(MOCK_VOICE_ASSESSMENTS);
  const [activePracticeIndex, setActivePracticeIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const practiceSentences = [
    {
      kn: 'ನಮ್ಮ ಶಾಲೆ ಹಸಿರು ಪರಿಸರದಲ್ಲಿದೆ. ನಾವು ಪ್ರತಿದಿನ ಓದುತ್ತೇವೆ ಮತ್ತು ಕಲಿಯುತ್ತೇವೆ.',
      en: 'Our school is in a green environment. We read and learn every day.',
      focus: 'ಉಚ್ಚಾರಣೆ ಮತ್ತು ಸ್ಪಷ್ಟತೆ (Pronunciation & Clarity)'
    },
    {
      kn: 'ಕನ್ನಡ ನಮ್ಮ ಮಾತೃಭಾಷೆ, ಅದನ್ನು ಪ್ರೀತಿಸುವುದು ನಮ್ಮ ಕರ್ತವ್ಯ.',
      en: 'Kannada is our mother tongue, loving it is our duty.',
      focus: 'ಧ್ವನಿ ಏರಿಳಿತ (Intonation)'
    },
    {
      kn: 'ಗಿಡಮರಗಳನ್ನು ಬೆಳೆಸಿ, ಪರಿಸರವನ್ನು ಕಾಪಾಡೋಣ.',
      en: 'Let us grow trees and protect the environment.',
      focus: 'ವೇಗ ಮತ್ತು ನಿರರ್ಗಳತೆ (Fluency)'
    }
  ];

  const currentSentence = practiceSentences[activePracticeIndex];

  const handleStartRecording = () => {
    setIsRecording(true);
    setAiScore(null);
    setAiFeedback(null);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setTimeout(() => {
      const simulatedScore = Math.floor(Math.random() * 15) + 85;
      setAiScore(simulatedScore);
      setAiFeedback(
        language === 'kn'
          ? `ಅತ್ಯುತ್ತಮ ಧ್ವನಿ ಸ್ಪಷ್ಟತೆ! ಉಚ್ಚಾರಣೆ ನಿಖರವಾಗಿದೆ (ನಿಖರತೆ: ${simulatedScore}%). ಕ ಮತ್ತು ಷ ಅಕ್ಷರಗಳ ಒತ್ತಕ್ಷರ ಸುಂದರವಾಗಿ ಮೂಡಿಬಂದಿದೆ.`
          : `Excellent clarity! Accuracy score: ${simulatedScore}%. Vowel clarity and intonation are highly accurate.`
      );
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'kn' ? 'ಧ್ವನಿ ಮತ್ತು ಕನ್ನಡ ಓದುವಿಕೆ ಮೌಲ್ಯಮಾಪನ' : 'Voice Assessment & Kannada Pronunciation Lab'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'kn' 
              ? 'ಕನ್ನಡ ಅಕ್ಷರ, ಪದ ಮತ್ತು ವಾಕ್ಯಗಳ ಉಚ್ಚಾರಣೆಯನ್ನು ಮೈಕ್ರೋಫೋನ್ ಮೂಲಕ ಪರೀಕ್ಷಿಸಿ' 
              : 'Interactive speech recognition & phonetic assessment tailored for rural learners'}
          </p>
        </div>
      </div>

      {/* Interactive Recording Card */}
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-stone-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {language === 'kn' ? 'ಇಂದಿನ ಓದುವಿಕೆ ಅಭ್ಯಾಸ (ಹಂತ ೧)' : "Today's Guided Practice"}
            </span>
            <div className="flex gap-1">
              {practiceSentences.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActivePracticeIndex(idx);
                    setAiScore(null);
                  }}
                  className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                    activePracticeIndex === idx
                      ? 'bg-emerald-700 text-white shadow'
                      : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="py-6 text-center">
            <span className="text-xs font-semibold text-slate-400 block mb-2">{currentSentence.focus}</span>
            <p className="text-2xl font-bold text-slate-900 font-serif leading-relaxed px-4">
              "{currentSentence.kn}"
            </p>
            <p className="text-xs text-slate-500 mt-2 italic font-sans">
              "{currentSentence.en}"
            </p>
          </div>

          <div className="flex flex-col items-center justify-center pt-2 pb-4">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                title="Start Recording"
              >
                <Mic className="w-7 h-7" />
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg animate-pulse"
                title="Stop Recording"
              >
                <div className="w-6 h-6 rounded-sm bg-white" />
              </button>
            )}

            <p className="text-xs font-semibold text-slate-600 mt-3">
              {isRecording 
                ? (language === 'kn' ? 'ಧ್ವನಿಮುದ್ರಣವಾಗುತ್ತಿದೆ... ಸ್ಪಷ್ಟವಾಗಿ ಓದಿ' : 'Recording audio... Read clearly')
                : (language === 'kn' ? 'ಮೈಕ್ ಒತ್ತಿ ಗಟ್ಟಿಯಾಗಿ ಓದಿ' : 'Tap microphone and read sentence aloud')}
            </p>
          </div>

          {/* AI Score Feedback */}
          {aiScore !== null && (
            <div className="mt-4 p-4 rounded-xl bg-white border border-emerald-300 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-slate-900">
                    {language === 'kn' ? 'AI ಧ್ವನಿ ಮೌಲ್ಯಮಾಪನ ವರದಿ' : 'AI Speech Evaluation Report'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
                  {language === 'kn' ? 'ಅಂಕ:' : 'Score:'} {aiScore}%
                </div>
              </div>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                {aiFeedback}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historical Student Audio Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಧ್ವನಿ ಮೌಲ್ಯಮಾಪನ ಇತಿಹಾಸ' : 'Recorded Student Voice Submissions'}</CardTitle>
          <CardDescription>
            {language === 'kn' 
              ? 'ಶಿಕ್ಷಕರು ಮತ್ತು ಪೋಷಕರು ಮಗುವಿನ ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಆಲಿಸಬಹುದು' 
              : 'Teachers and parents can listen to student reading submissions and teacher remarks'}
          </CardDescription>
        </CardHeader>
        <Table
          columns={[
            {
              key: 'student',
              header: language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ' : 'Student',
              render: v => (
                <div>
                  <p className="font-semibold text-xs text-slate-900">{v.studentName}</p>
                  <p className="text-[10px] text-slate-400">Class: 5th Grade</p>
                </div>
              )
            },
            {
              key: 'passage',
              header: language === 'kn' ? 'ಓದಿದ ವಾಕ್ಯ / ಕವನ' : 'Passage Title',
              render: v => (
                <span className="text-xs text-slate-700 font-medium">
                  {language === 'kn' ? v.titleKn : v.titleEn}
                </span>
              )
            },
            {
              key: 'score',
              header: language === 'kn' ? 'AI ಅಂಕ' : 'Score',
              render: v => (
                <Badge variant={v.scorePercentage >= 90 ? 'success' : 'warning'} size="sm">
                  {v.scorePercentage}%
                </Badge>
              )
            },
            {
              key: 'feedback',
              header: language === 'kn' ? 'ಸಲಹೆ ಮತ್ತು ಪ್ರಶಂಸೆ' : 'Feedback',
              render: v => (
                <span className="text-[11px] text-slate-600 line-clamp-1">
                  {v.pronunciationNotesKn}
                </span>
              )
            },
            {
              key: 'action',
              header: language === 'kn' ? 'ಆಲಿಸಿ' : 'Listen',
              render: v => (
                <Button 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<Play className="w-3 h-3 text-emerald-600" />}
                  onClick={() => alert(`Playing audio clip for ${v.studentName}`)}
                >
                  Play
                </Button>
              )
            }
          ]}
          data={assessments}
          keyExtractor={v => v.id}
        />
      </Card>
    </div>
  );
};

// ==========================================
// 4. SUPER ADMIN MANAGEMENT VIEWS
// ==========================================
export const AdminManagementView: React.FC<{ subTab: 'TEACHERS' | 'PARENTS' | 'CLASSES' | 'SETTINGS' }> = ({ subTab }) => {
  const { language } = useLanguage();
  const [teachers, setTeachers] = useState<TeacherProfile[]>(MOCK_TEACHERS);
  const [parents, setParents] = useState<ParentProfile[]>(MOCK_PARENTS);
  const [classes] = useState<SchoolClass[]>(MOCK_CLASSES);
  const [subjects] = useState(MOCK_SUBJECTS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Teacher / Parent Form states
  const [fullNameEn, setFullNameEn] = useState('');
  const [fullNameKn, setFullNameKn] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');

  const handleAddEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameEn.trim() && !fullNameKn.trim()) return;

    if (subTab === 'TEACHERS') {
      const newT: TeacherProfile = {
        id: `t-${Date.now()}`,
        userId: `u-t-${Date.now()}`,
        employeeCode: `GOV-T-0${teachers.length + 1}`,
        qualification: 'B.Ed, Kannada Vidwan',
        specialization: specialization || 'Kannada & Social Studies',
        joinedDate: '2026-06-01',
        user: {
          id: `u-${Date.now()}`,
          username: fullNameEn.toLowerCase().replace(/\s+/g, '.'),
          phoneNumber: phone || '9876543210',
          fullName: fullNameEn || fullNameKn,
          fullNameKn: fullNameKn || fullNameEn,
          role: 'TEACHER',
          preferredLanguage: 'kn',
          isActive: true,
          isPhoneVerified: true
        }
      };
      setTeachers([...teachers, newT]);
    } else if (subTab === 'PARENTS') {
      const newP: ParentProfile = {
        id: `p-${Date.now()}`,
        userId: `u-p-${Date.now()}`,
        relationship: 'Father',
        occupation: 'Agriculture / Farmer',
        villageName: 'Hosahalli',
        gramPanchayat: 'Hosahalli GP',
        taluk: 'Mandya',
        district: 'Mandya',
        preferredContact: 'VOICE_CALL',
        canReadKannada: true,
        user: {
          id: `u-p-${Date.now()}`,
          username: fullNameEn.toLowerCase().replace(/\s+/g, '.'),
          phoneNumber: phone || '9900000000',
          fullName: fullNameEn || fullNameKn,
          fullNameKn: fullNameKn || fullNameEn,
          role: 'PARENT',
          preferredLanguage: 'kn',
          isActive: true,
          isPhoneVerified: true
        },
        children: [MOCK_STUDENTS[0]]
      };
      setParents([...parents, newP]);
    }

    setIsAddOpen(false);
    setFullNameEn('');
    setFullNameKn('');
    setPhone('');
    setSpecialization('');
    setSuccessMsg(language === 'kn' ? 'ದಾಖಲೆ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!' : 'Record added successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {subTab === 'TEACHERS' ? (language === 'kn' ? 'ಶಿಕ್ಷಕರ ನಿರ್ವಹಣೆ' : 'Teacher Faculty Management') :
             subTab === 'PARENTS' ? (language === 'kn' ? 'ಪೋಷಕರ ದಾಖಲಾತಿ' : 'Parent Community Directory') :
             subTab === 'CLASSES' ? (language === 'kn' ? 'ತರಗತಿಗಳು ಮತ್ತು ವಿಷಯಗಳು' : 'Classes & Subject Curriculum') :
             (language === 'kn' ? 'ಶಾಲಾ ವ್ಯವಸ್ಥೆ ಸಂಯೋಜನೆಗಳು' : 'School System Settings')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'kn' 
              ? 'ಸರ್ಕಾರಿ ಮಾದರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಹೊಸಹಳ್ಳಿ - ಮುಖ್ಯಸ್ಥರ ಆಡಳಿತ ಮಂಡಳಿ' 
              : 'Official administrative master records, RBAC controls & school policies'}
          </p>
        </div>

        {subTab !== 'SETTINGS' && (
          <Button 
            variant="primary" 
            size="sm" 
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsAddOpen(true)}
          >
            {subTab === 'TEACHERS' ? (language === 'kn' ? 'ಹೊಸ ಶಿಕ್ಷಕರನ್ನು ಸೇರಿಸಿ' : 'Add Teacher') :
             subTab === 'PARENTS' ? (language === 'kn' ? 'ಹೊಸ ಪೋಷಕರನ್ನು ನೋಂದಾಯಿಸಿ' : 'Add Parent') :
             (language === 'kn' ? 'ಹೊಸ ತರಗತಿ ಸೇರಿಸಿ' : 'Add Class')}
          </Button>
        )}
      </div>

      {successMsg && (
        <Alert variant="success" title={successMsg} onDismiss={() => setSuccessMsg(null)}>
          {language === 'kn' ? 'ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ.' : 'Successfully saved.'}
        </Alert>
      )}

      {/* TEACHERS LIST */}
      {subTab === 'TEACHERS' && (
        <Card>
          <Table
            columns={[
              {
                key: 'code',
                header: 'Employee ID',
                render: t => <span className="font-mono text-xs text-slate-500">{t.employeeCode}</span>
              },
              {
                key: 'name',
                header: language === 'kn' ? 'ಶಿಕ್ಷಕರ ಹೆಸರು' : 'Teacher Name',
                render: t => (
                  <div>
                    <p className="font-semibold text-xs text-slate-900">{t.user.fullName}</p>
                    <p className="text-[11px] text-emerald-800">{t.user.fullNameKn}</p>
                  </div>
                )
              },
              {
                key: 'designation',
                header: language === 'kn' ? 'ಹುದ್ದೆ / ವಿದ್ಯಾರ್ಹತೆ' : 'Qualification',
                render: t => (
                  <span className="text-xs text-slate-600">
                    {t.qualification}
                  </span>
                )
              },
              {
                key: 'specialization',
                header: language === 'kn' ? 'ವಿಶೇಷತೆ' : 'Specialization',
                render: t => <span className="text-xs font-medium text-slate-700">{t.specialization}</span>
              },
              {
                key: 'phone',
                header: language === 'kn' ? 'ಸಂಪರ್ಕ ದೂರವಾಣಿ' : 'Phone Number',
                render: t => <span className="text-xs text-slate-500">{t.user.phoneNumber}</span>
              }
            ]}
            data={teachers}
            keyExtractor={t => t.id}
          />
        </Card>
      )}

      {/* PARENTS LIST */}
      {subTab === 'PARENTS' && (
        <Card>
          <Table
            columns={[
              {
                key: 'name',
                header: language === 'kn' ? 'ಪೋಷಕರ ಹೆಸರು' : 'Parent Name',
                render: p => (
                  <div>
                    <p className="font-semibold text-xs text-slate-900">{p.user.fullName}</p>
                    <p className="text-[11px] text-emerald-800">{p.user.fullNameKn}</p>
                  </div>
                )
              },
              {
                key: 'phone',
                header: 'Phone / SMS',
                render: p => (
                  <span className="text-xs font-mono text-slate-600">{p.user.phoneNumber}</span>
                )
              },
              {
                key: 'village',
                header: language === 'kn' ? 'ಗ್ರಾಮ' : 'Village',
                render: p => <span className="text-xs text-slate-600">{p.villageName}</span>
              },
              {
                key: 'children',
                header: language === 'kn' ? 'ಸಂಬಂಧಿತ ವಿದ್ಯಾರ್ಥಿ' : 'Linked Child',
                render: p => (
                  <span className="text-xs font-semibold text-emerald-800">
                    {p.children.map(c => `${c.firstName} ${c.lastName}`).join(', ')}
                  </span>
                )
              },
              {
                key: 'pref',
                header: language === 'kn' ? 'ಸಂವಹನ ಮಾದರಿ' : 'Channel Preference',
                render: p => (
                  <Badge variant="info" size="sm">
                    {p.preferredContact === 'VOICE_CALL' ? 'Voice Call & SMS' : 'SMS Only'}
                  </Badge>
                )
              }
            ]}
            data={parents}
            keyExtractor={p => p.id}
          />
        </Card>
      )}

      {/* CLASSES & SUBJECTS */}
      {subTab === 'CLASSES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'kn' ? 'ತರಗತಿಗಳ ಪಟ್ಟಿ' : 'School Classes (Grade 1 - 7)'}</CardTitle>
              <CardDescription>Karnataka State Syllabus & Nali-Kali Structure</CardDescription>
            </CardHeader>
            <Table
              columns={[
                {
                  key: 'name',
                  header: 'Class',
                  render: c => (
                    <div>
                      <p className="font-semibold text-xs text-slate-900">Grade {c.gradeLevel} - {c.section}</p>
                      <p className="text-[10px] text-slate-400">{c.roomNumber}</p>
                    </div>
                  )
                },
                {
                  key: 'naliKali',
                  header: 'Nali-Kali Flag',
                  render: c => (
                    <Badge variant={c.isNaliKali ? 'success' : 'neutral'} size="sm">
                      {c.isNaliKali ? 'Nali-Kali Active' : 'Higher Primary'}
                    </Badge>
                  )
                },
                {
                  key: 'capacity',
                  header: 'Students',
                  render: c => <span className="text-xs font-bold text-slate-700">{c.studentCount}</span>
                }
              ]}
              data={classes}
              keyExtractor={c => c.id}
            />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'kn' ? 'ವಿಷಯಗಳು ಮತ್ತು ಪಠ್ಯಕ್ರಮ' : 'Curriculum Subjects'}</CardTitle>
              <CardDescription>Standardized codes and bilingual credits</CardDescription>
            </CardHeader>
            <Table
              columns={[
                {
                  key: 'code',
                  header: 'Code',
                  render: s => <span className="font-mono text-xs text-slate-500">{s.code}</span>
                },
                {
                  key: 'name',
                  header: 'Subject',
                  render: s => (
                    <div>
                      <p className="font-semibold text-xs text-slate-900">{s.nameEn}</p>
                      <p className="text-[11px] text-emerald-800">{s.nameKn}</p>
                    </div>
                  )
                },
                {
                  key: 'grade',
                  header: 'Grade',
                  render: s => <span className="text-xs text-slate-600">Grade {s.gradeLevel}</span>
                }
              ]}
              data={subjects}
              keyExtractor={s => s.id}
            />
          </Card>
        </div>
      )}

      {/* SYSTEM SETTINGS */}
      {subTab === 'SETTINGS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'kn' ? 'ಶಾಲಾ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಸಂಯೋಜನೆಗಳು' : 'School Profile & Configuration'}</CardTitle>
              <CardDescription>Official DISE Code & General Details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block">School DISE Code</label>
                <p className="text-sm font-bold text-slate-900 mt-0.5">29220405201 (Karnataka)</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block">School Name (English)</label>
                <p className="text-sm font-bold text-slate-900 mt-0.5">Govt. Model Higher Primary School, Hosahalli</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block">School Name (Kannada)</label>
                <p className="text-sm font-bold text-slate-900 mt-0.5">ಸರ್ಕಾರಿ ಮಾದರಿ ಹಿರಿಯ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಹೊಸಹಳ್ಳಿ</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block">Education District</label>
                <p className="text-sm font-bold text-slate-900 mt-0.5">Mandya South Block, Karnataka</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'kn' ? 'ಸುರಕ್ಷತೆ ಮತ್ತು ಪ್ರವೇಶ ನಿಯಂತ್ರಣ' : 'Security & RBAC Controls'}</CardTitle>
              <CardDescription>Role-based session and cryptographic policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Role-Based Access Isolation (Active)
                </span>
                <p className="text-xs text-emerald-800 mt-1">
                  Parents are restricted to linked children records. Students can only see their own assessments and results.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-xs font-bold text-slate-800 block">Password Storage</span>
                <p className="text-xs text-slate-600 mt-1">
                  Bcrypt 12-round salted hashing algorithm configured on PostgreSQL backend.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-xs font-bold text-slate-800 block">Offline Village Sync</span>
                <p className="text-xs text-slate-600 mt-1">
                  IndexedDB client caching enabled for low-connectivity rural mobile network resilience.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Entity Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={subTab === 'TEACHERS' ? (language === 'kn' ? 'ಹೊಸ ಶಿಕ್ಷಕರನ್ನು ನೋಂದಾಯಿಸಿ' : 'Register New Teacher') :
               (language === 'kn' ? 'ಹೊಸ ಪೋಷಕರನ್ನು ನೋಂದಾಯಿಸಿ' : 'Register New Parent')}
      >
        <form onSubmit={handleAddEntity} className="space-y-4">
          <Input 
            label={language === 'kn' ? 'ಪೂರ್ಣ ಹೆಸರು (ಇಂಗ್ಲಿಷ್)' : 'Full Name (English)'}
            placeholder="e.g. Smt. Suma K."
            value={fullNameEn}
            onChange={e => setFullNameEn(e.target.value)}
            required
          />
          <Input 
            label={language === 'kn' ? 'ಪೂರ್ಣ ಹೆಸರು (ಕನ್ನಡ)' : 'Full Name (Kannada)'}
            placeholder="ಉದಾ: ಶ್ರೀಮತಿ ಸುಮಾ ಕೆ."
            value={fullNameKn}
            onChange={e => setFullNameKn(e.target.value)}
          />
          <Input 
            label={language === 'kn' ? 'ದೂರವಾಣಿ ಸಂಖ್ಯೆ (SMS ಗಾಗಿ)' : 'Phone Number (for SMS & Voice Alerts)'}
            placeholder="98XXXXXXXX"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
          {subTab === 'TEACHERS' && (
            <Input 
              label={language === 'kn' ? 'ಬೋಧನಾ ವಿಷಯ / ವಿಶೇಷತೆ' : 'Teaching Subject / Specialization'}
              placeholder="e.g. Science & Environmental Studies"
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
            />
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddOpen(false)}>
              {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {language === 'kn' ? 'ಉಳಿಸಿ' : 'Save Record'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
