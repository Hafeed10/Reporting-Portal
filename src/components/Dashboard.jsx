import React, { useState } from 'react';
import { Plus, Eye, Edit2, Trash2, Calendar, User, FileText, BarChart2, Award, LogOut, Filter, ChevronDown } from 'lucide-react';

const DARS_TABS = ['All Dars', 'Imam Navavi Garden', 'Imam Rafi Garden', 'Imam Gazli Garden', 'RootExc'];

const LEVELS_BY_CLASS = {
  'Imam Navavi Garden': ['BS3', 'BS4', 'BS5'],
  'Imam Rafi Garden': ['BS1', 'BS2'],
  'Imam Gazli Garden': ['HS1', 'HS2'],
  'RootExc': ['8th Class', '9th Class']
};

const DARS_COLORS = {
  'Imam Navavi Garden': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', dot: 'bg-indigo-500' },
  'Imam Rafi Garden': { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20', dot: 'bg-teal-500' },
  'Imam Gazli Garden': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  'RootExc': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-500' },
  'Consolidated': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500' }
};

export default function Dashboard({ reports, onCreateNew, onEdit, onPreview, onDelete, studentsRoster = {}, onUpdateRoster, currentUser, onGenerateConsolidated }) {
  const [activeDars, setActiveDars] = useState(() => {
    if (currentUser && currentUser.role === 'coordinator') {
      return currentUser.dars;
    }
    return 'All Dars';
  });
  const [activeClassLevel, setActiveClassLevel] = useState('HS1');
  const [newStudentName, setNewStudentName] = useState('');

  React.useEffect(() => {
    if (currentUser && currentUser.role === 'coordinator') {
      setActiveDars(currentUser.dars);
    } else {
      setActiveDars('All Dars');
    }
  }, [currentUser]);

  const rosterDars = activeDars === 'All Dars' ? 'Imam Navavi Garden' : activeDars;

  React.useEffect(() => {
    const validLevels = LEVELS_BY_CLASS[rosterDars] || [];
    if (validLevels.length > 0 && !validLevels.includes(activeClassLevel)) {
      setActiveClassLevel(validLevels[0]);
    }
  }, [rosterDars, activeClassLevel]);

  const visibleTabs = currentUser && currentUser.role === 'coordinator'
    ? [currentUser.dars]
    : DARS_TABS;

  // Filter reports by selected dars tab
  const MAIN_DARS = ['Imam Navavi Garden', 'Imam Rafi Garden', 'Imam Gazli Garden', 'RootExc'];

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

  // Normalize all reports first to ensure consistent month formatting
  const normalizedReports = reports.map(r => ({
    ...r,
    original_month: r.month,
    month: normalizeMonth(r.month)
  }));

  let filteredReports = (activeDars === 'All Dars')
    ? normalizedReports
    : normalizedReports.filter(r => {
      const darsName = (r.dars || 'Imam Navavi Garden').trim().toLowerCase();
      const currentDars = activeDars.trim().toLowerCase();
      return darsName === currentDars || darsName.includes(currentDars) || currentDars.includes(darsName);
    });

  filteredReports = [...filteredReports].sort((a, b) => {
    const monthA = new Date(a.month).getTime() || 0;
    const monthB = new Date(b.month).getTime() || 0;
    if (monthB !== monthA) return monthB - monthA;

    const idxA = MAIN_DARS.indexOf(a.dars || 'Imam Navavi Garden');
    const idxB = MAIN_DARS.indexOf(b.dars || 'Imam Navavi Garden');
    return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
  });

  const totalReports = filteredReports.length;
  const currentClassStudents = (studentsRoster[rosterDars] && studentsRoster[rosterDars][activeClassLevel]) || [];

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'admin') {
      alert('Only admins are authorized to add students to the roster.');
      return;
    }
    if (!newStudentName.trim()) return;
    const name = newStudentName.trim();
    if (currentClassStudents.includes(name)) {
      alert('Student name already exists in this class level!');
      return;
    }
    const updatedClassStudents = [...currentClassStudents, name];
    const updatedRoster = {
      ...studentsRoster,
      [rosterDars]: {
        ...(studentsRoster[rosterDars] || {}),
        [activeClassLevel]: updatedClassStudents
      }
    };
    onUpdateRoster(updatedRoster);
    setNewStudentName('');
  };

  const handleRemoveStudent = (studentName) => {
    if (currentUser?.role !== 'admin') {
      alert('Only admins are authorized to remove students from the roster.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove ${studentName} from the roster?`)) {
      const updatedClassStudents = currentClassStudents.filter(s => s !== studentName);
      const updatedRoster = {
        ...studentsRoster,
        [rosterDars]: {
          ...(studentsRoster[rosterDars] || {}),
          [activeClassLevel]: updatedClassStudents
        }
      };
      onUpdateRoster(updatedRoster);
    }
  };

  // Deduplicate reports by dars, month, and prepared_by (keeping the latest one)
  const uniqueReports = [];
  const seenReportKeys = new Set();
  for (let i = 0; i < filteredReports.length; i++) {
    const r = filteredReports[i];
    const key = `${(r.dars || '').trim()}||${(r.month || '').trim()}||${(r.prepared_by || '').trim()}`;
    if (!seenReportKeys.has(key)) {
      seenReportKeys.add(key);
      uniqueReports.push(r);
    }
  }

  const uniqueReportsCount = uniqueReports.length;

  // Aggregated Stats
  const avgAttendance = uniqueReportsCount > 0
    ? (uniqueReports.reduce((acc, r) => acc + Number(r.attendance_avg_pct || 0), 0) / uniqueReportsCount).toFixed(1)
    : '0.0';

  const totalPrograms = uniqueReports.reduce((acc, r) => acc + Number(r.programs_count || 0), 0);

  const aggregatedStudentReports = [];
  uniqueReports.forEach(r => {
    if (r.student_reports && r.student_reports.length > 0) {
      const isStudent = r.designation === 'Student' || r.student_reports.some(sr => sr.student_name === r.prepared_by);
      if (isStudent) {
        const studentRow = r.student_reports.find(sr => sr.student_name === r.prepared_by);
        if (studentRow) {
          aggregatedStudentReports.push(studentRow);
        }
      } else {
        r.student_reports.forEach(sr => {
          const studentTotalDays = Number(sr.present || 0) + Number(sr.absent || 0) + Number(sr.absent_approved || 0) + Number(sr.leave || 0) + Number(sr.leave_approved || 0);
          if (studentTotalDays > 0) {
            aggregatedStudentReports.push(sr);
          }
        });
      }
    }
  });

  const hasStudentReports = uniqueReports.some(r => r.student_reports && r.student_reports.length > 0);

  const totalLeaves = hasStudentReports
    ? aggregatedStudentReports.reduce((sum, sr) => sum + Number(sr.leave || 0) + Number(sr.leave_approved || 0), 0)
    : uniqueReports.reduce((acc, r) => acc + Number(r.leave_unapproved_count || 0) + Number(r.leave_approved_count || 0), 0);

  // Leave/absent category breakdown
  const leaveBreakdownAgg = hasStudentReports
    ? aggregatedStudentReports.reduce((acc, sr) => {
      acc.absent += Number(sr.absent || 0);
      acc.absent_approved += Number(sr.absent_approved || 0);
      acc.leave += Number(sr.leave || 0);
      acc.leave_approved += Number(sr.leave_approved || 0);
      return acc;
    }, { absent: 0, absent_approved: 0, leave: 0, leave_approved: 0 })
    : uniqueReports.reduce((acc, r) => {
      acc.absent += Number(r.attendance_low_count || 0);
      acc.absent_approved += Number(r.leave_total_received || 0);
      acc.leave += Number(r.leave_unapproved_count || 0);
      acc.leave_approved += Number(r.leave_approved_count || 0);
      return acc;
    }, { absent: 0, absent_approved: 0, leave: 0, leave_approved: 0 });

  const totalReasons = Object.values(leaveBreakdownAgg).reduce((a, b) => a + b, 0);
  const getReasonPct = (val) => totalReasons === 0 ? 0 : Math.round((val / totalReasons) * 100);

  // Group by month for trend chart
  const monthlyAggregated = filteredReports.reduce((acc, r) => {
    const month = r.month;
    if (!acc[month]) {
      acc[month] = { month, count: 0, sumPct: 0, originalDate: r.report_date };
    }
    acc[month].count += 1;
    acc[month].sumPct += Number(r.attendance_avg_pct);
    // Keep the earliest report date for sorting purposes if month string sorting is tricky,
    // but parsing `month` (e.g., "June 2026") works fine.
    return acc;
  }, {});

  const trendReports = Object.values(monthlyAggregated)
    .map(m => ({
      id: m.month,
      month: m.month,
      attendance_avg_pct: (m.sumPct / m.count).toFixed(1),
      sortDate: new Date(m.month)
    }))
    .sort((a, b) => a.sortDate - b.sortDate)
    .slice(-6);

  const today = new Date();
  const dayOfMonth = today.getDate();
  const isCreateAllowed = (dayOfMonth >= 25 && dayOfMonth <= 30) || (currentUser && currentUser.role === 'admin');

  return (
    <div className="space-y-8 no-print">

      {/* ── Top Header Control Bar ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Dars Filter Dropdown */}
        {visibleTabs.length > 1 ? (
          <div
            className="flex items-center gap-2.5 border border-slate-800 rounded-2xl px-4 py-2.5 bg-slate-900/50 w-fit max-w-full sm:min-w-[350px] no-print light:bg-white light:border-slate-205 shadow-sm"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
          >
            <Filter size={14} className="text-slate-400 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xxs font-black text-slate-400 uppercase tracking-widest shrink-0 hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
              Filter Class:
            </span>
            <div className="relative flex-1 flex items-center">
              <select
                value={activeDars}
                onChange={(e) => setActiveDars(e.target.value)}
                className="w-full min-w-[180px] sm:min-w-[240px] bg-transparent border-0 text-xs sm:text-sm font-bold text-slate-200 focus:outline-none cursor-pointer appearance-none pr-6 py-0.5 light:text-slate-800"
                style={{ color: 'var(--text-primary)' }}
              >
                {visibleTabs.map(tab => {
                  const count = tab === 'All Dars'
                    ? reports.length
                    : reports.filter(r => {
                      const dName = (r.dars || 'Imam Navavi Garden').trim().toLowerCase();
                      const tName = tab.trim().toLowerCase();
                      return dName === tName || dName.startsWith(tName) || dName.includes(tName);
                    }).length;
                  return (
                    <option
                      key={tab}
                      value={tab}
                      className="bg-slate-900 text-slate-100 light:bg-white light:text-slate-850 font-bold"
                    >
                      {tab} ({count})
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={14} className="absolute right-0 text-slate-400 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        ) : (
          /* Single Dars view for coordinators */
          <div
            className="flex items-center gap-2 border border-slate-800 rounded-2xl px-4 py-2.5 bg-slate-900/50 no-print light:bg-white light:border-slate-205"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
          >
            <Filter size={14} className="text-slate-400 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xxs font-black text-slate-400 uppercase tracking-widest shrink-0 hidden sm:inline" style={{ color: 'var(--text-muted)' }}>Class / Dars:</span>
            <span className="text-xs sm:text-sm font-bold text-slate-200 light:text-slate-850 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              {visibleTabs[0] !== 'All Dars' && (
                <span className={`inline-block w-2 h-2 rounded-full ${DARS_COLORS[visibleTabs[0]]?.dot || 'bg-indigo-500'}`} />
              )}
              {visibleTabs[0]}
            </span>
          </div>
        )}
      </div>

      <>
        {/* ── Stats Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard label="Avg Attendance" value={`${avgAttendance}%`} desc="Target: 95% or higher"
            icon={<BarChart2 size={16} style={{ color: 'var(--accent-indigo)' }} />} accent="before:bg-indigo-500" />
          <StatCard label="Skill Activities" value={totalPrograms} desc="Skill activities"
            icon={<FileText size={16} style={{ color: 'var(--accent-teal)' }} />} accent="before:bg-teal-500" />
          <StatCard label="Total Leaves" value={totalLeaves} desc="Approved / Unapproved"
            icon={<LogOut size={16} style={{ color: 'var(--accent-warning)' }} />} accent="before:bg-amber-500" />
        </div>

        {/* ── Visualizations ───────────────────────────────────────── */}
        {totalReports > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Attendance Trend Bar Chart */}
            <div
              className="lg:col-span-2 rounded-2xl border p-6 flex flex-col gap-4"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Attendance Trends ({activeDars})
              </h3>
              <div className="h-[200px] flex items-end justify-between pt-4 px-2 gap-2">
                {trendReports.map(r => (
                  <div key={r.id} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="flex-1 w-full flex items-end justify-center relative min-h-0">
                      <div
                        className="w-8 rounded-t-lg transition-all duration-700 relative cursor-pointer hover:opacity-90"
                        style={{
                          height: `${r.attendance_avg_pct}%`,
                          background: 'linear-gradient(to top, var(--accent-indigo), var(--accent-teal))'
                        }}
                      >
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xxs font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-slate-700 z-10">
                          {r.attendance_avg_pct}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xxs font-semibold truncate max-w-[52px] text-center mt-2" style={{ color: 'var(--text-muted)' }}>
                      {r.month.split(' ')[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Breakdown */}
            <div
              className="rounded-2xl border p-6 flex flex-col gap-4"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Absent & Leave Category Breakdown
              </h3>
              <div className="flex flex-col gap-4 h-full justify-center">
                {[
                  { label: 'Absent (A)', val: leaveBreakdownAgg.absent, color: 'var(--accent-danger)' },
                  { label: 'Absent Approved (AA)', val: leaveBreakdownAgg.absent_approved, color: 'var(--accent-teal)' },
                  { label: 'Leave (L)', val: leaveBreakdownAgg.leave, color: 'var(--accent-warning)' },
                  { label: 'Leave Approved (LA)', val: leaveBreakdownAgg.leave_approved, color: 'var(--accent-indigo)' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      <span>{label}</span>
                      <span>{getReasonPct(val)}% ({val})</span>
                    </div>
                    <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-color)' }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${getReasonPct(val)}%`, backgroundColor: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Bottom Section Grid (Reports + Roster) ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Report List (Col Span 2) ────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 pb-2">
              <h2 className="text-lg sm:text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                {activeDars === 'All Dars' ? 'All Reports' : `${activeDars} Reports`}
              </h2>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {currentUser && currentUser.role === 'admin' && (
                  <>
                    <button
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all hover:-translate-y-0.5 cursor-pointer light:bg-slate-100 light:border-slate-205"
                      style={{ backgroundColor: 'var(--bg-surface-active)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                      onClick={() => onGenerateConsolidated(activeDars)}
                    >
                      <FileText size={16} /> Consolidated Report
                    </button>
                    {totalReports > 0 && (
                      <button
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-red-500/20 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all hover:-translate-y-0.5 cursor-pointer"
                        onClick={() => {
                          const reportIds = filteredReports.map(r => r.id);
                          const targetDesc = activeDars === 'All Dars' ? 'ALL reports across all Dars' : `ALL reports for ${activeDars}`;
                          if (window.confirm(`Are you sure you want to delete ${targetDesc} (${totalReports} reports)?\nThis action is permanent and cannot be undone.`)) {
                            onDelete(reportIds);
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}
                <button
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5"
                  style={{
                    background: isCreateAllowed
                      ? 'linear-gradient(135deg, var(--accent-indigo), #4f46e5)'
                      : 'linear-gradient(135deg, var(--bg-surface-active), var(--bg-surface))',
                    boxShadow: isCreateAllowed ? 'var(--shadow-glow-indigo)' : 'none',
                    borderColor: isCreateAllowed ? 'transparent' : 'var(--border-color)',
                    borderWidth: isCreateAllowed ? '0' : '1px',
                    color: isCreateAllowed ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                  onClick={() => onCreateNew(activeDars)}
                  title={!isCreateAllowed ? "Monthly reports can only be created between the 25th and 30th of the month" : ""}
                >
                  <Plus size={16} className={isCreateAllowed ? "" : "text-slate-500"} />
                  Create Report {!isCreateAllowed && " (25th-30th Only)"}
                </button>
              </div>
            </div>

            {totalReports === 0 ? (
              <div
                className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed space-y-4"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              >
                <Calendar size={48} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    No reports for {activeDars}
                  </h3>
                  <p className="text-sm max-w-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Create your first report for {activeDars} to start tracking attendance, skill activities, and student participation.
                  </p>
                </div>
                <button
                  className="px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all"
                  style={{
                    background: isCreateAllowed
                      ? 'linear-gradient(135deg, var(--accent-indigo), #4f46e5)'
                      : 'linear-gradient(135deg, var(--bg-surface-active), var(--bg-surface))',
                    boxShadow: isCreateAllowed ? 'var(--shadow-glow-indigo)' : 'none',
                    borderColor: isCreateAllowed ? 'transparent' : 'var(--border-color)',
                    borderWidth: isCreateAllowed ? '0' : '1px',
                    color: isCreateAllowed ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                  onClick={() => onCreateNew(activeDars)}
                  title={!isCreateAllowed ? "Monthly reports can only be created between the 25th and 30th of the month" : ""}
                >
                  <Plus size={16} className={`inline mr-1 ${isCreateAllowed ? "" : "text-slate-500"}`} />
                  Create First Report {!isCreateAllowed && " (25th-30th Only)"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map(report => {
                  const baseDars = (report.dars || 'Imam Navavi Garden').split(' - ')[0];
                  const darsColor = DARS_COLORS[baseDars] || DARS_COLORS['Imam Navavi Garden'];
                  return (
                    <div
                      key={report.id}
                      className="rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-205"
                      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                            {report.month}
                          </span>
                          {/* Dars badge */}
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xxs font-bold border ${darsColor.bg} ${darsColor.text} ${darsColor.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${darsColor.dot}`} />
                            {report.dars || 'Imam Navavi Garden'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span className="flex items-center gap-1"><User size={12} /> {report.prepared_by}</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(report.report_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: Number(report.attendance_avg_pct) >= 90 ? 'var(--accent-success)' : 'var(--accent-warning)' }}
                          >
                            Attendance: {report.attendance_avg_pct}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                          style={{ backgroundColor: 'var(--bg-surface-active)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                          onClick={() => onPreview(report)}
                        >
                          <Eye size={14} /> View
                        </button>
                        {report.dars !== 'Consolidated' && (
                          <button
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                            style={{ backgroundColor: 'var(--bg-surface-active)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                            onClick={() => onEdit(report)}
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                        )}
                        {currentUser && currentUser.role === 'admin' && (
                          <button
                            className="p-2 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white rounded-xl transition-all cursor-pointer"
                            onClick={() => {
                              if (window.confirm(`Delete report for ${report.month} (${report.dars || 'Imam Navavi Garden'})?`)) {
                                onDelete(report.id);
                              }
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Class Roster Management (Col Span 1) ─────────────────────── */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                Class Roster
              </h2>
              <span className="px-2.5 py-1 text-xxs font-extrabold rounded-lg bg-slate-900 border border-slate-800 text-slate-350 light:bg-slate-50 light:border-slate-200" style={{ color: 'var(--text-secondary)' }}>
                {currentClassStudents.length} Students
              </span>
            </div>

            <div
              className="rounded-2xl border p-5 space-y-4"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex flex-col gap-2">
                <div className="text-xs font-semibold text-slate-400" style={{ color: 'var(--text-muted)' }}>
                  Active Class: <span className="font-bold text-slate-200" style={{ color: 'var(--text-primary)' }}>{rosterDars}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0" style={{ color: 'var(--text-muted)' }}>Class Level:</span>
                  <select
                    value={activeClassLevel}
                    onChange={(e) => setActiveClassLevel(e.target.value)}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250 font-bold cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    {(LEVELS_BY_CLASS[rosterDars] || []).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add Student Form */}
              {currentUser && currentUser.role === 'admin' && (
                <form onSubmit={handleAddStudent} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New student name..."
                    className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xxs font-bold border border-slate-700 rounded-xl transition-all text-slate-200 cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-surface-active)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                  >
                    Add
                  </button>
                </form>
              )}

              {/* Students List */}
              {currentClassStudents.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500" style={{ color: 'var(--text-muted)' }}>
                  No students in this class.
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {currentClassStudents.map((student, idx) => (
                    <div
                      key={`roster-student-${idx}`}
                      className="px-3 py-2 flex justify-between items-center border border-slate-800 bg-slate-950/20 rounded-xl hover:border-slate-700 transition-all light:bg-slate-50 light:border-slate-200 gap-2 min-w-0"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <span className="text-xs font-medium text-slate-300 truncate" style={{ color: 'var(--text-secondary)' }}>
                        {student}
                      </span>
                      {currentUser && currentUser.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStudent(student)}
                          className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    </div>
  );
}

// ── Reusable stat card ────────────────────────────────────────────
function StatCard({ label, value, desc, icon, accent }) {
  return (
    <div
      className={`relative rounded-2xl p-6 flex flex-col gap-1.5 shadow-sm transition-all duration-300 hover:-translate-y-1 border overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 ${accent}`}
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
    >
      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        <span>{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="text-xxs" style={{ color: 'var(--text-muted)' }}>{desc}</div>
    </div>
  );
}
