import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import { Badge } from '../../design-system/Badge';
import { Button } from '../../design-system/Button';
import { useLanguage } from '../../i18n/LanguageContext';
import { ParentConcern, ConcernStatus } from '../../types';
import { 
  concernService, 
  CONCERN_CATEGORIES, 
  WORKFLOW_STAGES 
} from '../../services/concernService';
import { TeacherConcernReviewModal } from './TeacherConcernReviewModal';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  User, 
  Sparkles, 
  Search, 
  Filter, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Eye,
  Check
} from 'lucide-react';

interface TeacherConcernSectionProps {
  onConcernSelected?: (concern: ParentConcern) => void;
}

export const TeacherConcernSection: React.FC<TeacherConcernSectionProps> = ({
  onConcernSelected
}) => {
  const { language } = useLanguage();
  const [concerns, setConcerns] = useState<ParentConcern[]>(() => concernService.getConcerns());
  const [activeTab, setActiveTab] = useState<ConcernStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReviewConcern, setSelectedReviewConcern] = useState<ParentConcern | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setConcerns(concernService.getConcerns());
    };
    window.addEventListener('parent-concern-updated', handleUpdate);
    return () => window.removeEventListener('parent-concern-updated', handleUpdate);
  }, []);

  // Filter concerns
  const filteredConcerns = concerns.filter(c => {
    if (activeTab !== 'ALL') {
      if (activeTab === 'UNDER_REVIEW') {
        if (c.status !== 'UNDER_REVIEW' && c.status !== 'IN_REVIEW') return false;
      } else if (c.status !== activeTab) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = c.studentName.toLowerCase().includes(q) ||
        c.parentName.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getCountByStatus = (status: ConcernStatus) => {
    if (status === 'UNDER_REVIEW') {
      return concerns.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'IN_REVIEW').length;
    }
    return concerns.filter(c => c.status === status).length;
  };

  const pendingCount = getCountByStatus('PENDING');
  const underReviewCount = getCountByStatus('UNDER_REVIEW');
  const actionTakenCount = getCountByStatus('ACTION_TAKEN');
  const followUpCount = getCountByStatus('FOLLOW_UP');
  const resolvedCount = getCountByStatus('RESOLVED');

  const getStatusBadge = (status: ConcernStatus) => {
    switch (status) {
      case 'RESOLVED': return <Badge variant="success" size="sm">Resolved</Badge>;
      case 'ACTION_TAKEN': return <Badge variant="info" size="sm">Action Taken</Badge>;
      case 'FOLLOW_UP': return <Badge variant="info" size="sm" className="bg-indigo-100 text-indigo-800">Follow-up</Badge>;
      case 'UNDER_REVIEW':
      case 'IN_REVIEW': return <Badge variant="warning" size="sm">Under Review</Badge>;
      default: return <Badge variant="danger" size="sm">Pending</Badge>;
    }
  };

  return (
    <Card className="border-2 border-slate-200 bg-white shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
              {language === 'kn' ? 'ಪೋಷಕರ ಕಾಳಜಿ & ವಿದ್ಯಾರ್ಥಿ ಫಾಲೋ-ಅಪ್' : 'Parent Concern & Student Follow-Up System'}
            </span>
          </div>
          <CardTitle className="text-base mt-1">
            {language === 'kn' ? 'ಪೋಷಕರ ಕುಂದುಕೊರತೆಗಳ ಪರಿಶೀಲನೆ' : 'Parent Concern Roster & Support Workflow'}
          </CardTitle>
          <CardDescription>
            {language === 'kn'
              ? 'ಬಾಕಿ → ಪರಿಶೀಲನೆ → ಕ್ರಮ → ಫಾಲೋ-ಅಪ್ → ಪರಿಹಾರ ಹಂತಗಳ ಸಮಗ್ರ ನಿರ್ವಹಣೆ'
              : 'End-to-end follow-up workflow: Pending → Under Review → Action Taken → Follow-up → Resolved'}
          </CardDescription>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ / ಪೋಷಕ ಹುಡುಕಿ...' : 'Search student or parent...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white w-48 sm:w-60 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* 5 WORKFLOW TABS WITH COUNTERS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{language === 'kn' ? 'ಎಲ್ಲಾ ಕಾಳಜಿಗಳು' : 'All Concerns'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {concerns.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <span>{language === 'kn' ? 'ಬಾಕಿ (Pending)' : 'Pending'}</span>
            <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-black">
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('UNDER_REVIEW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'UNDER_REVIEW'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200/60'
            }`}
          >
            <span>{language === 'kn' ? 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (Review)' : 'Under Review'}</span>
            <span className="text-[10px] bg-sky-500 text-white px-1.5 py-0.2 rounded-full font-black">
              {underReviewCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ACTION_TAKEN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ACTION_TAKEN'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/60'
            }`}
          >
            <span>{language === 'kn' ? 'ಕ್ರಮ ಕೈಗೊಳ್ಳಲಾಗಿದೆ (Action)' : 'Action Taken'}</span>
            <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.2 rounded-full font-black">
              {actionTakenCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('FOLLOW_UP')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'FOLLOW_UP'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200/60'
            }`}
          >
            <span>{language === 'kn' ? 'ಫಾಲೋ-ಅಪ್ (Follow-up)' : 'Follow-up'}</span>
            <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.2 rounded-full font-black">
              {followUpCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <span>{language === 'kn' ? 'ಪರಿಹರಿಸಲಾಗಿದೆ (Resolved)' : 'Resolved'}</span>
            <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-black">
              {resolvedCount}
            </span>
          </button>
        </div>

        {/* CONCERNS LIST */}
        <div className="space-y-3">
          {filteredConcerns.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
              <p className="font-semibold text-slate-700">
                {language === 'kn' ? 'ಈ ಹಂತದಲ್ಲಿ ಯಾವುದೇ ಕಾಳಜಿಗಳಿಲ್ಲ.' : 'No concerns matching this filter.'}
              </p>
            </div>
          ) : (
            filteredConcerns.map(c => {
              const catObj = CONCERN_CATEGORIES.find(cat => cat.key === c.category);
              const supportSummary = concernService.getStudentSupportSummary(c.studentId);

              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border-2 border-slate-200/80 bg-white hover:border-slate-300 transition-all space-y-3 shadow-2xs"
                >
                  {/* Top Bar: Category, Priority, Student & Parent info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {language === 'kn' ? catObj?.labelKn : catObj?.labelEn || c.category}
                      </span>
                      {c.priority && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.priority === 'URGENT' || c.priority === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {c.priority === 'URGENT' && '🚨 '}
                          Priority: {c.priority}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-slate-700">
                        Student: <strong className="text-emerald-800">{c.studentName}</strong> ({c.studentGrade || 'Grade 5-A'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                      {getStatusBadge(c.status)}
                    </div>
                  </div>

                  {/* Concern Description & Parent Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 space-y-1.5">
                      <h4 className="font-extrabold text-xs text-slate-900">
                        {c.subject || 'Concern Statement'}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        "{c.description}"
                      </p>

                      {/* Display Action Taken & Follow-up info if present */}
                      {c.actionTaken && (
                        <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-950">
                          <strong className="text-[11px] text-purple-900 block">Action Taken:</strong>
                          <span>{c.actionTaken}</span>
                        </div>
                      )}

                      {c.followUpDate && (
                        <div className="flex items-center gap-1.5 text-xs text-sky-900 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-sky-700" />
                          <span>Follow-up Date: <strong>{c.followUpDate}</strong> {c.followUpStatus ? `(${c.followUpStatus})` : ''}</span>
                        </div>
                      )}
                    </div>

                    {/* CONNECTED STUDENT SUPPORT ANALYSIS CHIPS */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          Support Summary
                        </span>
                        <span className="text-[10px] text-indigo-700 font-bold">
                          Attendance: {supportSummary.attendanceRate}%
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-600">
                        <div className="flex justify-between">
                          <span>Recent Test Average:</span>
                          <strong className="text-slate-800">{supportSummary.recentTestAverage}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Voice Practice:</span>
                          <strong className="text-emerald-700">{supportSummary.voicePracticeScore}%</strong>
                        </div>
                        <div className="pt-1 border-t border-indigo-200/50">
                          <span className="text-[10px] font-semibold text-indigo-800 block line-clamp-2">
                            {language === 'kn' ? supportSummary.supportIndicatorsKn[0] : supportSummary.supportIndicators[0]}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setSelectedReviewConcern(c)}
                          className="w-full text-xs font-bold py-1 h-8"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          {language === 'kn' ? 'ಪರಿಶೀಲಿಸಿ & ಕ್ರಮ ಕೈಗೊಳ್ಳಿ' : 'Review & Take Action'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      {/* Teacher Review & Follow-Up Modal */}
      {selectedReviewConcern && (
        <TeacherConcernReviewModal
          isOpen={Boolean(selectedReviewConcern)}
          onClose={() => setSelectedReviewConcern(null)}
          concern={selectedReviewConcern}
          onConcernUpdated={msg => {
            setSuccessToast(msg);
            setTimeout(() => setSuccessToast(null), 4000);
          }}
        />
      )}
    </Card>
  );
};
