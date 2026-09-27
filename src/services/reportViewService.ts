// Service to record and track parent student report card views
// Notifies teachers when a parent reviews their child's academic report
import { ReportType } from '../types';
import { notificationService } from './notificationService';

export interface ReportViewRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  reportType: ReportType;
  reportTitle: string;
  term: string;
  viewedAt: string;
  timestamp: number;
  viewCount: number;
}

const STORAGE_KEY = 'village_school_report_views';

const INITIAL_RECORDS: ReportViewRecord[] = [
  {
    id: 'rv-1',
    studentId: 's1',
    studentName: 'Kavya R. Gowda',
    studentRoll: '05-A-12',
    parentId: 'p1',
    parentName: 'Sri Ramesh Gowda',
    parentPhone: '9900112233',
    reportType: 'PROGRESS_REPORT',
    reportTitle: 'Term 1 Comprehensive Assessment Report',
    term: 'Term 1 (FA-1 & SA-1)',
    viewedAt: 'Today, 8:15 AM',
    timestamp: Date.now() - 3600000,
    viewCount: 2,
  },
  {
    id: 'rv-2',
    studentId: 's2',
    studentName: 'Abhishek Nayaka',
    studentRoll: '05-A-01',
    parentId: 'p2',
    parentName: 'Sri Manjunath Nayaka',
    parentPhone: '9845112244',
    reportType: 'TEST_REPORT',
    reportTitle: 'Mathematics Test Report',
    term: 'Unit Test 1',
    viewedAt: 'Today, 9:30 AM',
    timestamp: Date.now() - 1800000,
    viewCount: 1,
  },
  {
    id: 'rv-3',
    studentId: 's1',
    studentName: 'Kavya R. Gowda',
    studentRoll: '05-A-12',
    parentId: 'p1',
    parentName: 'Sri Ramesh Gowda',
    parentPhone: '9900112233',
    reportType: 'ATTENDANCE_REPORT',
    reportTitle: 'Monthly Attendance & Punctuality Sheet',
    term: 'September 2026',
    viewedAt: 'Yesterday, 6:40 PM',
    timestamp: Date.now() - 86400000,
    viewCount: 3,
  },
  {
    id: 'rv-4',
    studentId: 's3',
    studentName: 'Bhavani Devi',
    studentRoll: '05-A-05',
    parentId: 'p3',
    parentName: 'Smt. Lakshmi Devi',
    parentPhone: '9741889900',
    reportType: 'MARKS_REPORT',
    reportTitle: 'Mid-Term Subject Marks Evaluation',
    term: 'FA-1 & FA-2 Assessment',
    viewedAt: 'Yesterday, 4:10 PM',
    timestamp: Date.now() - 95000000,
    viewCount: 1,
  },
];

export const getReportViewRecords = (): ReportViewRecord[] => {
  try {
    if (typeof window === 'undefined') return INITIAL_RECORDS;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_RECORDS;
  }
};

export const getReportViewsByStudent = (studentId: string): ReportViewRecord[] => {
  return getReportViewRecords().filter(r => r.studentId === studentId);
};

export const getRecentReportViews = (limit: number = 10): ReportViewRecord[] => {
  return getReportViewRecords().slice(0, limit);
};

export const recordReportView = (
  studentId: string,
  studentName: string,
  studentRoll: string,
  parentId: string,
  parentName: string,
  parentPhone: string,
  reportType: ReportType = 'PROGRESS_REPORT',
  reportTitle: string = 'Term 1 Comprehensive Assessment Report'
): ReportViewRecord => {
  const current = getReportViewRecords();
  const existingIdx = current.findIndex(
    r => r.studentId === studentId && r.reportType === reportType && r.reportTitle === reportTitle
  );
  
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const timeStr = `Just now (${formattedHours}:${minutes} ${ampm})`;

  let updatedRecord: ReportViewRecord;

  if (existingIdx >= 0) {
    updatedRecord = {
      ...current[existingIdx],
      viewedAt: timeStr,
      timestamp: Date.now(),
      viewCount: current[existingIdx].viewCount + 1,
    };
    current[existingIdx] = updatedRecord;
  } else {
    updatedRecord = {
      id: `rv-${Date.now()}`,
      studentId,
      studentName,
      studentRoll,
      parentId,
      parentName,
      parentPhone,
      reportType,
      reportTitle,
      term: 'Academic Year 2026-27',
      viewedAt: timeStr,
      timestamp: Date.now(),
      viewCount: 1,
    };
    current.unshift(updatedRecord);
  }

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      // Dispatch custom browser event for instant multi-component reactivity
      window.dispatchEvent(new CustomEvent('report-view-updated', { detail: updatedRecord }));
    }
  } catch (e) {
    console.error('Failed to save report view', e);
  }

  // CRITICAL REQUIREMENT:
  // "When a parent opens: Marks report, Attendance report, Progress report, Test report
  // Record: Student, Parent, Report type, View timestamp
  // Notify the relevant teacher that the report was viewed.
  // Example: 'Rahul's parent viewed the Mathematics Test Report.'"
  notificationService.notifyReportViewed({
    studentName,
    studentRoll,
    parentName,
    reportType,
    reportTitle,
  });

  return updatedRecord;
};
