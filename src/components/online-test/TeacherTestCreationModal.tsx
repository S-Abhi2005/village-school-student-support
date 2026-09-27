import React, { useState } from 'react';
import { Modal } from '../../design-system/Modal';
import { Button } from '../../design-system/Button';
import { Input } from '../../design-system/Input';
import { Badge } from '../../design-system/Badge';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  OnlineTest, 
  TestQuestion, 
  QuestionType, 
  onlineTestService 
} from '../../services/onlineTestService';
import { MOCK_CLASSES, MOCK_SUBJECTS } from '../../mock/schoolData';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Award, 
  HelpCircle, 
  Shuffle, 
  Calendar, 
  Layers, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface TeacherTestCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestCreated: (test: OnlineTest) => void;
}

export const TeacherTestCreationModal: React.FC<TeacherTestCreationModalProps> = ({
  isOpen,
  onClose,
  onTestCreated,
}) => {
  const { language } = useLanguage();

  // Test setup form states
  const [titleKn, setTitleKn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(MOCK_CLASSES[0].id);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(MOCK_SUBJECTS[0].code);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
  );
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);

  // Questions builder list
  const [questions, setQuestions] = useState<TestQuestion[]>([
    {
      id: `q-${Date.now()}-1`,
      type: 'MULTIPLE_CHOICE',
      questionTextKn: 'ಕನ್ನಡ ಸಾಹಿತ್ಯದಲ್ಲಿ ಮೊದಲ ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ ಪಡೆದ ಕೃತಿಕಾರರು ಯಾರು?',
      questionTextEn: 'Who is the author to receive the first Jnanpith Award in Kannada?',
      options: [
        { id: 'opt-1', textKn: 'ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು', textEn: 'Rashtrakavi Kuvempu' },
        { id: 'opt-2', textKn: 'ದ. ರಾ. ಬೇಂದ್ರೆ', textEn: 'D. R. Bendre' },
        { id: 'opt-3', textKn: 'ಶಿವರಾಮ ಕಾರಂತ', textEn: 'Shivaram Karanth' },
        { id: 'opt-4', textKn: 'ಮಾಸ್ತಿ ವೆಂಕಟೇಶ ಅಯ್ಯಂಗಾರ್', textEn: 'Masti Venkatesha' },
      ],
      correctOptionId: 'opt-1',
      marks: 5,
    },
    {
      id: `q-${Date.now()}-2`,
      type: 'DESCRIPTIVE',
      questionTextKn: 'ಕನ್ನಡ ವ್ಯಾಕರಣದ "ಸಂಧಿ" ಎಂದರೇನು? ಒಂದು ಉದಾಹರಣೆ ನೀಡಿ.',
      questionTextEn: 'What is "Sandhi" in Kannada grammar? Provide one example.',
      marks: 10,
      sampleAnswerKn: 'ಎರಡು ಅಕ್ಷರಗಳು ಕಾಲವಿಳಂಬವಿಲ್ಲದೆ ಸೇರುವುದೇ ಸಂಧಿ. ಉದಾ: ಮರ + ಅನ್ನು = ಮರವನ್ನು (ಆಗಮ ಸಂಧಿ).',
      sampleAnswerEn: 'Sandhi is the joining of two sounds/words without pause. Example: Mara + Annu = Maravannu.',
    },
  ]);

  // New question draft modal/section
  const [newQType, setNewQType] = useState<QuestionType>('MULTIPLE_CHOICE');
  const [newQTextKn, setNewQTextKn] = useState('');
  const [newQTextEn, setNewQTextEn] = useState('');
  const [newQMarks, setNewQMarks] = useState(5);
  const [newQSampleAnswerKn, setNewQSampleAnswerKn] = useState('');

  // Options draft for MCQs
  const [optionsDraft, setOptionsDraft] = useState([
    { textKn: 'ಆಯ್ಕೆ ೧', textEn: 'Option 1' },
    { textKn: 'ಆಯ್ಕೆ ೨', textEn: 'Option 2' },
    { textKn: 'ಆಯ್ಕೆ ೩', textEn: 'Option 3' },
    { textKn: 'ಆಯ್ಕೆ ೪', textEn: 'Option 4' },
  ]);
  const [selectedCorrectOptionIdx, setSelectedCorrectOptionIdx] = useState(0);

  const [formError, setFormError] = useState<string | null>(null);

  // Calculate total marks
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const passingMarks = Math.max(1, Math.round(totalMarks * 0.4));

  const handleAddQuestion = () => {
    if (!newQTextKn.trim() && !newQTextEn.trim()) {
      setFormError(language === 'kn' ? 'ದಯವಿಟ್ಟು ಪ್ರಶ್ನೆಯನ್ನು ನಮೂದಿಸಿ.' : 'Please enter the question text.');
      return;
    }

    const newQuestionId = `q-${Date.now()}`;
    let createdQ: TestQuestion;

    if (newQType === 'MULTIPLE_CHOICE') {
      const generatedOptions = optionsDraft.map((opt, i) => ({
        id: `opt-${i + 1}`,
        textKn: opt.textKn.trim() || `ಆಯ್ಕೆ ${i + 1}`,
        textEn: opt.textEn.trim() || `Option ${i + 1}`,
      }));

      createdQ = {
        id: newQuestionId,
        type: 'MULTIPLE_CHOICE',
        questionTextKn: newQTextKn || newQTextEn,
        questionTextEn: newQTextEn || newQTextKn,
        options: generatedOptions,
        correctOptionId: `opt-${selectedCorrectOptionIdx + 1}`,
        marks: newQMarks,
      };
    } else {
      createdQ = {
        id: newQuestionId,
        type: 'DESCRIPTIVE',
        questionTextKn: newQTextKn || newQTextEn,
        questionTextEn: newQTextEn || newQTextKn,
        marks: newQMarks,
        sampleAnswerKn: newQSampleAnswerKn,
        sampleAnswerEn: newQSampleAnswerKn,
      };
    }

    setQuestions(prev => [...prev, createdQ]);
    // Reset draft fields
    setNewQTextKn('');
    setNewQTextEn('');
    setNewQSampleAnswerKn('');
    setFormError(null);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleCreateTest = (publishImmediately: boolean) => {
    if (!titleKn.trim() && !titleEn.trim()) {
      setFormError(language === 'kn' ? 'ದಯವಿಟ್ಟು ಪರೀಕ್ಷೆಯ ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ.' : 'Please provide a test title.');
      return;
    }

    if (questions.length === 0) {
      setFormError(language === 'kn' ? 'ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ಪ್ರಶ್ನೆಯನ್ನು ಸೇರಿಸಿ.' : 'Please add at least one question.');
      return;
    }

    const targetClass = MOCK_CLASSES.find(c => c.id === selectedClassId) || MOCK_CLASSES[0];
    const targetSubject = MOCK_SUBJECTS.find(s => s.code === selectedSubjectCode) || MOCK_SUBJECTS[0];

    const newTest = onlineTestService.createTest({
      titleEn: titleEn || titleKn,
      titleKn: titleKn || titleEn,
      classId: targetClass.id,
      className: `Grade ${targetClass.gradeLevel}-${targetClass.section}`,
      subjectCode: targetSubject.code,
      subjectName: targetSubject.nameEn,
      gradeLevel: targetClass.gradeLevel,
      totalMarks,
      passingMarks,
      durationMinutes,
      startTime,
      endTime,
      isPublished: publishImmediately,
      resultsPublished: false,
      randomizeQuestions,
      questions,
      createdBy: 'Smt. Savitri Hegde',
    });

    onTestCreated(newTest);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'kn' ? 'ಹೊಸ ಆನ್‌ಲೈನ್ ಪರೀಕ್ಷೆ ರಚನೆ' : 'Create Online Examination'}
      maxWidth="xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        {/* 1. Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'kn' ? 'ಪರೀಕ್ಷೆಯ ಶೀರ್ಷಿಕೆ (ಕನ್ನಡ)' : 'Test Title (Kannada)'}
            </label>
            <Input
              placeholder="ಉದಾ: ೫ ನೇ ತರಗತಿ ಕನ್ನಡ ಘಟಕ ಪರೀಕ್ಷೆ - ೨"
              value={titleKn}
              onChange={e => setTitleKn(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'kn' ? 'ಪರೀಕ್ಷೆಯ ಶೀರ್ಷಿಕೆ (ಇಂಗ್ಲಿಷ್)' : 'Test Title (English)'}
            </label>
            <Input
              placeholder="e.g., Grade 5 Kannada Unit Assessment 2"
              value={titleEn}
              onChange={e => setTitleEn(e.target.value)}
            />
          </div>
        </div>

        {/* 2. Class, Subject, Duration & Passing Marks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {language === 'kn' ? 'ತರಗತಿ ಆಯ್ಕೆ' : 'Select Class'}
            </label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-600"
            >
              {MOCK_CLASSES.map(c => (
                <option key={c.id} value={c.id}>
                  Grade {c.gradeLevel}-{c.section} ({c.roomNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {language === 'kn' ? 'ವಿಷಯ ಆಯ್ಕೆ' : 'Select Subject'}
            </label>
            <select
              value={selectedSubjectCode}
              onChange={e => setSelectedSubjectCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-600"
            >
              {MOCK_SUBJECTS.map(s => (
                <option key={s.id} value={s.code}>
                  {s.code} - {language === 'kn' ? s.nameKn : s.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {language === 'kn' ? 'ಅವಧಿ (ನಿಮಿಷ)' : 'Duration (Mins)'}
            </label>
            <input
              type="number"
              min="10"
              max="180"
              value={durationMinutes}
              onChange={e => setDurationMinutes(parseInt(e.target.value) || 30)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {language === 'kn' ? 'ಒಟ್ಟು ಅಂಕಗಳು' : 'Total Marks'}
            </label>
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 font-extrabold text-amber-900 text-center">
              {totalMarks} Marks (Pass: {passingMarks})
            </div>
          </div>
        </div>

        {/* 3. Schedule Dates & Randomization */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {language === 'kn' ? 'ಪ್ರಾರಂಭ ಸಮಯ' : 'Start Date & Time'}
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {language === 'kn' ? 'ಮುಕ್ತಾಯ ಸಮಯ' : 'End Date & Time'}
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="randCheck"
              checked={randomizeQuestions}
              onChange={e => setRandomizeQuestions(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded cursor-pointer"
            />
            <label htmlFor="randCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
              {language === 'kn' ? 'ಪ್ರಶ್ನೆಗಳ ಯಾದೃಚ್ಛಿಕೀಕರಣ (Randomize)' : 'Question Randomization'}
            </label>
          </div>
        </div>

        {/* 4. Questions List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-700" />
              <span>{language === 'kn' ? 'ಪ್ರಶ್ನೆಗಳ ಪಟ್ಟಿ' : 'Questions List'} ({questions.length})</span>
            </h4>
            <span className="text-xs text-slate-500 font-semibold">
              Total Calculated: {totalMarks} Marks
            </span>
          </div>

          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 relative group hover:border-amber-400 transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <Badge variant={q.type === 'MULTIPLE_CHOICE' ? 'info' : 'warning'} size="sm">
                    {q.type === 'MULTIPLE_CHOICE' ? 'MCQ (ಬಹುವಾಯ್ಕೆ)' : 'Descriptive (ವಿವರಣಾತ್ಮಕ)'}
                  </Badge>
                  <span className="text-xs font-bold text-slate-700">{q.marks} Marks</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(q.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Remove question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h5 className="font-bold text-xs text-slate-900 leading-snug">
                {language === 'kn' ? q.questionTextKn : q.questionTextEn}
              </h5>

              {q.type === 'MULTIPLE_CHOICE' && q.options && (
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  {q.options.map(opt => (
                    <div
                      key={opt.id}
                      className={`p-2 rounded-xl border text-[11px] flex items-center justify-between ${
                        opt.id === q.correctOptionId
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{language === 'kn' ? opt.textKn : opt.textEn}</span>
                      {opt.id === q.correctOptionId && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'DESCRIPTIVE' && q.sampleAnswerKn && (
                <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl">
                  {language === 'kn' ? `ಮಾದರಿ ಉತ್ತರ: ${q.sampleAnswerKn}` : `Sample: ${q.sampleAnswerEn}`}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* 5. Add New Question Form */}
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-700" />
              <span>{language === 'kn' ? 'ಹೊಸ ಪ್ರಶ್ನೆ ಸೇರಿಸಿ' : 'Add New Question'}</span>
            </h5>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-300 text-xs">
              <button
                type="button"
                onClick={() => setNewQType('MULTIPLE_CHOICE')}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  newQType === 'MULTIPLE_CHOICE' ? 'bg-amber-500 text-slate-950' : 'text-slate-600'
                }`}
              >
                MCQ
              </button>
              <button
                type="button"
                onClick={() => setNewQType('DESCRIPTIVE')}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  newQType === 'DESCRIPTIVE' ? 'bg-amber-500 text-slate-950' : 'text-slate-600'
                }`}
              >
                {language === 'kn' ? 'ವಿವರಣಾತ್ಮಕ' : 'Descriptive'}
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <Input
              placeholder={language === 'kn' ? 'ಪ್ರಶ್ನೆ ಬರೆಯಿರಿ (ಕನ್ನಡ)...' : 'Question in Kannada...'}
              value={newQTextKn}
              onChange={e => setNewQTextKn(e.target.value)}
            />
            <Input
              placeholder={language === 'kn' ? 'ಪ್ರಶ್ನೆ ಬರೆಯಿರಿ (ಇಂಗ್ಲಿಷ್)...' : 'Question in English...'}
              value={newQTextEn}
              onChange={e => setNewQTextEn(e.target.value)}
            />

            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">{language === 'kn' ? 'ಅಂಕ:' : 'Marks:'}</span>
              <input
                type="number"
                min="1"
                max="25"
                value={newQMarks}
                onChange={e => setNewQMarks(parseInt(e.target.value) || 5)}
                className="w-20 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
              />
            </div>

            {/* MCQ Options */}
            {newQType === 'MULTIPLE_CHOICE' && (
              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-700 block">
                  {language === 'kn' ? '೪ ಆಯ್ಕೆಗಳನ್ನು ನಮೂದಿಸಿ ಹಾಗೂ ಸರಿಯಾದ ಉತ್ತರ ಗುರುತಿಸಿ:' : 'Enter 4 options & mark correct choice:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {optionsDraft.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="correctOptRadio"
                        checked={selectedCorrectOptionIdx === optIdx}
                        onChange={() => setSelectedCorrectOptionIdx(optIdx)}
                        className="w-4 h-4 text-emerald-600 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        placeholder={`Option ${optIdx + 1}`}
                        value={opt.textKn}
                        onChange={e => {
                          const updated = [...optionsDraft];
                          updated[optIdx].textKn = e.target.value;
                          updated[optIdx].textEn = e.target.value;
                          setOptionsDraft(updated);
                        }}
                        className="flex-1 bg-transparent text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Descriptive Guide */}
            {newQType === 'DESCRIPTIVE' && (
              <div className="pt-2">
                <Input
                  placeholder={language === 'kn' ? 'ಮಾದರಿ ಉತ್ತರ ಮಾರ್ಗದರ್ಶಿ (Sample Answer Guide)...' : 'Sample answer guide for grading...'}
                  value={newQSampleAnswerKn}
                  onChange={e => setNewQSampleAnswerKn(e.target.value)}
                />
              </div>
            )}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddQuestion}
              className="mt-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              {language === 'kn' ? 'ಈ ಪ್ರಶ್ನೆಯನ್ನು ಸೇರಿಸಿ' : 'Add This Question'}
            </Button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <Button variant="outline" size="md" onClick={onClose} className="font-bold">
            {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => handleCreateTest(false)}
              className="font-bold"
            >
              {language === 'kn' ? 'ಕರಡು ಉಳಿಸಿ (Save Draft)' : 'Save as Draft'}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => handleCreateTest(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {language === 'kn' ? 'ಪರೀಕ್ಷೆ ಪ್ರಕಟಿಸಿ (Publish Test)' : 'Publish Test'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
