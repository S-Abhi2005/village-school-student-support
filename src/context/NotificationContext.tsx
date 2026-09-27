import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationItem, NotificationType, UserRole } from '../types';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  allNotifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => NotificationItem;
  triggerLiveEvent: (eventType: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, user } = useAuth();
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>(() => {
    return notificationService.getAllNotifications();
  });

  // Keep state synced with the centralized service (and cross-tab storage)
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((updated) => {
      setAllNotifications([...updated]);
    });
    return () => unsubscribe();
  }, []);

  // Filter notifications for the current role
  // Parents see parent-directed notifications + broadcast announcements
  // Teachers see teacher-directed notifications + alerts
  // Students see student-directed notifications + announcements
  // Super Admin sees everything
  const currentRole = role || 'SUPER_ADMIN';
  const roleFilteredNotifications = allNotifications.filter(n => {
    if (!n.targetRole || n.targetRole === 'ALL') return true;
    if (currentRole === 'SUPER_ADMIN') return true;
    return n.targetRole === currentRole;
  });

  const unreadCount = roleFilteredNotifications.filter(n => !n.isRead).length;

  const markAsRead = useCallback((id: string) => {
    notificationService.markAsRead(id);
    setAllNotifications(notificationService.getAllNotifications());
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead(currentRole);
    setAllNotifications(notificationService.getAllNotifications());
  }, [currentRole]);

  const deleteNotification = useCallback((id: string) => {
    notificationService.deleteNotification(id);
    setAllNotifications(notificationService.getAllNotifications());
  }, []);

  const addNotification = useCallback((item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => {
    const created = notificationService.addNotification(item);
    setAllNotifications(notificationService.getAllNotifications());
    return created;
  }, []);

  // Quick live event simulator for testing all required notification types
  const triggerLiveEvent = useCallback((eventType: NotificationType) => {
    switch (eventType) {
      case 'REPORT_VIEWED':
        notificationService.notifyReportViewed({
          studentName: 'Kavya R. Gowda',
          studentRoll: '05-A-12',
          parentName: 'Sri Ramesh Gowda',
          reportType: 'PROGRESS_REPORT',
          reportTitle: 'Term 1 Comprehensive Assessment Report',
        });
        break;

      case 'TEST_PUBLISHED':
        notificationService.notifyNewTestPublished('General Science & Environmental Studies Unit Test 2', 5);
        break;

      case 'RESULT_PUBLISHED':
        notificationService.notifyResultPublished({
          studentName: 'Kavya R. Gowda',
          testTitle: 'Mathematics Unit Assessment 1',
          percentage: 94,
          grade: 'A+',
        });
        break;

      case 'ATTENDANCE_UPDATE':
        notificationService.notifyAttendanceUpdate({
          studentName: 'Kavya R. Gowda',
          status: 'PRESENT',
          time: '9:15 AM',
        });
        break;

      case 'TEACHER_ANNOUNCEMENT':
        notificationService.notifyTeacherAnnouncement({
          teacherName: 'Smt. Savitri Hegde (Class Teacher)',
          titleEn: 'Quarterly Parent-Teacher Conference Reminder',
          titleKn: 'ತ್ರೈಮಾಸಿಕ ಪೋಷಕ-ಶಿಕ್ಷಕರ ಸಭೆಯ ಜ್ಞಾಪನೆ',
          bodyEn: 'Please attend the school progress review meeting on coming Friday at 3:00 PM.',
          bodyKn: 'ಶುಕ್ರವಾರ ಮಧ್ಯಾಹ್ನ ೩:೦೦ ಕ್ಕೆ ಶಾಲೆಯಲ್ಲಿ ನಡೆಯುವ ಪ್ರಗತಿ ಪರಿಶೀಲನಾ ಸಭೆಗೆ ಪೋಷಕರು ತಪ್ಪದೇ ಹಾಜರಾಗಬೇಕಾಗಿ ವಿನಂತಿ.',
          audioDuration: 35,
        });
        break;

      case 'CONCERN_RESPONSE':
        notificationService.notifyConcernResponse({
          parentName: 'Sri Ramesh Gowda',
          studentName: 'Kavya R. Gowda',
          teacherName: 'Smt. Savitri Hegde',
          concernCategory: 'Homework difficulty',
          status: 'ACTION_TAKEN',
          actionTaken: 'Assigned student mentor and provided printed Kannada work cards.',
        });
        break;

      case 'PARENT_CONCERN':
        notificationService.notifyNewParentConcern({
          parentName: 'Sri Ningappa',
          studentName: 'Chetan Kumar',
          category: 'Not studying regularly',
          subject: 'Requires extra guidance in English phonetic reading',
        });
        break;

      case 'TEST_SUBMISSION':
        notificationService.notifyStudentTestSubmission({
          studentName: 'Abhishek Nayaka',
          testTitle: 'Unit Test: Kannada Grammar & Composition',
          score: 24,
          totalMarks: 25,
        });
        break;

      case 'SUSPICIOUS_EXAM_ACTIVITY':
        notificationService.notifySuspiciousExamActivity({
          studentName: 'Chetan Kumar',
          testTitle: 'Mathematics Unit Assessment',
          activityDetails: 'Browser blur detected (switched to external window during timer)',
        });
        break;

      case 'STUDENT_ACTIVITY':
        notificationService.notifyImportantStudentActivity({
          studentName: 'Deepa Kulkarni',
          activityTitle: 'Kannada Oral Recitation Mastered',
          details: 'achieved 98% phonetic clarity on Kuvempu poetry module',
        });
        break;

      case 'LEARNING_MATERIAL':
        notificationService.notifyLearningMaterialAdded('Grade 5 Mathematics Vedic Multiplication Flashcards', 'Mathematics');
        break;

      case 'PROGRESS_UPDATE':
        notificationService.notifyStudentProgressUpdate({
          studentName: 'Chethan Gowda',
          progressSummary: 'Advanced to Nali-Kali Level 3 in Kannada vowel combinations.',
        });
        break;

      default:
        break;
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications: roleFilteredNotifications,
        allNotifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
        triggerLiveEvent,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
