import React from 'react';
import { 
  FileText, 
  Award, 
  CalendarCheck, 
  MessageSquare, 
  Bell, 
  BarChart3, 
  AlertTriangle, 
  BookOpen, 
  Sparkles,
  Eye,
  CheckCircle2,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { NotificationItem, NotificationType } from '../../types';

interface NotificationIconProps {
  item: NotificationItem;
  size?: 'sm' | 'md' | 'lg';
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({ item, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  const type = item.type;
  const category = item.category;

  // 1. Tests
  if (type === 'TEST_PUBLISHED' || type === 'TEST_SUBMISSION' || category === 'TEST') {
    if (type === 'SUSPICIOUS_EXAM_ACTIVITY') {
      return (
        <div className={`${sizeClasses} rounded-xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0`}>
          <AlertTriangle className={iconSizes} />
        </div>
      );
    }
    return (
      <div className={`${sizeClasses} rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0`}>
        <FileText className={iconSizes} />
      </div>
    );
  }

  // 2. Results
  if (type === 'RESULT_PUBLISHED') {
    return (
      <div className={`${sizeClasses} rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0`}>
        <Award className={iconSizes} />
      </div>
    );
  }

  // 3. Attendance
  if (type === 'ATTENDANCE_UPDATE' || category === 'ATTENDANCE') {
    return (
      <div className={`${sizeClasses} rounded-xl bg-teal-100 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0`}>
        <CalendarCheck className={iconSizes} />
      </div>
    );
  }

  // 4. Concerns
  if (type === 'PARENT_CONCERN' || type === 'CONCERN_RESPONSE' || category === 'CONCERN') {
    return (
      <div className={`${sizeClasses} rounded-xl bg-orange-100 text-orange-700 border border-orange-200 flex items-center justify-center shrink-0`}>
        <MessageSquare className={iconSizes} />
      </div>
    );
  }

  // 5. Reports
  if (type === 'REPORT_VIEWED' || category === 'REPORT') {
    return (
      <div className={`${sizeClasses} rounded-xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0`}>
        <Eye className={iconSizes} />
      </div>
    );
  }

  // 6. Announcements
  if (type === 'TEACHER_ANNOUNCEMENT' || category === 'ANNOUNCEMENT') {
    return (
      <div className={`${sizeClasses} rounded-xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0`}>
        <Bell className={iconSizes} />
      </div>
    );
  }

  // 7. Learning Materials / Progress
  if (type === 'LEARNING_MATERIAL') {
    return (
      <div className={`${sizeClasses} rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0`}>
        <BookOpen className={iconSizes} />
      </div>
    );
  }

  if (type === 'PROGRESS_UPDATE') {
    return (
      <div className={`${sizeClasses} rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0`}>
        <TrendingUp className={iconSizes} />
      </div>
    );
  }

  // Fallback
  return (
    <div className={`${sizeClasses} rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0`}>
      <Bell className={iconSizes} />
    </div>
  );
};
