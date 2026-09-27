import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Globe, 
  Menu, 
  User as UserIcon, 
  LogOut, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  UserCheck,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationIcon } from '../notifications/NotificationIcon';
import { Badge } from '../../design-system/Badge';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenProfile: () => void;
  onNavigate?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, onOpenProfile, onNavigate }) => {
  const { user, role, switchRole, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleMeta: Record<UserRole, { label: string; labelKn: string; color: 'success' | 'warning' | 'info' | 'neutral' }> = {
    SUPER_ADMIN: { label: 'Super Admin', labelKn: 'ಮುಖ್ಯೋಪಾಧ್ಯಾಯರು', color: 'success' },
    TEACHER: { label: 'Teacher', labelKn: 'ಶಿಕ್ಷಕರು', color: 'warning' },
    PARENT: { label: 'Parent', labelKn: 'ಪೋಷಕರು', color: 'info' },
    STUDENT: { label: 'Student', labelKn: 'ವಿದ್ಯಾರ್ಥಿ', color: 'neutral' },
  };

  const handlePlayVoice = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      // simulate audio end after 4 seconds
      setTimeout(() => setPlayingAudioId(null), 4000);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Left: Mobile hamburger & School Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
              {language === 'kn' ? t('schoolName') : 'Govt. Model Higher Primary School, Hosahalli'}
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            {language === 'kn'
              ? 'ಹಾಸನ ಜಿಲ್ಲೆ · ಗ್ರಾಮೀಣ ವಿದ್ಯಾ ಸೇತು ಡಿಜಿಟಲ್ ಕಲಿಕಾ ವೇದಿಕೆ'
              : 'Hassan District · Grameena Vidya Setu Platform'}
          </p>
        </div>
      </div>

      {/* Right controls: Language toggle, Notifications, Role Switcher, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Bilingual Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          title="Switch language between Kannada and English"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-700" />
          <span>{language === 'kn' ? 'ಕನ್ನಡ (KN)' : 'English (EN)'}</span>
        </button>

        {/* Role Selector Dropdown for Fast Evaluation */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-medium text-slate-800 transition-all cursor-pointer"
          >
            <Badge variant={roleMeta[role].color} size="sm" dot>
              {language === 'kn' ? roleMeta[role].labelKn : roleMeta[role].label}
            </Badge>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'kn' ? 'ಪಾತ್ರವನ್ನು ಬದಲಾಯಿಸಿ (ಪರೀಕ್ಷಾರ್ಥ)' : 'Switch Role (Preview)'}
                </p>
              </div>

              {(['SUPER_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    role === r ? 'font-bold text-emerald-800 bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {r === 'SUPER_ADMIN' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    {r === 'TEACHER' && <GraduationCap className="w-3.5 h-3.5 text-amber-600" />}
                    {r === 'PARENT' && <Users className="w-3.5 h-3.5 text-sky-600" />}
                    {r === 'STUDENT' && <UserCheck className="w-3.5 h-3.5 text-slate-600" />}
                    <span>{language === 'kn' ? roleMeta[r].labelKn : roleMeta[r].label}</span>
                  </div>
                  {role === r && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t('notifications')}</span>
                  </h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {unreadCount} {language === 'kn' ? 'ಹೊಸದು' : 'new'}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                  >
                    {t('markAllRead')}
                  </button>
                )}
              </div>

              {/* Filter tabs: All / Unread */}
              <div className="flex items-center px-3 pt-2 pb-1 bg-slate-50/50 border-b border-slate-100 gap-1 text-[11px]">
                <button
                  onClick={() => setNotifFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    notifFilter === 'ALL'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {language === 'kn' ? 'ಎಲ್ಲವೂ' : 'All'} ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('UNREAD')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    notifFilter === 'UNREAD'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {language === 'kn' ? 'ಓದದಿರುವುದು' : 'Unread'} ({unreadCount})
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {(notifFilter === 'UNREAD' ? notifications.filter(n => !n.isRead) : notifications).length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    {t('noNotifications')}
                  </div>
                ) : (
                  (notifFilter === 'UNREAD' ? notifications.filter(n => !n.isRead) : notifications).slice(0, 10).map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.metadata?.actionTab && onNavigate) {
                          onNavigate(n.metadata.actionTab);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3.5 hover:bg-slate-50/90 transition-colors cursor-pointer flex items-start gap-3 ${
                        !n.isRead ? 'bg-emerald-50/25' : ''
                      }`}
                    >
                      <NotificationIcon item={n} size="sm" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-xs font-semibold text-slate-900 leading-snug line-clamp-1">
                            {language === 'kn' ? n.titleKn : n.titleEn}
                          </span>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {language === 'kn' ? n.bodyKn : n.bodyEn}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100/60 text-[10px] text-slate-400">
                          <span className="font-medium text-slate-400">{n.createdAt}</span>

                          {n.audioDurationSeconds && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handlePlayVoice(n.id);
                              }}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                playingAudioId === n.id
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              <Volume2 className="w-2.5 h-2.5" />
                              <span>{playingAudioId === n.id ? 'Playing...' : `Voice (${n.audioDurationSeconds}s)`}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Dropdown Footer: Full Notification Page Link */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    if (onNavigate) {
                      onNavigate('notices');
                    }
                  }}
                  className="w-full text-center py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>{language === 'kn' ? 'ಎಲ್ಲಾ ಸೂಚನೆಗಳು & ವರದಿಗಳ ವೀಕ್ಷಣೆ' : 'View All Notifications & Reports'}</span>
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar / Trigger */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          title="View profile and account details"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-xs overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
          </div>
          <div className="hidden xl:block text-left text-xs">
            <p className="font-semibold text-slate-800 leading-tight">
              {language === 'kn' && user?.fullNameKn ? user.fullNameKn : user?.fullName}
            </p>
            <p className="text-[10px] text-slate-500">
              {language === 'kn' ? roleMeta[role].labelKn : roleMeta[role].label}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};
