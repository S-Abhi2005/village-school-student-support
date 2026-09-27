import { NotificationItem, NotificationType, ReportType, UserRole } from '../types';

const STORAGE_KEY = 'village_school_notifications_store_v2';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  // Teacher Notifications
  {
    id: 'notif-t-1',
    type: 'REPORT_VIEWED',
    category: 'REPORT',
    targetRole: 'TEACHER',
    titleEn: 'Parent Viewed Student Report',
    titleKn: 'ಪೋಷಕರು ವಿದ್ಯಾರ್ಥಿ ವರದಿ ವೀಕ್ಷಿಸಿದ್ದಾರೆ',
    bodyEn: "Rahul's parent viewed the Mathematics Test Report.",
    bodyKn: "ರಾಹುಲ್ ಅವರ ಪೋಷಕರು ಗಣಿತ ಪರೀಕ್ಷಾ ವರದಿಯನ್ನು ವೀಕ್ಷಿಸಿದ್ದಾರೆ.",
    createdAt: '5 mins ago',
    timestamp: Date.now() - 300000,
    isRead: false,
    isUrgent: false,
    metadata: {
      studentName: 'Rahul Nayaka',
      parentName: 'Sri Manjunath Nayaka',
      reportType: 'TEST_REPORT',
      reportTitle: 'Mathematics Test Report',
      actionTab: 'tests-marks',
    },
  },
  {
    id: 'notif-t-2',
    type: 'PARENT_CONCERN',
    category: 'CONCERN',
    targetRole: 'TEACHER',
    titleEn: 'New Parent Concern Submitted',
    titleKn: 'ಹೊಸ ಪೋಷಕರ ಸಮಸ್ಯೆ ದಾಖಲಾಗಿದೆ',
    bodyEn: 'Sri Ramesh Gowda submitted a concern: "Not studying regularly in evenings" for Kavya.',
    bodyKn: 'ಶ್ರೀ ರಮೇಶ್ ಗೌಡ ಅವರು ಕಾವ್ಯ ಅವರ ಬಗ್ಗೆ "ಸಂಜೆ ಸರಿಯಾಗಿ ಓದುತ್ತಿಲ್ಲ" ಎಂಬ ಸಮಸ್ಯೆ ದಾಖಲಿಸಿದ್ದಾರೆ.',
    createdAt: '25 mins ago',
    timestamp: Date.now() - 1500000,
    isRead: false,
    isUrgent: true,
    metadata: {
      studentName: 'Kavya R. Gowda',
      parentName: 'Sri Ramesh Gowda',
      actionTab: 'concerns',
    },
  },
  {
    id: 'notif-t-3',
    type: 'TEST_SUBMISSION',
    category: 'TEST',
    targetRole: 'TEACHER',
    titleEn: 'Student Test Submission',
    titleKn: 'ವಿದ್ಯಾರ್ಥಿ ಪರೀಕ್ಷೆ ಸಲ್ಲಿಕೆ',
    bodyEn: 'Kavya R. Gowda submitted "Grade 5 Kannada & Environmental Science Assessment" (Score: 23/25).',
    bodyKn: 'ಕಾವ್ಯ ಆರ್. ಗೌಡ ಅವರು "೫ನೇ ತರಗತಿ ಕನ್ನಡ & ಪರಿಸರ ಅಧ್ಯಯನ" ಪರೀಕ್ಷೆ ಸಲ್ಲಿಸಿದ್ದಾರೆ (ಅಂಕ: ೨೩/೨೫).',
    createdAt: '1 hour ago',
    timestamp: Date.now() - 3600000,
    isRead: false,
    isUrgent: false,
    metadata: {
      studentName: 'Kavya R. Gowda',
      testTitle: 'Grade 5 Kannada & Environmental Science Assessment',
      score: 23,
      totalMarks: 25,
      actionTab: 'tests-marks',
    },
  },
  {
    id: 'notif-t-4',
    type: 'SUSPICIOUS_EXAM_ACTIVITY',
    category: 'TEST',
    targetRole: 'TEACHER',
    titleEn: 'Suspicious Exam Activity Detected',
    titleKn: 'ಪರೀಕ್ಷೆಯಲ್ಲಿ ಶಂಕಾಸ್ಪದ ಚಟುವಟಿಕೆ ಪತ್ತೆಯಾಗಿದೆ',
    bodyEn: 'Exam Proctor flagged: Chetan Kumar switched browser tab 2 times during Online Assessment.',
    bodyKn: 'ಆನ್‌ಲೈನ್ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಚೇತನ್ ಕುಮಾರ್ ೨ ಬಾರಿ ವಿಂಡೋ ಬದಲಾಯಿಸಿದ್ದು ಸಿಸ್ಟಮ್ ಪತ್ತೆಹಚ್ಚಿದೆ.',
    createdAt: '2 hours ago',
    timestamp: Date.now() - 7200000,
    isRead: false,
    isUrgent: true,
    metadata: {
      studentName: 'Chetan Kumar',
      studentRoll: '05-A-08',
      actionTab: 'tests-marks',
    },
  },
  {
    id: 'notif-t-5',
    type: 'STUDENT_ACTIVITY',
    category: 'ACADEMIC',
    targetRole: 'TEACHER',
    titleEn: 'Important Student Learning Activity',
    titleKn: 'ಮುಖ್ಯ ವಿದ್ಯಾರ್ಥಿ ಕಲಿಕಾ ಪ್ರಗತಿ',
    bodyEn: 'Deepa Kulkarni completed Kannada Audio Storybook Assessment with 98% pronunciation accuracy.',
    bodyKn: 'ದೀಪಾ ಕುಲಕರ್ಣಿ ಅವರು ಕನ್ನಡ ಆಡಿಯೋ ಕಥೆ ಓದುವ ಪರೀಕ್ಷೆಯನ್ನು ೯೮% ಶುದ್ಧ ಉಚ್ಛಾರಣೆಯೊಂದಿಗೆ ಪೂರ್ಣಗೊಳಿಸಿದ್ದಾರೆ.',
    createdAt: 'Yesterday',
    timestamp: Date.now() - 86400000,
    isRead: true,
    isUrgent: false,
    metadata: {
      studentName: 'Deepa Kulkarni',
      actionTab: 'voice-assessment',
    },
  },

  // Parent Notifications
  {
    id: 'notif-p-1',
    type: 'TEST_PUBLISHED',
    category: 'TEST',
    targetRole: 'PARENT',
    titleEn: 'New Test Published: Grade 5 Mathematics',
    titleKn: 'ಹೊಸ ಪರೀಕ್ಷೆ ಪ್ರಕಟಣೆ: ೫ನೇ ತರಗತಿ ಗಣಿತ',
    bodyEn: 'Mathematics Unit Test 2 is scheduled for Friday. Duration: 30 minutes, 25 Marks.',
    bodyKn: 'ಶುಕ್ರವಾರ ಗಣಿತ ಘಟಕ ಪರೀಕ್ಷೆ ೨ ನಿಗದಿಯಾಗಿದೆ. ಸಮಯ: ೩೦ ನಿಮಿಷ, ಒಟ್ಟು ಅಂಕ: ೨೫.',
    createdAt: '15 mins ago',
    timestamp: Date.now() - 900000,
    isRead: false,
    isUrgent: false,
    metadata: {
      testTitle: 'Mathematics Unit Test 2',
      actionTab: 'tests-marks',
    },
  },
  {
    id: 'notif-p-2',
    type: 'RESULT_PUBLISHED',
    category: 'TEST',
    targetRole: 'PARENT',
    titleEn: 'Test Result Published: Unit Assessment 1',
    titleKn: 'ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶ ಪ್ರಕಟ: ಘಟಕ ಪರೀಕ್ಷೆ ೧',
    bodyEn: 'Results published! Kavya scored 92% (Grade A+) in Unit Assessment 1.',
    bodyKn: 'ಫಲಿತಾಂಶ ಪ್ರಕಟಗೊಂಡಿದೆ! ಘಟಕ ಪರೀಕ್ಷೆ ೧ ರಲ್ಲಿ ಕಾವ್ಯ ೯೨% (ಗ್ರೇಡ್ A+) ಪಡೆದಿದ್ದಾರೆ.',
    createdAt: '40 mins ago',
    timestamp: Date.now() - 2400000,
    isRead: false,
    isUrgent: false,
    metadata: {
      studentName: 'Kavya R. Gowda',
      score: 92,
      totalMarks: 100,
      actionTab: 'tests-marks',
    },
  },
  {
    id: 'notif-p-3',
    type: 'ATTENDANCE_UPDATE',
    category: 'ATTENDANCE',
    targetRole: 'PARENT',
    titleEn: 'Daily Attendance Update: Marked Present',
    titleKn: 'ದೈನಂದಿನ ಹಾಜರಾತಿ ಮಾಹಿತಿ: ಹಾಜರಾಗಿದ್ದಾರೆ',
    bodyEn: 'Kavya R. Gowda was marked Present today at 9:15 AM morning assembly.',
    bodyKn: 'ಕಾವ್ಯ ಆರ್. ಗೌಡ ಅವರು ಇಂದು ಬೆಳಿಗ್ಗೆ ೯:೧೫ ರ ಪ್ರಾರ್ಥನಾ ಸಭೆಯಲ್ಲಿ ಹಾಜರಾಗಿದ್ದಾರೆ.',
    createdAt: 'Today, 9:20 AM',
    timestamp: Date.now() - 14400000,
    isRead: true,
    isUrgent: false,
    metadata: {
      studentName: 'Kavya R. Gowda',
      actionTab: 'attendance',
    },
  },
  {
    id: 'notif-p-4',
    type: 'TEACHER_ANNOUNCEMENT',
    category: 'ANNOUNCEMENT',
    targetRole: 'PARENT',
    titleEn: 'Teacher Announcement: SDMC Meeting',
    titleKn: 'ಶಿಕ್ಷಕರ ಪ್ರಕಟಣೆ: ಶಾಲಾ ಅಭಿವೃದ್ಧಿ ಸಭೆ',
    bodyEn: 'Smt. Savitri Hegde: "All parents are invited for the quarterly parent-teacher discussion on Friday at 3 PM."',
    bodyKn: 'ಶ್ರೀಮತಿ ಸಾವಿತ್ರಿ ಹೆಗಡೆ: "ಶುಕ್ರವಾರ ಮಧ್ಯಾಹ್ನ ೩ ಗಂಟೆಗೆ ಪೋಷಕ-ಶಿಕ್ಷಕರ ಸಭೆ ಆಯೋಜಿಸಲಾಗಿದೆ."',
    createdAt: 'Today, 8:30 AM',
    timestamp: Date.now() - 18000000,
    isRead: false,
    isUrgent: true,
    audioDurationSeconds: 45,
    metadata: {
      actionTab: 'notices',
    },
  },
  {
    id: 'notif-p-5',
    type: 'CONCERN_RESPONSE',
    category: 'CONCERN',
    targetRole: 'PARENT',
    titleEn: 'Teacher Responded to Your Concern',
    titleKn: 'ನಿಮ್ಮ ಸಮಸ್ಯೆಗೆ ಶಿಕ್ಷಕರಿಂದ ಸ್ಪಂದನೆ',
    bodyEn: 'Teacher Smt. Savitri Hegde responded: "Reviewed concern on homework difficulty. Extra practice sheets provided; follow-up scheduled for next Tuesday."',
    bodyKn: 'ಶಿಕ್ಷಕಿ ಸಾವಿತ್ರಿ ಹೆಗಡೆ ಅವರು ಹೋಂವರ್ಕ್ ಸಮಸ್ಯೆಗೆ ಕ್ರಮ ಕೈಗೊಂಡಿದ್ದು, ಹೆಚ್ಚುವರಿ ಅಭ್ಯಾಸ ಹಾಳೆ ನೀಡಿದ್ದಾರೆ.',
    createdAt: 'Yesterday',
    timestamp: Date.now() - 86400000,
    isRead: false,
    isUrgent: false,
    metadata: {
      studentName: 'Kavya R. Gowda',
      actionTab: 'concerns',
    },
  },
  {
    id: 'notif-p-6',
    type: 'PROGRESS_UPDATE',
    category: 'ACADEMIC',
    targetRole: 'PARENT',
    titleEn: 'Student Progress Milestone Reached',
    titleKn: 'ವಿದ್ಯಾರ್ಥಿ ಕಲಿಕಾ ಪ್ರಗತಿ ಮೈಲಿಗಲ್ಲು',
    bodyEn: 'Chethan has successfully reached Nali-Kali Level 3 milestone in Kannada letter blending!',
    bodyKn: 'ಚೇತನ್ ನಲಿಕಲಿ ಹಂತ ೩ (ಕನ್ನಡ ಅಕ್ಷರ ಸಂಯೋಜನೆ) ಮೈಲಿಗಲ್ಲನ್ನು ಯಶಸ್ವಿಯಾಗಿ ತಲುಪಿದ್ದಾರೆ!',
    createdAt: '2 days ago',
    timestamp: Date.now() - 172800000,
    isRead: true,
    isUrgent: false,
    metadata: {
      studentName: 'Chethan Gowda',
      actionTab: 'dashboard',
    },
  },

  // Student Notifications
  {
    id: 'notif-s-1',
    type: 'TEST_PUBLISHED',
    category: 'TEST',
    targetRole: 'STUDENT',
    titleEn: 'New Online Test Active: Math Practice Quiz',
    titleKn: 'ಹೊಸ ಆನ್‌ಲೈನ್ ಪರೀಕ್ಷೆ ಸಕ್ರಿಯ: ಗಣಿತ ರಸಪ್ರಶ್ನೆ',
    bodyEn: 'Grade 5 Mathematics & Mental Math quiz is available. Test your speed and multiplication skills!',
    bodyKn: '೫ನೇ ತರಗತಿ ಗಣಿತ ಮತ್ತು ವೇಗದ ಗುಣಾಕಾರ ರಸಪ್ರಶ್ನೆ ಆರಂಭವಾಗಿದೆ. ಭಾಗವಹಿಸಿ!',
    createdAt: '10 mins ago',
    timestamp: Date.now() - 600000,
    isRead: false,
    isUrgent: false,
    metadata: {
      testTitle: 'Mathematics & Mental Math Quiz',
      actionTab: 'tests-marks',
    },
  },
  {
    id: 'notif-s-2',
    type: 'RESULT_PUBLISHED',
    category: 'TEST',
    targetRole: 'STUDENT',
    titleEn: 'Test Result Published',
    titleKn: 'ನಿಮ್ಮ ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶ ಪ್ರಕಟವಾಗಿದೆ',
    bodyEn: 'Your Environmental Studies & Science Test results are out. You scored 24/25 (Grade: A+)!',
    bodyKn: 'ನಿಮ್ಮ ಪರಿಸರ ಅಧ್ಯಯನ ಮತ್ತು ವಿಜ್ಞಾನ ಪರೀಕ್ಷೆಯ ಅಂಕಗಳು ಬಂದಿವೆ. ೨೪/೨೫ (ಗ್ರೇಡ್: A+)!',
    createdAt: '1 hour ago',
    timestamp: Date.now() - 3600000,
    isRead: false,
    isUrgent: false,
    metadata: {
      score: 24,
      totalMarks: 25,
      actionTab: 'tests-marks',
    },
  },
  {
    id: 'notif-s-3',
    type: 'LEARNING_MATERIAL',
    category: 'ACADEMIC',
    targetRole: 'STUDENT',
    titleEn: 'New Learning Material Added',
    titleKn: 'ಹೊಸ ಕಲಿಕಾ ಸಾಮಗ್ರಿ ಸೇರಿಸಲಾಗಿದೆ',
    bodyEn: 'New Audio Story & Worksheet: "Kittur Rani Chennamma Historical Drama" added to Kannada library.',
    bodyKn: 'ಕನ್ನಡ ಗ್ರಂಥಾಲಯಕ್ಕೆ "ಕಿತ್ತೂರು ರಾಣಿ ಚೆನ್ನಮ್ಮ" ಆಡಿಯೋ ಕಥೆ ಮತ್ತು ಅಭ್ಯಾಸ ಹಾಳೆ ಸೇರಿಸಲಾಗಿದೆ.',
    createdAt: '3 hours ago',
    timestamp: Date.now() - 10800000,
    isRead: true,
    isUrgent: false,
    metadata: {
      actionTab: 'materials',
    },
  },
  {
    id: 'notif-s-4',
    type: 'TEACHER_ANNOUNCEMENT',
    category: 'ANNOUNCEMENT',
    targetRole: 'STUDENT',
    titleEn: 'Teacher Announcement: Science Project Reminder',
    titleKn: 'ಶಿಕ್ಷಕರ ಸೂಚನೆ: ವಿಜ್ಞಾನ ಪ್ರಾಜೆಕ್ಟ್ ಜ್ಞಾಪನೆ',
    bodyEn: 'Remember to bring plant leaf specimens tomorrow morning for the environmental herbarium notebook.',
    bodyKn: 'ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಗಿಡಮೂಲಿಕೆಗಳ ಎಲೆಗಳನ್ನು ಸಂಗ್ರಹಿಸಿ ತರಗತಿಗೆ ತರಲು ಮರೆಯದಿರಿ.',
    createdAt: 'Today, 8:45 AM',
    timestamp: Date.now() - 16200000,
    isRead: false,
    isUrgent: false,
    metadata: {
      actionTab: 'notices',
    },
  },
];

