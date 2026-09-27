import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Search, 
  Filter, 
  Trash2, 
  Volume2, 
  ExternalLink, 
  Sparkles, 
  Check, 
  AlertCircle,
  Eye,
  FileText,
  Award,
  CalendarCheck,
  MessageSquare,
  Radio,
  Zap
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { NotificationIcon } from '../notifications/NotificationIcon';
import { NotificationItem, NotificationType } from '../../types';
import { Badge } from '../../design-system/Badge';
import { Button } from '../../design-system/Button';
import { Card, CardContent } from '../../design-system/Card';

interface NotificationCenterViewProps {
  onNavigate?: (tab: string) => void;
}

export const NotificationCenterView: React.FC<NotificationCenterViewProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const { role } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    triggerLiveEvent 
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'TESTS' | 'REPORTS' | 'CONCERNS' | 'ATTENDANCE' | 'ANNOUNCEMENTS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);

  // Play simulated voice note
  const handlePlayVoice = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      setTimeout(() => setPlayingAudioId(null), 4500);
    }
  };

  // Filter items
  const filteredNotifications = notifications.filter(n => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (n.titleEn || '').toLowerCase().includes(q) || (n.titleKn || '').toLowerCase().includes(q);
      const matchBody = (n.bodyEn || '').toLowerCase().includes(q) || (n.bodyKn || '').toLowerCase().includes(q);
      const matchStudent = n.metadata?.studentName?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchBody && !matchStudent) return false;
    }

    // Category / Status Filter
    switch (activeFilter) {
      case 'UNREAD':
        return !n.isRead;
      case 'TESTS':
        return n.type === 'TEST_PUBLISHED' || n.type === 'RESULT_PUBLISHED' || n.type === 'TEST_SUBMISSION' || n.type === 'SUSPICIOUS_EXAM_ACTIVITY' || n.category === 'TEST';
      case 'REPORTS':
        return n.type === 'REPORT_VIEWED' || n.category === 'REPORT';
      case 'CONCERNS':
        return n.type === 'PARENT_CONCERN' || n.type === 'CONCERN_RESPONSE' || n.category === 'CONCERN';
      case 'ATTENDANCE':
        return n.type === 'ATTENDANCE_UPDATE' || n.category === 'ATTENDANCE';
      case 'ANNOUNCEMENTS':
        return n.type === 'TEACHER_ANNOUNCEMENT' || n.category === 'ANNOUNCEMENT';
      case 'ALL':
      default:
        return true;
    }
  });

  const getFilterCount = (type: typeof activeFilter) => {
    switch (type) {
      case 'UNREAD':
        return notifications.filter(n => !n.isRead).length;
      case 'TESTS':
        return notifications.filter(n => n.type === 'TEST_PUBLISHED' || n.type === 'RESULT_PUBLISHED' || n.type === 'TEST_SUBMISSION' || n.type === 'SUSPICIOUS_EXAM_ACTIVITY' || n.category === 'TEST').length;
      case 'REPORTS':
        return notifications.filter(n => n.type === 'REPORT_VIEWED' || n.category === 'REPORT').length;
      case 'CONCERNS':
        return notifications.filter(n => n.type === 'PARENT_CONCERN' || n.type === 'CONCERN_RESPONSE' || n.category === 'CONCERN').length;
      case 'ATTENDANCE':
        return notifications.filter(n => n.type === 'ATTENDANCE_UPDATE' || n.category === 'ATTENDANCE').length;
      case 'ANNOUNCEMENTS':
        return notifications.filter(n => n.type === 'TEACHER_ANNOUNCEMENT' || n.category === 'ANNOUNCEMENT').length;
      case 'ALL':
      default:
        return notifications.length;
    }
  };

  const handleActionClick = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.metadata?.actionTab && onNavigate) {
      onNavigate(item.metadata.actionTab);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {language === 'kn' ? 'ಶಾಲಾ ಸೂಚನೆಗಳು & ಪ್ರಕಟಣೆಗಳು' : 'Notification & Alerts Center'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  {language === 'kn'
                    ? 'ನೈಜ ಸಮಯದ ಪರೀಕ್ಷೆ, ಫಲಿತಾಂಶ, ಹಾಜರಾತಿ, ಪೋಷಕರ ವರದಿ ವೀಕ್ಷಣೆ ಮತ್ತು ಶಾಲಾ ಪ್ರಕಟಣೆಗಳು'
                    : 'Real-time test updates, results, attendance, parent report tracking & concerns'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                leftIcon={<CheckCheck className="w-4 h-4 text-emerald-400" />}
              >
                {language === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ಓದಿದೆ ಎಂದು ಗುರುತಿಸಿ' : 'Mark all as read'}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSimulator(!showSimulator)}
              className="bg-indigo-600/30 text-indigo-200 border-indigo-500/40 hover:bg-indigo-600/50"
              leftIcon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
            >
              {language === 'kn' ? 'ನೈಜ-ಸಮಯ ಪರೀಕ್ಷಕ (Simulator)' : 'Live Event Simulator'}
            </Button>
          </div>
        </div>

        {/* Live Simulator Toolbar */}
        {showSimulator && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 bg-slate-950/50 -mx-6 -mb-6 p-4 rounded-b-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-500 animate-ping" />
                {language === 'kn' ? 'ನೈಜ ಸಮಯ ನೋಟಿಫಿಕೇಶನ್ ಸಿಮ್ಯುಲೇಟರ್ (ಪ್ರತ್ಯಕ್ಷ ಅನುಭವ)' : 'Live Notification Event Triggers (Test All Types):'}
              </span>
              <span className="text-[11px] text-slate-400">
                {language === 'kn' ? 'ಕ್ಲಿಕ್ ಮಾಡಿ ಲೈವ್ ಅಲರ್ಟ್ ಸ್ವೀಕರಿಸಿ' : 'Click any button to dispatch real-time event'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => triggerLiveEvent('REPORT_VIEWED')}
                className="px-2.5 py-1.5 rounded-lg bg-sky-950/80 border border-sky-600/40 text-sky-200 text-xs hover:bg-sky-900/80 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Parent Viewed Report (Teacher)</span>
              </button>

              <button
                onClick={() => triggerLiveEvent('TEST_PUBLISHED')}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-600/40 text-indigo-200 text-xs hover:bg-indigo-900/80 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>New Test Published</span>
              </button>

              <button
                onClick={() => triggerLiveEvent('RESULT_PUBLISHED')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-950/80 border border-amber-600/40 text-amber-200 text-xs hover:bg-amber-900/80 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Result Published (Parent/Student)</span>
              </button>

              <button
                onClick={() => triggerLiveEvent('ATTENDANCE_UPDATE')}
                className="px-2.5 py-1.5 rounded-lg bg-teal-950/80 border border-teal-600/40 text-teal-200 text-xs hover:bg-teal-900/80 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Attendance Update (Parent)</span>
              </button>

              <button
                onClick={() => triggerLiveEvent('PARENT_CONCERN')}
                className="px-2.5 py-1.5 rounded-lg bg-orange-950/80 border border-orange-600/40 text-orange-200 text-xs hover:bg-orange-900/80 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                <span>New Parent Concern (Teacher)</span>
              </button>

              <button
                onClick={() => triggerLiveEvent('SUSPICIOUS_EXAM_ACTIVITY')}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 border border-rose-600/40 text-rose-200 text-xs hover:bg-rose-900/80 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Suspicious Exam Activity (Teacher)</span>
              </button>

              <button
                onClick={() => triggerLiveEvent('TEACHER_ANNOUNCEMENT')}
                className="px-2.5 py-1.5 rounded-lg bg-purple-950/80 border border-purple-600/40 text-purple-200 text-xs hover:bg-purple-900/80 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Teacher Voice Announcement</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All', labelKn: 'ಎಲ್ಲವೂ', icon: Bell },
            { id: 'UNREAD', label: `Unread (${unreadCount})`, labelKn: `ಓದದಿರುವುದು (${unreadCount})`, icon: Sparkles },
            { id: 'TESTS', label: 'Tests & Results', labelKn: 'ಪರೀಕ್ಷೆ & ಫಲಿತಾಂಶ', icon: FileText },
            { id: 'REPORTS', label: 'Report Views', labelKn: 'ವರದಿ ವೀಕ್ಷಣೆ', icon: Eye },
            { id: 'CONCERNS', label: 'Concerns', labelKn: 'ಸಮಸ್ಯೆಗಳು', icon: MessageSquare },
            { id: 'ATTENDANCE', label: 'Attendance', labelKn: 'ಹಾಜರಾತಿ', icon: CalendarCheck },
            { id: 'ANNOUNCEMENTS', label: 'Notices', labelKn: 'ಪ್ರಕಟಣೆಗಳು', icon: Volume2 },
          ].map(tab => {
            const Icon = tab.icon;
            const count = getFilterCount(tab.id as typeof activeFilter);
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{language === 'kn' ? tab.labelKn : tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={language === 'kn' ? 'ಹುಡುಕಿ (ಹೆಸರು, ವಿಷಯ)...' : 'Search notifications...'}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">
                {language === 'kn' ? 'ಯಾವುದೇ ಸೂಚನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No notifications found'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {language === 'kn'
                  ? 'ಈ ಫಿಲ್ಟರ್‌ಗೆ ಸಂಬಂಧಿಸಿದ ಯಾವುದೇ ಸಂದೇಶಗಳಿಲ್ಲ. ಹೊಸ ಸೂಚನೆಗಳು ಬಂದಾಗ ಇಲ್ಲಿ ಗೋಚರಿಸುತ್ತವೆ.'
                  : 'You have no notifications matching this criteria. New alerts and updates will appear here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map(n => {
            return (
              <div
                key={n.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 bg-white ${
                  !n.isRead
                    ? 'border-emerald-300 shadow-sm bg-gradient-to-r from-emerald-50/30 via-white to-white'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <NotificationIcon item={n} size="md" />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 leading-snug">
                          {language === 'kn' ? n.titleKn : n.titleEn}
                        </span>

                        {!n.isRead && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {language === 'kn' ? 'ಹೊಸದು' : 'New'}
                          </span>
                        )}

                        {n.isUrgent && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {language === 'kn' ? 'ತುರ್ತು' : 'Urgent'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
                        <span>{n.createdAt}</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {language === 'kn' ? n.bodyKn : n.bodyEn}
                    </p>

                    {/* Metadata tags if present */}
                    {n.metadata && (
                      <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        {n.metadata.studentName && (
                          <span className="font-medium text-slate-700">
                            👤 {language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ:' : 'Student:'} {n.metadata.studentName}
                          </span>
                        )}
                        {n.metadata.parentName && (
                          <span className="text-slate-500">
                            • {language === 'kn' ? 'ಪೋಷಕರು:' : 'Parent:'} {n.metadata.parentName}
                          </span>
                        )}
                        {n.metadata.reportTitle && (
                          <Badge variant="info" size="sm">
                            {n.metadata.reportTitle}
                          </Badge>
                        )}
                        {n.metadata.score !== undefined && (
                          <Badge variant="success" size="sm">
                            Score: {n.metadata.score}/{n.metadata.totalMarks || 100}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2">
                      <div className="flex items-center gap-2">
                        {n.audioDurationSeconds && (
                          <button
                            type="button"
                            onClick={() => handlePlayVoice(n.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              playingAudioId === n.id
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>
                              {playingAudioId === n.id
                                ? language === 'kn' ? 'ಪ್ಲೇ ಆಗುತ್ತಿದೆ...' : 'Playing...'
                                : language === 'kn' ? `ಧ್ವನಿ ಸಂದೇಶ ಕೇಳಿ (${n.audioDurationSeconds}s)` : `Play Kannada Voice (${n.audioDurationSeconds}s)`}
                            </span>
                          </button>
                        )}

                        {n.metadata?.actionTab && (
                          <button
                            onClick={() => handleActionClick(n)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <span>{language === 'kn' ? 'ವಿವರ ವೀಕ್ಷಿಸಿ' : 'View Details'}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!n.isRead ? (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{language === 'kn' ? 'ಓದಿದೆ' : 'Mark as read'}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                            <span>{language === 'kn' ? 'ಓದಲಾಗಿದೆ' : 'Read'}</span>
                          </span>
                        )}

                        <button
                          onClick={() => deleteNotification(n.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
