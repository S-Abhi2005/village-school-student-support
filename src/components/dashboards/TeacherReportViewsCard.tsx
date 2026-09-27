import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  FileText, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Sparkles, 
  Filter, 
  Search,
  Phone,
  BarChart3,
  CalendarCheck,
  Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import { Badge } from '../../design-system/Badge';
import { useLanguage } from '../../i18n/LanguageContext';
import { getReportViewRecords, ReportViewRecord } from '../../services/reportViewService';
import { ReportType } from '../../types';

export const TeacherReportViewsCard: React.FC = () => {
  const { language } = useLanguage();
  const [reportViews, setReportViews] = useState<ReportViewRecord[]>(() => getReportViewRecords());
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setReportViews(getReportViewRecords());
    };

    window.addEventListener('report-view-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Polling interval to ensure real-time synchronization
    const interval = setInterval(handleUpdate, 3500);

    return () => {
      window.removeEventListener('report-view-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const reportTypeMeta: Record<ReportType, { labelEn: string; labelKn: string; color: 'info' | 'success' | 'warning' | 'neutral'; icon: React.ReactNode }> = {
    MARKS_REPORT: {
      labelEn: 'Marks Report',
      labelKn: 'ಅಂಕಗಳ ವರದಿ',
      color: 'warning',
      icon: <Award className="w-3.5 h-3.5" />,
    },
    ATTENDANCE_REPORT: {
      labelEn: 'Attendance Report',
      labelKn: 'ಹಾಜರಾತಿ ವರದಿ',
      color: 'success',
      icon: <CalendarCheck className="w-3.5 h-3.5" />,
    },
    PROGRESS_REPORT: {
      labelEn: 'Progress Report',
      labelKn: 'ಪ್ರಗತಿ ಪತ್ರಿಕೆ',
      color: 'info',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
    },
    TEST_REPORT: {
      labelEn: 'Test Report',
      labelKn: 'ಪರೀಕ್ಷಾ ವರದಿ',
      color: 'neutral',
      icon: <FileText className="w-3.5 h-3.5" />,
    },
  };

  const filteredRecords = reportViews.filter(r => {
    if (filterType !== 'ALL' && r.reportType !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.parentName.toLowerCase().includes(q) ||
        r.reportTitle.toLowerCase().includes(q) ||
        r.studentRoll.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <Card className="border-sky-200/80 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100 bg-sky-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-slate-900">
                  {language === 'kn' ? 'ಪೋಷಕರ ವರದಿ ವೀಕ್ಷಣೆ ಟ್ರ್ಯಾಕಿಂಗ್' : 'Parent Report-View Tracking'}
                </CardTitle>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Live Real-time
                </span>
              </div>
              <CardDescription className="text-xs text-slate-500">
                {language === 'kn'
                  ? 'ಪೋಷಕರು ಅಂಕ, ಹಾಜರಾತಿ, ಪ್ರಗತಿ ಅಥವಾ ಪರೀಕ್ಷಾ ವರದಿಗಳನ್ನು ತೆರೆದಾಗ ಶಿಕ್ಷಕರಿಗೆ ನೈಜ ಸಮಯದಲ್ಲಿ ದಾಖಲಾಗುತ್ತದೆ'
                  : 'Instant notification & logs whenever a parent opens Marks, Attendance, Progress, or Test reports'}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ/ಪೋಷಕರು...' : 'Filter student...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-sky-500 w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Reports', count: reportViews.length },
            { id: 'PROGRESS_REPORT', label: 'Progress Reports', count: reportViews.filter(r => r.reportType === 'PROGRESS_REPORT').length },
            { id: 'MARKS_REPORT', label: 'Marks Reports', count: reportViews.filter(r => r.reportType === 'MARKS_REPORT').length },
            { id: 'ATTENDANCE_REPORT', label: 'Attendance Reports', count: reportViews.filter(r => r.reportType === 'ATTENDANCE_REPORT').length },
            { id: 'TEST_REPORT', label: 'Test Reports', count: reportViews.filter(r => r.reportType === 'TEST_REPORT').length },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors shrink-0 cursor-pointer ${
                filterType === f.id
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{f.label}</span>
              <span className={`ml-1.5 text-[10px] px-1 py-0.2 rounded-full ${filterType === f.id ? 'bg-sky-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              {language === 'kn' ? 'ಯಾವುದೇ ವೀಕ್ಷಣೆ ದಾಖಲೆಗಳಿಲ್ಲ' : 'No parent report view records found for this filter.'}
            </div>
          ) : (
            filteredRecords.map(record => {
              const meta = reportTypeMeta[record.reportType] || {
                labelEn: record.reportType,
                labelKn: record.reportType,
                color: 'neutral',
                icon: <FileText className="w-3.5 h-3.5" />,
              };

              return (
                <div
                  key={record.id}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                      {meta.icon}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {record.studentName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                          {record.studentRoll}
                        </span>
                        <Badge variant={meta.color} size="sm">
                          {language === 'kn' ? meta.labelKn : meta.labelEn}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-700 font-medium mt-1">
                        {record.reportTitle}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1 text-slate-600">
                          👤 {language === 'kn' ? 'ವೀಕ್ಷಿಸಿದ ಪೋಷಕರು:' : 'Parent:'} <strong className="font-semibold text-slate-800">{record.parentName}</strong>
                        </span>
                        {record.parentPhone && (
                          <span className="text-slate-400 flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {record.parentPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 text-right">
                    <div className="text-right">
                      <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/60 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-600" />
                        {record.viewedAt}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {record.viewCount > 1 ? `Viewed ${record.viewCount} times` : 'Viewed for the first time'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
