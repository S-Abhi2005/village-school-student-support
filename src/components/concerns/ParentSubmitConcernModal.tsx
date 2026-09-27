import React, { useState } from 'react';
import { Modal } from '../../design-system/Modal';
import { Button } from '../../design-system/Button';
import { Input } from '../../design-system/Input';
import { Badge } from '../../design-system/Badge';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { StudentProfile, ConcernCategory, ConcernPriority } from '../../types';
import { concernService, CONCERN_CATEGORIES } from '../../services/concernService';
import { 
  Send, 
  HelpCircle, 
  AlertCircle, 
  BookOpen, 
  Smartphone, 
  Tv, 
  FileText, 
  CalendarCheck, 
  HeartHandshake, 
  School, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface ParentSubmitConcernModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: StudentProfile[];
  initialSelectedChildId?: string;
  onConcernSubmitted?: (toastMsg: string) => void;
}

export const ParentSubmitConcernModal: React.FC<ParentSubmitConcernModalProps> = ({
  isOpen,
  onClose,
  childrenList,
  initialSelectedChildId,
  onConcernSubmitted
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialSelectedChildId || (childrenList[0]?.id ?? 's1')
  );
  const [category, setCategory] = useState<ConcernCategory>('NOT_STUDYING');
  const [priority, setPriority] = useState<ConcernPriority>('MEDIUM');
  const [subjectTitle, setSubjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedChild = childrenList.find(c => c.id === selectedStudentId) || childrenList[0];

  const getCategoryIcon = (catKey: ConcernCategory) => {
    switch (catKey) {
      case 'NOT_STUDYING': return <BookOpen className="w-4 h-4 text-amber-600" />;
      case 'EXCESSIVE_MOBILE': return <Smartphone className="w-4 h-4 text-purple-600" />;
      case 'EXCESSIVE_TV': return <Tv className="w-4 h-4 text-rose-600" />;
      case 'HOMEWORK_DIFFICULTY': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'ATTENDANCE_CONCERN': return <CalendarCheck className="w-4 h-4 text-emerald-600" />;
      case 'SUBJECT_DIFFICULTY': return <HelpCircle className="w-4 h-4 text-orange-600" />;
      case 'BEHAVIOUR_CONCERN': return <HeartHandshake className="w-4 h-4 text-teal-600" />;
      case 'SCHOOL_RELATED': return <School className="w-4 h-4 text-sky-600" />;
      default: return <MessageSquare className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);

    const activeChild = childrenList.find(c => c.id === selectedStudentId) || childrenList[0];
    const catObj = CONCERN_CATEGORIES.find(c => c.key === category);
    const resolvedSubject = subjectTitle.trim() || (language === 'kn' ? catObj?.labelKn : catObj?.labelEn) || 'Student Concern';

    const newConcern = concernService.addConcern({
      parentId: 'p1',
      parentName: user?.fullName || 'Sri Ramesh Gowda',
      parentPhone: user?.phoneNumber || '9900112233',
      studentId: activeChild.id,
      studentName: `${activeChild.firstName} ${activeChild.lastName}`,
      studentGrade: activeChild.className || 'Grade 5-A',
      category,
      priority,
      subject: resolvedSubject,
      description: description.trim()
    });

    // Notify teachers
    addNotification({
      titleEn: `New Parent Concern: ${activeChild.firstName}`,
      titleKn: `ಹೊಸ ಪೋಷಕರ ಕಾಳಜಿ: ${activeChild.firstNameKn}`,
      bodyEn: `${user?.fullName || 'Parent'} submitted concern regarding "${catObj?.labelEn}". Follow-up requested.`,
      bodyKn: `${activeChild.firstNameKn} ಬಗ್ಗೆ ಪೋಷಕರಿಂದ "${catObj?.labelKn}" ಕಾಳಜಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ. ಪರಿಶೀಲನೆ ಕೋರಲಾಗಿದೆ.`,
      category: 'ACADEMIC',
      targetRole: 'TEACHER',
      isUrgent: priority === 'URGENT' || priority === 'HIGH'
    });

    setIsSubmitting(false);
    onClose();

    // Reset fields
    setSubjectTitle('');
    setDescription('');
    setCategory('NOT_STUDYING');
    setPriority('MEDIUM');

    if (onConcernSubmitted) {
      onConcernSubmitted(
        language === 'kn'
          ? 'ನಿಮ್ಮ ಕಾಳಜಿ/ಸಲಹೆಯನ್ನು ವರ್ಗ ಶಿಕ್ಷಕರಿಗೆ ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ. ಶಿಕ್ಷಕರು ಶೀಘ್ರದಲ್ಲಿ ಪರಿಶೀಲಿಸುತ್ತಾರೆ.'
          : 'Your concern has been submitted to the class teacher. You will receive real-time follow-up updates.'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಕಾಳಜಿ ಮತ್ತು ಸಲಹೆ ನಮೂನೆ' : 'Submit Student Concern'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Child Selector */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1.5">
            {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ (Student)' : 'Select Student'} <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {childrenList.map(child => {
              const isSelected = child.id === selectedStudentId;
              return (
                <button
                  type="button"
                  key={child.id}
                  onClick={() => setSelectedStudentId(child.id)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">
                      {language === 'kn' ? child.firstNameKn : child.firstName} {language === 'kn' ? child.lastNameKn : child.lastName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {child.className || 'Grade 5-A'} • Roll #{child.rollNumber}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Selector with exact 9 categories from prompt */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1.5">
            {language === 'kn' ? 'ಕಾಳಜಿಯ ವರ್ಗ (Category)' : 'Category of Concern'} <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {CONCERN_CATEGORIES.map(cat => {
              const isSelected = category === cat.key;
              return (
                <button
                  type="button"
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/90 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {getCategoryIcon(cat.key)}
                  </div>
                  <div className="min-w-0">
                    <span className={`text-xs block font-bold leading-tight ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                      {language === 'kn' ? cat.labelKn : cat.labelEn}
                    </span>
                    <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5">
                      {cat.descriptionEn}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Priority */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1.5">
            {language === 'kn' ? 'ಆದ್ಯತೆ ಮಟ್ಟ (Optional Priority)' : 'Priority Level (Optional)'}
          </label>
          <div className="flex flex-wrap gap-2">
            {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as ConcernPriority[]).map(p => {
              const isSelected = priority === p;
              const colorClasses = 
                p === 'URGENT' ? (isSelected ? 'bg-rose-600 text-white border-rose-600' : 'bg-rose-50 text-rose-800 border-rose-200') :
                p === 'HIGH' ? (isSelected ? 'bg-amber-600 text-white border-amber-600' : 'bg-amber-50 text-amber-800 border-amber-200') :
                p === 'MEDIUM' ? (isSelected ? 'bg-sky-600 text-white border-sky-600' : 'bg-sky-50 text-sky-800 border-sky-200') :
                (isSelected ? 'bg-slate-700 text-white border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200');

              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${colorClasses}`}
                >
                  {p === 'URGENT' && '🚨 '}
                  {p === 'HIGH' && '⚠️ '}
                  {language === 'kn' 
                    ? p === 'LOW' ? 'ಸಾಮಾನ್ಯ (Low)' : p === 'MEDIUM' ? 'ಮಧ್ಯಮ (Medium)' : p === 'HIGH' ? 'ಹೆಚ್ಚು (High)' : 'ತುರ್ತು (Urgent)' 
                    : p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Title */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            {language === 'kn' ? 'ಸಂಕ್ಷಿಪ್ತ ಶೀರ್ಷಿಕೆ (Title / Subject)' : 'Short Subject / Title (Optional)'}
          </label>
          <input
            type="text"
            value={subjectTitle}
            onChange={e => setSubjectTitle(e.target.value)}
            placeholder={
              language === 'kn' 
                ? 'ಉದಾ: ಸಂಜೆ ವೇಳೆ ಮೊಬೈಲ್ ಬಳಕೆಯ ಬಗ್ಗೆ ಶಿಕ್ಷಕರ ಸಮಾಲೋಚನೆ' 
                : 'e.g., Concern regarding evening phone habits before exams'
            }
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Detailed Description */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            {language === 'kn' ? 'ವಿವರವಾದ ಸಂದೇಶ (Description)' : 'Detailed Description'} <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={
              language === 'kn'
                ? 'ಮನೆಯಲ್ಲಿ ಮಗುವಿನ ಅಧ್ಯಯನ, ಟಿವಿ/ಮೊಬೈಲ್ ಬಳಕೆ, ಅಥವಾ ಮನೆಕೆಲಸದ ಬಗ್ಗೆ ನೀವು ಗಮನಿಸಿದ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ...'
                : 'Please explain the specific observation regarding studying, mobile/TV usage, homework difficulty, or school support needed...'
            }
            required
            className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed"
          />
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {language === 'kn' 
              ? 'ಶಿಕ್ಷಕರು ಈ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಶಾಲೆ ಹಾಗೂ ಮನೆಯಲ್ಲಿ ಸೂಕ್ತ ಕಲಿಕಾ ಬೆಂಬಲ ನೀಡುತ್ತಾರೆ.' 
              : 'The class teacher will review student records and provide structured guidance.'}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            type="submit" 
            disabled={isSubmitting || !description.trim()}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            {isSubmitting 
              ? (language === 'kn' ? 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Submitting...') 
              : (language === 'kn' ? 'ಶಿಕ್ಷಕರಿಗೆ ಸಲ್ಲಿಸಿ (Submit)' : 'Submit Concern')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
