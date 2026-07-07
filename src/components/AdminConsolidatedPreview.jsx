import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Copy, Check, FileText, User, Calendar, Award, BookOpen, ThumbsUp, LogOut, Save } from 'lucide-react';

const AhlussuffaLogo = ({ className = "w-8 h-8" }) => (
  <img src="/logo.png" className={className} alt="Ahlussuffa Logo" />
);

export default function AdminConsolidatedPreview({ reports, defaultDars = 'All Dars', onBack, onSaveConsolidated, currentUser }) {
  const [copied, setCopied] = useState(false);
  const [activeDars, setActiveDars] = useState(defaultDars || 'All Dars');
  const [saving, setSaving] = useState(false);
  const [sealApplied, setSealApplied] = useState(false);
  const [sealError, setSealError] = useState(false);

  const normalizeMonth = (monthStr) => {
    if (!monthStr) return 'Unknown';
    let str = monthStr.replace(/[\/\-]/g, ' ').trim();
    const parts = str.split(/\s+/);
    if (parts.length >= 2 && !isNaN(parts[0]) && parts[0].length <= 2) {
      const monthNum = parseInt(parts[0], 10);
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      if (monthNum >= 1 && monthNum <= 12) {
        str = `${months[monthNum - 1]} ${parts[1]}`;
      }
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
  };

  const normalizedReports = reports.map(r => ({
    ...r,
    original_month: r.month,
    month: normalizeMonth(r.month)
  }));

  const filteredReportsByDars = (activeDars === 'All Dars')
    ? normalizedReports
    : normalizedReports.filter(r => {
        const darsName = (r.dars || 'Imam Navavi Garden').trim().toLowerCase();
        const currentDars = activeDars.trim().toLowerCase();
        return darsName === currentDars || darsName.includes(currentDars) || currentDars.includes(darsName);
      });

  const availableMonths = [...new Set(filteredReportsByDars.map(r => r.month))].sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB - dateA;
  });

  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    if (availableMonths.length > 0) {
      if (!selectedMonth || !availableMonths.includes(selectedMonth)) {
        setSelectedMonth(availableMonths[0]);
      }
    } else {
      setSelectedMonth('');
    }
  }, [activeDars, availableMonths, selectedMonth]);

  const rawMonthlyReports = filteredReportsByDars.filter(r => r.month === selectedMonth);
  
  // Deduplicate reports by class/Dars and who prepared it (student/coordinator) to prevent duplicate entries
  const monthlyReports = [];
  const seenReportKeys = new Set();
  rawMonthlyReports.forEach(r => {
    const studentName = (r.prepared_by || '').trim();
    const darsName = (r.dars || '').trim();
    const key = `${studentName}||${darsName}`;
    if (!seenReportKeys.has(key)) {
      seenReportKeys.add(key);
      monthlyReports.push(r);
    }
  });

  // Consolidated Math
  const totalClasses = monthlyReports.length;
  const avgAttendance = totalClasses > 0
    ? (monthlyReports.reduce((acc, r) => acc + Number(r.attendance_avg_pct || 0), 0) / totalClasses).toFixed(1)
    : '0.0';

  const hasStudentReports = monthlyReports.some(r => r.student_reports && r.student_reports.length > 0);

  const allStudentReports = [];
  const seenStudents = new Set();
  monthlyReports.forEach(r => {
    if (r.student_reports && r.student_reports.length > 0) {
      const isStudent = r.designation === 'Student' || r.student_reports.some(sr => sr.student_name === r.prepared_by);
      if (isStudent) {
        const studentRow = r.student_reports.find(sr => sr.student_name === r.prepared_by);
        if (studentRow) {
          const name = (studentRow.student_name || '').trim();
          const darsName = (r.dars || '').trim();
          const studentKey = `${name}||${darsName}`;
          if (!seenStudents.has(studentKey)) {
            seenStudents.add(studentKey);
            allStudentReports.push({
              ...studentRow,
              class: r.dars
            });
          }
        }
      } else {
        r.student_reports.forEach(sr => {
          const studentTotalDays = Number(sr.present || 0) + Number(sr.absent || 0) + Number(sr.absent_approved || 0) + Number(sr.leave || 0) + Number(sr.leave_approved || 0);
          if (studentTotalDays === 0) return; // Exclude deleted/inactive students with no attendance data
          
          const name = (sr.student_name || '').trim();
          const darsName = (r.dars || '').trim();
          const studentKey = `${name}||${darsName}`;
          if (!seenStudents.has(studentKey)) {
            seenStudents.add(studentKey);
            allStudentReports.push({
              ...sr,
              class: r.dars
            });
          }
        });
      }
    }
  });
  allStudentReports.sort((a, b) => (a.student_name || '').localeCompare(b.student_name || ''));

  const totalLeaves = hasStudentReports
    ? allStudentReports.reduce((sum, sr) => sum + Number(sr.leave || 0) + Number(sr.leave_approved || 0), 0)
    : monthlyReports.reduce((acc, r) => acc + Number(r.leave_unapproved_count || 0) + Number(r.leave_approved_count || 0), 0);

  const approvedLeaves = hasStudentReports
    ? allStudentReports.reduce((sum, sr) => sum + Number(sr.leave_approved || 0), 0)
    : monthlyReports.reduce((acc, r) => acc + Number(r.leave_approved_count || 0), 0);

  const unapprovedLeaves = hasStudentReports
    ? allStudentReports.reduce((sum, sr) => sum + Number(sr.leave || 0), 0)
    : monthlyReports.reduce((acc, r) => acc + Number(r.leave_unapproved_count || 0), 0);

  const absentApprovedLeaves = hasStudentReports
    ? allStudentReports.reduce((sum, sr) => sum + Number(sr.absent_approved || 0), 0)
    : monthlyReports.reduce((acc, r) => acc + Number(r.leave_total_received || 0), 0);

  const totalPrograms = monthlyReports.reduce((acc, r) => acc + Number(r.programs_count || 0), 0);

  const totalA = hasStudentReports
    ? allStudentReports.reduce((sum, sr) => sum + Number(sr.absent || 0), 0)
    : monthlyReports.reduce((acc, r) => acc + Number(r.attendance_low_count || 0), 0);

  const totalAA = absentApprovedLeaves;
  const totalL = unapprovedLeaves;
  const totalLA = approvedLeaves;
  const totalNonPresent = totalA + totalAA + totalL + totalLA;
  const getMetricPct = (val) => totalNonPresent === 0 ? 0 : Math.round((val / totalNonPresent) * 100);

  const allObservations = [];
  const allSuggestions = [];
  monthlyReports.forEach(r => {
    if (r.observations) r.observations.forEach(o => { if (o && o.trim()) allObservations.push({ text: o.trim(), class: r.dars }); });
    if (r.suggestions) r.suggestions.forEach(s => { if (s && s.trim()) allSuggestions.push({ text: s.trim(), class: r.dars }); });
  });

  const handlePrint = () => {
    window.print();
  };

  const getMarkdownText = () => {
    const isConsolidated = activeDars === 'All Dars';
    const titleText = isConsolidated
      ? `AHLUSSUFFA MONTHLY CONSOLIDATED REPORT - ${selectedMonth}`
      : `AHLUSSUFFA MONTHLY REPORT - ${activeDars.toUpperCase()} - ${selectedMonth}`;

    let markdown = `${titleText}\n\n`;
    markdown += `### 1. Executive Summary\n`;
    if (isConsolidated) {
      markdown += `* Total Classes Reported: ${totalClasses}\n`;
    } else {
      markdown += `* Class / Dars: ${activeDars}\n`;
    }
    markdown += `* ${isConsolidated ? 'Combined ' : ''}Attendance Rate: ${avgAttendance}%\n`;
    markdown += `* ${isConsolidated ? 'Combined ' : ''}Leaves Received: ${totalLeaves} (Absent Approved (AA): ${absentApprovedLeaves}, Leave (L): ${unapprovedLeaves}, Leave Approved (LA): ${approvedLeaves})\n`;
    markdown += `* ${isConsolidated ? 'Combined ' : ''}Skill Activities Participation: ${totalPrograms}\n\n`;

    markdown += `### 2. Class Summary Roster\n`;
    markdown += `| Class/Dars | Coordinator | Avg Attendance | Leaves | Skill Activities |\n`;
    markdown += `|---|---|---|---|---|\n`;
    monthlyReports.forEach(r => {
      const classLeaves = Number(r.leave_total_received || 0) + Number(r.leave_unapproved_count || 0) + Number(r.leave_approved_count || 0);
      markdown += `| ${r.dars} | ${r.prepared_by} | ${r.attendance_avg_pct}% | ${classLeaves} | ${r.programs_count} |\n`;
    });
    markdown += `\n`;

    if (allStudentReports.length > 0) {
      markdown += `### 3. Consolidated Student Performance Roster\n`;
      markdown += `| Student | Class | Attendance | P | A | AA | L | LA | Assessment |\n`;
      markdown += `|---|---|---|---|---|---|---|---|---|\n`;
      allStudentReports.forEach(sr => {
        const studentTotalDays = Number(sr.present || 0) + Number(sr.absent || 0) + Number(sr.absent_approved || 0) + Number(sr.leave || 0) + Number(sr.leave_approved || 0);
        const studentAttendancePct = studentTotalDays > 0 ? Math.round((Number(sr.present || 0) / studentTotalDays) * 100) : (sr.attendance_pct || 100);
        markdown += `| ${sr.student_name} | ${sr.class} | ${studentAttendancePct}% | ${sr.present ?? 0} | ${sr.absent ?? 0} | ${sr.absent_approved ?? 0} | ${sr.leave ?? 0} | ${sr.leave_approved ?? 0} | ${sr.participation} |\n`;
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

  const handleSave = async () => {
    if (!onSaveConsolidated) return;
    setSaving(true);
    try {
      const leaveReasonsSum = monthlyReports.reduce((acc, r) => {
        const reasons = r.leave_reasons || {};
        return {
          medical: acc.medical + Number(reasons.medical || 0),
          family_function: acc.family_function + Number(reasons.family_function || 0),
          personal: acc.personal + Number(reasons.personal || 0),
          others: acc.others + Number(reasons.others || 0)
        };
      }, { medical: 0, family_function: 0, personal: 0, others: 0 });

      const consolidatedPayload = {
        dars: 'Consolidated',
        month: selectedMonth,
        report_date: new Date().toISOString().substring(0, 10),
        prepared_by: currentUser?.name || 'Administrator',
        designation: currentUser?.role === 'admin' ? 'Administrator' : (currentUser?.role || 'Admin'),
        
        attendance_total_working_days: monthlyReports.length > 0
          ? Math.round(monthlyReports.reduce((acc, r) => acc + Number(r.attendance_total_working_days || 0), 0) / monthlyReports.length)
          : 0,
        attendance_avg_pct: Number(avgAttendance),
        attendance_regular_count: monthlyReports.reduce((acc, r) => acc + Number(r.attendance_regular_count || 0), 0),
        attendance_low_count: monthlyReports.reduce((acc, r) => acc + Number(r.attendance_low_count || 0), 0),
        
        leave_total_received: totalLeaves,
        leave_approved_count: approvedLeaves,
        leave_unapproved_count: unapprovedLeaves,
        leave_reasons: leaveReasonsSum,
        
        programs_count: totalPrograms,
        programs_names: [...new Set(monthlyReports.flatMap(r => r.programs_names || []))].filter(Boolean),
        programs_outcomes: [...new Set(monthlyReports.flatMap(r => r.programs_outcomes || []))].filter(Boolean),
        books_read: [...new Set(monthlyReports.flatMap(r => r.books_read || []))].filter(Boolean),
        writing_activities: [...new Set(monthlyReports.flatMap(r => r.writing_activities || []))].filter(Boolean),
        
        participation_total: monthlyReports.reduce((acc, r) => acc + Number(r.participation_total || 0), 0),
        participation_active: monthlyReports.reduce((acc, r) => acc + Number(r.participation_active || 0), 0),
        participation_achievements: [...new Set(monthlyReports.flatMap(r => r.participation_achievements || []))].filter(Boolean),
        
        student_reports: allStudentReports,
        observations: [...new Set(allObservations.map(o => `${o.class}: ${o.text}`))],
        suggestions: [...new Set(allSuggestions.map(s => `${s.class}: ${s.text}`))]
      };

      await onSaveConsolidated(consolidatedPayload);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selection Control Panel */}
      <div
        className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl light:bg-white light:border-slate-200 no-print"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <button
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-all cursor-pointer whitespace-nowrap shrink-0"
          style={{ backgroundColor: 'var(--bg-surface-active)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          onClick={onBack}
        >
          <ArrowLeft size={16} className="shrink-0" /> Back to Dashboard
        </button>

        <div className="flex flex-1 min-w-0 flex-wrap gap-2.5 items-center justify-start sm:justify-end w-full sm:w-auto">
          {availableMonths.length > 0 && (
            <div
              className="flex items-center gap-2 border border-slate-700 rounded-xl px-3 py-1.5 bg-slate-800/40 mr-1.5 light:bg-slate-100 light:border-slate-200"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface-active)' }}
            >
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer light:text-slate-800"
                style={{ color: 'var(--text-secondary)' }}
              >
                {availableMonths.map(month => (
                  <option key={`month-opt-${month}`} value={month} className="bg-slate-900 text-slate-100 light:bg-white light:text-slate-850">
                    {month}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dars filter dropdown */}
          <div
            className="flex items-center gap-2 border border-slate-700 rounded-xl px-3 py-1.5 bg-slate-800/40 mr-1.5 light:bg-slate-100 light:border-slate-200"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface-active)' }}
          >
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Dars:</span>
            <select
              value={activeDars}
              onChange={(e) => setActiveDars(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer light:text-slate-800"
              style={{ color: 'var(--text-secondary)' }}
            >
              {['All Dars', 'Imam Navavi Garden', 'Imam Rafi Garden', 'Imam Gazli Garden', 'RootExc'].map(dars => (
                <option key={`dars-opt-${dars}`} value={dars} className="bg-slate-900 text-slate-100 light:bg-white light:text-slate-850">
                  {dars}
                </option>
              ))}
            </select>
          </div>

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
                <Copy size={15} /> {activeDars === 'All Dars' ? 'Copy Consolidated Markdown' : 'Copy Markdown'}
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
            <Printer size={15} /> {activeDars === 'All Dars' ? 'Print Consolidated PDF' : 'Print PDF'}
          </button>
        </div>
      </div>

      {availableMonths.length === 0 ? (
        <div
          className="p-12 text-center border border-dashed rounded-2xl text-sm"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
        >
          No monthly reports available to consolidate.
        </div>
      ) : (
        <div className="bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 print-sheet overflow-hidden max-w-4xl mx-auto leading-relaxed">
          {/* Header */}
          <div className="bg-white p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-[#1a2d4c] gap-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">
                {activeDars === 'All Dars' ? 'ADMINISTRATION CONSOLIDATED SYSTEM' : `${activeDars.toUpperCase()} REPORT SYSTEM`}
              </span>
              <h2 className="text-2xl font-normal leading-tight tracking-wide text-slate-900">
                {activeDars === 'All Dars' ? (
                  <>
                    <span className="font-black text-[#1a2d4c]">MONTHLY PERFORMANCE</span> CONSOLIDATION
                  </>
                ) : (
                  <>
                    <span className="font-black text-[#1a2d4c]">MONTHLY PERFORMANCE</span> REPORT
                  </>
                )}
              </h2>
              <div className="pt-2 text-indigo-600/10">
                <svg width="100" height="30" viewBox="0 0 100 30" fill="none" className="stroke-current">
                  <path d="M10 25 C 30 5, 70 5, 90 25" strokeWidth="1.5" />
                  <path d="M20 25 C 35 12, 65 12, 80 25" strokeWidth="1.5" />
                  <path d="M30 25 C 40 18, 60 18, 70 25" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-right">
              <div className="flex items-center gap-2">
                <AhlussuffaLogo className="w-8 h-8" />
                <span className="text-base font-black uppercase tracking-wider text-slate-900">
                  Ahlussuffa
                </span>
              </div>
              <div className="text-[11px] font-semibold text-slate-600 space-y-0.5">
                <div><span className="text-slate-500">Report Month:</span> <span className="text-[#0284c7] font-bold">{selectedMonth}</span></div>
                {activeDars === 'All Dars' ? (
                  <div><span className="text-slate-500">Classes Responded:</span> <span className="font-extrabold text-[#1a2d4c]">{totalClasses}</span></div>
                ) : (
                  <div><span className="text-slate-500">Class / Dars:</span> <span className="font-extrabold text-[#0284c7]">{activeDars}</span></div>
                )}
                <div><span className="text-slate-500">Consolidated Date:</span> {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-8">

            {/* Section 1: Executive Summary stats cards */}
            <div className="print-avoid-break">
              <h3 className="text-xs font-black text-slate-900 tracking-widest uppercase border-l-4 border-[#3b4d61] pl-2.5 mb-4">
                {activeDars === 'All Dars' ? '1. Performance Dashboard Overview' : '1. Performance Overview'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-3 sm:p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {activeDars === 'All Dars' ? 'Classes Reported' : 'Class / Dars'}
                  </span>
                  <span className="text-base sm:text-2xl font-black text-slate-800 block mt-1 truncate" title={activeDars}>
                    {activeDars === 'All Dars' ? totalClasses : activeDars.replace(' Garden', '')}
                  </span>
                </div>
                <div className="p-3 sm:p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Avg Attendance</span>
                  <span className="text-base sm:text-2xl font-black text-indigo-700 block mt-1">{avgAttendance}%</span>
                </div>
                <div className="p-3 sm:p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Skill Activities</span>
                  <span className="text-base sm:text-2xl font-black text-slate-800 block mt-1">{totalPrograms}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Executive Summary Table */}
            <div className="print-avoid-break">
              <h3 className="text-xs font-black text-slate-900 tracking-widest uppercase border-l-4 border-[#3b4d61] pl-2.5 mb-3">
                {activeDars === 'All Dars' ? '2. Class-by-Class Activity Matrix' : '2. Class Performance Summary'}
              </h3>

              <div className="overflow-x-auto border border-slate-200 rounded-xl w-full">
                <table className="min-w-[650px] w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="px-3 py-2.5 font-bold text-slate-700 border-r border-slate-200 w-1/4">Class / Dars</th>
                      <th className="px-3 py-2.5 font-bold text-slate-700 border-r border-slate-200">Coordinator</th>
                      <th className="px-3 py-2.5 font-bold text-slate-700 border-r border-slate-200 text-center">Avg Attendance</th>
                      <th className="px-3 py-2.5 font-bold text-slate-700 border-r border-slate-200 text-center">Class Leave</th>
                      <th className="px-3 py-2.5 font-bold text-slate-700 text-center">Skill Activities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyReports.map((r, idx) => {
                      const studentReports = r.student_reports || [];
                      const currentStudent = studentReports.find(s => s.student_name === r.prepared_by);
                      const isStudent = r.designation === 'Student' || !!currentStudent;

                      let rowAttendance = `${r.attendance_avg_pct || 0}%`;
                      let rowLeaves = 0;

                      if (isStudent && currentStudent) {
                        const studentTotalDays = Number(currentStudent.present || 0) + Number(currentStudent.absent || 0) + Number(currentStudent.absent_approved || 0) + Number(currentStudent.leave || 0) + Number(currentStudent.leave_approved || 0);
                        const studentAttendancePct = studentTotalDays > 0 ? Math.round((Number(currentStudent.present || 0) / studentTotalDays) * 100) : (currentStudent.attendance_pct || 100);
                        rowAttendance = `${studentAttendancePct}%`;
                        rowLeaves = Number(currentStudent.leave || 0) + Number(currentStudent.leave_approved || 0);
                      } else {
                        rowLeaves = r.student_reports && r.student_reports.length > 0
                          ? r.student_reports.reduce((sum, sr) => sum + Number(sr.leave || 0) + Number(sr.leave_approved || 0), 0)
                          : Number(r.leave_unapproved_count || 0) + Number(r.leave_approved_count || 0);
                      }

                      return (
                        <tr key={`summary-row-${idx}`} className="border-b border-slate-200 hover:bg-slate-50/50">
                          <td className="px-3 py-2.5 font-bold text-slate-900 border-r border-slate-200">{r.dars}</td>
                          <td className="px-3 py-2.5 text-slate-750 border-r border-slate-200 font-medium">{r.prepared_by}</td>
                          <td className="px-3 py-2.5 text-center border-r border-slate-200 font-bold text-indigo-750">{rowAttendance}</td>
                          <td className="px-3 py-2.5 text-center border-r border-slate-200 text-slate-650">
                            {rowLeaves} leaves
                          </td>
                          <td className="px-3 py-2.5 text-center font-bold text-slate-800">{r.programs_count}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Leave analysis breakdown */}
            <div className="print-avoid-break">
              <div>
                <h3 className="text-xs font-black text-slate-900 tracking-widest uppercase border-l-4 border-[#3b4d61] pl-2.5 mb-3">
                  {activeDars === 'All Dars' ? '3. Consolidated Leaves breakdown' : '3. Leaves breakdown'}
                </h3>
                <div className="border border-slate-200 rounded-xl p-4 space-y-3.5 bg-slate-50/30">
                  <div className="grid grid-cols-4 gap-1 text-center text-xs border-b pb-3 mb-2 border-slate-200">
                    <div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase block">Total Leaves</span>
                      <span className="text-base font-black text-slate-800">{totalLeaves}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase block">AA</span>
                      <span className="text-base font-black text-teal-700">{absentApprovedLeaves}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase block">Leave (L)</span>
                      <span className="text-base font-black text-amber-700">{unapprovedLeaves}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase block">LA</span>
                      <span className="text-base font-black text-purple-700">{approvedLeaves}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: 'Absent (A)', val: totalA, color: 'var(--accent-danger)' },
                      { label: 'Absent Approved (AA)', val: totalAA, color: 'var(--accent-teal)' },
                      { label: 'Leave (L)', val: totalL, color: 'var(--accent-warning)' },
                      { label: 'Leave Approved (LA)', val: totalLA, color: 'var(--accent-indigo)' },
                    ].map(r => (
                      <div key={r.label} className="space-y-1">
                        <div className="flex justify-between text-xxs font-bold text-slate-600">
                          <span>{r.label}</span>
                          <span>{getMetricPct(r.val)}% ({r.val})</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${getMetricPct(r.val)}%`, backgroundColor: r.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Skill Activities Details */}
            <div className="print-avoid-break">
              <h3 className="text-xs font-black text-slate-900 tracking-widest uppercase border-l-4 border-[#3b4d61] pl-2.5 mb-3">
                {activeDars === 'All Dars' ? '4. Class Activities & Skill Details' : '4. Class Activities & Details'}
              </h3>

              <div className="border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden text-xs">
                {(() => {
                  const reportsWithActivities = monthlyReports.filter(r => {
                    const hasPrograms = r.programs_names && r.programs_names.some(p => p && p.trim());
                    const hasOutcomes = r.programs_outcomes && r.programs_outcomes.some(o => o && o.trim());
                    return hasPrograms || hasOutcomes;
                  });

                  if (reportsWithActivities.length === 0) {
                    return (
                      <div className="p-6 text-center text-slate-500 italic bg-slate-50/50">
                        No activity or skill details recorded for this month.
                      </div>
                    );
                  }

                  return reportsWithActivities.map((r, idx) => (
                    <div key={`activity-${idx}`} className="p-4 space-y-1.5 hover:bg-slate-50/20">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-[#1a2d4c] font-black text-sm">
                          {r.dars} {r.prepared_by ? ` - ${r.prepared_by}` : ''}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-550 border border-slate-200 uppercase tracking-widest text-[9px]">{r.programs_count} activities</span>
                      </div>
                      {r.programs_names && r.programs_names.length > 0 && r.programs_names.some(p => p && p.trim()) && (
                        <div>
                          <span className="font-extrabold text-slate-500 block text-[10px] uppercase">Skill Activity / Activity:</span>
                          <span className="text-slate-800">{r.programs_names.filter(p => p && p.trim()).join(', ')}</span>
                        </div>
                      )}
                      {r.programs_outcomes && r.programs_outcomes.length > 0 && r.programs_outcomes.some(o => o && o.trim()) && (
                        <div className="mt-1">
                          <span className="font-extrabold text-slate-500 block text-[10px] uppercase">Learning Outcomes:</span>
                          <p className="text-slate-650 italic font-medium leading-tight">
                            "{r.programs_outcomes.filter(o => o && o.trim()).join('; ')}"
                          </p>
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Section 5: Student grid table */}
            <div className="print-avoid-break">
              <div className="flex justify-between items-center border-l-4 border-[#3b4d61] pl-2.5 mb-3">
                <h3 className="text-xs font-black text-slate-900 tracking-widest uppercase">
                  {activeDars === 'All Dars' ? '6. Consolidated Student Activity Performance Roster' : '6. Student Activity Performance Roster'}
                </h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  Total Students: {allStudentReports.length}
                </span>
              </div>

              {allStudentReports.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-550 border border-dashed rounded-xl bg-slate-50">
                  No individual student performance logs submitted for this month.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-[10px] border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                        <th className="px-1.5 py-1 font-black border-r border-slate-200 w-8 text-center">#</th>
                        <th className="px-1.5 py-1 font-black border-r border-slate-200">Student Name</th>
                        <th className="px-1.5 py-1 font-black border-r border-slate-200">Class / Dars</th>
                        <th className="px-1.5 py-1 font-black border-r border-slate-200 text-center">Attendance</th>
                        <th className="px-1.5 py-1 font-black border-r border-slate-200 text-center">P</th>
                        <th className="px-1.5 py-1 font-black border-r border-slate-200 text-center">A</th>
                        <th className="px-1.5 py-1 font-black border-r border-slate-200 text-center">AA</th>
                        <th className="px-1.5 py-1 font-black border-r border-slate-200 text-center">L</th>
                        <th className="px-1.5 py-1 font-black border-r border-slate-200 text-center">LA</th>
                        <th className="px-1.5 py-1 font-black">Assessment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allStudentReports.map((sr, idx) => {
                        const studentTotalDays = Number(sr.present || 0) + Number(sr.absent || 0) + Number(sr.absent_approved || 0) + Number(sr.leave || 0) + Number(sr.leave_approved || 0);
                        const studentAttendancePct = studentTotalDays > 0 ? Math.round((Number(sr.present || 0) / studentTotalDays) * 100) : (sr.attendance_pct || 100);
                        return (
                          <tr key={`master-student-${idx}`} className="border-b border-slate-200 hover:bg-slate-50/50 leading-tight">
                            <td className="px-1.5 py-1 font-bold text-slate-500 border-r border-slate-200 text-center">{idx + 1}</td>
                            <td className="px-1.5 py-1 font-black text-slate-900 border-r border-slate-200">{sr.student_name}</td>
                            <td className="px-1.5 py-1 text-slate-550 border-r border-slate-200 font-bold">{sr.class}</td>
                            <td className="px-1.5 py-1 text-center border-r border-slate-200 font-extrabold">
                              <span className={studentAttendancePct >= 90 ? 'text-emerald-700' : 'text-amber-700'}>
                                {studentAttendancePct}%
                              </span>
                            </td>
                            <td className="px-1.5 py-1 text-center border-r border-slate-200">{sr.present ?? 0}</td>
                            <td className="px-1.5 py-1 text-center border-r border-slate-200">{sr.absent ?? 0}</td>
                            <td className="px-1.5 py-1 text-center border-r border-slate-200">{sr.absent_approved ?? 0}</td>
                            <td className="px-1.5 py-1 text-center border-r border-slate-200">{sr.leave ?? 0}</td>
                            <td className="px-1.5 py-1 text-center border-r border-slate-200">{sr.leave_approved ?? 0}</td>
                            <td className="px-1.5 py-1 border-r border-slate-200 font-medium">
                              <span className={`px-1 py-0.5 rounded text-[9px] font-black ${sr.participation === 'Active'
                                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                  : sr.participation === 'Semi-active'
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : 'bg-slate-100 text-slate-650'
                                }`}>
                                {sr.participation}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Signature Area */}
            <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8 print-avoid-break">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Administration Review</span>
                <span className="font-black text-slate-800 text-sm block">Superintendent / Dean</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Office of Student Records</span>
              </div>
              
              <div className="flex flex-col items-end w-full sm:w-72">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block w-full text-left">Director Digital Signature</span>
                
                {!sealApplied ? (
                  <>
                    <button 
                      onClick={() => setSealApplied(true)}
                      className="w-full h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer no-print mb-3 select-none"
                    >
                      <svg className="w-5 h-5 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">Click to apply digital seal</span>
                    </button>
                    {/* Fallback for print when seal not applied */}
                    <div className="hidden print:block w-full h-16 border-b-2 border-slate-300 mb-3"></div>
                  </>
                ) : (
                  <div 
                    onClick={() => setSealApplied(false)}
                    className="w-full h-24 flex flex-col items-center justify-center cursor-pointer relative mb-3 select-none"
                    title="Click to remove seal"
                  >
                    {sealError ? (
                      <div className="text-center text-[#1e3a8a]/90 transform -rotate-2 p-1 inline-block mix-blend-multiply" style={{ fontFamily: 'Georgia, serif' }}>
                        <div className="text-[17px] font-black tracking-wider uppercase text-[#1e3a8a]">DIRECTOR</div>
                        <div className="text-[15px] font-bold leading-tight text-[#1e3a8a]">Ahlussuffa Dars</div>
                        <div className="text-[15px] font-bold leading-tight text-[#1e3a8a]">Kannur, Kerala</div>
                        <div className="text-[13px] font-bold leading-tight mt-0.5 text-[#1e3a8a]">Mob: +91 9746431108</div>
                      </div>
                    ) : (
                      <img 
                        src="/seal.png" 
                        alt="Director Seal" 
                        className="h-20 object-contain mix-blend-multiply opacity-90 transform -rotate-2"
                        onError={() => setSealError(true)}
                      />
                    )}
                  </div>
                )}
                
                <div className="w-full flex justify-between items-end border-t border-slate-200 pt-2">
                  <div>
                    <div className="text-sm font-black text-slate-900">{currentUser?.name || 'Administrator'}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">{currentUser?.role === 'admin' ? 'System Admin' : (currentUser?.role || 'Admin')}</div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">ID: {currentUser?.id || 'AUTH-01'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white text-slate-500 px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-wider gap-3 border-t-4 border-[#1a2d4c] print-avoid-break">
            <div className="flex items-center gap-1.5">
              <span>Prepared for Office of Islamic Affairs</span>
            </div>
            <div className="hidden sm:block w-[1px] h-3 bg-slate-200"></div>
            <div className="flex items-center gap-1.5">
              <span>{activeDars === 'All Dars' ? 'Ahlussuffa Consolidated Portal' : `Ahlussuffa Portal | ${activeDars}`}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
