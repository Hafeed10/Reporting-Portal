import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Save, Plus, Trash2, Calendar, User, Eye, Lightbulb } from 'lucide-react';
import { dailyAttendanceService } from '../supabase';

const DARS_OPTIONS = ['Imam Navavi Garden', 'Imam Rafi Garden', 'Imam Gazli Garden', 'RootExc'];

const LEVELS_BY_CLASS = {
  'Imam Navavi Garden': ['BS3', 'BS4', 'BS5'],
  'Imam Rafi Garden': ['BS1', 'BS2'],
  'Imam Gazli Garden': ['HS1', 'HS2'],
  'RootExc': ['8th Class', '9th Class']
};

const DEFAULT_FORM_STATE = {
  dars: 'Imam Navavi Garden',
  classLevel: 'BS3',
  month: new Date().toISOString().substring(0, 7),
  report_date: new Date().toISOString().substring(0, 10),
  prepared_by: '',
  designation: 'Student',

  student_reports: [],

  attendance_total_working_days: '',
  attendance_avg_pct: '',
  attendance_regular_count: '',
  attendance_low_count: '',

  leave_total_received: '',
  leave_approved_count: '',
  leave_unapproved_count: '',
  leave_reasons: { medical: 0, family_function: 0, personal: 0, others: 0 },

  programs_count: '',
  programs_names: [''],
  programs_outcomes: [''],
  books_read: [''],
  writing_activities: [''],

  participation_total: 0,
  participation_active: '',
  participation_achievements: [''],

  observations: [
    'Attendance trends and student engagement were satisfactory.',
    'Students actively participated in the skill activities and discussions.',
    'Leave records were monitored and maintained regularly.'
  ],
  suggestions: [
    'Improve attendance through regular follow-up.',
    'Encourage greater participation in skill activities.',
    'Conduct additional awareness and skill-development activities.'
  ]
};

const parseDarsField = (darsField) => {
  let dars = darsField || 'Imam Navavi Garden';
  let classLevel = 'HS1';
  const match = dars.match(/(.+) - (HS1|HS2|BS1|BS2|BS3|BS4|BS5|8th Class|9th Class)/);
  if (match) {
    dars = match[1];
    classLevel = match[2];
  }
  return { dars, classLevel };
};

const toYYYYMM = (monthStr) => {
  if (!monthStr) return new Date().toISOString().substring(0, 7);
  if (/^\d{4}-\d{2}$/.test(monthStr)) return monthStr;

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
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  return new Date().toISOString().substring(0, 7);
};

