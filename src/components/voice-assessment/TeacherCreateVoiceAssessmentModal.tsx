import React, { useState } from 'react';
import { Mic, Clock, Sparkles, BookOpen, CheckCircle2, Volume2, Plus } from 'lucide-react';
import { Modal } from '../../design-system/Modal';
import { Input } from '../../design-system/Input';
import { Button } from '../../design-system/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import { voiceAssessmentService, VoiceAssessment, VoiceResponseType } from '../../services/voiceAssessmentService';

interface TeacherCreateVoiceAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (assessment: VoiceAssessment) => void;
}

export const TeacherCreateVoiceAssessmentModal: React.FC<TeacherCreateVoiceAssessmentModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { language } = useLanguage();

  const [titleEn, setTitleEn] = useState('');
  const [titleKn, setTitleKn] = useState('');
  const [subjectCode, setSubjectCode] = useState('KAN-05');
  const [gradeLevel, setGradeLevel] = useState(5);
  const [promptTextKn, setPromptTextKn] = useState('');
  const [promptTextEn, setPromptTextEn] = useState('');
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(60);
  const [responseType, setResponseType] = useState<VoiceResponseType>('READING_ALOUD');
  const [totalMarks, setTotalMarks] = useState(25);
  const [langPreference, setLangPreference] = useState<'kn' | 'en' | 'bilingual'>('kn');

  const subjectNames: Record<string, string> = {
    'KAN-05': 'Kannada Language (ಕನ್ನಡ)',
    'ENG-05': 'English (ಇಂಗ್ಲಿಷ್)',
    'EVS-05': 'Environmental Studies (ಪರಿಸರ)',
    'MAT-05': 'Mathematics (ಗಣಿತ)',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() && !titleKn.trim()) return;
    if (!promptTextKn.trim() && !promptTextEn.trim()) return;

    const created = voiceAssessmentService.createAssessment({
      titleEn: titleEn || titleKn,
      titleKn: titleKn || titleEn,
      subjectCode,
      subjectName: subjectNames[subjectCode] || 'Kannada',
      gradeLevel,
      className: `Grade ${gradeLevel}-A`,
      promptTextEn: promptTextEn || promptTextKn,
      promptTextKn: promptTextKn || promptTextEn,
      language: langPreference,
      timeLimitSeconds,
      expectedResponseType: responseType,
      isPublished: true,
      teacherName: 'Smt. Savitri Hegde',
      totalMarks,
    });

    onCreated(created);
    onClose();

    // Reset fields
    setTitleEn('');
    setTitleKn('');
    setPromptTextEn('');
    setPromptTextKn('');
  };

  // Quick Preset Samples for Rural Schools
  const applyPreset = (preset: 'KUVEMPU' | 'ENGLISH_READ' | 'VILLAGE_EVS') => {
    if (preset === 'KUVEMPU') {
      setTitleEn('Kuvempu Poetry Recitation & Phonetics');
      setTitleKn('ಕುವೆಂಪು ಮಕ್ಕಳ ಕವನ ವಾಚನ ಮತ್ತು ಉಚ್ಚಾರಣೆ');
      setSubjectCode('KAN-05');
      setGradeLevel(5);
      setResponseType('READING_ALOUD');
      setLangPreference('kn');
      setTimeLimitSeconds(60);
      setPromptTextKn('ನಮ್ಮ ಶಾಲೆ ಹಸಿರು ಪರಿಸರದಲ್ಲಿದೆ. ಮುಂಜಾನೆ ತಂಗಾಳಿ ಬೀಸುವಾಗ ನಾವು ಶಾಲೆಯ ಮೈದಾನದಲ್ಲಿ ಒಟ್ಟಾಗಿ ಪ್ರಾರ್ಥನೆ ಮಾಡುತ್ತೇವೆ.');
      setPromptTextEn('Our school is surrounded by green nature. In the fresh morning breeze, we gather in the school courtyard to recite our prayer together.');
    } else if (preset === 'ENGLISH_READ') {
      setTitleEn('English Oral Story Reading & Clarity');
      setTitleKn('ಇಂಗ್ಲಿಷ್ ಕಥಾ ವಾಚನ ಮತ್ತು ಸ್ಪಷ್ಟತೆ');
      setSubjectCode('ENG-05');
      setGradeLevel(5);
      setResponseType('READING_ALOUD');
      setLangPreference('en');
      setTimeLimitSeconds(45);
      setPromptTextEn('Once upon a time, there was a little bird in the village banyan tree. Every morning she sang a joyful tune.');
      setPromptTextKn('ಹಳ್ಳಿಯ ಆಲದ ಮರದಲ್ಲಿ ಒಂದು ಪುಟ್ಟ ಹಕ್ಕಿಯಿತ್ತು. ಪ್ರತಿ ಮುಂಜಾನೆ ಅದು ಮಧುರವಾಗಿ ಹಾಡುತ್ತಿತ್ತು.');
    } else if (preset === 'VILLAGE_EVS') {
      setTitleEn('Environmental Science: Clean Drinking Water');
      setTitleKn('ಪರಿಸರ ಅಧ್ಯಯನ: ಶುದ್ಧ ಕುಡಿಯುವ ನೀರು ಮತ್ತು ನೈರ್ಮಲ್ಯ');
      setSubjectCode('EVS-05');
      setGradeLevel(5);
      setResponseType('FREE_SPEAKING');
      setLangPreference('bilingual');
      setTimeLimitSeconds(90);
      setPromptTextKn('ನಮ್ಮ ಗ್ರಾಮದ ಶುದ್ಧ ಕುಡಿಯುವ ನೀರಿನ ಘಟಕ ಮತ್ತು ಕೆರೆ ಸಂರಕ್ಷಣೆಯ ಮಹತ್ವದ ಬಗ್ಗೆ ನಿಮ್ಮ ಸ್ವಂತ ಮಾತುಗಳಲ್ಲಿ ವಿವರಿಸಿ.');
      setPromptTextEn('Explain in your own words the importance of clean drinking water and protecting our village water bodies.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'kn' ? 'ಹೊಸ ಧ್ವನಿ ಮೌಲ್ಯಮಾಪನ ರಚಿಸಿ' : 'Create Voice & Pronunciation Assessment'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Sample Presets */}
        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-900 block mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            {language === 'kn' ? 'ಸಿದ್ಧ ಮಾದರಿಗಳು (ತ್ವರಿತ ಭರ್ತಿ):' : 'Quick Rural Curriculum Presets:'}
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('KUVEMPU')}
              className="text-xs px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-semibold cursor-pointer"
            >
              📖 ಕನ್ನಡ ಕುವೆಂಪು ವಾಚನ
            </button>
            <button
              type="button"
              onClick={() => applyPreset('ENGLISH_READ')}
              className="text-xs px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-semibold cursor-pointer"
            >
              🗣️ English Phonics Passage
            </button>
            <button
              type="button"
              onClick={() => applyPreset('VILLAGE_EVS')}
              className="text-xs px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-semibold cursor-pointer"
            >
              🌿 ಗ್ರಾಮ ಪರಿಸರ ಮುಕ್ತ ಮಾತು
            </button>
          </div>
        </div>

        {/* Title Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={language === 'kn' ? 'ಪರೀಕ್ಷೆಯ ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)' : 'Assessment Title (Kannada)'}
            placeholder="ಉದಾ: ಕುವೆಂಪು ಮಕ್ಕಳ ಕವನ ವಾಚನ"
            value={titleKn}
            onChange={e => setTitleKn(e.target.value)}
            required
          />
          <Input
            label={language === 'kn' ? 'ಪರೀಕ್ಷೆಯ ಶೀರ್ಷಿಕೆ (English)' : 'Assessment Title (English)'}
            placeholder="e.g. Kuvempu Poetry Recitation"
            value={titleEn}
            onChange={e => setTitleEn(e.target.value)}
          />
        </div>

        {/* Subject, Grade, Language */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {language === 'kn' ? 'ವಿಷಯ (Subject)' : 'Subject'}
            </label>
            <select
              value={subjectCode}
              onChange={e => setSubjectCode(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="KAN-05">Kannada (ಕನ್ನಡ)</option>
              <option value="ENG-05">English (ಇಂಗ್ಲಿಷ್)</option>
              <option value="EVS-05">Environmental Studies (ಪರಿಸರ)</option>
              <option value="MAT-05">Mathematics (ಗಣಿತ)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {language === 'kn' ? 'ತರಗತಿ (Class)' : 'Class'}
            </label>
            <select
              value={gradeLevel}
              onChange={e => setGradeLevel(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(g => (
                <option key={g} value={g}>Grade {g} (ತರಗತಿ {g})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {language === 'kn' ? 'ಮಾಧ್ಯಮ ಭಾಷೆ (Language)' : 'Language Format'}
            </label>
            <select
              value={langPreference}
              onChange={e => setLangPreference(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="en">English</option>
              <option value="bilingual">ದ್ವಿಭಾಷಾ (Bilingual)</option>
            </select>
          </div>
        </div>

        {/* Expected Response Type & Time Limit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {language === 'kn' ? 'ಪ್ರತಿಕ್ರಿಯೆಯ ಮಾದರಿ' : 'Expected Response Type'}
            </label>
            <select
              value={responseType}
              onChange={e => setResponseType(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
            >
              <option value="READING_ALOUD">📖 Reading Aloud (ಗಟ್ಟಿಯಾಗಿ ಓದುವುದು)</option>
              <option value="FREE_SPEAKING">🗣️ Free Speaking (ಸ್ವಂತ ಮಾತುಗಾರಿಕೆ)</option>
              <option value="QUESTION_ANSWER">❓ Question & Answer (ಪ್ರಶ್ನೋತ್ತರ)</option>
              <option value="WORD_PRONUNCIATION">🎯 Word Pronunciation (ಪದ ಉಚ್ಚಾರಣೆ)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {language === 'kn' ? 'ಸಮಯ ಮಿತಿ (Time Limit)' : 'Recording Time Limit'}
            </label>
            <select
              value={timeLimitSeconds}
              onChange={e => setTimeLimitSeconds(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value={30}>30 Seconds (ಸಂಕ್ಷಿಪ್ತ)</option>
              <option value={45}>45 Seconds</option>
              <option value={60}>60 Seconds (1 Minute)</option>
              <option value={90}>90 Seconds (1.5 Mins)</option>
              <option value={120}>120 Seconds (2 Minutes)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {language === 'kn' ? 'ಗರಿಷ್ಠ ಅಂಕ (Marks)' : 'Total Marks'}
            </label>
            <input
              type="number"
              min={5}
              max={100}
              value={totalMarks}
              onChange={e => setTotalMarks(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Prompt / Question Text in Kannada */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            {language === 'kn' ? 'ಪ್ರಶ್ನೆ / ಓದುವ ಪಠ್ಯ (ಕನ್ನಡದಲ್ಲಿ)' : 'Question / Reading Passage (Kannada)'}
          </label>
          <textarea
            rows={3}
            value={promptTextKn}
            onChange={e => setPromptTextKn(e.target.value)}
            placeholder="ವಿದ್ಯಾರ್ಥಿಯು ಮೈಕ್ರೋಫೋನ್‌ನಲ್ಲಿ ಓದಬೇಕಾದ ಅಥವಾ ಉತ್ತರಿಸಬೇಕಾದ ಪಠ್ಯ..."
            className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed font-sans"
            required
          />
        </div>

        {/* Prompt / Question Text in English */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            {language === 'kn' ? 'ಪ್ರಶ್ನೆ / ಪಠ್ಯ (ಇಂಗ್ಲಿಷ್ ವಿವರಣೆ)' : 'Question / Reading Passage (English)'}
          </label>
          <textarea
            rows={2}
            value={promptTextEn}
            onChange={e => setPromptTextEn(e.target.value)}
            placeholder="Reading prompt or question explanation in English..."
            className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed font-sans"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            {language === 'kn' ? 'ಪ್ರಕಟಿಸಿದ ತಕ್ಷಣ ವಿದ್ಯಾರ್ಥಿ & ಪೋಷಕರಿಗೆ ನೋಟಿಫಿಕೇಶನ್ ತಲುಪುತ್ತದೆ.' : 'Publishing sends immediate alert to students & parents.'}
          </p>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
            >
              {language === 'kn' ? 'ಧ್ವನಿ ಪರೀಕ್ಷೆ ಪ್ರಕಟಿಸಿ' : 'Publish Assessment'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
