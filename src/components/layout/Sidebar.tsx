import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  BookOpen, 
  Sparkles, 
  Bell, 
  UtensilsCrossed, 
  PhoneCall, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Library,
  ChevronLeft,
  ChevronRight,
  FileText,
  Award,
  MessageSquare,
  Mic,
  Bot,
  User,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole } from '../../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const { role, logout, user } = useAuth();
  const { language, t } = useLanguage();
  const { unreadCount } = useNotifications();

  interface NavItem {
    id: string;
    label: string;
    labelKn: string;
    icon: React.ReactNode;
    roles: UserRole[];
    badge?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      labelKn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಮುಖಪುಟ',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],
    },
    // SUPER ADMIN NAV
    {
      id: 'manage-teachers',
      label: 'Manage Teachers',
      labelKn: 'ಶಿಕ್ಷಕರ ನಿರ್ವಹಣೆ',
      icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'manage-parents',
      label: 'Manage Parents',
      labelKn: 'ಪೋಷಕರ ದಾಖಲಾತಿ',
      icon: <HeartHandshake className="w-4 h-4 text-amber-400" />,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'classes',
      label: 'Students & Roster',
      labelKn: 'ವಿದ್ಯಾರ್ಥಿಗಳು & ತರಗತಿಗಳು',
      icon: <Users className="w-4 h-4 text-sky-400" />,
      roles: ['SUPER_ADMIN', 'TEACHER'],
    },
    {
      id: 'manage-curriculum',
      label: 'Classes & Subjects',
      labelKn: 'ತರಗತಿ & ವಿಷಯಗಳು',
      icon: <BookOpen className="w-4 h-4 text-teal-400" />,
      roles: ['SUPER_ADMIN'],
    },

    // TEACHER & STUDENT & PARENT COMMON / SPECIFIC
    {
      id: 'attendance',
      label: 'Daily Attendance',
      labelKn: 'ದೈನಂದಿನ ಹಾಜರಾತಿ',
      icon: <CalendarCheck className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'TEACHER', 'PARENT'],
      badge: role === 'PARENT' ? 'Live' : 'Today',
    },
    {
      id: 'tests-marks',
      label: role === 'STUDENT' ? 'Tests & Results' : role === 'PARENT' ? 'Marks & Progress' : 'Tests & Marks',
      labelKn: role === 'STUDENT' ? 'ಪರೀಕ್ಷೆ & ಫಲಿತಾಂಶ' : role === 'PARENT' ? 'ಅಂಕಗಳು & ಪ್ರಗತಿ' : 'ಪರೀಕ್ಷೆಗಳು & ಅಂಕಗಳು',
      icon: <Award className="w-4 h-4 text-amber-400" />,
      roles: ['SUPER_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],
    },
    {
      id: 'materials',
      label: 'Learning Materials',
      labelKn: 'ಕಲಿಕಾ ಸಾಮಗ್ರಿಗಳು',
      icon: <FileText className="w-4 h-4 text-indigo-400" />,
      roles: ['SUPER_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],
    },
    {
      id: 'voice-assessment',
      label: 'Voice & Pronunciation',
      labelKn: 'ಧ್ವನಿ ಓದುವಿಕೆ ಪರೀಕ್ಷೆ',
      icon: <Mic className="w-4 h-4 text-rose-400" />,
      roles: ['SUPER_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],
      badge: 'Oral & Audio',
    },
    {
      id: 'ai-tutor',
      label: 'AI Tutor Chat (ಕನ್ನಡ)',
      labelKn: 'AI ಕಲಿಕಾ ಮಿತ್ರ (ಕನ್ನಡ)',
      icon: <Bot className="w-4 h-4 text-emerald-400" />,
      roles: ['TEACHER', 'STUDENT'],
      badge: 'Gemini',
    },
    {
      id: 'concerns',
      label: role === 'PARENT' ? 'Parent Grievance Box' : 'Parent Concerns',
      labelKn: role === 'PARENT' ? 'ಸಲಹಾ/ದೂರು ಪೆಟ್ಟಿಗೆ' : 'ಪೋಷಕರ ಸಮಸ್ಯೆಗಳು',
      icon: <MessageSquare className="w-4 h-4 text-orange-400" />,
      roles: ['SUPER_ADMIN', 'TEACHER', 'PARENT'],
      badge: role === 'PARENT' ? undefined : '2 Open',
    },
    {
      id: 'midday-meal',
      label: 'Mid-Day Meal Register',
      labelKn: 'ಬಿಸಿಯೂಟ ದಾಖಲಾತಿ',
      icon: <UtensilsCrossed className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'TEACHER', 'PARENT'],
    },
    {
      id: 'parent-voice',
      label: 'Voice & SMS Broadcast',
      labelKn: 'ಧ್ವನಿ ಕರೆ & SMS ಸಂದೇಶ',
      icon: <PhoneCall className="w-4 h-4" />,
      roles: ['SUPER_ADMIN', 'TEACHER'],
    },
    {
      id: 'notices',
      label: 'Notifications & Alerts',
      labelKn: 'ಸೂಚನೆಗಳು & ಪ್ರಕಟಣೆಗಳು',
      icon: <Bell className="w-4 h-4 text-emerald-400" />,
      roles: ['SUPER_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'],
      badge: unreadCount > 0 ? `${unreadCount} New` : undefined,
    },
    {
      id: 'system-settings',
      label: 'System Settings & Security',
      labelKn: 'ವ್ಯವಸ್ಥೆ ಸಂಯೋಜನೆಗಳು',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
      roles: ['SUPER_ADMIN'],
    },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(role));

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  return (
    <aside
      className={`h-full bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col justify-between transition-all duration-200 select-none ${
        collapsed && !isMobileDrawer ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Branding */}
      <div>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <Library className="w-5 h-5" />
            </div>
            {(!collapsed || isMobileDrawer) && (
              <div className="truncate">
                <span className="text-xs font-bold tracking-tight text-white block">
                  ಗ್ರಾಮೀಣ ವಿದ್ಯಾ ಸೇತು
                </span>
                <span className="text-[10px] text-slate-400 block tracking-tight font-medium">
                  Grameena Vidya Setu
                </span>
              </div>
            )}
          </div>

          {!isMobileDrawer && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden lg:block cursor-pointer"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation items list */}
        <nav className="p-3 space-y-1">
          {(!collapsed || isMobileDrawer) && (
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {language === 'kn' ? 'ಮುಖ್ಯ ಮೆನು' : 'Main Navigation'}
            </div>
          )}

          {filteredNav.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title={language === 'kn' ? item.labelKn : item.label}
              >
                <span className="shrink-0">{item.icon}</span>
                {(!collapsed || isMobileDrawer) && (
                  <div className="flex items-center justify-between w-full truncate">
                    <span className="truncate">{language === 'kn' ? item.labelKn : item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom area: Current Role Info & Logout */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {(!collapsed || isMobileDrawer) && (
          <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/60 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{language === 'kn' ? 'ಪ್ರಸ್ತುತ ಲಾಗಿನ್:' : 'Active Role:'}</span>
              <span className="font-semibold text-emerald-400">{role}</span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors cursor-pointer"
          title="Sign out of platform"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobileDrawer) && (
            <span>{language === 'kn' ? 'ಲಾಗ್ ಔಟ್' : 'Sign Out'}</span>
          )}
        </button>
      </div>
    </aside>
  );
};