const toDisplayMonth = (yyyy_mm) => {
  if (!/^\d{4}-\d{2}$/.test(yyyy_mm)) return yyyy_mm;
  const [y, m] = yyyy_mm.split('-');
  const d = new Date(parseInt(y), parseInt(m) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export default function ReportForm({ initialReport, onSave, onCancel, studentsRoster = {}, onUpdateRoster, currentUser, prefillDars }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    const defaultDars = currentUser && currentUser.role === 'coordinator' 
      ? currentUser.dars 
      : (prefillDars || 'Imam Navavi Garden');
    const validLevels = LEVELS_BY_CLASS[defaultDars] || [];
    const defaultLevel = validLevels[0] || 'HS1';
    return { ...DEFAULT_FORM_STATE, dars: defaultDars, classLevel: defaultLevel };
  });
  const [errors, setErrors] = useState({});
  const [expandedStudent, setExpandedStudent] = useState(0);
  const [inlineStudentName, setInlineStudentName] = useState('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [step3StudentIdx, setStep3StudentIdx] = useState(0);
  const [lastLoadedReportId, setLastLoadedReportId] = useState(null);

  useEffect(() => {
    if (initialReport) {
      if (initialReport.id !== lastLoadedReportId) {
        setLastLoadedReportId(initialReport.id);
        const parsed = parseDarsField(initialReport.dars);
        setFormData({
          dars: currentUser && currentUser.role === 'coordinator' ? currentUser.dars : parsed.dars,
          classLevel: parsed.classLevel,
          month: initialReport.month ? toYYYYMM(initialReport.month) : new Date().toISOString().substring(0, 7),
          report_date: initialReport.report_date || new Date().toISOString().substring(0, 10),
          prepared_by: initialReport.prepared_by || '',
          designation: initialReport.designation || '',

          student_reports: initialReport.student_reports && initialReport.student_reports.length > 0 ? [...initialReport.student_reports] : [],

          attendance_total_working_days: initialReport.attendance_total_working_days ?? '',
          attendance_avg_pct: initialReport.attendance_avg_pct ?? '',
          attendance_regular_count: initialReport.attendance_regular_count ?? '',
          attendance_low_count: initialReport.attendance_low_count ?? '',

          leave_total_received: initialReport.leave_total_received ?? '',
          leave_approved_count: initialReport.leave_approved_count ?? '',
          leave_unapproved_count: initialReport.leave_unapproved_count ?? '',
          leave_reasons: initialReport.leave_reasons ? { ...initialReport.leave_reasons } : { medical: 0, family_function: 0, personal: 0, others: 0 },

          programs_count: initialReport.programs_count ?? '',
          programs_names: initialReport.programs_names && initialReport.programs_names.length > 0 ? [...initialReport.programs_names] : [''],
          programs_outcomes: initialReport.programs_outcomes && initialReport.programs_outcomes.length > 0 ? [...initialReport.programs_outcomes] : [''],
          books_read: initialReport.books_read && initialReport.books_read.length > 0 ? [...initialReport.books_read] : [''],
          writing_activities: initialReport.writing_activities && initialReport.writing_activities.length > 0 ? [...initialReport.writing_activities] : [''],

          participation_total: 0,
          participation_active: initialReport.participation_active ?? '',
          participation_achievements: initialReport.participation_achievements && initialReport.participation_achievements.length > 0 ? [...initialReport.participation_achievements] : [''],

          observations: initialReport.observations && initialReport.observations.length > 0 ? [...initialReport.observations] : [],
          suggestions: initialReport.suggestions && initialReport.suggestions.length > 0 ? [...initialReport.suggestions] : []
        });
      }
    } else {
      if (lastLoadedReportId !== null) {
        setLastLoadedReportId(null);
      }
      const defaultDars = currentUser && currentUser.role === 'coordinator' ? currentUser.dars : (prefillDars || 'Imam Navavi Garden');
      const validLevels = LEVELS_BY_CLASS[defaultDars] || [];
      setFormData({
        ...DEFAULT_FORM_STATE,
        dars: defaultDars,
        classLevel: validLevels[0] || 'HS1'
      });
    }
  }, [initialReport, currentUser, prefillDars, lastLoadedReportId]);

  // Sync roster students to report state
  useEffect(() => {
    const rosterStudents = (studentsRoster[formData.dars] && studentsRoster[formData.dars][formData.classLevel]) || [];
    setFormData(prev => {
      const currentReports = prev.student_reports || [];
      const defaultPresent = Number(prev.attendance_total_working_days || 22);

      // Keep existing ones (do not filter out deleted ones, as this also prevents data wipe before roster loads)
      const keptReports = currentReports.map(sr => {
        const present = sr.present ?? (sr.attendance_pct === 100 ? defaultPresent : sr.attendance_pct ? Math.round((Number(sr.attendance_pct)/100)*defaultPresent) : defaultPresent);
        const absent = sr.absent ?? 0;
        const absent_approved = sr.absent_approved ?? 0;
        const leave = sr.leave ?? 0;
        const leave_approved = sr.leave_approved ?? 0;
        const studentTotalDays = present + absent + absent_approved + leave + leave_approved;
        const attendance_pct = studentTotalDays > 0 ? Math.round((present / studentTotalDays) * 100) : (sr.attendance_pct || 100);
        return {
          ...sr,
          present,
          absent,
          absent_approved,
          leave,
          leave_approved,
          attendance_pct
        };
      });

      // Add new ones
      const missingStudents = rosterStudents.filter(name => !keptReports.some(sr => sr.student_name === name));
      const newEntries = missingStudents.map(name => ({
        student_name: name,
        present: defaultPresent,
        absent: 0,
        absent_approved: 0,
        leave: 0,
        leave_approved: 0,
        attendance_pct: 100,
        participation: 'Active',
        achievements: '',
        remarks: ''
      }));

      return {
        ...prev,
        student_reports: [...keptReports, ...newEntries]
      };
    });
  }, [formData.dars, formData.classLevel, studentsRoster, initialReport]);

  const handleAutoFillAttendance = async () => {
    setIsAutoFilling(true);
    try {
      const logs = await dailyAttendanceService.getAll();
      const targetMonth = toYYYYMM(formData.month);
      const targetClassKey = `${formData.dars} - ${formData.classLevel}`;
      
      const monthlyLogs = logs.filter(
        r => r.class === targetClassKey && r.date.substring(0, 7) === targetMonth
      );

      if (monthlyLogs.length === 0) {
        alert('No attendance logs found for the selected class and month.');
        setIsAutoFilling(false);
        return;
      }

      // Use total logs length as the number of "sessions/days"
      const totalSessions = monthlyLogs.length;

      // Prepare attendance map for all current students
      const studentAttendanceMap = {};
      const rosterStudents = (studentsRoster[formData.dars] && studentsRoster[formData.dars][formData.classLevel]) || [];
      
      rosterStudents.forEach(name => {
        studentAttendanceMap[name] = { present: 0, absent: 0, absentApproved: 0, leave: 0, leaveApproved: 0 };
      });

      monthlyLogs.forEach(log => {
        log.records.forEach(r => {
          const name = r.student_name;
          if (!studentAttendanceMap[name]) {
             studentAttendanceMap[name] = { present: 0, absent: 0, absentApproved: 0, leave: 0, leaveApproved: 0 };
          }
          if (r.status === 'P') {
            studentAttendanceMap[name].present += 1;
          } else if (r.status === 'A' || r.status === 'UA' || r.status === 'UL') {
            studentAttendanceMap[name].absent += 1;
          } else if (r.status === 'AA') {
            studentAttendanceMap[name].absentApproved += 1;
          } else if (r.status === 'L') {
            studentAttendanceMap[name].leave += 1;
          } else if (r.status === 'LA') {
            studentAttendanceMap[name].leaveApproved += 1;
          }
        });
      });

      const updatedReports = (formData.student_reports || []).map(sr => {
        const stats = studentAttendanceMap[sr.student_name] || { present: 0, absent: 0, absentApproved: 0, leave: 0, leaveApproved: 0 };
        
        const studentTotalDays = stats.present + stats.absent + stats.absentApproved + stats.leave + stats.leaveApproved;
        const attendance_pct = studentTotalDays > 0 ? Math.round((stats.present / studentTotalDays) * 100) : 100;
        
        return {
          ...sr,
          present: stats.present,
          absent: stats.absent,
          absent_approved: stats.absentApproved,
          leave: stats.leave,
          leave_approved: stats.leaveApproved,
          attendance_pct
        };
      });

      const presentSum = updatedReports.reduce((sum, r) => sum + Number(r.present || 0), 0);
      const absentSum = updatedReports.reduce((sum, r) => sum + Number(r.absent || 0), 0);
      const absentApprovedSum = updatedReports.reduce((sum, r) => sum + Number(r.absent_approved || 0), 0);
      const leaveSum = updatedReports.reduce((sum, r) => sum + Number(r.leave || 0), 0);
      const leaveApprovedSum = updatedReports.reduce((sum, r) => sum + Number(r.leave_approved || 0), 0);
      const totalDays = presentSum + absentSum + absentApprovedSum + leaveSum + leaveApprovedSum;
      const avgAttendance = totalDays > 0 ? Number(((presentSum / totalDays) * 100).toFixed(1)) : 100.0;
      const activeCount = updatedReports.filter(r => r.participation === 'Active' || r.participation === 'Semi-active').length;
      const achievements = updatedReports.filter(r => r.achievements && r.achievements.trim() !== '').map(r => `${r.student_name}: ${r.achievements.trim()}`);
      const participation_achievements = achievements.length > 0 ? achievements : formData.participation_achievements.filter(a => a.trim() !== '');

      const newFormData = {
        ...formData,
        attendance_total_working_days: totalSessions.toString(),
        student_reports: updatedReports,
        attendance_avg_pct: avgAttendance,
        attendance_regular_count: presentSum,
        attendance_low_count: absentSum,
        leave_total_received: absentApprovedSum,
        leave_unapproved_count: leaveSum,
        leave_approved_count: leaveApprovedSum,
        participation_total: 0,
        participation_active: activeCount,
        participation_achievements
      };

      const { classLevel, ...restFormData } = newFormData;
      const cleanedReport = {
        ...restFormData,
        dars: `${newFormData.dars} - ${newFormData.classLevel}`,
        month: toDisplayMonth(newFormData.month),
        attendance_total_working_days: Number(newFormData.attendance_total_working_days),
        attendance_avg_pct: Number(newFormData.attendance_avg_pct),
        attendance_regular_count: Number(newFormData.attendance_regular_count || 0),
        attendance_low_count: Number(newFormData.attendance_low_count || 0),
        leave_total_received: Number(newFormData.leave_total_received || 0),
        leave_approved_count: Number(newFormData.leave_approved_count || 0),
        leave_unapproved_count: Number(newFormData.leave_unapproved_count || 0),
        programs_count: Number(newFormData.programs_count || 0),
        programs_names: newFormData.programs_names.filter(item => item.trim() !== ''),
        programs_outcomes: newFormData.programs_outcomes.filter(item => item.trim() !== ''),
        books_read: newFormData.books_read.filter(item => item.trim() !== ''),
        writing_activities: newFormData.writing_activities.filter(item => item.trim() !== ''),
        participation_total: 0,
        participation_active: Number(newFormData.participation_active || 0),
        participation_achievements: newFormData.participation_achievements.filter(item => item.trim() !== ''),
        observations: newFormData.observations || [],
        suggestions: newFormData.suggestions || []
      };

      setFormData(newFormData);
      onSave(cleanedReport, true);
    } catch (err) {
      console.error('Error fetching attendance for auto-fill:', err);
      alert('Failed to fetch attendance records.');
    } finally {
      setIsAutoFilling(false);
    }
  };

  const autoCalculateClassStats = (studentReports) => {
    if (!studentReports || studentReports.length === 0) return;

    const N = studentReports.length;

    // Summing new student metrics
    const presentSum = studentReports.reduce((sum, r) => sum + Number(r.present || 0), 0);
    const absentSum = studentReports.reduce((sum, r) => sum + Number(r.absent || 0), 0);
    const absentApprovedSum = studentReports.reduce((sum, r) => sum + Number(r.absent_approved || 0), 0);
    const leaveSum = studentReports.reduce((sum, r) => sum + Number(r.leave || 0), 0);
    const leaveApprovedSum = studentReports.reduce((sum, r) => sum + Number(r.leave_approved || 0), 0);

    const totalDays = presentSum + absentSum + absentApprovedSum + leaveSum + leaveApprovedSum;
    const avgAttendance = totalDays > 0 ? Number(((presentSum / totalDays) * 100).toFixed(1)) : 100.0;

    const activeCount = studentReports.filter(r => r.participation === 'Active' || r.participation === 'Semi-active').length;

    const achievements = studentReports
      .filter(r => r.achievements && r.achievements.trim() !== '')
      .map(r => `${r.student_name}: ${r.achievements.trim()}`);

    setFormData(prev => ({
      ...prev,
      attendance_avg_pct: avgAttendance,
      attendance_regular_count: presentSum,       // mapped to Present (P) sum
      attendance_low_count: absentSum,            // mapped to Absent (A) sum
      leave_total_received: absentApprovedSum,     // mapped to Absent Approved (AA) sum
      leave_unapproved_count: leaveSum,            // mapped to Leave (L) sum
      leave_approved_count: leaveApprovedSum,      // mapped to Leave Approved (LA) sum
      participation_total: 0,
      participation_active: activeCount,
      participation_achievements: achievements.length > 0 ? achievements : prev.participation_achievements.filter(a => a.trim() !== '')
    }));
  };

  const handleWorkingDaysChange = (newDaysVal) => {
    const days = Math.min(365, Math.max(0, Number(newDaysVal) || 0));
    const finalDaysVal = Number(newDaysVal) > 365 ? '365' : newDaysVal;
    setFormData(prev => {
      const updatedReports = (prev.student_reports || []).map(sr => {
        const a = Number(sr.absent || 0);
        const aa = Number(sr.absent_approved || 0);
        const l = Number(sr.leave || 0);
        const la = Number(sr.leave_approved || 0);
        const present = Math.max(0, days - (a + aa + l + la));
        const studentTotalDays = present + a + aa + l + la;
        const attendance_pct = studentTotalDays > 0 ? Math.round((present / studentTotalDays) * 100) : 100;
        return {
          ...sr,
          present,
          attendance_pct
        };
      });
      return {
        ...prev,
        attendance_total_working_days: finalDaysVal,
        student_reports: updatedReports
      };
    });
  };

  const handleStudentReportChange = (index, field, value) => {
    const updatedReports = [...formData.student_reports];
    const totalWorkingDays = Number(formData.attendance_total_working_days || 22);
    
    let finalValue = value;
    if (['present', 'absent', 'absent_approved', 'leave', 'leave_approved'].includes(field)) {
      finalValue = Math.min(totalWorkingDays, Math.max(0, Number(value) || 0));
    }

    const sr = {
      ...updatedReports[index],
      [field]: finalValue
    };

    if (['present', 'absent', 'absent_approved', 'leave', 'leave_approved'].includes(field)) {
      const a = Number(field === 'absent' ? finalValue : (sr.absent || 0));
      const aa = Number(field === 'absent_approved' ? finalValue : (sr.absent_approved || 0));
      const l = Number(field === 'leave' ? finalValue : (sr.leave || 0));
      const la = Number(field === 'leave_approved' ? finalValue : (sr.leave_approved || 0));

      if (field === 'present') {
        sr.present = Math.min(totalWorkingDays, finalValue);
        const sumOthers = (sr.absent || 0) + (sr.absent_approved || 0) + (sr.leave || 0) + (sr.leave_approved || 0);
        if (sr.present + sumOthers > totalWorkingDays) {
          let remaining = totalWorkingDays - sr.present;
          sr.absent = Math.min(remaining, sr.absent || 0);
          remaining -= sr.absent;
          sr.absent_approved = Math.min(remaining, sr.absent_approved || 0);
          remaining -= sr.absent_approved;
          sr.leave = Math.min(remaining, sr.leave || 0);
          remaining -= sr.leave;
          sr.leave_approved = Math.min(remaining, sr.leave_approved || 0);
        }
      } else {
        const sumOthers = a + aa + l + la;
        if (sumOthers > totalWorkingDays) {
          const otherFieldsSum = (field === 'absent' ? 0 : a) +
                                 (field === 'absent_approved' ? 0 : aa) +
                                 (field === 'leave' ? 0 : l) +
                                 (field === 'leave_approved' ? 0 : la);
          const adjustedValue = Math.max(0, totalWorkingDays - otherFieldsSum);
          sr[field] = adjustedValue;
          sr.present = 0;
        } else {
          sr.present = totalWorkingDays - sumOthers;
        }
      }
    }
    
    // Compute student attendance percentage
    const currentP = Number(sr.present || 0);
    const currentA = Number(sr.absent || 0);
    const currentAA = Number(sr.absent_approved || 0);
    const currentL = Number(sr.leave || 0);
    const currentLA = Number(sr.leave_approved || 0);
    const studentTotalDays = currentP + currentA + currentAA + currentL + currentLA;
    sr.attendance_pct = studentTotalDays > 0 ? Math.round((currentP / studentTotalDays) * 100) : 100;
    
    updatedReports[index] = sr;
    setFormData(prev => ({
      ...prev,
      student_reports: updatedReports
    }));
  };

  const handleAddStudentInline = (e) => {
    e.preventDefault();
    if (!inlineStudentName.trim()) return;
    const name = inlineStudentName.trim();
    if (formData.student_reports.some(sr => sr.student_name === name)) {
      alert('Student already exists in this report!');
      return;
    }
    const newEntry = {
      student_name: name,
      attendance_pct: 100,
      leave_approved: 0,
      leave_unapproved: 0,
      leave_reason: 'None',
      participation: 'Active',
      achievements: '',
      remarks: ''
    };
    setFormData(prev => ({
      ...prev,
      student_reports: [...prev.student_reports, newEntry]
    }));

    // Save new student to the global roster (database)
    if (onUpdateRoster && formData.dars && formData.classLevel) {
      const rosterStudents = (studentsRoster[formData.dars] && studentsRoster[formData.dars][formData.classLevel]) || [];
      if (!rosterStudents.includes(name)) {
        const updatedRoster = {
          ...studentsRoster,
          [formData.dars]: {
            ...(studentsRoster[formData.dars] || {}),
            [formData.classLevel]: [...rosterStudents, name]
          }
        };
        onUpdateRoster(updatedRoster);
      }
    }

    setExpandedStudent(formData.student_reports.length); // Expand the newly added student
    setInlineStudentName('');
  };

  const handleRemoveStudentInline = (index) => {
    const updated = formData.student_reports.filter((_, idx) => idx !== index);
    setFormData(prev => ({
      ...prev,
      student_reports: updated
    }));
    if (expandedStudent >= updated.length) {
      setExpandedStudent(Math.max(0, updated.length - 1));
    }
  };

  const handleChange = (field, value) => {
    if (field === 'dars') {
      const validLevels = LEVELS_BY_CLASS[value] || [];
      const newLvl = validLevels[0] || 'HS1';
      setFormData(prev => ({
        ...prev,
        dars: value,
        classLevel: newLvl
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNestedChange = (parentField, childField, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: Number(value) || 0
      }
    }));
  };

  const handleListChange = (listField, index, value) => {
    const updatedList = [...formData[listField]];
    updatedList[index] = value;
    setFormData(prev => ({
      ...prev,
      [listField]: updatedList
    }));
  };

  const addListItem = (listField) => {
    setFormData(prev => ({
      ...prev,
      [listField]: [...prev[listField], '']
    }));
  };

  const removeListItem = (listField, index) => {
    const updatedList = formData[listField].filter((_, idx) => idx !== index);
    setFormData(prev => ({
      ...prev,
      [listField]: updatedList.length > 0 ? updatedList : ['']
    }));
  };

  const validateStep = (currentStep) => {
    const stepErrors = {};

    if (currentStep === 1) {
      if (!formData.month) stepErrors.month = 'Month is required';
      if (!formData.prepared_by) stepErrors.prepared_by = 'Student name is required';
      if (!formData.designation) stepErrors.designation = 'Designation is required';
      if (!formData.report_date) stepErrors.report_date = 'Report date is required';
    }

    if (currentStep === 3) {
      if (formData.attendance_total_working_days === '') {
        stepErrors.attendance_total_working_days = 'Total working classes is required';
      } else if (Number(formData.attendance_total_working_days) > 365) {
        stepErrors.attendance_total_working_days = 'Total working classes cannot exceed 365';
      } else if (Number(formData.attendance_total_working_days) < 0) {
        stepErrors.attendance_total_working_days = 'Total working classes cannot be negative';
      }
    }



    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 2) {
        autoCalculateClassStats(formData.student_reports);
      }
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleSubmit = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!validateStep(step)) return;

    const { classLevel, ...restFormData } = formData;
    const cleanedReport = {
      ...restFormData,
      dars: `${formData.dars} - ${formData.classLevel}`,
      month: toDisplayMonth(formData.month),
      attendance_total_working_days: Number(formData.attendance_total_working_days),
      attendance_avg_pct: Number(formData.attendance_avg_pct),
      attendance_regular_count: Number(formData.attendance_regular_count || 0),
      attendance_low_count: Number(formData.attendance_low_count || 0),

      leave_total_received: Number(formData.leave_total_received || 0),
      leave_approved_count: Number(formData.leave_approved_count || 0),
      leave_unapproved_count: Number(formData.leave_unapproved_count || 0),

      programs_count: Number(formData.programs_count || 0),
      programs_names: formData.programs_names.filter(item => item.trim() !== ''),
      programs_outcomes: formData.programs_outcomes.filter(item => item.trim() !== ''),
      books_read: formData.books_read.filter(item => item.trim() !== ''),
      writing_activities: formData.writing_activities.filter(item => item.trim() !== ''),

      participation_total: 0,
      participation_active: Number(formData.participation_active || 0),
      participation_achievements: formData.participation_achievements.filter(item => item.trim() !== ''),

      observations: formData.observations || [],
      suggestions: formData.suggestions || []
    };

    onSave(cleanedReport);
  };

  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl light:bg-white light:border-slate-200"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
    >
      {/* Wizard Steps Header */}
      <div className="flex border-b border-slate-800 bg-slate-950/20 overflow-x-auto no-scrollbar light:bg-slate-100/50 light:border-slate-200" style={{ borderColor: 'var(--border-color)', backgroundColor: 'rgba(17, 24, 39, 0.2)' }}>
        {[
          { num: 1, label: 'Details' },
          { num: 2, label: 'Students' },
          { num: 3, label: 'Attendance & Leaves' },
          { num: 4, label: 'Skill Activities' }
        ].map(s => (
          <div
            key={`step-btn-${s.num}`}
            className={`flex-1 min-w-[90px] sm:min-w-[110px] flex flex-col items-center gap-1.5 py-4 px-3 text-xxs sm:text-xs font-semibold border-b-2 transition-all cursor-pointer ${step === s.num
                ? 'text-indigo-400 border-indigo-500 bg-indigo-500/5 light:text-indigo-600 light:border-indigo-600'
                : step > s.num
                  ? 'text-teal-400 border-transparent light:text-teal-600'
                  : 'text-slate-500 border-transparent light:text-slate-400'
              }`}
            onClick={() => {
              // Only navigate if validated
              let canNavigate = true;
              for (let i = 1; i < s.num; i++) {
                if (!validateStep(i)) {
                  canNavigate = false;
                  setStep(i);
                  break;
                }
              }
              if (canNavigate) {
                if (step === 2 && s.num > 2) {
                  autoCalculateClassStats(formData.student_reports);
                }
                setStep(s.num);
              }
            }}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xxs font-extrabold transition-all ${step === s.num
                  ? 'bg-indigo-600 text-white'
                  : step > s.num
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-800 text-slate-400 light:bg-slate-200 light:text-slate-500'
                }`}
            >
              {s.num}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <div className="p-6 md:p-8 space-y-6 min-h-[380px]">

          {/* STEP 1: GENERAL INFO */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-slate-200 uppercase tracking-wider mb-2" style={{ color: 'var(--text-primary)' }}>1. General Report Details</h2>

              {/* Dars Selector */}
              <div className="flex flex-col gap-1.5 mb-2">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Class / Dars *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DARS_OPTIONS.map(d => {
                    const isCoordinator = currentUser && currentUser.role === 'coordinator';
                    const isSelected = formData.dars === d;
                    const isDisabled = isCoordinator && !isSelected;
                    return (
                      <button
                        key={d}
                        type="button"
                        disabled={isCoordinator}
                        onClick={() => handleChange('dars', d)}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold border transition-all ${isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-glow-indigo'
                            : isDisabled
                              ? 'border-slate-800 text-slate-650 opacity-30 cursor-not-allowed'
                              : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200 cursor-pointer'
                          }`}
                        style={{
                          backgroundColor: isSelected ? 'var(--accent-indigo)' : 'var(--bg-input)',
                          borderColor: isSelected ? 'var(--accent-indigo)' : 'var(--border-color)',
                          color: isSelected ? '#fff' : isDisabled ? 'var(--text-muted)' : 'var(--text-secondary)'
                        }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
                {currentUser && currentUser.role === 'coordinator' && (
                  <span className="text-[10px] text-indigo-400 font-semibold mt-1">
                    Your account is restricted to reporting for {currentUser.dars}.
                  </span>
                )}
              </div>

              {/* Class Level Selector */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Class Level *</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {(LEVELS_BY_CLASS[formData.dars] || []).map(lvl => {
                    const isSelected = formData.classLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleChange('classLevel', lvl)}
                        className={`w-full py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-glow-indigo'
                            : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                          }`}
                        style={{
                          backgroundColor: isSelected ? 'var(--accent-indigo)' : 'var(--bg-input)',
                          borderColor: isSelected ? 'var(--accent-indigo)' : 'var(--border-color)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }} htmlFor="month">Month & Year *</label>
                  <input
                    id="month"
                    type="month"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    value={formData.month}
                    onChange={(e) => handleChange('month', e.target.value)}
                    required
                  />
                  {errors.month && <span className="text-red-400 text-xxs font-semibold mt-0.5">{errors.month}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }} htmlFor="report_date">Report Date *</label>
                  <input
                    id="report_date"
                    type="date"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    value={formData.report_date}
                    onChange={(e) => handleChange('report_date', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }} htmlFor="prepared_by">Student Name *</label>
                  <select
                    id="prepared_by"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    value={formData.prepared_by}
                    onChange={(e) => handleChange('prepared_by', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a student</option>
                    {(formData.dars && formData.classLevel && studentsRoster[formData.dars] && studentsRoster[formData.dars][formData.classLevel] ? studentsRoster[formData.dars][formData.classLevel] : []).map(studentName => (
                      <option key={studentName} value={studentName}>{studentName}</option>
                    ))}
                  </select>
                  {errors.prepared_by && <span className="text-red-400 text-xxs font-semibold mt-0.5">{errors.prepared_by}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }} htmlFor="designation">Designation *</label>
                  <input
                    id="designation"
                    type="text"
                    placeholder="Student, Coordinator, Advisor etc."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    value={formData.designation}
                    onChange={(e) => handleChange('designation', e.target.value)}
                    required
                  />
                  {errors.designation && <span className="text-red-400 text-xxs font-semibold mt-0.5">{errors.designation}</span>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INDIVIDUAL STUDENT PERFORMANCE */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-2 light:border-slate-200" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <h2 className="text-base font-extrabold text-slate-200 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>2. Student Performance Reports</h2>
                  <p className="text-xxs text-slate-400 mt-1" style={{ color: 'var(--text-muted)' }}>
                    Fill out detailed stats for each student. Class aggregates will be automatically calculated.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleAutoFillAttendance}
                    disabled={isAutoFilling}
                    className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg text-xxs font-bold transition-all border border-teal-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isAutoFilling ? 'Fetching...' : 'Auto-fill from Daily Logs'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      autoCalculateClassStats(formData.student_reports);
                      alert('Class stats auto-calculated successfully! Check the next steps to review.');
                    }}
                    className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xxs font-bold transition-all border border-indigo-500/20 cursor-pointer"
                  >
                    Recalculate Class Stats
                  </button>
                </div>
              </div>

              {/* Working Classes Config in Step 2 */}
              <div className="p-4 bg-slate-950/20 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-200" style={{ color: 'var(--text-primary)' }}>Total Classes Held</span>
                  <span className="text-[10px] text-slate-450" style={{ color: 'var(--text-muted)' }}>Sets the baseline classes for auto-calculating student Present (P) values.</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 w-fit" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    placeholder="22"
                    className="w-16 bg-transparent text-sm font-bold text-indigo-400 focus:outline-none"
                    value={formData.attendance_total_working_days}
                    onChange={(e) => handleWorkingDaysChange(e.target.value)}
                  />
                  <span className="text-xxs font-semibold text-slate-500">Class</span>
                </div>
              </div>

              {/* Roster list */}
              {(!formData.student_reports || formData.student_reports.length === 0) ? (
                <div className="text-center py-12 text-sm text-slate-500 border border-dashed border-slate-800 rounded-2xl" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                  No students defined in the roster. Go to Dashboard and add students, or add a student name below.
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {formData.student_reports.map((sr, idx) => {
                    const isExpanded = expandedStudent === idx;
                    return (
                      <div
                        key={`student-card-${idx}`}
                        className={`border rounded-xl transition-all overflow-hidden ${isExpanded
                            ? 'bg-slate-950/45 border-indigo-500/30'
                            : 'border-slate-850 bg-slate-900/10 hover:border-slate-700 light:bg-slate-50'
                          }`}
                        style={{
                          backgroundColor: isExpanded ? 'rgba(99, 102, 241, 0.03)' : 'var(--bg-surface)',
                          borderColor: isExpanded ? 'rgba(99, 102, 241, 0.3)' : 'var(--border-color)'
                        }}
                      >
                        {/* Header Row */}
                        <div
                          onClick={() => setExpandedStudent(isExpanded ? null : idx)}
                          className="px-4 py-3 flex justify-between items-center cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5.5 h-5.5 rounded-full bg-slate-800 flex items-center justify-center text-xxs font-bold text-slate-400">
                              {idx + 1}
                            </span>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                                {sr.student_name}
                              </span>
                              <span className={`w-fit text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                                (sr.attendance_pct ?? 100) >= 90 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                                {sr.attendance_pct ?? 100}% Attendance
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {/* Summary Badge Preview */}
                             {!isExpanded && (
                               <div className="hidden sm:flex items-center gap-1.5 text-xxs font-bold">
                                 <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">P: {sr.present || 0}</span>
                                 <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">A: {sr.absent || 0}</span>
                                 <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400">AA: {sr.absent_approved || 0}</span>
                                 <span className="px-1.5 py-0.5 rounded bg-amber-555/10 text-amber-500">L: {sr.leave || 0}</span>
                                 <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">LA: {sr.leave_approved || 0}</span>
                                 <span className={`px-2 py-0.5 rounded ${sr.participation === 'Active' ? 'bg-teal-500/10 text-teal-400' : 'bg-slate-800 text-slate-400'}`} style={{ color: sr.participation === 'Active' ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                                   {sr.participation}
                                 </span>
                               </div>
                             )}
                           </div>
                         </div>

                         {/* Input Row Panel (Expanded content) */}
                         {isExpanded && (
                           <div className="px-5 pb-5 pt-2 border-t border-slate-800/40 grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderColor: 'var(--border-color)' }}>
                             
                             {/* P, A, AA, L, LA Grid */}
                             <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-5 gap-2 sm:col-span-2">
                               <div className="flex flex-col gap-1">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Present (P) *</label>
                                 <input
                                   type="number"
                                   min="0"
                                   required
                                   className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-105 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250 font-bold"
                                   style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                                   value={sr.present || 0}
                                   onChange={(e) => handleStudentReportChange(idx, 'present', Math.max(0, Number(e.target.value) || 0))}
                                 />
                               </div>
                               <div className="flex flex-col gap-1">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Absent (A) *</label>
                                 <input
                                   type="number"
                                   min="0"
                                   required
                                   className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-105 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250 font-bold"
                                   style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                                   value={sr.absent || 0}
                                   onChange={(e) => handleStudentReportChange(idx, 'absent', Math.max(0, Number(e.target.value) || 0))}
                                 />
                               </div>
                               <div className="flex flex-col gap-1">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Abs. App (AA) *</label>
                                 <input
                                   type="number"
                                   min="0"
                                   required
                                   className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-105 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250 font-bold"
                                   style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                                   value={sr.absent_approved || 0}
                                   onChange={(e) => handleStudentReportChange(idx, 'absent_approved', Math.max(0, Number(e.target.value) || 0))}
                                 />
                               </div>
                               <div className="flex flex-col gap-1">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Leave (L) *</label>
                                 <input
                                   type="number"
                                   min="0"
                                   required
                                   className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-105 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250 font-bold"
                                   style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                                   value={sr.leave || 0}
                                   onChange={(e) => handleStudentReportChange(idx, 'leave', Math.max(0, Number(e.target.value) || 0))}
                                 />
                               </div>
                               <div className="flex flex-col gap-1">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Lv. App (LA) *</label>
                                 <input
                                   type="number"
                                   min="0"
                                   required
                                   className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-105 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250 font-bold"
                                   style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                                   value={sr.leave_approved || 0}
                                   onChange={(e) => handleStudentReportChange(idx, 'leave_approved', Math.max(0, Number(e.target.value) || 0))}
                                 />
                               </div>
                             </div>

                              {/* Live Attendance Calculation Indicator */}
                              <div className="sm:col-span-2 p-3 bg-slate-950/20 border border-slate-800 rounded-xl flex flex-col min-[450px]:flex-row min-[450px]:items-center justify-between gap-3" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Calculated Attendance Rating</span>
                                  <span className="text-[9px] text-slate-500 font-semibold leading-none">Formula: P / (P + A + AA + L + LA)</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                                    (sr.attendance_pct ?? 100) >= 90 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  }`}>
                                    {sr.attendance_pct ?? 100}%
                                  </span>
                                  <span className="text-xxs font-bold text-slate-400" style={{ color: 'var(--text-muted)' }}>
                                    {(sr.attendance_pct ?? 100) >= 95 ? 'Excellent' : (sr.attendance_pct ?? 100) >= 90 ? 'Satisfactory' : 'Needs Improvement'}
                                  </span>
                                </div>
                              </div>

                             {/* Participation */}
                             <div className="flex flex-col gap-1.5 sm:col-span-2">
                               <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Class Participation</label>
                               <select
                                 className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250"
                                 style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                 value={sr.participation}
                                 onChange={(e) => handleStudentReportChange(idx, 'participation', e.target.value)}
                               >
                                 <option value="Active">Active</option>
                                 <option value="Semi-active">Semi-active</option>
                                 <option value="Passive">Passive</option>
                               </select>
                             </div>

                             {/* Achievements */}
                             <div className="flex flex-col gap-1.5 sm:col-span-2">
                               <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Special Achievements</label>
                               <input
                                 type="text"
                                 placeholder="E.g., Secured first place in debating contest"
                                 className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250"
                                 style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                 value={sr.achievements || ''}
                                 onChange={(e) => handleStudentReportChange(idx, 'achievements', e.target.value)}
                               />
                             </div>

                             {/* Remarks */}
                             <div className="flex flex-col gap-1.5 sm:col-span-2">
                               <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Teacher's Remarks / Comments</label>
                               <input
                                 type="text"
                                 placeholder="E.g., Very active in science projects, needs to improve attendance."
                                 className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250"
                                 style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                 value={sr.remarks || ''}
                                 onChange={(e) => handleStudentReportChange(idx, 'remarks', e.target.value)}
                               />
                             </div>
                           </div>
                         )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Removed Add Student Inline Form via Select Dropdown */}
            </div>
          )}

          {/* STEP 3: ATTENDANCE & LEAVES SUMMARY */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-2" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <h2 className="text-base font-extrabold text-slate-200 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>3. Attendance & Leaves Summary</h2>
                  <p className="text-xxs text-slate-400 mt-1" style={{ color: 'var(--text-muted)' }}>
                    Configure overall class metrics. Class-level totals are auto-calculated from individual student reports.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillAttendance}
                  disabled={isAutoFilling}
                  className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg text-xxs font-bold transition-all border border-teal-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  {isAutoFilling ? 'Fetching...' : 'Auto-fill from Daily Logs'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Working Classes Card Input */}
                <div className="glass-card rounded-3xl p-5 border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[140px]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }} htmlFor="attendance_total_working_days">
                    Total Classes Held *
                  </label>
                  <div className="flex items-center gap-2 mt-4 bg-slate-950/40 border border-slate-850 rounded-2xl px-4 py-1.5 max-w-[150px] z-10" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    <input
                      id="attendance_total_working_days"
                      type="number"
                      min="0"
                      max="365"
                      required
                      placeholder="22"
                      className="w-16 bg-transparent text-2xl font-black text-indigo-400 focus:outline-none"
                      value={formData.attendance_total_working_days}
                      onChange={(e) => handleWorkingDaysChange(e.target.value)}
                    />
                    <span className="text-xxs font-bold text-slate-400">Class</span>
                  </div>
                  <div className="absolute right-4 bottom-4 text-slate-700/10 pointer-events-none z-0">
                    <Calendar size={55} strokeWidth={1.5} />
                  </div>
                  {errors.attendance_total_working_days && <span className="text-red-400 text-xxs font-semibold mt-1">{errors.attendance_total_working_days}</span>}
                </div>

                {/* Average Student Attendance % Card Display */}
                <div className="glass-card rounded-3xl p-5 border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[140px]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Average Student Attendance
                  </span>
                  <div className="flex items-baseline gap-2 mt-4 bg-slate-950/40 border border-slate-850 rounded-2xl px-4 py-2.5 w-fit" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    <span className="text-2xl font-black text-teal-400">
                      {formData.attendance_avg_pct || '0.0'}%
                    </span>
                  </div>
                  <div className="absolute right-4 bottom-4 text-teal-500/10 pointer-events-none z-0">
                    <svg width="55" height="55" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M18 20V10M12 20V4M6 20v-6" />
                    </svg>
                  </div>
                </div>

              </div>

              {/* Class Totals Grid */}
              <div className="glass-card rounded-3xl p-5 border border-slate-800 space-y-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-850 pb-2 gap-3" style={{ borderColor: 'var(--border-color)' }}>
                  <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">
                    Student Summary
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>View:</span>
                    <select
                      value={step3StudentIdx}
                      onChange={(e) => setStep3StudentIdx(Number(e.target.value))}
                      className="bg-slate-950/40 border border-slate-800 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
                      style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      {(formData.student_reports || []).map((sr, idx) => (
                        <option key={`step3-student-${idx}`} value={idx}>
                          {sr.student_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {(() => {
                    const N = formData.student_reports?.length || 0;
                    
                    let pSum = 0, aSum = 0, aaSum = 0, lSum = 0, laSum = 0;
                    const sr = formData.student_reports[step3StudentIdx];
                    if (sr) {
                      pSum = sr.present || 0;
                      aSum = sr.absent || 0;
                      aaSum = sr.absent_approved || 0;
                      lSum = sr.leave || 0;
                      laSum = sr.leave_approved || 0;
                    }

                    const renderCard = (label, sum, labelColor) => {
                      const avgVal = N > 0 ? (Number(sum || 0) / N).toFixed(1) : '0.0';
                      return (
                        <div className="flex flex-col gap-1 p-2.5 bg-slate-950/30 rounded-2xl border border-slate-850 justify-between min-h-[85px]" style={{ borderColor: 'var(--border-color)' }}>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">{label}</span>
                            <div className="flex items-baseline gap-1">
                              <span className={`text-xl font-extrabold ${labelColor}`}>{sum || 0}</span>
                              <span className="text-[8px] font-black text-slate-500 uppercase">Class</span>
                            </div>
                          </div>
                          {/* Removed Avg display per user request */}
                        </div>
                      );
                    };
                    return (
                      <>
                        {renderCard('Present (P)', pSum, 'text-indigo-400')}
                        {renderCard('Absent (A)', aSum, 'text-red-400')}
                        {renderCard('Abs. App (AA)', aaSum, 'text-teal-400')}
                        {renderCard('Leave (L)', lSum, 'text-amber-400')}
                        {renderCard('Lv. App (LA)', laSum, 'text-purple-400')}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SKILL ACTIVITIES & PARTICIPATION */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-800 pb-3" style={{ borderColor: 'var(--border-color)' }}>
                <h2 className="text-base font-extrabold text-slate-200 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>4. Skill Activities & Student Participation</h2>
                <p className="text-xxs text-slate-400 mt-1" style={{ color: 'var(--text-muted)' }}>
                  Log the total skill activities participation and aggregate student participation figures.
                </p>
              </div>


              <div className="grid grid-cols-1 gap-4 max-w-md">
                
                {/* Skill Activities Conducted Card Input */}
                <div className="glass-card rounded-3xl p-5 border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[140px]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }} htmlFor="programs_count">
                    Skill Activities Participation
                  </label>
                  <div className="flex items-center gap-3 mt-4 z-10">
                    <div className="flex items-baseline gap-1.5 bg-slate-950/40 border border-slate-850 rounded-2xl px-4 py-1.5 max-w-[150px]" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                      <input
                        id="programs_count"
                        type="number"
                        min="0"
                        placeholder="4"
                        className="w-16 bg-transparent text-2xl font-black text-teal-400 focus:outline-none"
                        value={formData.programs_count}
                        onChange={(e) => handleChange('programs_count', e.target.value)}
                      />
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
                  <div className="absolute right-4 bottom-4 text-teal-500/10 pointer-events-none z-0">
                    <svg width="55" height="55" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-spin-slow">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                  </div>
                </div>

              </div>

              {/* Lists section (Skill Activity Names, outcomes, achievements) */}
              <div className="glass-card rounded-3xl p-5 border border-slate-800 space-y-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                {/* Skill Activity Names List */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Skill Activity Names / Participation</label>
                  <div className="space-y-2">
                    {formData.programs_names.map((program, idx) => (
                      <div key={`program-${idx}`} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder={`Skill Activity Name #${idx + 1}`}
                          className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all light:bg-white light:border-slate-250"
                          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                          value={program}
                          onChange={(e) => handleListChange('programs_names', idx, e.target.value)}
                        />
                        <button
                          type="button"
                          className="p-2.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white rounded-xl transition-all cursor-pointer"
                          onClick={() => removeListItem('programs_names', idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-xxs font-extrabold rounded-lg text-slate-355 border border-slate-800 transition-all cursor-pointer"
                      onClick={() => addListItem('programs_names')}
                    >
                      <Plus size={12} /> Add Skill Activity
                    </button>
                  </div>
                </div>

                {/* Outcomes List */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Key Learning Outcomes</label>
                  <div className="space-y-2">
                    {formData.programs_outcomes.map((outcome, idx) => (
                      <div key={`outcome-${idx}`} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder={`Learning Outcome #${idx + 1}`}
                          className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all light:bg-white light:border-slate-250"
                          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                          value={outcome}
                          onChange={(e) => handleListChange('programs_outcomes', idx, e.target.value)}
                        />
                        <button
                          type="button"
                          className="p-2.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white rounded-xl transition-all cursor-pointer"
                          onClick={() => removeListItem('programs_outcomes', idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-xxs font-extrabold rounded-lg text-slate-355 border border-slate-800 transition-all cursor-pointer"
                      onClick={() => addListItem('programs_outcomes')}
                    >
                      <Plus size={12} /> Add Outcome
                    </button>
                  </div>
                </div>

                {/* Book Reading List */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Book Reading Activities</label>
                  <div className="space-y-2">
                    {formData.books_read.map((book, idx) => (
                      <div key={`book-${idx}`} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder={`Book/Chapter Title #${idx + 1}`}
                          className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all light:bg-white light:border-slate-250"
                          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                          value={book}
                          onChange={(e) => handleListChange('books_read', idx, e.target.value)}
                        />
                        <button
                          type="button"
                          className="p-2.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white rounded-xl transition-all cursor-pointer"
                          onClick={() => removeListItem('books_read', idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-xxs font-extrabold rounded-lg text-slate-355 border border-slate-800 transition-all cursor-pointer"
                      onClick={() => addListItem('books_read')}
                    >
                      <Plus size={12} /> Add Book/Chapter
                    </button>
                  </div>
                </div>

                {/* Writing List */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Writing Activities</label>
                  <div className="space-y-2">
                    {formData.writing_activities.map((writing, idx) => (
                      <div key={`writing-${idx}`} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder={`Writing Activity #${idx + 1}`}
                          className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all light:bg-white light:border-slate-250"
                          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                          value={writing}
                          onChange={(e) => handleListChange('writing_activities', idx, e.target.value)}
                        />
                        <button
                          type="button"
                          className="p-2.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white rounded-xl transition-all cursor-pointer"
                          onClick={() => removeListItem('writing_activities', idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-xxs font-extrabold rounded-lg text-slate-355 border border-slate-800 transition-all cursor-pointer"
                      onClick={() => addListItem('writing_activities')}
                    >
                      <Plus size={12} /> Add Writing
                    </button>
                  </div>
                </div>

                {/* Achievements List */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Special Participation Achievements</label>
                  <div className="space-y-2">
                    {formData.participation_achievements.map((achievement, idx) => (
                      <div key={`achievement-${idx}`} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder={`Special Achievement #${idx + 1}`}
                          className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all light:bg-white light:border-slate-250"
                          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                          value={achievement}
                          onChange={(e) => handleListChange('participation_achievements', idx, e.target.value)}
                        />
                        <button
                          type="button"
                          className="p-2.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white rounded-xl transition-all cursor-pointer"
                          onClick={() => removeListItem('participation_achievements', idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-xxs font-extrabold rounded-lg text-slate-355 border border-slate-800 transition-all cursor-pointer"
                      onClick={() => addListItem('participation_achievements')}
                    >
                      <Plus size={12} /> Add Achievement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/30 flex flex-col sm:flex-row justify-between items-stretch sm:items-center light:border-slate-200 gap-3 sm:gap-0" style={{ borderColor: 'var(--border-color)', backgroundColor: 'rgba(17, 24, 39, 0.2)' }}>
          <div className="flex flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-300 rounded-xl text-sm font-semibold transition-all cursor-pointer text-center justify-center"
              style={{ backgroundColor: 'var(--bg-surface-active)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              onClick={onCancel}
            >
              Cancel
            </button>

            {step > 1 && (
              <button
                type="button"
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-300 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                style={{ backgroundColor: 'var(--bg-surface-active)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                onClick={handlePrev}
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
          </div>

          {step < 4 ? (
            <button
              key="next-btn"
              type="button"
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-1.5 shadow-glow-indigo transition-all hover:-translate-y-0.5 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--accent-indigo), #4f46e5)',
                boxShadow: 'var(--shadow-glow-indigo)'
              }}
              onClick={handleNext}
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              key="save-btn"
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-1.5 shadow-glow-teal transition-all hover:-translate-y-0.5 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--accent-teal), #0d9488)',
                boxShadow: 'var(--shadow-glow-teal)'
              }}
            >
              <Save size={16} /> Save Report
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