type NotificationListener = (notifications: NotificationItem[]) => void;
const listeners = new Set<NotificationListener>();

class NotificationService {
  private memoryFallback: NotificationItem[] = INITIAL_NOTIFICATIONS;

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen to cross-tab storage changes
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.notifySubscribers();
        }
      });

      // Poll periodically to provide a real-time reactive feel
      setInterval(() => {
        this.notifySubscribers();
      }, 4000);
    }
  }

  public getAllNotifications(): NotificationItem[] {
    try {
      if (typeof window === 'undefined') return this.memoryFallback;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
        return INITIAL_NOTIFICATIONS;
      }
      return JSON.parse(raw);
    } catch {
      return this.memoryFallback;
    }
  }

  public getNotificationsForRole(role?: UserRole): NotificationItem[] {
    const all = this.getAllNotifications();
    if (!role || role === 'SUPER_ADMIN') {
      return all;
    }
    return all.filter(n => {
      if (!n.targetRole || n.targetRole === 'ALL') return true;
      return n.targetRole === role;
    });
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'> & { id?: string; createdAt?: string; isRead?: boolean }): NotificationItem {
    const all = this.getAllNotifications();
    const newItem: NotificationItem = {
      ...item,
      id: item.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: item.createdAt || 'Just now',
      timestamp: item.timestamp || Date.now(),
      isRead: item.isRead ?? false,
    };

    all.unshift(newItem);
    this.save(all);

    // Dispatch custom browser event for instant UI update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('village_notification_event', { detail: newItem }));
    }

    return newItem;
  }

  public markAsRead(id: string): void {
    const all = this.getAllNotifications();
    const updated = all.map(n => n.id === id ? { ...n, isRead: true } : n);
    this.save(updated);
  }

  public markAllAsRead(role?: UserRole): void {
    const all = this.getAllNotifications();
    const updated = all.map(n => {
      if (!role || role === 'SUPER_ADMIN' || n.targetRole === role || n.targetRole === 'ALL') {
        return { ...n, isRead: true };
      }
      return n;
    });
    this.save(updated);
  }

  public deleteNotification(id: string): void {
    const all = this.getAllNotifications();
    const updated = all.filter(n => n.id !== id);
    this.save(updated);
  }

  public subscribe(listener: NotificationListener): () => void {
    listeners.add(listener);
    // initial trigger
    listener(this.getAllNotifications());
    return () => {
      listeners.delete(listener);
    };
  }

  private notifySubscribers(): void {
    const items = this.getAllNotifications();
    listeners.forEach(l => {
      try {
        l(items);
      } catch (err) {
        console.error('Error notifying notification listener', err);
      }
    });
  }

  private save(items: NotificationItem[]): void {
    this.memoryFallback = items;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        this.notifySubscribers();
      }
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  }

  // Quick Dispatch Helpers for specific domain events
  public notifyReportViewed(params: {
    studentName: string;
    studentRoll: string;
    parentName: string;
    reportType: ReportType;
    reportTitle: string;
  }): NotificationItem {
    const typeLabelEn: Record<ReportType, string> = {
      MARKS_REPORT: 'Marks Report',
      ATTENDANCE_REPORT: 'Attendance Report',
      PROGRESS_REPORT: 'Progress Report',
      TEST_REPORT: 'Test Report',
    };

    const typeLabelKn: Record<ReportType, string> = {
      MARKS_REPORT: 'ಅಂಕಗಳ ವರದಿ',
      ATTENDANCE_REPORT: 'ಹಾಜರಾತಿ ವರದಿ',
      PROGRESS_REPORT: 'ಪ್ರಗತಿ ಪತ್ರಿಕೆ ವರದಿ',
      TEST_REPORT: 'ಪರೀಕ್ಷಾ ವರದಿ',
    };

    return this.addNotification({
      type: 'REPORT_VIEWED',
      category: 'REPORT',
      targetRole: 'TEACHER',
      titleEn: `Parent Viewed Student Report`,
      titleKn: `ಪೋಷಕರು ವರದಿ ವೀಕ್ಷಿಸಿದ್ದಾರೆ`,
      // Example prompt requirement: "Rahul's parent viewed the Mathematics Test Report."
      bodyEn: `${params.studentName}'s parent (${params.parentName}) viewed the ${params.reportTitle}.`,
      bodyKn: `${params.studentName} ಅವರ ಪೋಷಕರಾದ ${params.parentName} ಅವರು "${params.reportTitle}" ${typeLabelKn[params.reportType]}ಯನ್ನು ವೀಕ್ಷಿಸಿದ್ದಾರೆ.`,
      isUrgent: false,
      metadata: {
        studentName: params.studentName,
        studentRoll: params.studentRoll,
        parentName: params.parentName,
        reportType: params.reportType,
        reportTitle: params.reportTitle,
        actionTab: 'tests-marks',
      },
    });
  }

  public notifyNewTestPublished(testTitle: string, gradeLevel: number): NotificationItem {
    // Notify parents and students
    this.addNotification({
      type: 'TEST_PUBLISHED',
      category: 'TEST',
      targetRole: 'PARENT',
      titleEn: `New Test Published: Grade ${gradeLevel}`,
      titleKn: `ಹೊಸ ಪರೀಕ್ಷೆ ಪ್ರಕಟವಾಗಿದೆ: ತರಗತಿ ${gradeLevel}`,
      bodyEn: `New test "${testTitle}" has been scheduled for Grade ${gradeLevel}. Review syllabus and practice questions.`,
      bodyKn: `${gradeLevel}ನೇ ತರಗತಿಗೆ "${testTitle}" ಪರೀಕ್ಷೆ ಪ್ರಕಟಗೊಂಡಿದೆ.`,
      isUrgent: false,
      metadata: { testTitle, actionTab: 'tests-marks' },
    });

    return this.addNotification({
      type: 'TEST_PUBLISHED',
      category: 'TEST',
      targetRole: 'STUDENT',
      titleEn: `New Test Published: ${testTitle}`,
      titleKn: `ಹೊಸ ಪರೀಕ್ಷೆ ಆರಂಭವಾಗಿದೆ: ${testTitle}`,
      bodyEn: `Your teacher published "${testTitle}". Log in to attempt before deadline.`,
      bodyKn: `ನಿಮ್ಮ ಶಿಕ್ಷಕರು "${testTitle}" ಪರೀಕ್ಷೆಯನ್ನು ಪ್ರಕಟಿಸಿದ್ದಾರೆ. ಅವಧಿಯೊಳಗೆ ಉತ್ತರಿಸಿ.`,
      isUrgent: false,
      metadata: { testTitle, actionTab: 'tests-marks' },
    });
  }

  public notifyResultPublished(params: {
    studentName: string;
    testTitle: string;
    percentage: number;
    grade: string;
  }): NotificationItem {
    // Notify parent
    this.addNotification({
      type: 'RESULT_PUBLISHED',
      category: 'TEST',
      targetRole: 'PARENT',
      titleEn: `Test Result Published: ${params.testTitle}`,
      titleKn: `ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶ ಪ್ರಕಟ: ${params.testTitle}`,
      bodyEn: `${params.studentName} scored ${params.percentage}% (${params.grade}) in ${params.testTitle}. Click to view full marksheet.`,
      bodyKn: `${params.studentName} ಅವರು ${params.testTitle} ಪರೀಕ್ಷೆಯಲ್ಲಿ ${params.percentage}% (${params.grade}) ಅಂಕ ಪಡೆದಿದ್ದಾರೆ.`,
      isUrgent: false,
      metadata: { studentName: params.studentName, testTitle: params.testTitle, actionTab: 'tests-marks' },
    });

    // Notify student
    return this.addNotification({
      type: 'RESULT_PUBLISHED',
      category: 'TEST',
      targetRole: 'STUDENT',
      titleEn: `Result Out: ${params.testTitle}`,
      titleKn: `ಫಲಿತಾಂಶ ಪ್ರಕಟ: ${params.testTitle}`,
      bodyEn: `Congratulations! You scored ${params.percentage}% (Grade ${params.grade}) in ${params.testTitle}.`,
      bodyKn: `ಅಭಿನಂದನೆಗಳು! ನೀವು ${params.testTitle} ಪರೀಕ್ಷೆಯಲ್ಲಿ ${params.percentage}% ಅಂಕ ಗಳಿಸಿದ್ದೀರಿ.`,
      isUrgent: false,
      metadata: { testTitle: params.testTitle, actionTab: 'tests-marks' },
    });
  }

  public notifyAttendanceUpdate(params: {
    studentName: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    time?: string;
  }): NotificationItem {
    const statusTextEn = params.status === 'PRESENT' ? 'Present' : params.status === 'LATE' ? 'Late' : 'Absent';
    const statusTextKn = params.status === 'PRESENT' ? 'ಹಾಜರಾಗಿದ್ದಾರೆ' : params.status === 'LATE' ? 'ತಡವಾಗಿ ಬಂದಿದ್ದಾರೆ' : 'ಗೈರುಹಾಜರಾಗಿದ್ದಾರೆ';

    return this.addNotification({
      type: 'ATTENDANCE_UPDATE',
      category: 'ATTENDANCE',
      targetRole: 'PARENT',
      titleEn: `Daily Attendance Update: ${statusTextEn}`,
      titleKn: `ದೈನಂದಿನ ಹಾಜರಾತಿ: ${statusTextKn}`,
      bodyEn: `${params.studentName} was marked ${statusTextEn} for school attendance today${params.time ? ` at ${params.time}` : ''}.`,
      bodyKn: `${params.studentName} ಅವರು ಇಂದು ಶಾಲೆಗೆ ${statusTextKn}.`,
      isUrgent: params.status === 'ABSENT',
      metadata: { studentName: params.studentName, actionTab: 'attendance' },
    });
  }

  public notifyTeacherAnnouncement(params: {
    teacherName: string;
    titleEn: string;
    titleKn: string;
    bodyEn: string;
    bodyKn: string;
    audioDuration?: number;
  }): NotificationItem {
    // Notify both parent and student
    this.addNotification({
      type: 'TEACHER_ANNOUNCEMENT',
      category: 'ANNOUNCEMENT',
      targetRole: 'STUDENT',
      titleEn: params.titleEn,
      titleKn: params.titleKn,
      bodyEn: `${params.teacherName}: ${params.bodyEn}`,
      bodyKn: `${params.teacherName}: ${params.bodyKn}`,
      isUrgent: true,
      audioDurationSeconds: params.audioDuration,
      metadata: { actionTab: 'notices' },
    });

    return this.addNotification({
      type: 'TEACHER_ANNOUNCEMENT',
      category: 'ANNOUNCEMENT',
      targetRole: 'PARENT',
      titleEn: params.titleEn,
      titleKn: params.titleKn,
      bodyEn: `${params.teacherName}: ${params.bodyEn}`,
      bodyKn: `${params.teacherName}: ${params.bodyKn}`,
      isUrgent: true,
      audioDurationSeconds: params.audioDuration,
      metadata: { actionTab: 'notices' },
    });
  }

  public notifyConcernResponse(params: {
    parentName: string;
    studentName: string;
    teacherName: string;
    concernCategory: string;
    status: string;
    actionTaken?: string;
  }): NotificationItem {
    return this.addNotification({
      type: 'CONCERN_RESPONSE',
      category: 'CONCERN',
      targetRole: 'PARENT',
      titleEn: `Teacher Action on Your Concern (${params.status})`,
      titleKn: `ನಿಮ್ಮ ಸಮಸ್ಯೆಗೆ ಶಿಕ್ಷಕರ ಪ್ರತಿಕ್ರಿಯೆ (${params.status})`,
      bodyEn: `Teacher ${params.teacherName} reviewed your concern for ${params.studentName}. Status: ${params.status}.${params.actionTaken ? ` Action taken: "${params.actionTaken}"` : ''}`,
      bodyKn: `ಶಿಕ್ಷಕರು ನಿಮ್ಮ ಮನವಿಗೆ ಸ್ಪಂದಿಸಿದ್ದಾರೆ. ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ: ${params.status}.`,
      isUrgent: false,
      metadata: { studentName: params.studentName, actionTab: 'concerns' },
    });
  }

  public notifyNewParentConcern(params: {
    parentName: string;
    studentName: string;
    category: string;
    subject: string;
  }): NotificationItem {
    return this.addNotification({
      type: 'PARENT_CONCERN',
      category: 'CONCERN',
      targetRole: 'TEACHER',
      titleEn: `New Parent Concern Submitted`,
      titleKn: `ಹೊಸ ಪೋಷಕರ ಸಮಸ್ಯೆ ದಾಖಲಾಗಿದೆ`,
      bodyEn: `${params.parentName} submitted concern regarding "${params.category}": "${params.subject}" for ${params.studentName}.`,
      bodyKn: `${params.parentName} ಅವರು ${params.studentName} ಅವರ ಬಗ್ಗೆ ಹೊಸ ಸಮಸ್ಯೆ ದಾಖಲಿಸಿದ್ದಾರೆ.`,
      isUrgent: true,
      metadata: { parentName: params.parentName, studentName: params.studentName, actionTab: 'concerns' },
    });
  }

  public notifySuspiciousExamActivity(params: {
    studentName: string;
    testTitle: string;
    activityDetails: string;
  }): NotificationItem {
    return this.addNotification({
      type: 'SUSPICIOUS_EXAM_ACTIVITY',
      category: 'TEST',
      targetRole: 'TEACHER',
      titleEn: `Suspicious Exam Activity Flagged`,
      titleKn: `ಪರೀಕ್ಷೆಯಲ್ಲಿ ಶಂಕಾಸ್ಪದ ಚಟುವಟಿಕೆ`,
      bodyEn: `Online Proctor Alert: ${params.studentName} - ${params.activityDetails} during "${params.testTitle}".`,
      bodyKn: `ಪರೀಕ್ಷಾ ನಿಗಾ ವ್ಯವಸ್ಥೆ ಎಚ್ಚರಿಕೆ: ${params.studentName} - ${params.activityDetails}.`,
      isUrgent: true,
      metadata: { studentName: params.studentName, testTitle: params.testTitle, actionTab: 'tests-marks' },
    });
  }

  public notifyStudentTestSubmission(params: {
    studentName: string;
    testTitle: string;
    score?: number;
    totalMarks?: number;
  }): NotificationItem {
    return this.addNotification({
      type: 'TEST_SUBMISSION',
      category: 'TEST',
      targetRole: 'TEACHER',
      titleEn: `Student Test Submission`,
      titleKn: `ವಿದ್ಯಾರ್ಥಿ ಪರೀಕ್ಷೆ ಸಲ್ಲಿಕೆ`,
      bodyEn: `${params.studentName} submitted "${params.testTitle}"${params.score !== undefined ? ` (Score: ${params.score}/${params.totalMarks})` : ''}.`,
      bodyKn: `${params.studentName} ಅವರು "${params.testTitle}" ಪರೀಕ್ಷೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಿದ್ದಾರೆ.`,
      isUrgent: false,
      metadata: { studentName: params.studentName, testTitle: params.testTitle, actionTab: 'tests-marks' },
    });
  }

  public notifyImportantStudentActivity(params: {
    studentName: string;
    activityTitle: string;
    details: string;
  }): NotificationItem {
    return this.addNotification({
      type: 'STUDENT_ACTIVITY',
      category: 'ACADEMIC',
      targetRole: 'TEACHER',
      titleEn: `Important Student Activity: ${params.activityTitle}`,
      titleKn: `ವಿದ್ಯಾರ್ಥಿ ಕಲಿಕಾ ಚಟುವಟಿಕೆ: ${params.activityTitle}`,
      bodyEn: `${params.studentName} ${params.details}.`,
      bodyKn: `${params.studentName} ಅವರು ${params.details}.`,
      isUrgent: false,
      metadata: { studentName: params.studentName, actionTab: 'voice-assessment' },
    });
  }

  public notifyLearningMaterialAdded(materialTitle: string, subject: string): NotificationItem {
    return this.addNotification({
      type: 'LEARNING_MATERIAL',
      category: 'ACADEMIC',
      targetRole: 'STUDENT',
      titleEn: `New Learning Material: ${materialTitle}`,
      titleKn: `ಹೊಸ ಕಲಿಕಾ ಸಾಮಗ್ರಿ: ${materialTitle}`,
      bodyEn: `New study notes & worksheets uploaded for ${subject}. Available for download now.`,
      bodyKn: `${subject} ವಿಷಯಕ್ಕೆ ಹೊಸ ನೋಟ್ಸ್ ಮತ್ತು ವರ್ಕ್‌ಶೀಟ್ ಸೇರಿಸಲಾಗಿದೆ.`,
      isUrgent: false,
      metadata: { actionTab: 'materials' },
    });
  }

  public notifyStudentProgressUpdate(params: {
    studentName: string;
    progressSummary: string;
  }): NotificationItem {
    return this.addNotification({
      type: 'PROGRESS_UPDATE',
      category: 'ACADEMIC',
      targetRole: 'PARENT',
      titleEn: `Progress Update for ${params.studentName}`,
      titleKn: `${params.studentName} ಅವರ ಪ್ರಗತಿ ವಿವರ`,
      bodyEn: `${params.studentName}: ${params.progressSummary}`,
      bodyKn: `${params.studentName} ಅವರ ಶೈಕ್ಷಣಿಕ ಪ್ರಗತಿ ಮೈಲಿಗಲ್ಲು ತಲುಪಿದೆ.`,
      isUrgent: false,
      metadata: { studentName: params.studentName, actionTab: 'dashboard' },
    });
  }
}

export const notificationService = new NotificationService();
