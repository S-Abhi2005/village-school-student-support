import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Sparkles, 
  Bell, 
  Users, 
  Award, 
  BookOpen, 
  Mic, 
  Bot, 
  MessageSquare,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface MobileNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onSelectTab }) => {
  const { role } = useAuth();
  const { language } = useLanguage();

  // Role-specific bottom navigation items optimized for touch
  const getNavItems = () => {
    if (role === 'STUDENT') {
      return [
        {
          id: 'dashboard',
          label: language === 'kn' ? 'ಮುಖಪುಟ' : 'Home',
          icon: <LayoutDashboard className="w-5 h-5" />,
          isHighlight: false,
        },
        {
          id: 'ai-tutor',
          label: language === 'kn' ? 'AI ಮಿತ್ರ' : 'AI Tutor',
          icon: <Bot className="w-5 h-5" />,
          isHighlight: true,
        },
        {
          id: 'tests-marks',
          label: language === 'kn' ? 'ಪರೀಕ್ಷೆ' : 'Tests',
          icon: <Award className="w-5 h-5" />,
          isHighlight: false,
        },
        {
          id: 'materials',
          label: language === 'kn' ? 'ಸಾಮಗ್ರಿ' : 'Materials',
          icon: <BookOpen className="w-5 h-5" />,
          isHighlight: false,
        },
        {
          id: 'voice-assessment',
          label: language === 'kn' ? 'ಧ್ವನಿ' : 'Voice',
          icon: <Mic className="w-5 h-5" />,
          isHighlight: false,
        },
      ];
    }

    if (role === 'PARENT') {
      return [
        {
          id: 'dashboard',
          label: language === 'kn' ? 'ಮುಖಪುಟ' : 'Home',
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          id: 'attendance',
          label: language === 'kn' ? 'ಹಾಜರಾತಿ' : 'Attendance',
          icon: <CalendarCheck className="w-5 h-5" />,
        },
        {
          id: 'tests-marks',
          label: language === 'kn' ? 'ಅಂಕಗಳು' : 'Marks',
          icon: <Award className="w-5 h-5" />,
        },
        {
          id: 'concerns',
          label: language === 'kn' ? 'ದೂರು/ಸಲಹೆ' : 'Concerns',
          icon: <MessageSquare className="w-5 h-5" />,
        },
        {
          id: 'notices',
          label: language === 'kn' ? 'ಪ್ರಕಟಣೆ' : 'Notices',
          icon: <Bell className="w-5 h-5" />,
        },
      ];
    }

    if (role === 'TEACHER') {
      return [
        {
          id: 'dashboard',
          label: language === 'kn' ? 'ಮುಖಪುಟ' : 'Home',
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          id: 'attendance',
          label: language === 'kn' ? 'ಹಾಜರಾತಿ' : 'Attendance',
          icon: <CalendarCheck className="w-5 h-5" />,
        },
        {
          id: 'tests-marks',
          label: language === 'kn' ? 'ಪರೀಕ್ಷೆ' : 'Tests & Marks',
          icon: <Award className="w-5 h-5" />,
        },
        {
          id: 'classes',
          label: language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ' : 'Students',
          icon: <Users className="w-5 h-5" />,
        },
        {
          id: 'notices',
          label: language === 'kn' ? 'ಪ್ರಕಟಣೆ' : 'Notices',
          icon: <Bell className="w-5 h-5" />,
        },
      ];
    }

    // SUPER_ADMIN
    return [
      {
        id: 'dashboard',
        label: language === 'kn' ? 'ಮುಖಪುಟ' : 'Home',
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        id: 'manage-teachers',
        label: language === 'kn' ? 'ಶಿಕ್ಷಕರು' : 'Teachers',
        icon: <GraduationCap className="w-5 h-5" />,
      },
      {
        id: 'classes',
        label: language === 'kn' ? 'ತರಗತಿಗಳು' : 'Classes',
        icon: <Users className="w-5 h-5" />,
      },
      {
        id: 'notices',
        label: language === 'kn' ? 'ಪ್ರಕಟಣೆ' : 'Notices',
        icon: <Bell className="w-5 h-5" />,
      },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1 flex items-center justify-around shadow-lg safe-bottom">
      {navItems.map(item => {
        const isActive = activeTab === item.id;
        const isHighlight = 'isHighlight' in item && item.isHighlight;

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
              isActive
                ? isHighlight
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs scale-105'
                  : 'bg-emerald-50 text-emerald-800 font-extrabold shadow-2xs'
                : isHighlight
                ? 'text-amber-700 font-bold hover:bg-amber-50'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="relative">
              {item.icon}
              {isHighlight && !isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] leading-tight mt-0.5 truncate max-w-[64px]">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
