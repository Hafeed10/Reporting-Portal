import React, { useState } from 'react';
import { ArrowLeft, Printer, Copy, Check, Edit2, Calendar, User, Eye, Lightbulb } from 'lucide-react';

const AhlussuffaLogo = ({ className = "w-8 h-8" }) => (
  <img src="/logo.png" className={className} alt="Ahlussuffa Logo" />
);

const renderStudentCard = (sr, report) => {
  const studentTotalDays = Number(sr.present || 0) + Number(sr.absent || 0) + Number(sr.absent_approved || 0) + Number(sr.leave || 0) + Number(sr.leave_approved || 0);
  const studentAttendancePct = studentTotalDays > 0 ? Math.round((Number(sr.present || 0) / studentTotalDays) * 100) : (sr.attendance_pct || 100);

  return (
    <div className="space-y-6">
      {/* School Roster Banner */}
      <div className="text-center border-b-2 border-double border-slate-300 pb-5 mb-4">
        <div className="text-xxs font-black tracking-widest text-indigo-600 uppercase mb-1">Monthly Student Report Card</div>
        <h2 className="text-2xl font-black text-slate-900 tracking-wide uppercase">
          STUDENT ACTIVITY PERFORMANCE
        </h2>
        <div className="mt-2.5 inline-flex items-center gap-2">
          <span className="px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wide">
            {report.dars}
          </span>
          <span className="px-3 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold tracking-wide">
            {report.month}
          </span>
        </div>
      </div>

      {/* Profile Header Block */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-205 p-4 rounded-xl text-xs font-bold text-slate-700 mb-2">
        <div>Student Name: <span className="font-black text-slate-900 block text-sm mt-0.5">{sr.student_name}</span></div>
        <div className="text-right">Report Date: <span className="font-medium text-slate-600 block text-sm mt-0.5">{report.report_date}</span></div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
        {/* Attendance Performance */}
        <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-slate-50/30">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest mb-2">Attendance Rating</span>
          <div className="relative w-20 h-20 flex items-center justify-center rounded-full border-4 border-slate-100 bg-white shadow-sm mb-2">
            <span className={`text-lg font-black ${studentAttendancePct >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {studentAttendancePct}%
            </span>
          </div>
          <span className={`text-xxs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${studentAttendancePct >= 95
              ? 'bg-emerald-100 text-emerald-800'
              : studentAttendancePct >= 90
                ? 'bg-teal-100 text-teal-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
            {studentAttendancePct >= 95 ? 'Excellent' : studentAttendancePct >= 90 ? 'Satisfactory' : 'Needs Improvement'}
          </span>
        </div>

        {/* Participation Rating */}
        <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-slate-50/30">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest mb-3">Participation Assessment</span>
          <div className="h-16 flex items-center justify-center mb-3">
            <span className={`text-xl font-black uppercase tracking-wide px-4 py-1.5 rounded-xl ${sr.participation === 'Active'
                ? 'bg-teal-100 text-teal-800'
                : sr.participation === 'Semi-active'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-slate-100 text-slate-700'
              }`}>
              {sr.participation}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Engagement during activities</span>
        </div>
      </div>

      {/* Attendance & Leaves Breakdown */}
      <div className="border border-slate-200 rounded-xl p-4 space-y-2">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-1 mb-2">Attendance & Leave Breakdown</h3>
        <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-5 gap-1.5 text-center text-xs">
          <div className="p-1.5 bg-slate-50 rounded-lg">
            <span className="text-[9px] font-bold text-indigo-650 uppercase block">Present (P)</span>
            <span className="text-sm font-black text-slate-800">{sr.present ?? 0}</span>
          </div>
          <div className="p-1.5 bg-red-50 rounded-lg">
            <span className="text-[9px] font-bold text-red-650 uppercase block">Absent (A)</span>
            <span className="text-sm font-black text-slate-800">{sr.absent ?? 0}</span>
          </div>
          <div className="p-1.5 bg-teal-50 rounded-lg">
            <span className="text-[9px] font-bold text-teal-650 uppercase block">Abs. App (AA)</span>
            <span className="text-sm font-black text-slate-800">{sr.absent_approved ?? 0}</span>
          </div>
          <div className="p-1.5 bg-amber-50 rounded-lg">
            <span className="text-[9px] font-bold text-amber-650 uppercase block">Leave (L)</span>
            <span className="text-sm font-black text-slate-800">{sr.leave ?? 0}</span>
          </div>
          <div className="p-1.5 bg-purple-50 rounded-lg">
            <span className="text-[9px] font-bold text-purple-650 uppercase block">Lv. App (LA)</span>
            <span className="text-sm font-black text-slate-800">{sr.leave_approved ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Achievements Box */}
      {sr.achievements && (
        <div className="border border-emerald-100 bg-emerald-50/20 rounded-xl p-4">
          <h3 className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            ★ Special Achievements
          </h3>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {sr.achievements}
          </p>
        </div>
      )}

      {/* Remarks Comment */}
      <div className="border border-slate-200 rounded-xl p-4">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-1 mb-2">Teacher Remarks</h3>
        <p className="text-xs italic text-slate-600 leading-relaxed">
          {sr.remarks ? `"${sr.remarks}"` : '"No specific comments entered. Overall student progress is satisfactory."'}
        </p>
      </div>

      {/* Footer signature */}
      <div className="mt-10 pt-5 border-t border-slate-250 grid grid-cols-2 gap-8 font-bold text-xs text-slate-800 print-avoid-break">
        <div>
          Student Name:
          <span className="font-medium text-slate-600 block mt-1">{report.prepared_by}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{report.designation}</span>
        </div>
        <div className="text-right flex flex-col justify-end">
          Signature: ____________________
        </div>
      </div>
    </div>
  );
};

const toDisplayMonth = (yyyy_mm) => {
  if (!yyyy_mm) return '—';
  if (!/^\d{4}-\d{2}$/.test(yyyy_mm)) return yyyy_mm;
  const [y, m] = yyyy_mm.split('-');
  const d = new Date(parseInt(y), parseInt(m) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export default function ReportPreview({ report, onBack }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'grid', 'card'
  const [selectedStudentIdx, setSelectedStudentIdx] = useState(-1);
  const [coordinatorSigned, setCoordinatorSigned] = useState(false);
  const [directorSigned, setDirectorSigned] = useState(false);
  const [directorSealError, setDirectorSealError] = useState(false);

  const studentReports = report.student_reports || [];
  const currentStudent = studentReports.find(s => s.student_name === report.prepared_by) || {};
  const isStudent = report.designation === 'Student' || !!currentStudent.student_name;
  const studentTotalDays = isStudent
    ? Number(currentStudent.present || 0) + Number(currentStudent.absent || 0) + Number(currentStudent.absent_approved || 0) + Number(currentStudent.leave || 0) + Number(currentStudent.leave_approved || 0)
    : 0;
  const studentAttendancePct = isStudent
    ? (studentTotalDays > 0 ? Math.round((Number(currentStudent.present || 0) / studentTotalDays) * 100) : (currentStudent.attendance_pct || 100))
    : 0;

  const handlePrint = () => {
    window.print();
  };

  const getMarkdownText = () => {
    const reasons = report.leave_reasons || { medical: 0, family_function: 0, personal: 0, others: 0 };

    const programNames = report.programs_names && report.programs_names.length > 0
      ? report.programs_names.map((name, idx) => `  ${idx + 1}. ${name}`).join('\n')
      : '  1. ---';

    const learningOutcomes = report.programs_outcomes && report.programs_outcomes.length > 0
      ? report.programs_outcomes.map(outcome => `  * ${outcome}`).join('\n')
      : '  * ---';

    const booksRead = report.books_read && report.books_read.length > 0
      ? report.books_read.map((book, idx) => `  ${idx + 1}. ${book}`).join('\n')
      : '  1. ---';

    const writingActivities = report.writing_activities && report.writing_activities.length > 0
      ? report.writing_activities.map((w, idx) => `  ${idx + 1}. ${w}`).join('\n')
      : '  1. ---';

    const achievements = report.participation_achievements && report.participation_achievements.length > 0
      ? report.participation_achievements.map(ach => `  * ${ach}`).join('\n')
      : '  * ---';

    const formatMetric = (val) => {
      const sum = Number(val || 0);
      return `${sum}`;
    };

    const presentVal = isStudent ? (currentStudent.present ?? 0) : (report.attendance_regular_count || 0);
    const absentVal = isStudent ? (currentStudent.absent ?? 0) : (report.attendance_low_count || 0);
    const absentApprovedVal = isStudent ? (currentStudent.absent_approved ?? 0) : (report.leave_total_received || 0);
    const leaveVal = isStudent ? (currentStudent.leave ?? 0) : (report.leave_unapproved_count || 0);
    const leaveApprovedVal = isStudent ? (currentStudent.leave_approved ?? 0) : (report.leave_approved_count || 0);
    const avgAttendanceVal = isStudent ? studentAttendancePct : report.attendance_avg_pct;

    let markdown = `MONTHLY STUDENT ACTIVITY REPORT

Dars / Class: ${report.dars || '—'}
Month: ${report.month}
Prepared By: ${report.prepared_by} (${report.designation})

### 1. Attendance & Leaves Summary

* Total Working Days: ${report.attendance_total_working_days}
* ${isStudent ? 'Student' : 'Average Student'} Attendance: ${avgAttendanceVal}%
* ${isStudent ? 'Present (P)' : 'Total Present (P)'}: ${formatMetric(presentVal)}
* ${isStudent ? 'Absent (A)' : 'Total Absent (A)'}: ${formatMetric(absentVal)}
* ${isStudent ? 'Absent Approved (AA)' : 'Total Absent Approved (AA)'}: ${formatMetric(absentApprovedVal)}
* ${isStudent ? 'Leave (L)' : 'Total Leave (L)'}: ${formatMetric(leaveVal)}
* ${isStudent ? 'Leave Approved (LA)' : 'Total Leave Approved (LA)'}: ${formatMetric(leaveApprovedVal)}

### 3. Skill Activities

* Skill Activities Participation: ${report.programs_count || 0}

* Skill Activity Names:

${programNames}

* Key Learning Outcomes:

${learningOutcomes}

* Book Reading Activities:

${booksRead}

* Writing Activities:

${writingActivities}

### 4. Student Participation

* Special Achievements:

${achievements}



Student Name: ${report.prepared_by}

Designation: ${report.designation}

Date: ${report.report_date}
`;

    if (studentReports.length > 0) {
      markdown += `\n### 7. Individual Student Performance Reports\n\n`;
      studentReports.forEach((sr, idx) => {
        const studentTotalDays = Number(sr.present || 0) + Number(sr.absent || 0) + Number(sr.absent_approved || 0) + Number(sr.leave || 0) + Number(sr.leave_approved || 0);
        const studentAttendancePct = studentTotalDays > 0 ? Math.round((Number(sr.present || 0) / studentTotalDays) * 100) : (sr.attendance_pct || 100);
        markdown += `#### ${idx + 1}. ${sr.student_name}\n`;
        markdown += `* Attendance: ${studentAttendancePct}%\n`;
        markdown += `* Performance Metrics: Present (P): ${sr.present || 0}, Absent (A): ${sr.absent || 0}, Absent Approved (AA): ${sr.absent_approved || 0}, Leave (L): ${sr.leave || 0}, Leave Approved (LA): ${sr.leave_approved || 0}\n`;
        markdown += `* Participation: ${sr.participation || 'Active'}\n`;
        if (sr.achievements) markdown += `* Achievements: ${sr.achievements}\n`;
        if (sr.remarks) markdown += `* Remarks: ${sr.remarks}\n`;
        markdown += `\n`;
      });
    }

    return markdown;
  };

  const handleCopyMarkdown = () => {
    const md = getMarkdownText();
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const reasons = report.leave_reasons || { medical: 0, family_function: 0, personal: 0, others: 0 };

  return (
    <div className="space-y-6">
      {/* Action panel (hidden during printing) */}
      <div
        className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl light:bg-white light:border-slate-200 no-print"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <button
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-all cursor-pointer"
          style={{ backgroundColor: 'var(--bg-surface-active)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          onClick={onBack}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex flex-wrap gap-2.5 items-center">
          {activeTab === 'card' && studentReports.length > 0 && (
            <div
              className="flex items-center gap-2 border border-slate-700 rounded-xl px-3 py-1.5 bg-slate-800/40 mr-1.5 light:bg-slate-105 light:border-slate-200"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface-active)' }}
            >
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Student:</span>
              <select
                value={selectedStudentIdx}
                onChange={(e) => setSelectedStudentIdx(Number(e.target.value))}
                className="bg-transparent border-0 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer light:text-slate-800"
                style={{ color: 'var(--text-secondary)' }}
              >
                <option value={-1} className="bg-slate-900 text-slate-100 light:bg-white light:text-slate-850">
                  All Students
                </option>
                {studentReports.map((sr, idx) => (
                  <option key={`opt-student-${idx}`} value={idx} className="bg-slate-900 text-slate-100 light:bg-white light:text-slate-850">
                    {sr.student_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--bg-surface-active)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            onClick={handleCopyMarkdown}
          >
            {copied ? (
              <>
                <Check size={15} className="text-teal-400" style={{ color: 'var(--accent-teal)' }} /> Copied!
              </>
            ) : (
              <>
                <Copy size={15} /> Copy Markdown
              </>
            )}
          </button>

          <button
            className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--accent-indigo), #4f46e5)',
              boxShadow: 'var(--shadow-glow-indigo)'
            }}
            onClick={handlePrint}
          >
            <Printer size={15} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Tabs bar for switching views */}
      <div className="flex overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-full sm:w-fit no-print light:bg-white light:border-slate-200" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 sm:flex-initial shrink-0 text-center px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'summary' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
            }`}
          style={{
            backgroundColor: activeTab === 'summary' ? 'var(--bg-surface-active)' : 'transparent',
            color: activeTab === 'summary' ? 'var(--text-primary)' : 'var(--text-muted)'
          }}
        >
          Class Summary
        </button>
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex-1 sm:flex-initial shrink-0 text-center px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'grid' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-205'
            }`}
          style={{
            backgroundColor: activeTab === 'grid' ? 'var(--bg-surface-active)' : 'transparent',
            color: activeTab === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)'
          }}
        >
          Students Grid
        </button>
        <button
          onClick={() => setActiveTab('card')}
          className={`flex-1 sm:flex-initial shrink-0 text-center px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'card' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-205'
            }`}
          style={{
            backgroundColor: activeTab === 'card' ? 'var(--bg-surface-active)' : 'transparent',
            color: activeTab === 'card' ? 'var(--text-primary)' : 'var(--text-muted)'
          }}
        >
          Report Cards
        </button>
      </div>

      {/* ── View 1: Class Summary Sheet ─────────────────────────── */}
      {activeTab === 'summary' && (
        <>
          {/* Screen View (High-fidelity glassmorphic dark mockup) */}
          <div className="no-print space-y-5 max-w-3xl mx-auto animate-fade-in text-slate-200">
            {/* Header / Title block */}
            <div className="flex flex-col gap-1 pb-1">
              <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">
                Monthly Performance Report
              </h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Academic Session: {toDisplayMonth(report.month)}
              </p>
            </div>

            {/* Quick Stats Grid / Card Deck */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Working Classes Card */}
              <div className="glass-card rounded-3xl p-5 border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[140px]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Total Classes Held
                </span>
                <div className="flex items-baseline gap-2 mt-4 bg-slate-950/40 border border-slate-850 rounded-2xl px-4 py-2.5 w-fit" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                  <span className="text-2xl font-black text-indigo-400">
                    {report.attendance_total_working_days || '0'}
                  </span>
                  <span className="text-xxs font-bold text-slate-400">Class</span>
                </div>
                {/* SVG calendar illustration decoration */}
                <div className="absolute right-4 bottom-4 text-slate-700/10 pointer-events-none">
                  <Calendar size={55} strokeWidth={1.5} />
                </div>
              </div>

              {/* Total Student Leaves Card */}
              <div className="glass-card rounded-3xl p-5 border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[140px]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Total Student Leaves
                </span>
                <div className="flex items-baseline gap-2 mt-4 bg-slate-950/40 border border-red-500/25 rounded-2xl px-4 py-2.5 w-fit" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'rgba(239, 68, 68, 0.25)' }}>
                  <span className="text-2xl font-black text-red-400">
                    {report.student_reports && report.student_reports.length > 0
                      ? report.student_reports.reduce((sum, sr) => sum + Number(sr.leave || 0) + Number(sr.leave_approved || 0), 0)
                      : Number(report.leave_unapproved_count || 0) + Number(report.leave_approved_count || 0)}
                  </span>
                  <span className="text-xxs font-bold text-slate-400">Total</span>
                </div>
                {/* SVG cross decoration */}
                <div className="absolute right-6 bottom-3 text-red-500/10 pointer-events-none font-bold text-5xl">
                  ✕
                </div>
              </div>

              {/* Skill Activities Card */}
              <div className="glass-card rounded-3xl p-5 border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[140px]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Skill Activities Participation
                </span>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-baseline gap-1.5 bg-slate-950/40 border border-slate-850 rounded-2xl px-4 py-2.5" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    <span className="text-2xl font-black text-teal-400">
                      {report.programs_count || '0'}
                    </span>
                    <span className="text-xxs font-bold text-slate-400">Sessions</span>
                  </div>
                  {/* Avatar group */}
                  <div className="flex items-center -space-x-1.5 shrink-0">
                    <div className="w-5.5 h-5.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[7px] font-black text-slate-300">ZH</div>
                    <div className="w-5.5 h-5.5 rounded-full bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-[7px] font-black text-indigo-300">FZ</div>
                    <div className="w-5.5 h-5.5 rounded-full bg-teal-900/60 border border-teal-700/50 flex items-center justify-center text-[7px] font-black text-teal-300">OF</div>
                    <div className="w-5.5 h-5.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[7px] font-black text-slate-500">+12</div>
                  </div>
                </div>
                {/* SVG recycle arrow decoration */}
                <div className="absolute right-4 bottom-4 text-teal-500/10 pointer-events-none">
                  <svg width="55" height="55" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-spin-slow">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                </div>
              </div>

            </div>

            {/* Defaulter Students & Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Defaulter Students Card */}
              <div className="glass-card rounded-3xl p-5 border border-slate-800 flex flex-col justify-between" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                <div className="flex justify-between items-center border-b border-slate-850 pb-2.5 mb-2" style={{ borderColor: 'var(--border-color)' }}>
                  <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">
                    Defaulter Students
                  </h4>
                  <User size={14} className="text-slate-500" />
                </div>
                <div className="space-y-1.5 flex-1">
                  {(() => {
                    const listToRender = studentReports.map(sr => {
                      const studentTotalDays = Number(sr.present || 0) + Number(sr.absent || 0) + Number(sr.absent_approved || 0) + Number(sr.leave || 0) + Number(sr.leave_approved || 0);
                      const attendancePct = studentTotalDays > 0 ? Math.round((Number(sr.present || 0) / studentTotalDays) * 100) : (sr.attendance_pct || 100);
                      const absentDays = sr.present !== undefined
                        ? (Number(sr.absent || 0) + Number(sr.absent_approved || 0) + Number(sr.leave || 0) + Number(sr.leave_approved || 0))
                        : (Number(sr.leave_unapproved || 0) + Number(sr.leave_approved || 0));
                      return { name: sr.student_name, attendancePct, absentDays };
                    });

                    const lowAttendance = listToRender.filter(item => item.attendancePct < 85);
                    const sortedList = [...listToRender].sort((a, b) => b.absentDays - a.absentDays);
                    const finalRenderList = lowAttendance.length > 0 ? lowAttendance : (sortedList.length > 0 ? sortedList : [
                      { name: 'Zaid Ahmed', absentDays: 8 },
                      { name: 'Fatima Zahra', absentDays: 6 },
                      { name: 'Omar Farooq', absentDays: 5 },
                      { name: 'Mariam Ali', absentDays: 5 }
                    ]);

                    return (
                      <div className="divide-y divide-slate-850/65" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex justify-between text-[8px] font-black text-slate-500 tracking-wider pb-1.5 uppercase">
                          <span>Name</span>
                          <span>Class Absent</span>
                        </div>
                        {finalRenderList.slice(0, 4).map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 text-xs font-bold">
                            <span className="text-slate-300" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                            <span className="text-red-400 font-black text-sm shrink-0 pr-1" style={{ color: 'var(--accent-danger)' }}>
                              {String(item.absentDays).padStart(2, '0')}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <p className="text-[9px] font-bold text-slate-500 italic mt-3" style={{ color: 'var(--text-muted)' }}>
                  Auto-calculated from daily attendance records
                </p>
              </div>

              {/* Quick Summary Card */}
              <div className="glass-card rounded-3xl p-5 border border-slate-800 flex flex-col justify-between" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                <div className="flex justify-between items-center border-b border-slate-850 pb-2.5 mb-4" style={{ borderColor: 'var(--border-color)' }}>
                  <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">
                    Quick Summary
                  </h4>
                  <span className="text-slate-500 font-bold text-xs">i</span>
                </div>
                <div className="space-y-4 flex-1">
                  {/* Avg Attendance */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-400" style={{ color: 'var(--text-secondary)' }}>Avg. Attendance</span>
                      <span className="text-teal-400 font-black">{report.attendance_avg_pct || '92.4'}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{
                          width: `${report.attendance_avg_pct || 92.4}%`,
                          backgroundColor: 'var(--accent-teal)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Curriculum Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-400" style={{ color: 'var(--text-secondary)' }}>Curriculum Progress</span>
                      <span className="text-indigo-400 font-black">78%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: '78%',
                          backgroundColor: 'var(--accent-indigo)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>



            {/* Signature & Seal Blocks (Interactive) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Coordinator Digital Signature Box */}
              <div className="glass-card rounded-3xl p-5 border border-slate-800 flex flex-col justify-between gap-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Coordinator Digital Signature
                </span>

                {/* Clickable stamp signature box */}
                <div
                  onClick={() => setCoordinatorSigned(prev => !prev)}
                  className="bg-slate-950/40 hover:bg-slate-950/60 border border-dashed border-slate-800 hover:border-indigo-500/30 rounded-2xl h-24 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden group select-none"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                >
                  {coordinatorSigned ? (
                    <div className="flex flex-col items-center justify-center p-2 animate-fade-in">
                      {/* Stylized digital seal stamp */}
                      <div className="border-2 border-double border-indigo-500/50 rounded-full px-4 py-1.5 text-[8px] font-black uppercase text-indigo-400 tracking-widest rotate-[-3deg] shadow-[0_0_12px_rgba(99,102,241,0.2)]">
                        ★ APPROVED SEAL ★
                      </div>
                      <span className="text-[7px] text-slate-500 uppercase mt-1">
                        AHLUSSUFFA ACADEMIC REGISTERED
                      </span>
                      <span className="text-[7px] text-indigo-400 font-bold mt-0.5 tracking-wider">
                        SECURE DIGITALLY SIGNED
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-1 shrink-0 opacity-80 group-hover:scale-105 transition-transform">
                        <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                      <span className="text-[9px] font-black tracking-wider uppercase">Click to apply digital seal</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end border-t border-slate-850 pt-2.5" style={{ borderColor: 'var(--border-color)' }}>
                  <div>
                    <h5 className="text-xs font-black text-slate-200" style={{ color: 'var(--text-primary)' }}>
                      {report.prepared_by || 'Academic Coordinator'}
                    </h5>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {report.designation || 'Academic Coordinator'}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500" style={{ color: 'var(--text-muted)' }}>
                    ID: AC-88291
                  </span>
                </div>
              </div>

              {/* Director Approval Review Box */}
              <div className="glass-card rounded-3xl p-5 border border-slate-800 flex flex-col justify-between gap-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Director Digital Signature
                </span>

                {/* Clickable seal area */}
                {!directorSigned ? (
                  <button
                    onClick={() => setDirectorSigned(true)}
                    className="w-full h-24 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-blue-400 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all cursor-pointer no-print mt-2 select-none"
                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-input)' }}
                  >
                    <svg className="w-5 h-5 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Click to apply digital seal</span>
                  </button>
                ) : (
                  <div
                    onClick={() => setDirectorSigned(false)}
                    className="w-full h-24 flex flex-col items-center justify-center cursor-pointer relative mt-2 rounded-xl bg-slate-900/40 border border-slate-800 hover:bg-slate-900/60 transition-all select-none"
                    title="Click to remove seal"
                  >
                    <div className="flex flex-col items-center justify-center animate-fade-in p-1">
                      {directorSealError ? (
                        <div className="text-center text-blue-400/90 transform -rotate-2 p-1 inline-block" style={{ fontFamily: 'Georgia, serif' }}>
                          <div className="text-[17px] font-black tracking-wider uppercase text-blue-400">DIRECTOR</div>
                          <div className="text-[15px] font-bold leading-tight text-blue-400">Ahlussuffa Dars</div>
                          <div className="text-[15px] font-bold leading-tight text-blue-400">Kannur, Kerala</div>
                          <div className="text-[13px] font-bold leading-tight mt-0.5 text-blue-400">Mob: +91 9746431108</div>
                        </div>
                      ) : (
                        <img
                          src="/seal.png"
                          alt="Director Seal"
                          className="h-20 object-contain mix-blend-multiply opacity-90 transform -rotate-2"
                          onError={() => setDirectorSealError(true)}
                        />
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-end border-t border-slate-850 pt-2.5" style={{ borderColor: 'var(--border-color)' }}>
                  <div>
                    <h5 className="text-xs font-black text-slate-200" style={{ color: 'var(--text-primary)' }}>
                      Project Director
                    </h5>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Board of Directors
                    </p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase" style={{ color: 'var(--text-muted)' }}>
                    DATE: _ / _ / {report.month ? (report.month.match(/\d{4}/)?.[0] || new Date().getFullYear()) : new Date().getFullYear()}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Print View (Original White/Light Paper Page Layout) */}
          <div className="hidden print:block bg-white text-slate-800 rounded-2xl shadow-xl p-0 max-w-3xl mx-auto border border-slate-200 leading-relaxed print-sheet overflow-hidden">
            {/* Header Banner - Clean white/light theme with border */}
            <div className="bg-white text-slate-800 p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center relative gap-6 border-b-4 border-[#1a2d4c]">
              {/* Left Header content */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">
                  REPORT | {report.month}
                </span>
                <h2 className="text-2xl font-normal leading-tight tracking-wide text-slate-900">
                  <span className="font-black text-[#1a2d4c]">MONTHLY SUMMARY</span> REPORT
                </h2>
                {/* Concentric waves SVG decoration */}
                <div className="pt-2 text-indigo-600/10">
                  <svg width="100" height="30" viewBox="0 0 100 30" fill="none" className="stroke-current">
                    <path d="M10 25 C 30 5, 70 5, 90 25" strokeWidth="1.5" />
                    <path d="M20 25 C 35 12, 65 12, 80 25" strokeWidth="1.5" />
                    <path d="M30 25 C 40 18, 60 18, 70 25" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              {/* Right Header content */}
              <div className="flex flex-col items-end gap-3 text-right">
                {/* Logo block */}
                <div className="flex items-center gap-2">
                  <AhlussuffaLogo className="w-8 h-8" />
                  <span className="text-base font-black uppercase tracking-wider text-slate-900">
                    Ahlussuffa
                  </span>
                </div>

                {/* Prepared details */}
                <div className="text-[11px] font-semibold text-slate-600 space-y-0.5">
                  <div><span className="text-slate-500">Student Name:</span> <span className="text-slate-900 font-bold">{report.prepared_by}</span></div>
                  <div><span className="text-slate-500">Designation:</span> {report.designation}</div>
                  <div><span className="text-slate-500">Class / Dars:</span> <span className="font-extrabold text-[#0284c7]">{report.dars || '—'}</span></div>
                  <div><span className="text-slate-500">Date:</span> {report.report_date}</div>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10 space-y-8">
              {/* Section 1: Overview */}
              <div className="print-avoid-break">
                <h3 className="text-xs font-black text-slate-900 tracking-widest uppercase border-l-4 border-[#3b4d61] pl-2.5 mb-3">
                  Overview
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-xl w-full">
                  <table className="min-w-[500px] w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                        <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider border-r border-slate-200 w-1/3">Metric</th>
                        <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-[#f8fafc] border-b border-slate-200">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-900 border-r border-slate-200">Class / Dars</td>
                        <td className="px-4 py-2.5 text-xs text-slate-800 font-medium">{report.dars || '—'}</td>
                      </tr>
                      <tr className="bg-[#edf2f7] border-b border-slate-200">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-900 border-r border-slate-200">Student Name</td>
                        <td className="px-4 py-2.5 text-xs text-slate-800 font-medium">{report.prepared_by} ({report.designation})</td>
                      </tr>
                      <tr className="bg-[#f8fafc]">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-900 border-r border-slate-200">Report Date</td>
                        <td className="px-4 py-2.5 text-xs text-slate-800 font-medium">{report.report_date}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Key Metrics */}
              <div className="print-avoid-break">
                <h3 className="text-xs font-black text-slate-900 tracking-widest uppercase border-l-4 border-[#3b4d61] pl-2.5 mb-3">
                  Key Metrics
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-xl w-full">
                  <table className="min-w-[500px] w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                        <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider border-r border-slate-200 w-1/3">Metric</th>
                        <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-[#f8fafc] border-b border-slate-200">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-900 border-r border-slate-200">Total Classes Held</td>
                        <td className="px-4 py-2.5 text-xs text-slate-800 font-medium">{report.attendance_total_working_days}</td>
                      </tr>
                      <tr className="bg-[#edf2f7] border-b border-slate-200 no-print">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-900 border-r border-slate-200">
                          {isStudent ? 'Student Attendance Rating' : 'Average Student Attendance'}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-800 font-bold text-indigo-700">
                          {isStudent ? `${studentAttendancePct}%` : `${report.attendance_avg_pct}%`}
                        </td>
                      </tr>
                      <tr className="bg-[#f8fafc] border-b border-slate-200">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-900 border-r border-slate-200">Present (P)</td>
                        <td className="px-4 py-2.5 text-xs text-slate-800 font-medium">
                          {isStudent ? (currentStudent.present ?? 0) : (report.attendance_regular_count || 0)}
                        </td>
                      </tr>
                      <tr className="bg-[#edf2f7] border-b border-slate-200">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-900 border-r border-slate-200">Absent (A)</td>
                        <td className="px-4 py-2.5 text-xs text-slate-800 font-medium">
                          {isStudent ? (currentStudent.absent ?? 0) : (report.attendance_low_count || 0)}
                        </td>
                      </tr>
                      <tr className="bg-[#f8fafc] border-b border-slate-200">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-900 border-r border-slate-200">Absent Approved (AA)</td>
                        <td className="px-4 py-2.5 text-xs text-slate-800 font-medium">
                          {isStudent ? (currentStudent.absent_approved ?? 0) : (report.leave_total_received || 0)}
                        </td>
                      </tr>
                      <tr className="bg-[#edf2f7] border-b border-slate-200">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-900 border-r border-slate-200">Leave (L)</td>
                        <td className="px-4 py-2.5 text-xs text-slate-800 font-medium">
                          {isStudent ? (currentStudent.leave ?? 0) : (report.leave_unapproved_count || 0)}
                        </td>
                      </tr>
                      <tr className="bg-[#f8fafc]">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-900 border-r border-slate-200">Leave Approved (LA)</td>
                        <td className="px-4 py-2.5 text-xs text-slate-800 font-medium">
                          {isStudent ? (currentStudent.leave_approved ?? 0) : (report.leave_approved_count || 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Performance Analysis */}
              <div className="print-avoid-break">
                <h3 className="text-xs font-black text-slate-900 tracking-widest uppercase border-l-4 border-[#3b4d61] pl-2.5 mb-4">
                  Performance Analysis
                </h3>
                <div className="space-y-3.5">
                  <div className="text-xs text-slate-850 flex gap-2">
                    <span className="font-bold text-[#1a2d4c] shrink-0">• Key Achievements:</span>
                    <span>{report.participation_achievements && report.participation_achievements.length > 0 ? report.participation_achievements.join(', ') : 'No special achievements recorded.'}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Monthly Performance */}
              <div className="print-avoid-break">
                <h3 className="text-xs font-black text-slate-900 tracking-widest uppercase border-l-4 border-[#3b4d61] pl-2.5 mb-3">
                  Monthly Performance
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-xl w-full">
                  <table className="min-w-[500px] w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                        <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider border-r border-slate-200 w-1/3">Metric</th>
                        <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-[#f8fafc] border-b border-slate-200">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-900 border-r border-slate-200">Skill Activities Participation</td>
                        <td className="px-4 py-2.5 text-xs text-slate-800 font-medium">{report.programs_count} activities</td>
                      </tr>
                      <tr className="bg-[#edf2f7] border-b border-slate-200">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-900 border-r border-slate-200">Skill Activity Names</td>
                        <td className="px-4 py-2.5 text-xs text-slate-800 font-medium">
                          {report.programs_names && report.programs_names.length > 0 ? (
                            <ul className="list-disc pl-4 space-y-1">
                              {report.programs_names.map((n, i) => <li key={`prog-${i}`}>{n}</li>)}
                            </ul>
                          ) : 'None recorded'}
                        </td>
                      </tr>
                      <tr className="bg-[#f8fafc] border-b border-slate-200">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-900 border-r border-slate-200">Book Reading Activities</td>
                        <td className="px-4 py-2.5 text-xs text-slate-800 font-medium">
                          {report.books_read && report.books_read.length > 0 ? (
                            <ul className="list-disc pl-4 space-y-1">
                              {report.books_read.map((b, i) => <li key={`book-${i}`}>{b}</li>)}
                            </ul>
                          ) : 'None recorded'}
                        </td>
                      </tr>
                      <tr className="bg-[#edf2f7]">
                        <td className="px-4 py-2.5 text-xs font-bold text-slate-900 border-r border-slate-200">Writing Activities</td>
                        <td className="px-4 py-2.5 text-xs text-slate-800 font-medium">
                          {report.writing_activities && report.writing_activities.length > 0 ? (
                            <ul className="list-disc pl-4 space-y-1">
                              {report.writing_activities.map((w, i) => <li key={`writing-${i}`}>{w}</li>)}
                            </ul>
                          ) : 'None recorded'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 5: Signatures (Print View) */}
              <div className="mt-12 pt-6 border-t border-slate-200 flex flex-row justify-between items-end print-avoid-break">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Prepared By</span>
                  <span className="font-black text-slate-800 text-sm block">{report.prepared_by}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">{report.designation}</span>
                  <div className="mt-8 border-b border-slate-300 w-48"></div>
                  <div className="text-[9px] font-bold text-slate-500 mt-1">Signature / Seal</div>
                </div>

                <div className="flex flex-col items-end text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block w-full text-right">Approved By</span>
                  <span className="font-black text-slate-800 text-sm block w-full text-right">Project Director</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block w-full text-right">Board of Directors</span>
                  {directorSigned ? (
                    <div className="mt-2 mb-2">
                      <img
                        src="/seal.png"
                        alt="Director Seal"
                        className="h-16 object-contain mix-blend-multiply opacity-90 transform -rotate-3 inline-block"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.outerHTML = '<div class="text-center text-[#1e3a8a]/90 transform -rotate-3 p-1 inline-block mix-blend-multiply" style="font-family: Georgia, serif"><div class="text-[15px] font-black tracking-wider uppercase text-[#1e3a8a]">DIRECTOR</div><div class="text-[13px] font-bold leading-tight text-[#1e3a8a]">Ahlussuffa Dars</div><div class="text-[13px] font-bold leading-tight text-[#1e3a8a]">Kannur, Kerala</div><div class="text-[11px] font-bold leading-tight mt-0.5 text-[#1e3a8a]">Mob: +91 9746431108</div></div>';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mt-8 border-b border-slate-300 w-48"></div>
                  )}
                  <div className="text-[9px] font-bold text-slate-500 mt-1 w-full text-right">Director Signature / Seal</div>
                </div>
              </div>
            </div>

            {/* Footer Banner - Clean White/Light with border */}
            <div className="bg-white text-slate-500 px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-wider gap-3 border-t-4 border-[#1a2d4c] print-avoid-break">
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#0284c7]">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>Student Name: {report.prepared_by} ({report.designation})</span>
              </div>

              <div className="hidden sm:block w-[1px] h-3 bg-slate-200"></div>

              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#0284c7]">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Ahlussuffa Systems | Date: {report.report_date}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── View 2: All Students Monthly Grid Table ─────────────── */}
      {activeTab === 'grid' && (
        <div className="bg-white text-slate-800 rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto border border-slate-200 print-sheet animate-fadeIn">
          {/* Title */}
          <div className="text-center border-b-2 border-double border-slate-300 pb-5 mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-wide uppercase">
              ALL STUDENTS MONTHLY REPORT
            </h2>
            <div className="mt-2 inline-flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-indigo-105 text-indigo-800 text-xs font-bold tracking-wide">
                {report.dars}
              </span>
              <span className="px-3 py-0.5 rounded-full bg-teal-105 text-teal-800 text-xs font-bold tracking-wide">
                {report.month}
              </span>
            </div>
          </div>

          {studentReports.length === 0 ? (
            <div className="text-center py-12 text-slate-500 italic">
              No individual student reports recorded for this month.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="min-w-[900px] w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 font-bold text-slate-700 border-r border-slate-200">Student Name</th>
                    <th className="px-3 py-2.5 font-bold text-slate-700 text-center border-r border-slate-200">Attendance</th>
                    <th className="px-3 py-2.5 font-bold text-slate-700 text-center border-r border-slate-200">P</th>
                    <th className="px-3 py-2.5 font-bold text-slate-700 text-center border-r border-slate-200">A</th>
                    <th className="px-3 py-2.5 font-bold text-slate-700 text-center border-r border-slate-200">AA</th>
                    <th className="px-3 py-2.5 font-bold text-slate-700 text-center border-r border-slate-200">L</th>
                    <th className="px-3 py-2.5 font-bold text-slate-700 text-center border-r border-slate-200">LA</th>
                    <th className="px-3 py-2.5 font-bold text-slate-700 border-r border-slate-200">Participation</th>
                    <th className="px-3 py-2.5 font-bold text-slate-700">Achievements & Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {studentReports.map((sr, idx) => {
                    const studentTotalDays = Number(sr.present || 0) + Number(sr.absent || 0) + Number(sr.absent_approved || 0) + Number(sr.leave || 0) + Number(sr.leave_approved || 0);
                    const studentAttendancePct = studentTotalDays > 0 ? Math.round((Number(sr.present || 0) / studentTotalDays) * 100) : (sr.attendance_pct || 100);
                    return (
                      <tr key={`grid-row-${idx}`} className="border-b border-slate-200 hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 font-bold text-slate-900 border-r border-slate-200">{sr.student_name}</td>
                        <td className="px-3 py-2.5 text-center border-r border-slate-200 font-semibold">
                          <span className={studentAttendancePct >= 90 ? 'text-emerald-600' : 'text-amber-600'}>
                            {studentAttendancePct}%
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center border-r border-slate-200">{sr.present ?? 0}</td>
                        <td className="px-3 py-2.5 text-center border-r border-slate-200">{sr.absent ?? 0}</td>
                        <td className="px-3 py-2.5 text-center border-r border-slate-200">{sr.absent_approved ?? 0}</td>
                        <td className="px-3 py-2.5 text-center border-r border-slate-200">{sr.leave ?? 0}</td>
                        <td className="px-3 py-2.5 text-center border-r border-slate-200">{sr.leave_approved ?? 0}</td>
                        <td className="px-3 py-2.5 border-r border-slate-200 font-medium">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sr.participation === 'Active'
                              ? 'bg-teal-50 text-teal-700'
                              : sr.participation === 'Semi-active'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                            {sr.participation}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">
                          {sr.achievements && <div className="font-semibold text-slate-800">★ {sr.achievements}</div>}
                          {sr.remarks && <div className="text-[11px] italic mt-0.5">"{sr.remarks}"</div>}
                          {!sr.achievements && !sr.remarks && <span className="text-slate-400 italic">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer signature */}
          <div className="mt-12 pt-5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 font-bold text-xs text-slate-800 print-avoid-break">
            <div>Student Name: <span className="font-medium text-slate-600 block mt-0.5">{report.prepared_by}</span></div>
            <div>Designation: <span className="font-medium text-slate-600 block mt-0.5">{report.designation}</span></div>
            <div>Date: <span className="font-medium text-slate-600 block mt-0.5">{report.report_date}</span></div>
          </div>
        </div>
      )}

      {/* ── View 3: Individual Student Report Card Sheet ─────────── */}
      {activeTab === 'card' && (
        <div className="space-y-12 max-w-2xl mx-auto">
          {studentReports.length === 0 ? (
            <div className="bg-white text-slate-800 rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200 print-sheet text-center py-12 italic">
              No individual student reports recorded for this month.
            </div>
          ) : (
            <>
              {/* Screen View: Show selected student or all students, hidden during print */}
              <div className="bg-white text-slate-800 rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200 print-sheet no-print animate-fadeIn space-y-12">
                {selectedStudentIdx === -1 ? (
                  studentReports.map((sr, idx) => (
                    <div key={`screen-card-${idx}`} className={idx > 0 ? "pt-12 border-t border-slate-200" : ""}>
                      {renderStudentCard(sr, report)}
                    </div>
                  ))
                ) : (
                  renderStudentCard(studentReports[selectedStudentIdx] || studentReports[0], report)
                )}
              </div>

              {/* Print View: Render selected student or all students with page breaks, hidden on screen */}
              <div className="hidden print:block space-y-12">
                {selectedStudentIdx === -1 ? (
                  studentReports.map((sr, idx) => (
                    <div
                      key={`print-card-${idx}`}
                      className={`bg-white text-slate-800 p-8 md:p-12 border border-slate-200 print-sheet ${idx < studentReports.length - 1 ? "print-page-break" : ""
                        }`}
                    >
                      {renderStudentCard(sr, report)}
                    </div>
                  ))
                ) : (
                  <div className="bg-white text-slate-800 p-8 md:p-12 border border-slate-200 print-sheet">
                    {renderStudentCard(studentReports[selectedStudentIdx] || studentReports[0], report)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
