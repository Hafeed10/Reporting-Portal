import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, User, FileText, BarChart2, Award, Printer, Download, BookOpen, Clock, AlertCircle, CheckCircle2, Trash2, Edit2, ChevronRight, BookOpenCheck, X, ChevronDown } from 'lucide-react';
import { dailyAttendanceService } from '../supabase';

const SUBJECTS_BY_CLASS_LEVEL = {
  '8th Class': [
    "QUR'AN",
    'MEEZAN',
    'خلاصة',
    'FATHUL QAYYOOM',
    'ENGLISH',
    'ARABIC',
    'SOCIAL SCIENCE',
    'MATHS',
    'Custom'
  ],
  '9th Class': [
    "QUR'AN",
    'MEEZAN',
     'خلاصة',
    'FATHUL QAYYOOM',
    'ENGLISH',
    'ARABIC',
    'SOCIAL SCIENCE',
    'MATHS',
    'Custom'
  ],
  'HS1': [
    'رياض الصالحين/كفاية',
    'خلاصة',
    'الصرف',
    'النحو',
    'تدريبات',
    'اردو',
    'الإنجليزية',
    'Hizb',
    'School',
    'Custom'
  ],
  'HS2': [
    'اذكياء/اردو',
    'خلاصة',
    'تقويم اللسان',
    'قطر الندي',
    'اقرأ',
    'الإنجليزية',
    'Hizb',
    'School',
    'Custom'
  ],
  'BS1': [
    'فتح المعين',
    'زبدة العرفان',
    'رسالة العزيزية',
    'الخلاصة الألفية',
    'مقدمة المشكوة',
    'اللغة العربية المعاصرة /اللغة',
    'ഇംഗ്ലീഷ്',
    'المدخل',
    'Custom'
  ],
  'BS2': [
    'فتح المعين',
    'زبدة العرفان',
    'رسالة العزيزية',
    'الخلاصة الألفية',
    'مشكوة المصابيح',
    'اللغة العربية المعاصرة /اللغة الإنجليزية',
    'شرح التهذيب',
    'Custom'
  ],
  'BS3': [
    'Hadees',
    'തഫ്സീർ',
    'മഹല്ലി',
    'Fikhh',
    'മുഖ്തസർ',
    'Fawaed',
    'Nahv',
    'Manthoq',
    'Custom'
  ],
  'BS4': [
    'Hadees',
    'തഫ്സീർ',
    'മഹല്ലി',
    'Fikhh',
    'Usool',
    'Aqeeda',
    'Rashediya',
    'മുഖ്തസർ',
    'Custom'
  ],
  'BS5': [
    'നുഹ്ബ',
    'Aqeeda',
    'Fiqh',
    'Usool',
    'Uklaidis',
    'Thafseer',
    'Hadees',
    'Custom'
  ],
  'default': [
    'Thafseer',
    'Tajweed',
    'Fiqh',
    'Aqeedah',
    'Hadith',
    'Arabic Language',
    'Custom'
  ]
};

const getSubjectOptions = (classLevel) => {
  if (classLevel === '8th STD') return SUBJECTS_BY_CLASS_LEVEL['8th Class'];
  if (classLevel === '9th STD') return SUBJECTS_BY_CLASS_LEVEL['9th Class'];
  return SUBJECTS_BY_CLASS_LEVEL[classLevel] || SUBJECTS_BY_CLASS_LEVEL['default'];
};

const ALL_UNIQUE_SUBJECTS = Array.from(
  new Set(
    Object.values(SUBJECTS_BY_CLASS_LEVEL)
      .flat()
      .filter(s => s !== 'Custom')
  )
);
const PERIOD_OPTIONS = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7', 'Period 8', ];
const CLASS_OPTIONS = ['Imam Navavi Garden', 'Imam Rafi Garden', 'Imam Gazli Garden', 'RootExc'];
const LEVELS_BY_CLASS = {
  'Imam Navavi Garden': ['BS3', 'BS4', 'BS5'],
  'Imam Rafi Garden': ['BS1', 'BS2'],
  'Imam Gazli Garden': ['HS1', 'HS2'],
  'RootExc': ['8th Class', '9th Class']
};

const FACULTY_OPTIONS = [
  'Hafiz Usthad',
  'Arshad Nurani Usthad',
  'Ali Nurani Usthad',
  'Thulaib Usthad',
  'Sadiq Usthad',
  'Qadar Usthad',
  'Ameer Sir',
  'Thasheel Adany',
  'Shammas Usthad',
  'Shamnad Sir',
  'System',
  'Custom'
];



const getSubjectCategory = (subject) => {
  const s = (subject || '').trim().toLowerCase();
  if (s.includes('thafseer') || s.includes('exegesis') || s.includes('തഫ്സീർ'))
    return { name: 'EXEGESIS & COMMENTARY', color: 'text-indigo-400 border-indigo-500/25 bg-indigo-500/10' };

  if (s.includes('tajweed') || s.includes('recitation') || s.includes('زبدة') || s.includes("qur'an") || s.includes('quran') || s.includes('اقرأ') || s.includes('hizb'))
    return { name: 'RECITATIONAL SCIENCE', color: 'text-amber-400 border-amber-500/25 bg-amber-500/10' };

  if (s.includes('fiqh') || s.includes('fikhh') || s.includes('മഹല്ലി') || s.includes('فتح المعين') || s.includes('jurisprudence') || s.includes('fathul') || s.includes('qayyoom') || s.includes('كفاية'))
    return { name: 'ISLAMIC JURISPRUDENCE', color: 'text-purple-400 border-purple-500/25 bg-purple-500/10' };

  if (s.includes('aqeedah') || s.includes('aqeeda') || s.includes('theology'))
    return { name: 'THEOLOGY & CREED', color: 'text-sky-400 border-sky-500/25 bg-sky-500/10' };

  if (s.includes('hadith') || s.includes('hadees') || s.includes('مشكوة') || s.includes('tradition') || s.includes('رياض'))
    return { name: 'PROPHETIC TRADITIONS', color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10' };

  if (s.includes('arabic') || s.includes('grammar') || s.includes('language') || s.includes('اللغة') || s.includes('الخلاصة') || s.includes('الألفية') || s.includes('التهذيب') || s.includes('العزيزية') || s.includes('nahv') || s.includes('manthoq') || s.includes('ഇംഗ്ലീഷ്') || s.includes('english') || s.includes('meezan') || s.includes('الصرف') || s.includes('النحو') || s.includes('متفرد') || s.includes('اردو') || s.includes('الإنجليزية') || s.includes('تقويم') || s.includes('قطر') || s.includes('خلاصة'))
    return { name: 'LINGUISTICS & GRAMMAR', color: 'text-rose-400 border-rose-500/25 bg-rose-500/10' };

  return { name: 'GENERAL ACADEMICS', color: 'text-teal-400 border-teal-500/25 bg-teal-500/10' };
};

export default function Classes({
  currentUser,
  studentsRoster = {},
  onUpdateRoster,
  showToast,
  activeSubTab: propActiveSubTab,
  setActiveSubTab: propSetActiveSubTab
}) {
  const [localActiveSubTab, setLocalActiveSubTab] = useState('register');
  const activeSubTab = propActiveSubTab !== undefined ? propActiveSubTab : localActiveSubTab;
  const setActiveSubTab = propSetActiveSubTab !== undefined ? propSetActiveSubTab : setLocalActiveSubTab;

  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selector Dropdown Toggles for custom inputs
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);

  // Daily Register form state
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [selectedClass, setSelectedClass] = useState(() => {
    if (currentUser && currentUser.role === 'coordinator') {
      return currentUser.dars;
    }
    return 'Imam Navavi Garden';
  });
  const [selectedClassLevel, setSelectedClassLevel] = useState(() => {
    const initialClass = currentUser && currentUser.role === 'coordinator' ? currentUser.dars : 'Imam Navavi Garden';
    const validLevels = LEVELS_BY_CLASS[initialClass] || [];
    return validLevels[0] || 'HS1';
  });
  const [selectedSubject, setSelectedSubject] = useState(() => {
    const initialClass = currentUser && currentUser.role === 'coordinator' ? currentUser.dars : 'Imam Navavi Garden';
    const validLevels = LEVELS_BY_CLASS[initialClass] || [];
    const firstLevel = validLevels[0] || 'HS1';
    const subjects = getSubjectOptions(firstLevel);
    return subjects[0] || 'Fiqh';
  });
  const [customSubject, setCustomSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Period 1');
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [isExplicitEditMode, setIsExplicitEditMode] = useState(false);
  const [duplicateRecordConflict, setDuplicateRecordConflict] = useState(null);
  const [studentFilterQuery, setStudentFilterQuery] = useState('');
  const [facultyName, setFacultyName] = useState(() => {
    if (currentUser) {
      return currentUser.name;
    }
    return FACULTY_OPTIONS[0];
  });
  const [selectedFacultyOption, setSelectedFacultyOption] = useState(() => {
    if (currentUser) {
      return FACULTY_OPTIONS.includes(currentUser.name) ? currentUser.name : 'Custom';
    }
    return FACULTY_OPTIONS[0];
  });
  const [studentAttendance, setStudentAttendance] = useState({});
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const studentAttendanceRef = React.useRef(studentAttendance);
  studentAttendanceRef.current = studentAttendance;

  // Search/Filter in History
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterClassLevel, setFilterClassLevel] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [historyLimit, setHistoryLimit] = useState(10);

  // Reset pagination limit when filters change
  useEffect(() => {
    setHistoryLimit(10);
  }, [searchQuery, filterClass, filterClassLevel, filterSubject, filterDate]);

  // Weekly summary state
  const [weeklyClass, setWeeklyClass] = useState(() => {
    if (currentUser && currentUser.role === 'coordinator') {
      return currentUser.dars;
    }
    return 'Imam Navavi Garden';
  });
  const [weeklyClassLevel, setWeeklyClassLevel] = useState(() => {
    const initialClass = currentUser && currentUser.role === 'coordinator' ? currentUser.dars : 'Imam Navavi Garden';
    const validLevels = LEVELS_BY_CLASS[initialClass] || [];
    return validLevels[0] || 'HS1';
  });
  const [weeklyStart, setWeeklyStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().substring(0, 10);
  });
  const [weeklyEnd, setWeeklyEnd] = useState(() => new Date().toISOString().substring(0, 10));

  // Monthly summary state
  const [monthlyClass, setMonthlyClass] = useState(() => {
    if (currentUser && currentUser.role === 'coordinator') {
      return currentUser.dars;
    }
    return 'Imam Navavi Garden';
  });
  const [monthlyClassLevel, setMonthlyClassLevel] = useState(() => {
    const initialClass = currentUser && currentUser.role === 'coordinator' ? currentUser.dars : 'Imam Navavi Garden';
    const validLevels = LEVELS_BY_CLASS[initialClass] || [];
    return validLevels[0] || 'HS1';
  });
  const [monthlyMonth, setMonthlyMonth] = useState(() => new Date().toISOString().substring(0, 7));
  const [defaulterThreshold, setDefaulterThreshold] = useState(75);
  const [monthlySortOption, setMonthlySortOption] = useState('pct');

  // Load history records
  const loadHistory = async () => {
    setLoading(true);
    try {
      const logs = await dailyAttendanceService.getAll();
      setHistoryRecords(logs);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Update register form selections when user changes (e.g. coordinator locked class)
  useEffect(() => {
    if (currentUser && currentUser.role === 'coordinator') {
      const dars = currentUser.dars;
      setSelectedClass(dars);
      setWeeklyClass(dars);
      setMonthlyClass(dars);

      const validLevels = LEVELS_BY_CLASS[dars] || [];
      const firstValidLvl = validLevels[0] || 'HS1';
      setSelectedClassLevel(firstValidLvl);
      setWeeklyClassLevel(firstValidLvl);
      setMonthlyClassLevel(firstValidLvl);

      const subjects = getSubjectOptions(firstValidLvl);
      setSelectedSubject(subjects[0]);

      setFacultyName(currentUser.name);
      setSelectedFacultyOption(FACULTY_OPTIONS.includes(currentUser.name) ? currentUser.name : 'Custom');
    }
  }, [currentUser]);

  // Sync attendance fields on selection changes
  useEffect(() => {
    const finalSubject = selectedSubject === 'Custom' ? customSubject : selectedSubject;
    const targetClassKey = `${selectedClass} - ${selectedClassLevel}`;
    const match = historyRecords.find(
      r => r.date === selectedDate &&
        r.class === targetClassKey &&
        r.subject === finalSubject &&
        r.period.split(' (')[0] === selectedPeriod
    );

    const roster = (studentsRoster[selectedClass] && studentsRoster[selectedClass][selectedClassLevel]) || [];
    const rosterSet = new Set(roster);

    if (isExplicitEditMode) {
      if (match && match.id !== editingRecordId) {
        setDuplicateRecordConflict(match);
      } else {
        setDuplicateRecordConflict(null);
      }
      
      // Sync roster keys if class/level changed in edit mode, keeping existing statuses
      const currentKeys = Object.keys(studentAttendanceRef.current);
      const isRosterDifferent = roster.length !== currentKeys.length || roster.some(name => !currentKeys.includes(name));
      
      if (isRosterDifferent) {
        const attendanceMap = { ...studentAttendanceRef.current };
        const parts = selectedDate.split('-');
        const isFriday = parts.length === 3 && new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getDay() === 5;
        const defaultStatus = isFriday ? 'L' : 'P';
        
        roster.forEach(name => {
          if (attendanceMap[name] === undefined) {
            attendanceMap[name] = defaultStatus;
          }
        });
        
        // Remove names not in new roster
        Object.keys(attendanceMap).forEach(name => {
          if (!rosterSet.has(name)) {
            delete attendanceMap[name];
          }
        });
        
        setStudentAttendance(attendanceMap);
      }
      return;
    }

    if (match) {
      setFacultyName(match.faculty);
      setSelectedFacultyOption(FACULTY_OPTIONS.includes(match.faculty) ? match.faculty : 'Custom');
      const attendanceMap = {};
      roster.forEach(name => {
        attendanceMap[name] = 'P';
      });
      match.records.forEach(r => {
        let mappedStatus = r.status;
        if (mappedStatus === 'UA' || mappedStatus === 'UL') {
          mappedStatus = 'A';
        }
        attendanceMap[r.student_name] = mappedStatus;
      });
      setStudentAttendance(attendanceMap);
      setIsEditingExisting(true);
      setEditingRecordId(match.id);
    } else {
      // Merge current student attendance with roster, preserving marked statuses
      const attendanceMap = { ...studentAttendanceRef.current };
      const parts = selectedDate.split('-');
      const isFriday = parts.length === 3 && new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getDay() === 5;
      const defaultStatus = isFriday ? 'L' : 'P';
      
      roster.forEach(name => {
        if (attendanceMap[name] === undefined) {
          attendanceMap[name] = defaultStatus;
        }
      });
      
      // Clean up names not in the roster
      Object.keys(attendanceMap).forEach(name => {
        if (!rosterSet.has(name)) {
          delete attendanceMap[name];
        }
      });
      
      setStudentAttendance(attendanceMap);
      setIsEditingExisting(false);
      setEditingRecordId(null);
      if (currentUser && currentUser.role === 'coordinator') {
        setFacultyName(currentUser.name);
        setSelectedFacultyOption(FACULTY_OPTIONS.includes(currentUser.name) ? currentUser.name : 'Custom');
      } else {
        setSelectedFacultyOption(FACULTY_OPTIONS.includes(facultyName) ? facultyName : 'Custom');
      }
    }
  }, [selectedDate, selectedClass, selectedClassLevel, selectedSubject, customSubject, selectedPeriod, historyRecords, studentsRoster, currentUser, isExplicitEditMode, editingRecordId]);

  // Handle saving attendance log
  const handleSaveAttendance = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const roster = (studentsRoster[selectedClass] && studentsRoster[selectedClass][selectedClassLevel]) || [];
    if (roster.length === 0) {
      alert('Cannot save attendance for an empty class level. Please add students to the roster first.');
      return;
    }

    const finalSubject = selectedSubject === 'Custom' ? customSubject : selectedSubject;
    if (!finalSubject.trim()) {
      alert('Please enter a subject name.');
      return;
    }

    if (!facultyName.trim()) {
      alert('Please enter a faculty name.');
      return;
    }

    if (duplicateRecordConflict) {
      alert(`Conflict: An attendance record already exists for ${selectedDate}, ${selectedClass} - ${selectedClassLevel}, ${finalSubject}, ${selectedPeriod}. Please modify or delete the existing entry first.`);
      return;
    }

    const finalPeriod = selectedPeriod;

    const recordsPayload = roster.map(name => ({
      student_name: name,
      status: studentAttendance[name] || 'P'
    }));

    const payload = {
      id: editingRecordId,
      date: selectedDate,
      class: `${selectedClass} - ${selectedClassLevel}`,
      subject: finalSubject,
      period: finalPeriod,
      faculty: facultyName,
      records: recordsPayload
    };

    setLoading(true);
    try {
      await dailyAttendanceService.save(payload);
      showToast(isEditingExisting ? 'Attendance register updated successfully!' : 'Attendance register saved successfully!');
      setIsExplicitEditMode(false);
      setDuplicateRecordConflict(null);
      setEditingRecordId(null);
      setIsEditingExisting(false);
      loadHistory();
    } catch (err) {
      console.error('Error saving daily register:', err);
      showToast('Error saving daily register.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm('Are you sure you want to delete this daily attendance log? This action cannot be undone.')) {
      try {
        await dailyAttendanceService.delete(id);
        showToast('Daily attendance log deleted.');
        loadHistory();
      } catch (err) {
        console.error('Error deleting daily log:', err);
        showToast('Failed to delete log.', 'error');
      }
    }
  };

  const handleEditRecordTrigger = (rec) => {
    setIsExplicitEditMode(true);
    setEditingRecordId(rec.id);
    setIsEditingExisting(true);
    setDuplicateRecordConflict(null);

    setSelectedDate(rec.date);

    // Parse combined class and class level
    let displayClass = rec.class;
    let displayClassLevel = 'HS1';
    const classMatch = rec.class.match(/(.+) - (HS1|HS2|BS1|BS2|BS3|BS4|BS5|8th Class|9th Class)/);
    if (classMatch) {
      displayClass = classMatch[1];
      displayClassLevel = classMatch[2];
    }
    setSelectedClass(displayClass);
    setSelectedClassLevel(displayClassLevel);
    setFacultyName(rec.faculty);
    setSelectedFacultyOption(FACULTY_OPTIONS.includes(rec.faculty) ? rec.faculty : 'Custom');

    // Parse combined period
    let displayPeriod = rec.period;
    const timeMatch = rec.period.match(/(Period \d+)\s*\((.+)\)/);
    if (timeMatch) {
      displayPeriod = timeMatch[1];
    }
    setSelectedPeriod(displayPeriod);

    const subjects = getSubjectOptions(displayClassLevel);
    if (subjects.includes(rec.subject)) {
      setSelectedSubject(rec.subject);
      setCustomSubject('');
    } else {
      setSelectedSubject('Custom');
      setCustomSubject(rec.subject);
    }

    // Set student states
    const attendanceMap = {};
    const roster = (studentsRoster[displayClass] && studentsRoster[displayClass][displayClassLevel]) || [];
    const parts = rec.date.split('-');
    const isFriday = parts.length === 3 && new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getDay() === 5;
    const defaultStatus = isFriday ? 'L' : 'P';
    roster.forEach(name => {
      attendanceMap[name] = defaultStatus;
    });
    rec.records.forEach(r => {
      let mappedStatus = r.status;
      if (mappedStatus === 'UA' || mappedStatus === 'UL') {
        mappedStatus = 'A';
      }
      attendanceMap[r.student_name] = mappedStatus;
    });
    setStudentAttendance(attendanceMap);
    setActiveSubTab('register');
  };

  const handleCancelExplicitEdit = () => {
    setIsExplicitEditMode(false);
    setEditingRecordId(null);
    setIsEditingExisting(false);
    setDuplicateRecordConflict(null);
  };

  // Helper calculation for average attendance of a log record
  const getLogStats = (rec) => {
    const total = rec.records.length;
    if (total === 0) return { present: 0, absent: 0, leave: 0, pct: 0 };
    const present = rec.records.filter(r => r.status === 'P').length;
    const absent = rec.records.filter(r => r.status === 'A' || r.status === 'AA' || r.status === 'UA' || r.status === 'UL').length;
    const leave = rec.records.filter(r => r.status === 'LA' || r.status === 'L').length;

    // Percentage = Present / Total
    const pct = Math.round((present / total) * 100);
    return { present, absent, leave, pct };
  };

  // Filter history records
  const filteredHistory = historyRecords.filter(rec => {
    if (currentUser && currentUser.role === 'coordinator' && !rec.class.startsWith(currentUser.dars)) {
      return false;
    }

    // Parse combined class key
    let recDars = rec.class;
    let recClassLevel = '';
    const classMatch = rec.class.match(/(.+) - (HS1|HS2|BS1|BS2|BS3|BS4|BS5|8th Class|9th Class)/);
    if (classMatch) {
      recDars = classMatch[1];
      recClassLevel = classMatch[2];
    }

    if (filterClass !== 'All' && recDars !== filterClass) {
      return false;
    }
    if (filterClassLevel !== 'All' && recClassLevel !== filterClassLevel) {
      return false;
    }
    if (filterSubject !== 'All' && rec.subject !== filterSubject) {
      return false;
    }
    if (filterDate && rec.date !== filterDate) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchSubject = rec.subject.toLowerCase().includes(query);
      const matchFaculty = rec.faculty.toLowerCase().includes(query);
      const matchPeriod = rec.period.toLowerCase().includes(query);
      return matchSubject || matchFaculty || matchPeriod;
    }
    return true;
  });

  // Calculate stats for history dashboard panel
  const totalRegistersLogged = filteredHistory.length;
  const overallAvgAttendance = (() => {
    if (filteredHistory.length === 0) return '0%';
    const sum = filteredHistory.reduce((acc, rec) => {
      const stats = getLogStats(rec);
      return acc + stats.pct;
    }, 0);
    return `${Math.round(sum / filteredHistory.length)}%`;
  })();

  const classesTodayCount = historyRecords.filter(r => r.date === new Date().toISOString().substring(0, 10)).length;
  const absentsToday = (() => {
    const todayLogs = historyRecords.filter(r => r.date === new Date().toISOString().substring(0, 10));
    const absentNames = [];
    todayLogs.forEach(log => {
      log.records.forEach(r => {
        if ((r.status === 'A' || r.status === 'UA' || r.status === 'UL') && !absentNames.includes(r.student_name)) {
          absentNames.push(r.student_name);
        }
      });
    });
    return absentNames;
  })();

  // CSV Exporter
  const handleExportCSV = (headers, rows, filename) => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [headers.join(","), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute Weekly Summary Report
  const getWeeklyData = () => {
    const targetKey = `${weeklyClass} - ${weeklyClassLevel}`;
    const logs = historyRecords.filter(
      r => r.class === targetKey && r.date >= weeklyStart && r.date <= weeklyEnd
    );
    const roster = (studentsRoster[weeklyClass] && studentsRoster[weeklyClass][weeklyClassLevel]) || [];

    // Subject statistics
    const subjectStatsMap = {};
    // Faculty summaries
    const facultyStatsMap = {};
    // Student weekly stats
    const studentStatsMap = {};
    roster.forEach(name => {
      studentStatsMap[name] = { present: 0, absent: 0, absentApproved: 0, leave: 0, leaveApproved: 0, total: 0 };
    });

    logs.forEach(log => {
      // Subjects
      if (!subjectStatsMap[log.subject]) {
        subjectStatsMap[log.subject] = { classes: 0, presentSum: 0, studentPeriodCount: 0 };
      }
      subjectStatsMap[log.subject].classes += 1;

      // Faculty
      if (!facultyStatsMap[log.faculty]) {
        facultyStatsMap[log.faculty] = { classes: 0, subjects: new Set(), totalStudents: 0, presentStudents: 0 };
      }
      facultyStatsMap[log.faculty].classes += 1;
      facultyStatsMap[log.faculty].subjects.add(log.subject);

      log.records.forEach(studentRec => {
        const name = studentRec.student_name;
        const status = studentRec.status;

        // Populate student stats
        if (studentStatsMap[name]) {
          studentStatsMap[name].total += 1;
          if (status === 'P') {
            studentStatsMap[name].present += 1;
          } else if (status === 'A' || status === 'UA' || status === 'UL') {
            studentStatsMap[name].absent += 1;
          } else if (status === 'AA') {
            studentStatsMap[name].absentApproved += 1;
          } else if (status === 'L') {
            studentStatsMap[name].leave += 1;
          } else if (status === 'LA') {
            studentStatsMap[name].leaveApproved += 1;
          }
        }

        // Populate subject stats
        subjectStatsMap[log.subject].studentPeriodCount += 1;
        if (status === 'P') {
          subjectStatsMap[log.subject].presentSum += 1;
        }

        // Populate faculty stats
        facultyStatsMap[log.faculty].totalStudents += 1;
        if (status === 'P') {
          facultyStatsMap[log.faculty].presentStudents += 1;
        }
      });
    });

    const subjectsList = Object.entries(subjectStatsMap).map(([subjectName, stats]) => {
      const avgPct = stats.studentPeriodCount > 0 ? Math.round((stats.presentSum / stats.studentPeriodCount) * 100) : 100;
      return { subject: subjectName, classes: stats.classes, attendancePct: `${avgPct}%` };
    });

    const studentsList = Object.entries(studentStatsMap).map(([name, stats]) => {
      const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100;
      return {
        name,
        present: stats.present,
        absent: stats.absent,
        absentApproved: stats.absentApproved,
        leave: stats.leave,
        leaveApproved: stats.leaveApproved,
        total: stats.total,
        pct: `${pct}%`,
        numericPct: pct
      };
    });

    const facultyList = Object.entries(facultyStatsMap).map(([facultyName, stats]) => {
      const avgPct = stats.totalStudents > 0 ? Math.round((stats.presentStudents / stats.totalStudents) * 100) : 100;
      return {
        faculty: facultyName,
        classes: stats.classes,
        subjects: Array.from(stats.subjects).join(', '),
        attendancePct: `${avgPct}%`
      };
    });

    return { subjectsList, studentsList, facultyList, logsCount: logs.length };
  };

  const handleExportWeeklyCSV = () => {
    const data = getWeeklyData();
    const headers = ['Subject', 'Classes Taken', 'Avg Attendance %'];
    const rows = data.subjectsList.map(s => [s.subject, s.classes, s.attendancePct]);
    handleExportCSV(headers, rows, `Weekly_Subject_Summary_${weeklyClass}_${weeklyClassLevel}_${weeklyStart}_to_${weeklyEnd}.csv`);
  };

  // Compute Monthly Report Data
  const getMonthlyData = () => {
    const targetKey = `${monthlyClass} - ${monthlyClassLevel}`;
    const logs = historyRecords.filter(
      r => r.class === targetKey && r.date.substring(0, 7) === monthlyMonth
    );
    const roster = (studentsRoster[monthlyClass] && studentsRoster[monthlyClass][monthlyClassLevel]) || [];

    // Overall Average
    let totalPctSum = 0;
    logs.forEach(log => {
      const stats = getLogStats(log);
      totalPctSum += stats.pct;
    });
    const monthlyAveragePct = logs.length > 0 ? Math.round(totalPctSum / logs.length) : 100;

    // Subject trends
    const subjectTrends = {};
    logs.forEach(log => {
      if (!subjectTrends[log.subject]) {
        subjectTrends[log.subject] = { present: 0, total: 0 };
      }
      log.records.forEach(r => {
        subjectTrends[log.subject].total += 1;
        if (r.status === 'P') {
          subjectTrends[log.subject].present += 1;
        }
      });
    });
    const subjectList = Object.entries(subjectTrends).map(([sub, stats]) => {
      const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100;
      return { subject: sub, classesCount: logs.filter(l => l.subject === sub).length, avgPct: pct };
    }).sort((a, b) => b.avgPct - a.avgPct);

    // Student performance rankings
    const studentAttendanceMap = {};
    roster.forEach(name => {
      studentAttendanceMap[name] = { present: 0, absent: 0, absentApproved: 0, leave: 0, leaveApproved: 0, total: 0 };
    });

    logs.forEach(log => {
      log.records.forEach(r => {
        const name = r.student_name;
        if (studentAttendanceMap[name]) {
          studentAttendanceMap[name].total += 1;
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
        }
      });
    });

    const studentsRanked = Object.entries(studentAttendanceMap).map(([name, stats]) => {
      const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100;
      return {
        name,
        present: stats.present,
        absent: stats.absent,
        absentApproved: stats.absentApproved,
        leave: stats.leave,
        leaveApproved: stats.leaveApproved,
        total: stats.total,
        pct: pct
      };
    }).filter(st => {
      if (monthlySortOption === 'present') return st.present > 0;
      if (monthlySortOption === 'absent') return st.absent > 0;
      if (monthlySortOption === 'absentApproved') return st.absentApproved > 0;
      if (monthlySortOption === 'leave') return st.leave > 0;
      if (monthlySortOption === 'leaveApproved') return st.leaveApproved > 0;
      return true;
    }).sort((a, b) => {
      if (monthlySortOption === 'total') return b.total - a.total;
      if (monthlySortOption === 'present') return b.present - a.present;
      if (monthlySortOption === 'absent') return b.absent - a.absent;
      if (monthlySortOption === 'absentApproved') return b.absentApproved - a.absentApproved;
      if (monthlySortOption === 'leave') return b.leave - a.leave;
      if (monthlySortOption === 'leaveApproved') return b.leaveApproved - a.leaveApproved;
      return b.pct - a.pct;
    });

    // Defaulters list
    const defaulters = studentsRanked.filter(s => s.pct < Number(defaulterThreshold));

    // Faculty teaching summary
    const facultySummary = {};
    logs.forEach(log => {
      if (!facultySummary[log.faculty]) {
        facultySummary[log.faculty] = { periods: 0, subjects: new Set(), present: 0, total: 0 };
      }
      facultySummary[log.faculty].periods += 1;
      facultySummary[log.faculty].subjects.add(log.subject);
      log.records.forEach(r => {
        facultySummary[log.faculty].total += 1;
        if (r.status === 'P') {
          facultySummary[log.faculty].present += 1;
        }
      });
    });

    const facultyList = Object.entries(facultySummary).map(([facultyName, stats]) => {
      const avgPct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100;
      return {
        faculty: facultyName,
        periods: stats.periods,
        subjects: Array.from(stats.subjects).join(', '),
        attendancePct: avgPct
      };
    });

    return {
      monthlyAveragePct,
      subjectList,
      studentsRanked,
      defaulters,
      facultyList,
      logsCount: logs.length
    };
  };

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, Math.min(2, name.length)).toUpperCase();
  };

  const getAvatarBg = (name) => {
    const colors = [
      'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20',
      'bg-rose-600/20 text-rose-400 border border-rose-500/20',
      'bg-teal-600/20 text-teal-400 border border-teal-500/20',
      'bg-amber-600/20 text-amber-400 border border-amber-500/20',
      'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20',
      'bg-sky-600/20 text-sky-400 border border-sky-500/20'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleExportMonthlyCSV = () => {
    const data = getMonthlyData();
    const headers = ['Student Name', 'Total Classes', 'Present', 'Absent', 'Absent Approved', 'Leave', 'Leave Approved', 'Attendance %'];
    const rows = data.studentsRanked.map(s => [s.name, s.total, s.present, s.absent, s.absentApproved, s.leave, s.leaveApproved, `${s.pct}%`]);
    handleExportCSV(headers, rows, `Monthly_Student_Attendance_Ranking_${monthlyClass}_${monthlyMonth}.csv`);
  };

  return (
    <div className="space-y-6">

      {/* ── Sub Tabs Navigation ──────────────────────────────────── */}
      <div className="hidden md:flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-3 no-print" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex overflow-x-auto no-scrollbar gap-1.5 p-1 rounded-2xl border border-slate-800 bg-slate-900/40 w-full sm:w-auto flex-nowrap sm:flex-wrap" style={{ borderColor: 'var(--border-color)' }}>
          {[
            { id: 'register', label: 'Daily Register', icon: <BookOpenCheck size={14} /> },
            { id: 'log', label: 'History Log', icon: <Clock size={14} /> },
            { id: 'weekly', label: 'Weekly Summary', icon: <FileText size={14} /> },
            { id: 'monthly', label: 'Monthly Report', icon: <BarChart2 size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 sm:flex-initial shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === tab.id
                ? 'bg-indigo-600 text-white shadow-glow-indigo'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              style={
                activeSubTab === tab.id
                  ? { background: 'linear-gradient(135deg, var(--accent-indigo), #4f46e5)', boxShadow: 'var(--shadow-glow-indigo)' }
                  : {}
              }
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xxs font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 sm:self-center self-end" style={{ color: 'var(--text-muted)' }}>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Attendance Module Active
        </div>
      </div>

      {/* ── Sub Tab Content ──────────────────────────────────────── */}

      {/* 1. Daily Register View */}
      {activeSubTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
          {/* Controls & Selections Card */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 light:bg-white light:border-slate-200" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-350" style={{ color: 'var(--text-secondary)' }}>
              Register Config
            </h3>

            <form onSubmit={handleSaveAttendance} className="space-y-4">
              {/* Date selection (mockup card style) */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Date
                </label>
                <div className="relative cursor-pointer w-full group">
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-2xl text-slate-200 text-xs focus:outline-none transition-colors group-hover:border-indigo-500/50" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    <Calendar size={15} className="text-indigo-400 shrink-0" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                        {(() => {
                          if (!selectedDate) return 'Select Date';
                          const d = new Date(selectedDate);
                          return isNaN(d.getTime()) ? selectedDate : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        })()}
                      </span>
                    </div>
                  </div>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Class selection (mockup card style) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Class / Section
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowClassDropdown(p => !p);
                    setShowFacultyDropdown(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-2xl text-slate-200 text-xs text-left hover:border-indigo-500/50 transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen size={14} className="text-indigo-400 shrink-0" />
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      {selectedClass} • {selectedClassLevel}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform ${showClassDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showClassDropdown && (
                  <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex flex-col gap-3.5 animate-fade-in" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Class / Section</span>
                      <select
                        disabled={currentUser && currentUser.role === 'coordinator'}
                        value={selectedClass}
                        onChange={(e) => {
                          const newClass = e.target.value;
                          setSelectedClass(newClass);
                          const validLevels = LEVELS_BY_CLASS[newClass] || [];
                          const firstValidLvl = validLevels[0] || 'HS1';
                          setSelectedClassLevel(firstValidLvl);
                          const subjects = getSubjectOptions(firstValidLvl);
                          setSelectedSubject(subjects[0]);
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                        style={{ backgroundColor: 'var(--bg-surface)' }}
                      >
                        {CLASS_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Class Level</span>
                      <select
                        value={selectedClassLevel}
                        onChange={(e) => {
                          const newLvl = e.target.value;
                          setSelectedClassLevel(newLvl);
                          const subjects = getSubjectOptions(newLvl);
                          setSelectedSubject(subjects[0]);
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                        style={{ backgroundColor: 'var(--bg-surface)' }}
                      >
                        {(LEVELS_BY_CLASS[selectedClass] || []).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Subject Selection Grid */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Subject
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5">
                  {getSubjectOptions(selectedClassLevel).map(opt => {
                    const isSelected = selectedSubject === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedSubject(opt)}
                        className={`py-2 px-2.5 rounded-xl border text-xxs font-bold text-center transition-all cursor-pointer ${isSelected
                          ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400 shadow-glow-indigo font-black'
                          : 'bg-slate-950/35 border-slate-850 text-slate-400 hover:text-slate-205 hover:bg-slate-900/50'
                          }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {selectedSubject === 'Custom' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom subject..."
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-150 text-xs focus:outline-none focus:border-indigo-500"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                  />
                )}
              </div>

              {/* Period Selection Grid */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Period
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {PERIOD_OPTIONS.map(opt => {
                    const isSelected = selectedPeriod === opt;
                    const displayNum = opt.replace('Period ', 'P');
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedPeriod(opt)}
                        className={`py-2 rounded-xl border text-xxs font-bold text-center transition-all cursor-pointer ${isSelected
                          ? 'bg-indigo-650 border-indigo-550 text-white font-black shadow-glow-indigo'
                          : 'bg-slate-950/35 border-slate-850 text-slate-400 hover:text-slate-205 hover:bg-slate-900/50'
                          }`}
                        title={opt}
                      >
                        {displayNum}
                      </button>
                    );
                  })}
                </div>
              </div>



              {/* Faculty selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Faculty
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowFacultyDropdown(p => !p);
                    setShowClassDropdown(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-2xl text-slate-200 text-xs text-left hover:border-indigo-500/50 transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-center gap-3">
                    <User size={14} className="text-indigo-400 shrink-0" />
                    <span className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {facultyName || 'Select Faculty'}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform ${showFacultyDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showFacultyDropdown && (
                  <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex flex-col gap-3.5 animate-fade-in" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Faculty Member</span>
                      <select
                        value={selectedFacultyOption}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedFacultyOption(val);
                          if (val !== 'Custom') {
                            setFacultyName(val);
                          } else {
                            setFacultyName('');
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-105 text-xs focus:outline-none focus:border-indigo-500"
                        style={{ backgroundColor: 'var(--bg-surface)' }}
                      >
                        {FACULTY_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {selectedFacultyOption === 'Custom' && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Custom Faculty Name</span>
                        <input
                          type="text"
                          required
                          placeholder="Enter custom faculty name..."
                          value={facultyName}
                          onChange={(e) => setFacultyName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-105 text-xs focus:outline-none focus:border-indigo-500"
                          style={{ backgroundColor: 'var(--bg-surface)' }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit button */}
              <div className="pt-2 hidden md:block">
                <button
                  type="submit"
                  disabled={loading || !!duplicateRecordConflict}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-glow-indigo transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-xs disabled:opacity-50 disabled:pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, var(--accent-indigo), #4f46e5)', boxShadow: 'var(--shadow-glow-indigo)' }}
                >
                  {isExplicitEditMode ? 'Update Attendance Log' : 'Save Attendance Log'}
                </button>
              </div>

              {duplicateRecordConflict ? (
                <div className="text-center text-xxs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex flex-col gap-1.5 animate-fade-in">
                  <div className="flex items-center justify-center gap-1.5">
                    <AlertCircle size={12} className="text-rose-400 shrink-0" />
                    <span>CONFLICT: Record Already Exists!</span>
                  </div>
                  <span className="font-semibold text-slate-350 text-[10px]">
                    An entry already exists for this combination. Please modify or cancel editing.
                  </span>
                  <button
                    type="button"
                    onClick={handleCancelExplicitEdit}
                    className="mt-1 px-3 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-white rounded-lg text-[10px] font-bold border border-rose-500/30 transition-all duration-200 cursor-pointer w-fit mx-auto"
                  >
                    Cancel Editing
                  </button>
                </div>
              ) : isExplicitEditMode ? (
                <div className="text-center text-xxs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex flex-col gap-1.5 animate-fade-in">
                  <div className="flex items-center justify-center gap-1.5">
                    <Edit2 size={12} className="text-amber-400 shrink-0" />
                    <span>Explicit Edit Mode Active</span>
                  </div>
                  <span className="font-semibold text-slate-350 text-[10px]">
                    Updating original record. If you change date/period, it will be moved.
                  </span>
                  <button
                    type="button"
                    onClick={handleCancelExplicitEdit}
                    className="mt-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700 transition-all duration-200 cursor-pointer w-fit mx-auto"
                  >
                    Cancel Editing
                  </button>
                </div>
              ) : isEditingExisting ? (
                <div className="text-center text-xxs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  <span>Editing existing entry in database</span>
                </div>
              ) : null}
            </form>
          </div>

          {/* Student attendance roster marking sheet */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col light:bg-white light:border-slate-200" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 mb-4 gap-3.5" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-350" style={{ color: 'var(--text-secondary)' }}>
                  Student Attendance Register
                </h3>
                <p className="text-[10px] text-slate-500 font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Mark P (Present), A (Absent), AA (Absent Approved), or L (Leave) for each student rostered in <span className="text-indigo-400">{selectedClass}</span>.
                </p>
              </div>

              {/* Quick batch selectors */}
              <div className="flex gap-1.5 self-end sm:self-auto">
                <button
                  onClick={() => {
                    const updated = {};
                    ((studentsRoster[selectedClass] && studentsRoster[selectedClass][selectedClassLevel]) || []).forEach(name => { updated[name] = 'P'; });
                    setStudentAttendance(updated);
                  }}
                  className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-350 border border-emerald-500/20 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  All Present
                </button>
                <button
                  onClick={() => {
                    const updated = {};
                    ((studentsRoster[selectedClass] && studentsRoster[selectedClass][selectedClassLevel]) || []).forEach(name => { updated[name] = 'A'; });
                    setStudentAttendance(updated);
                  }}
                  className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-350 border border-red-500/20 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  All Absent
                </button>
              </div>
            </div>

            {/* Student Search Filter */}
            {studentsRoster[selectedClass] && studentsRoster[selectedClass][selectedClassLevel] && studentsRoster[selectedClass][selectedClassLevel].length > 0 && (
              <div className="mb-4 relative flex items-center">
                <span className="absolute left-3.5 text-slate-500">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Filter student by name..."
                  value={studentFilterQuery}
                  onChange={(e) => setStudentFilterQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250 animate-fade-in"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
                {studentFilterQuery && (
                  <button
                    type="button"
                    onClick={() => setStudentFilterQuery('')}
                    className="absolute right-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}

            {/* Checklist */}
            {(!studentsRoster[selectedClass] || !studentsRoster[selectedClass][selectedClassLevel] || studentsRoster[selectedClass][selectedClassLevel].length === 0) ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-3">
                <AlertCircle size={32} className="text-amber-500 animate-pulse" />
                <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No Students Found</h4>
                <p className="text-xs max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  There are no students registered in the <span className="font-bold">{selectedClass} - {selectedClassLevel}</span> class roster. Add students in the Class Roster card on the dashboard.
                </p>
              </div>
            ) : (() => {
              const filteredRoster = (studentsRoster[selectedClass][selectedClassLevel] || [])
                .map((studentName, idx) => ({ studentName, idx }))
                .filter(({ studentName }) => studentName.toLowerCase().includes(studentFilterQuery.toLowerCase()));

              if (filteredRoster.length === 0) {
                return (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-2">
                    <Search size={24} className="text-slate-500 animate-bounce" />
                    <p className="text-xs text-slate-400 font-semibold" style={{ color: 'var(--text-muted)' }}>
                      No students match "{studentFilterQuery}"
                    </p>
                  </div>
                );
              }

              return (
                <div className="flex-1 overflow-y-auto max-h-[460px] pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4 pb-2">
                    {filteredRoster.map(({ studentName, idx }) => {
                      const currentStatus = studentAttendance[studentName] || 'P';
                      return (
                        <div
                          key={`student-mark-${idx}`}
                          className="flex flex-col p-4 bg-slate-950/20 border border-slate-800 rounded-3xl gap-3 transition-all hover:border-slate-700 light:bg-slate-50 light:border-slate-205"
                          style={{ borderColor: 'var(--border-color)' }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-500 tracking-wider">S1{String(idx + 1).padStart(2, '0')}</span>
                            {currentUser && currentUser.role === 'admin' && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to remove ${studentName} from the class roster?`)) {
                                    const currentList = (studentsRoster[selectedClass] && studentsRoster[selectedClass][selectedClassLevel]) || [];
                                    const updatedList = currentList.filter(name => name !== studentName);
                                    const updatedRoster = {
                                      ...studentsRoster,
                                      [selectedClass]: {
                                        ...(studentsRoster[selectedClass] || {}),
                                        [selectedClassLevel]: updatedList
                                      }
                                    };
                                    onUpdateRoster(updatedRoster);
                                  }
                                }}
                                className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                                title={`Remove ${studentName} from roster`}
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarBg(studentName)}`}>
                              {getInitials(studentName)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-250 truncate" style={{ color: 'var(--text-primary)' }}>{studentName}</span>
                              <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>Attendance Status</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-1 flex-wrap sm:flex-nowrap">
                            <button
                              type="button"
                              onClick={() => setStudentAttendance(prev => ({ ...prev, [studentName]: 'P' }))}
                              className={`flex-1 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer border ${currentStatus === 'P'
                                ? 'bg-indigo-650 border-indigo-550 text-white shadow-glow-indigo font-black'
                                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-205 hover:bg-slate-850 light:bg-white light:border-slate-250'
                                }`}
                              style={currentStatus === 'P' ? { background: 'var(--accent-indigo)', borderColor: 'var(--accent-indigo)' } : {}}
                              title="Present"
                            >
                              P
                            </button>
                            <button
                              type="button"
                              onClick={() => setStudentAttendance(prev => ({ ...prev, [studentName]: 'A' }))}
                              className={`flex-1 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer border ${currentStatus === 'A'
                                ? 'bg-red-650 border-red-550 text-white shadow-[0_0_15px_rgba(239,68,68,0.25)] font-black'
                                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-205 hover:bg-slate-850 light:bg-white light:border-slate-250'
                                }`}
                              style={currentStatus === 'A' ? { background: 'var(--accent-danger)', borderColor: 'var(--accent-danger)' } : {}}
                              title="Absent"
                            >
                              A
                            </button>

                            <button
                              type="button"
                              onClick={() => setStudentAttendance(prev => ({ ...prev, [studentName]: 'AA' }))}
                              className={`flex-1 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer border ${currentStatus === 'AA'
                                ? 'bg-teal-650 border-teal-550 text-white shadow-[0_0_15px_rgba(13,148,136,0.25)] font-black'
                                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-205 hover:bg-slate-850 light:bg-white light:border-slate-250'
                                }`}
                              style={currentStatus === 'AA' ? { background: 'var(--accent-teal)', borderColor: 'var(--accent-teal)' } : {}}
                              title="Absent Approved"
                            >
                              AA
                            </button>
                            <button
                              type="button"
                              onClick={() => setStudentAttendance(prev => ({ ...prev, [studentName]: 'L' }))}
                              className={`flex-1 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer border ${currentStatus === 'L'
                                ? 'bg-amber-650 border-amber-550 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)] font-black'
                                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-205 hover:bg-slate-850 light:bg-white light:border-slate-250'
                                }`}
                              style={currentStatus === 'L' ? { background: 'var(--accent-warning)', borderColor: 'var(--accent-warning)' } : {}}
                              title="Leave"
                            >
                              L
                            </button>
                            <button
                              type="button"
                              onClick={() => setStudentAttendance(prev => ({ ...prev, [studentName]: 'LA' }))}
                              className={`flex-1 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer border ${currentStatus === 'LA'
                                ? 'bg-purple-650 border-purple-550 text-white shadow-[0_0_15px_rgba(147,51,234,0.25)] font-black'
                                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-205 hover:bg-slate-850 light:bg-white light:border-slate-250'
                                }`}
                              style={currentStatus === 'LA' ? { background: '#8b5cf6', borderColor: '#8b5cf6' } : {}}
                              title="Leave Approved"
                            >
                              LA
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Mobile floating action bar */}
      {activeSubTab === 'register' && studentsRoster[selectedClass] && studentsRoster[selectedClass][selectedClassLevel] && studentsRoster[selectedClass][selectedClassLevel].length > 0 && (
        <div className="md:hidden fixed bottom-[56px] left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-850 p-4 flex justify-between items-center gap-3 backdrop-blur-md no-print animate-slide-up" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
          <button
            type="button"
            onClick={() => {
              const updated = {};
              ((studentsRoster[selectedClass] && studentsRoster[selectedClass][selectedClassLevel]) || []).forEach(name => { updated[name] = 'P'; });
              setStudentAttendance(updated);
            }}
            className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-glow-indigo transition-colors"
            style={{ background: 'linear-gradient(135deg, var(--accent-indigo), #4f46e5)' }}
          >
            <CheckCircle2 size={15} /> All Present
          </button>
          <button
            type="button"
            onClick={() => {
              const updated = {};
              ((studentsRoster[selectedClass] && studentsRoster[selectedClass][selectedClassLevel]) || []).forEach(name => { updated[name] = 'A'; });
              setStudentAttendance(updated);
            }}
            className="flex-1 py-3 bg-teal-650 hover:bg-teal-600 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-glow-teal transition-colors"
            style={{ background: 'linear-gradient(135deg, var(--accent-teal), #0d9488)' }}
          >
            <X size={15} /> All Absent
          </button>
          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={loading || !!duplicateRecordConflict}
            className={`p-3 border rounded-2xl transition-colors shrink-0 cursor-pointer disabled:opacity-50 ${
              isExplicitEditMode 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-indigo-400'
            }`}
            style={{ 
              backgroundColor: isExplicitEditMode ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface-active)', 
              borderColor: isExplicitEditMode ? 'rgba(245, 158, 11, 0.25)' : 'var(--border-color)' 
            }}
            title={isExplicitEditMode ? "Update Attendance" : "Save Attendance"}
          >
            <BookOpenCheck size={16} />
          </button>
        </div>
      )}

      {/* 2. History Log View */}
      {activeSubTab === 'log' && (
        <div className="space-y-5 no-print">
          {/* Filters card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-wrap gap-4 items-center justify-between light:bg-white light:border-slate-200" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <div className="flex flex-wrap gap-3 items-center flex-1">

              {/* Search */}
              <div className="relative min-w-[200px] flex-1 max-w-xs">
                <span className="absolute left-3.5 top-2.5 text-slate-500">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Search subject, faculty, period..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-550 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Class Filter */}
              {!(currentUser && currentUser.role === 'coordinator') && (
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  <option value="All">All Dars</option>
                  {CLASS_OPTIONS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}

              {/* Class Level Filter */}
              <select
                value={filterClassLevel}
                onChange={(e) => setFilterClassLevel(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                <option value="All">All Levels</option>
                {['HS1', 'HS2', 'BS1', 'BS2', 'BS3', 'BS4', 'BS5', '8th Class', '9th Class'].map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>

              {/* Subject Filter */}
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                <option value="All">All Subjects</option>
                {(filterClassLevel === 'All'
                  ? ALL_UNIQUE_SUBJECTS
                  : getSubjectOptions(filterClassLevel).filter(s => s !== 'Custom')
                ).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Date Filter (Custom styled card wrapping native date input) */}
              <div className="relative cursor-pointer min-w-[130px] group">
                <div
                  className="flex items-center gap-2 px-3.5 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none transition-colors group-hover:border-indigo-500/50 light:bg-white light:border-slate-250"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  <Calendar size={13} className="text-indigo-400 shrink-0" />
                  <span className="font-bold truncate">
                    {filterDate ? (() => {
                      const d = new Date(filterDate);
                      return isNaN(d.getTime()) ? filterDate : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    })() : 'Filter Date'}
                  </span>
                </div>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              {(filterDate || filterClass !== 'All' || filterSubject !== 'All' || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterDate('');
                    setFilterClass('All');
                    setFilterSubject('All');
                    setSearchQuery('');
                  }}
                  className="text-xs text-slate-450 hover:text-indigo-400 transition-colors cursor-pointer font-bold"
                >
                  Clear Filters
                </button>
              )}
              {currentUser && currentUser.role === 'admin' && filteredHistory.length > 0 && (
                <button
                  type="button"
                  onClick={async () => {
                    const ids = filteredHistory.map(h => h.id);
                    let targetDesc = 'all filtered attendance logs';
                    const activeFilters = [];
                    if (filterClass !== 'All') activeFilters.push(`Dars: ${filterClass}`);
                    if (filterClassLevel !== 'All') activeFilters.push(`Level: ${filterClassLevel}`);
                    if (filterSubject !== 'All') activeFilters.push(`Subject: ${filterSubject}`);
                    if (filterDate) activeFilters.push(`Date: ${filterDate}`);
                    if (searchQuery) activeFilters.push(`Search: "${searchQuery}"`);

                    if (activeFilters.length > 0) {
                      targetDesc = `filtered logs (${activeFilters.join(', ')})`;
                    }

                    if (window.confirm(`Are you sure you want to delete ${ids.length} daily logs matching the current filters?\nThis will delete ${targetDesc} permanently and cannot be undone.`)) {
                      try {
                        setLoading(true);
                        await dailyAttendanceService.delete(ids);
                        showToast(`Deleted ${ids.length} attendance logs successfully.`);
                        loadHistory();
                      } catch (err) {
                        console.error('Failed to delete logs:', err);
                        showToast('Error deleting attendance logs.', 'error');
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl text-xxs font-extrabold border border-red-500/20 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 ml-2"
                  title="Delete all filtered logs"
                >
                  <Trash2 size={12} /> Delete All Filtered ({filteredHistory.length})
                </button>
              )}
            </div>

            {/* Dashboard counters */}
            <div
              className="flex gap-4 border-t border-slate-800 pt-3.5 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-4 w-full sm:w-auto justify-between sm:justify-start light:border-slate-200"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div className="text-left sm:text-right">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Logs Count</div>
                <div className="text-base sm:text-lg font-black text-indigo-400">{totalRegistersLogged}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Avg Attendance</div>
                <div className="text-base sm:text-lg font-black text-teal-400">{overallAvgAttendance}</div>
              </div>
            </div>
          </div>

          {/* Today's Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex justify-between items-center light:bg-slate-50 light:border-slate-200" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <div className="text-xxs font-extrabold text-slate-500 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Classes Conducted Today</div>
                <div className="text-base font-black" style={{ color: 'var(--text-primary)' }}>{classesTodayCount} registers completed</div>
              </div>
              <BookOpen size={24} className="text-indigo-400/85" />
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex justify-between items-center light:bg-slate-50 light:border-slate-200" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <div className="text-xxs font-extrabold text-slate-500 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Absent Students Today</div>
                <div className="text-xs font-bold mt-1 max-h-[40px] overflow-y-auto scrollbar-thin" style={{ color: 'var(--text-secondary)' }}>
                  {absentsToday.length === 0 ? 'No absences logged today' : absentsToday.join(', ')}
                </div>
              </div>
              <AlertCircle size={24} className="text-red-400/85" />
            </div>
          </div>

          {/* History card grid list */}
          {filteredHistory.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-550 space-y-2 light:bg-white light:border-slate-200" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
              <Calendar size={40} className="mx-auto text-slate-600" />
              <p className="text-sm font-semibold">No attendance registers found matching filters.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHistory.slice(0, historyLimit).map((rec) => {
                  const stats = getLogStats(rec);
                  const category = getSubjectCategory(rec.subject);

                  // Regex parse period and time
                  let displayPeriod = rec.period;
                  let displayTime = '';
                  const timeMatch = rec.period.match(/(Period \d+)\s*\((.+)\)/);
                  if (timeMatch) {
                    displayPeriod = timeMatch[1];
                    displayTime = timeMatch[2];
                  }

                  return (
                    <div
                      key={rec.id}
                      className="glass-card rounded-3xl p-5 border border-slate-800 flex flex-col justify-between gap-4 transition-all hover:border-slate-700/80 hover:-translate-y-0.5"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      {/* Top Row: Category Tag & Date */}
                      <div className="flex justify-between items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${category.color}`}>
                          {category.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500" style={{ color: 'var(--text-muted)' }}>
                          {rec.date}
                        </span>
                      </div>

                      {/* Middle: Subject, Period, Faculty */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-black text-slate-100" style={{ color: 'var(--text-primary)' }}>
                              {rec.subject}
                            </h4>
                            <p className="text-[10px] font-bold text-indigo-400 mt-0.5">
                              {rec.class}
                            </p>
                          </div>
                          <div className="flex gap-1.5 no-print shrink-0">
                            <button
                              onClick={() => handleEditRecordTrigger(rec)}
                              className="p-1.5 bg-slate-950/40 border border-slate-800 hover:border-indigo-500/50 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                              title="Edit register"
                            >
                              <Edit2 size={12} />
                            </button>
                            {currentUser && currentUser.role === 'admin' && (
                              <button
                                onClick={() => handleDeleteRecord(rec.id)}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white rounded-xl transition-all cursor-pointer"
                                title="Delete record"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/65 border border-slate-850 rounded-xl text-[10px] font-black text-indigo-400 tracking-wide w-fit light:bg-slate-50 light:border-slate-205 shadow-sm" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                            <Clock size={12} className="text-indigo-400 shrink-0" />
                            <span>{displayPeriod}</span>
                            {displayTime && (
                              <>
                                <span className="text-slate-600 font-normal select-none">•</span>
                                <span className="text-teal-400 font-extrabold">{displayTime}</span>
                              </>
                            )}
                          </div>
                          <span className="text-slate-700 text-xs hidden sm:inline select-none">•</span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400" style={{ color: 'var(--text-secondary)' }}>
                            <User size={11} className="text-slate-500 shrink-0" />
                            {rec.faculty}
                          </span>
                        </div>
                      </div>

                      {/* Bottom: Attendance Rate & HSL Progress Bar */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-850/50" style={{ borderTopColor: 'var(--border-color)' }}>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-500" style={{ color: 'var(--text-muted)' }}>ATTENDANCE RATE</span>
                          <span className="text-slate-200" style={{ color: 'var(--text-primary)' }}>
                            <span className="text-emerald-405 font-bold" style={{ color: 'var(--accent-success)' }}>{stats.present}P</span>
                            <span className="text-slate-600 mx-1">/</span>
                            <span className="text-red-405 font-bold" style={{ color: 'var(--accent-danger)' }}>{stats.absent}A</span>
                            <span className="text-slate-600 mx-1">/</span>
                            <span className="text-amber-505 font-bold" style={{ color: 'var(--accent-warning)' }}>{stats.leave}L</span>
                            <span className="text-slate-500 mx-2">•</span>
                            <span style={{ color: `hsl(${stats.pct * 1.2}, 75%, 45%)` }}>{stats.pct}%</span>
                          </span>
                        </div>
                        {/* HSL progress bar track */}
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${stats.pct}%`,
                              backgroundColor: `hsl(${stats.pct * 1.2}, 75%, 45%)`,
                              boxShadow: `0 0 8px hsl(${stats.pct * 1.2}, 75%, 45%, 0.3)`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col items-center gap-3.5 pt-4 no-print">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-fade-in" style={{ color: 'var(--text-muted)' }}>
                  Showing {Math.min(filteredHistory.length, historyLimit)} of {filteredHistory.length} registers
                </span>

                {filteredHistory.length > historyLimit && (
                  <button
                    onClick={() => setHistoryLimit(prev => prev + 10)}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] font-black rounded-2xl transition-all cursor-pointer shadow-sm"
                    style={{ backgroundColor: 'var(--bg-surface-active)', borderColor: 'var(--border-color)' }}
                  >
                    LOAD PREVIOUS RECORDS
                  </button>
                )}

                {/* Archive warning card block */}
                <div className="w-full max-w-md mt-2 p-4 bg-amber-500/5 border border-amber-500/15 rounded-3xl flex items-start gap-3 text-left">
                  <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Older Records Archived</h5>
                    <p className="text-[9px] text-slate-400 font-semibold leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Older database logs are archived automatically to maintain optimal performance. Please contact the system administrator to retrieve older registers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Weekly Summary Report View */}
      {activeSubTab === 'weekly' && (() => {
        const weeklyData = getWeeklyData();
        return (
          <div className="space-y-6">
            {/* Range and selection inputs card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-wrap gap-4 items-end light:bg-white light:border-slate-200 no-print" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>

              {/* Class Selection */}
              {!(currentUser && currentUser.role === 'coordinator') ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Class / Section
                  </label>
                  <select
                    value={weeklyClass}
                    onChange={(e) => {
                      const newClass = e.target.value;
                      setWeeklyClass(newClass);
                      const validLevels = LEVELS_BY_CLASS[newClass] || [];
                      setWeeklyClassLevel(validLevels[0] || 'HS1');
                    }}
                    className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    {CLASS_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Class / Section</span>
                  <span className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-bold light:bg-slate-50" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    {weeklyClass}
                  </span>
                </div>
              )}

              {/* Class Level Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Class Level
                </label>
                <select
                  value={weeklyClassLevel}
                  onChange={(e) => setWeeklyClassLevel(e.target.value)}
                  className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  {(LEVELS_BY_CLASS[weeklyClass] || []).map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Start Date
                </label>
                <div className="relative cursor-pointer min-w-[130px] group">
                  <div
                    className="flex items-center gap-2 px-3.5 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none transition-colors group-hover:border-indigo-500/50 light:bg-white light:border-slate-250"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <Calendar size={13} className="text-indigo-400 shrink-0" />
                    <span className="font-bold truncate">
                      {weeklyStart ? (() => {
                        const d = new Date(weeklyStart);
                        return isNaN(d.getTime()) ? weeklyStart : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      })() : 'Start Date'}
                    </span>
                  </div>
                  <input
                    type="date"
                    value={weeklyStart}
                    onChange={(e) => setWeeklyStart(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  End Date
                </label>
                <div className="relative cursor-pointer min-w-[130px] group">
                  <div
                    className="flex items-center gap-2 px-3.5 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none transition-colors group-hover:border-indigo-500/50 light:bg-white light:border-slate-250"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <Calendar size={13} className="text-indigo-400 shrink-0" />
                    <span className="font-bold truncate">
                      {weeklyEnd ? (() => {
                        const d = new Date(weeklyEnd);
                        return isNaN(d.getTime()) ? weeklyEnd : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      })() : 'End Date'}
                    </span>
                  </div>
                  <input
                    type="date"
                    value={weeklyEnd}
                    onChange={(e) => setWeeklyEnd(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Export actions */}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={handleExportWeeklyCSV}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-surface-active)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  <Download size={14} /> Export CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-surface-active)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  <Printer size={14} /> Print Page
                </button>
              </div>
            </div>

            {/* Weekly Report Layout Sheet */}
            {weeklyData.logsCount === 0 ? (
              <div className="text-center py-12 bg-slate-900 border border-slate-850 rounded-3xl text-slate-500 space-y-2 light:bg-white light:border-slate-200" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <Calendar size={40} className="mx-auto text-slate-650" />
                <p className="text-sm font-semibold">No attendance registers logged in this date range.</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 print-sheet light:bg-white light:border-slate-200" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                {/* Print Banner header */}
                <div className="text-center border-b border-slate-800 pb-5 light:border-slate-200" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="text-xxs font-black tracking-widest text-indigo-400 uppercase mb-1">
                    Faculty Weekly Attendance Summary
                  </div>
                  <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                    WEEKLY STATUS REPORT
                  </h2>
                  <div className="mt-2 text-xs font-semibold text-slate-400" style={{ color: 'var(--text-muted)' }}>
                    Class: <span className="font-extrabold text-slate-250 light:text-slate-700">{weeklyClass}</span>
                    <span className="mx-3.5">|</span>
                    Range: <span className="font-extrabold text-slate-250 light:text-slate-700">{weeklyStart} to {weeklyEnd}</span>
                  </div>
                </div>

                {/* Subject statistics table */}
                <div className="space-y-3 print-avoid-break">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                    <BookOpenCheck size={14} /> Subject-wise Summary
                  </h3>

                  <div className="border border-slate-850 rounded-2xl overflow-x-auto light:border-slate-205" style={{ borderColor: 'var(--border-color)' }}>
                    <table className="min-w-[550px] w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/30 border-b border-slate-850 text-slate-400 font-extrabold uppercase light:bg-slate-50 light:border-slate-205" style={{ borderBottomColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                          <th className="px-5 py-3">Subject Name</th>
                          <th className="px-5 py-3">Periods Logged (Classes Taken)</th>
                          <th className="px-5 py-3">Average Attendance %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 light:divide-slate-205" style={{ dividerColor: 'var(--border-color)' }}>
                        {weeklyData.subjectsList.map((s, idx) => (
                          <tr key={`weekly-sub-${idx}`} className="hover:bg-slate-950/5 light:hover:bg-slate-50">
                            <td className="px-5 py-3 font-bold" style={{ color: 'var(--text-primary)' }}>{s.subject}</td>
                            <td className="px-5 py-3 font-semibold text-slate-300" style={{ color: 'var(--text-secondary)' }}>{s.classes} classes</td>
                            <td className="px-5 py-3">
                              <span className="font-extrabold text-indigo-400">{s.attendancePct}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Faculty Teaching Summary */}
                <div className="space-y-3 print-avoid-break">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                    <User size={14} /> Faculty Performance Summary
                  </h3>

                  <div className="border border-slate-850 rounded-2xl overflow-x-auto light:border-slate-205" style={{ borderColor: 'var(--border-color)' }}>
                    <table className="min-w-[600px] w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/30 border-b border-slate-850 text-slate-400 font-extrabold uppercase light:bg-slate-50 light:border-slate-205" style={{ borderBottomColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                          <th className="px-5 py-3">Faculty Name</th>
                          <th className="px-5 py-3">Periods Taught</th>
                          <th className="px-5 py-3">Subjects Conducted</th>
                          <th className="px-5 py-3">Class Attendance %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 light:divide-slate-205" style={{ dividerColor: 'var(--border-color)' }}>
                        {weeklyData.facultyList.map((f, idx) => (
                          <tr key={`weekly-fac-${idx}`} className="hover:bg-slate-950/5 light:hover:bg-slate-50">
                            <td className="px-5 py-3 font-bold text-slate-200" style={{ color: 'var(--text-primary)' }}>{f.faculty}</td>
                            <td className="px-5 py-3 text-slate-350" style={{ color: 'var(--text-secondary)' }}>{f.classes} periods</td>
                            <td className="px-5 py-3 text-slate-400 font-medium" style={{ color: 'var(--text-muted)' }}>{f.subjects}</td>
                            <td className="px-5 py-3 font-black text-teal-400">{f.attendancePct}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Detailed Student breakdown grid */}
                <div className="space-y-3 print-avoid-break">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                    <Award size={14} /> Student Attendance Percentages
                  </h3>

                  <div className="border border-slate-850 rounded-2xl overflow-x-auto light:border-slate-205" style={{ borderColor: 'var(--border-color)' }}>
                    <table className="min-w-[700px] w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/30 border-b border-slate-850 text-slate-400 font-extrabold uppercase light:bg-slate-50 light:border-slate-205" style={{ borderBottomColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                          <th className="px-5 py-3">Student Name</th>
                          <th className="px-5 py-3 text-center">Classes Logged</th>
                          <th className="px-5 py-3 text-center text-emerald-400">Present (P)</th>
                          <th className="px-5 py-3 text-center text-red-400">Absent (A)</th>
                          <th className="px-5 py-3 text-center text-teal-400">Absent Approved (AA)</th>
                          <th className="px-5 py-3 text-center text-amber-500">Leave (L)</th>
                          <th className="px-5 py-3 text-center text-purple-400">Leave Approved (LA)</th>
                          <th className="px-5 py-3 text-center">Weekly Attendance %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 light:divide-slate-205" style={{ dividerColor: 'var(--border-color)' }}>
                        {weeklyData.studentsList.map((st, idx) => (
                          <tr key={`weekly-student-${idx}`} className="hover:bg-slate-950/5 light:hover:bg-slate-50">
                            <td className="px-5 py-3 font-bold" style={{ color: 'var(--text-primary)' }}>{st.name}</td>
                            <td className="px-5 py-3 text-center text-slate-450 font-semibold" style={{ color: 'var(--text-muted)' }}>{st.total}</td>
                            <td className="px-5 py-3 text-center text-emerald-450 font-extrabold">{st.present}</td>
                            <td className="px-5 py-3 text-center text-red-450 font-extrabold">{st.absent}</td>
                            <td className="px-5 py-3 text-center text-teal-400 font-extrabold">{st.absentApproved}</td>
                            <td className="px-5 py-3 text-center text-amber-500 font-extrabold">{st.leave}</td>
                            <td className="px-5 py-3 text-center text-purple-400 font-extrabold">{st.leaveApproved}</td>
                            <td className="px-5 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-lg text-xxs font-black ${st.numericPct >= 90
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : st.numericPct >= 75
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                {st.pct}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Print Signatures */}
                <div className="pt-10 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-6 font-bold text-[10px] text-slate-400 print-avoid-break light:border-slate-200" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                  <div className="flex flex-col gap-1">
                    <div>Prepared By: ____________________</div>
                    <span className="block font-medium text-slate-500 text-[9px]">Class Coordinator signature</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:items-end sm:text-right print:items-end print:text-right">
                    <div>Approved By Academic Director: ____________________</div>
                    <span className="block font-medium text-slate-500 text-[9px]">Ahlussuffa Administration</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 4. Monthly Summary Report View */}
      {activeSubTab === 'monthly' && (() => {
        const monthlyData = getMonthlyData();

        // Setup simple formatting for month label: e.g. "2026-06" -> "June 2026"
        const formatMonth = (yyyy_mm) => {
          if (!/^\d{4}-\d{2}$/.test(yyyy_mm)) return yyyy_mm;
          const [y, m] = yyyy_mm.split('-');
          const d = new Date(parseInt(y), parseInt(m) - 1, 1);
          return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        };

        return (
          <div className="space-y-6">
            {/* Month & Threshold Filters */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-wrap gap-4 items-end light:bg-white light:border-slate-200 no-print" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>

              {/* Class selector */}
              {!(currentUser && currentUser.role === 'coordinator') ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Class / Section
                  </label>
                  <select
                    value={monthlyClass}
                    onChange={(e) => {
                      const newClass = e.target.value;
                      setMonthlyClass(newClass);
                      const validLevels = LEVELS_BY_CLASS[newClass] || [];
                      setMonthlyClassLevel(validLevels[0] || 'HS1');
                    }}
                    className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    {CLASS_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Class / Section</span>
                  <span className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-bold light:bg-slate-50" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    {monthlyClass}
                  </span>
                </div>
              )}

              {/* Class Level selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Class Level
                </label>
                <select
                  value={monthlyClassLevel}
                  onChange={(e) => setMonthlyClassLevel(e.target.value)}
                  className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  {(LEVELS_BY_CLASS[monthlyClass] || []).map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              {/* Month Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Month
                </label>
                <div className="relative cursor-pointer min-w-[130px] group">
                  <div
                    className="flex items-center gap-2 px-3.5 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none transition-colors group-hover:border-indigo-500/50 light:bg-white light:border-slate-250"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <Calendar size={13} className="text-indigo-400 shrink-0" />
                    <span className="font-bold truncate">
                      {monthlyMonth ? formatMonth(monthlyMonth) : 'Select Month'}
                    </span>
                  </div>
                  <input
                    type="month"
                    value={monthlyMonth}
                    onChange={(e) => setMonthlyMonth(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Defaulter Threshold Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Defaulter Threshold %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={defaulterThreshold}
                  onChange={(e) => setDefaulterThreshold(e.target.value)}
                  className="w-32 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Filter Option Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Filter Option
                </label>
                <select
                  value={monthlySortOption}
                  onChange={(e) => setMonthlySortOption(e.target.value)}
                  className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-250"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  <option value="pct">Attendance %</option>
                  <option value="total">Conducted Periods</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="absentApproved">Absent Approved</option>
                  <option value="leave">Leave</option>
                  <option value="leaveApproved">Leave Approved</option>
                </select>
              </div>

              {/* Export actions */}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={handleExportMonthlyCSV}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-surface-active)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  <Download size={14} /> Export CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-surface-active)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  <Printer size={14} /> Print Page
                </button>
              </div>
            </div>

            {/* Monthly Report Layout Sheet */}
            {monthlyData.logsCount === 0 ? (
              <div className="text-center py-12 bg-slate-900 border border-slate-850 rounded-3xl text-slate-500 space-y-2 light:bg-white light:border-slate-200" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <Calendar size={40} className="mx-auto text-slate-650" />
                <p className="text-sm font-semibold">No attendance registers logged in this month.</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 print-sheet light:bg-white light:border-slate-200" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                {/* Print Banner header */}
                <div className="text-center border-b border-slate-800 pb-5 light:border-slate-200" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="text-xxs font-black tracking-widest text-indigo-400 uppercase mb-1">
                    Faculty Monthly Attendance Summary
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-wide uppercase" style={{ color: 'var(--text-primary)' }}>
                    MONTHLY PERFORMANCE SUMMARY
                  </h2>
                  <div className="mt-2 text-xs font-semibold text-slate-400" style={{ color: 'var(--text-muted)' }}>
                    Class: <span className="font-extrabold text-slate-250 light:text-slate-700">{monthlyClass}</span>
                    <span className="mx-3.5">|</span>
                    Month: <span className="font-extrabold text-slate-250 light:text-slate-700">{formatMonth(monthlyMonth)}</span>
                  </div>
                </div>

                {/* Overall Attendance Stat & Defaulters count alert block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 print-avoid-break">
                  {/* Monthly average circle */}
                  <div className="border border-slate-850 rounded-2xl p-5 bg-slate-950/20 flex items-center justify-between light:border-slate-205 light:bg-slate-50" style={{ borderColor: 'var(--border-color)' }}>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-550 block" style={{ color: 'var(--text-muted)' }}>
                        Monthly Class Average
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold" style={{ color: 'var(--text-muted)' }}>Total registers: {monthlyData.logsCount}</span>
                    </div>
                    <div className="relative w-16 h-16 rounded-full border-4 border-slate-800 bg-slate-900 flex items-center justify-center font-black text-lg text-teal-400 shadow-sm light:bg-white light:border-slate-200">
                      {monthlyData.monthlyAveragePct}%
                    </div>
                  </div>

                  {/* Defaulters alert box */}
                  <div className={`border rounded-2xl p-5 flex items-center justify-between ${monthlyData.defaulters.length > 0
                    ? 'border-red-500/20 bg-red-500/5 text-red-400'
                    : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                    }`}>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block" style={{ color: 'var(--text-muted)' }}>
                        Defaulters Alert
                      </span>
                      <span className="text-xxs font-semibold" style={{ color: 'var(--text-muted)' }}>Attendance under {defaulterThreshold}%</span>
                    </div>
                    <div className="text-center font-black">
                      <span className="text-2xl block leading-none">{monthlyData.defaulters.length}</span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold">Students</span>
                    </div>
                  </div>
                </div>

                {/* Subject statistics and Trends */}
                <div className="space-y-3 print-avoid-break">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                    <BarChart2 size={14} /> Subject-wise Performance Trend
                  </h3>

                  <div className="border border-slate-850 rounded-2xl overflow-x-auto light:border-slate-205" style={{ borderColor: 'var(--border-color)' }}>
                    <table className="min-w-[600px] w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/30 border-b border-slate-850 text-slate-400 font-extrabold uppercase light:bg-slate-50 light:border-slate-205" style={{ borderBottomColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                          <th className="px-5 py-3">Subject Name</th>
                          <th className="px-5 py-3">Classes Logged</th>
                          <th className="px-5 py-3">Attendance Trend</th>
                          <th className="px-5 py-3 text-right">Avg Attendance %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 light:divide-slate-205" style={{ dividerColor: 'var(--border-color)' }}>
                        {monthlyData.subjectList.map((s, idx) => (
                          <tr key={`monthly-sub-${idx}`} className="hover:bg-slate-950/5 light:hover:bg-slate-50">
                            <td className="px-5 py-3 font-bold" style={{ color: 'var(--text-primary)' }}>{s.subject}</td>
                            <td className="px-5 py-3 font-medium text-slate-350" style={{ color: 'var(--text-secondary)' }}>{s.classesCount} periods</td>
                            <td className="px-5 py-3 w-1/3">
                              <div className="h-2 w-full bg-slate-950 border border-slate-850 rounded-full overflow-hidden light:bg-slate-100 light:border-slate-200" style={{ borderColor: 'var(--border-color)' }}>
                                <div
                                  className="h-full rounded-full transition-all duration-350"
                                  style={{
                                    width: `${s.avgPct}%`,
                                    background: 'linear-gradient(90deg, var(--accent-indigo), var(--accent-teal))'
                                  }}
                                />
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right font-black text-indigo-400">{s.avgPct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Faculty Summary */}
                <div className="space-y-3 print-avoid-break">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                    <User size={14} /> Faculty Monthly Summary
                  </h3>
                  <div className="border border-slate-850 rounded-2xl overflow-x-auto light:border-slate-205" style={{ borderColor: 'var(--border-color)' }}>
                    <table className="min-w-[600px] w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/30 border-b border-slate-850 text-slate-400 font-extrabold uppercase light:bg-slate-50 light:border-slate-205" style={{ borderBottomColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                          <th className="px-5 py-3">Faculty Name</th>
                          <th className="px-5 py-3">Total Periods</th>
                          <th className="px-5 py-3">Subjects Taught</th>
                          <th className="px-5 py-3 text-right">Avg Attendance %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 light:divide-slate-205" style={{ dividerColor: 'var(--border-color)' }}>
                        {monthlyData.facultyList.map((f, idx) => (
                          <tr key={`monthly-fac-${idx}`} className="hover:bg-slate-950/5 light:hover:bg-slate-50">
                            <td className="px-5 py-3 font-bold" style={{ color: 'var(--text-primary)' }}>{f.faculty}</td>
                            <td className="px-5 py-3 text-slate-350" style={{ color: 'var(--text-secondary)' }}>{f.periods} periods</td>
                            <td className="px-5 py-3 text-slate-450 font-medium" style={{ color: 'var(--text-muted)' }}>{f.subjects}</td>
                            <td className="px-5 py-3 text-right font-black text-teal-400">{f.attendancePct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Student Ranking */}
                <div className="space-y-3 print-avoid-break">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                    <Award size={14} /> Student Attendance Rankings
                  </h3>

                  <div className="border border-slate-850 rounded-2xl overflow-x-auto light:border-slate-205" style={{ borderColor: 'var(--border-color)' }}>
                    <table className="min-w-[750px] w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/30 border-b border-slate-850 text-slate-400 font-extrabold uppercase light:bg-slate-50 light:border-slate-205" style={{ borderBottomColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                          <th className="px-5 py-3 text-center w-12">Rank</th>
                          <th className="px-5 py-3">Student Name</th>
                          <th className="px-5 py-3 text-center">Conducted Periods</th>
                          {(monthlySortOption === 'pct' || monthlySortOption === 'present') && (
                            <th className="px-5 py-3 text-center text-emerald-400">Present</th>
                          )}
                          {(monthlySortOption === 'pct' || monthlySortOption === 'absent') && (
                            <th className="px-5 py-3 text-center text-red-400">Absent</th>
                          )}
                          {(monthlySortOption === 'pct' || monthlySortOption === 'absentApproved') && (
                            <th className="px-5 py-3 text-center text-teal-400">Absent Approved</th>
                          )}
                          {(monthlySortOption === 'pct' || monthlySortOption === 'leave') && (
                            <th className="px-5 py-3 text-center text-amber-500">Leave</th>
                          )}
                          {(monthlySortOption === 'pct' || monthlySortOption === 'leaveApproved') && (
                            <th className="px-5 py-3 text-center text-purple-400">Leave Approved</th>
                          )}
                          <th className="px-5 py-3 text-right">Attendance %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 light:divide-slate-205" style={{ dividerColor: 'var(--border-color)' }}>
                        {monthlyData.studentsRanked.map((st, idx) => {
                          const isTop3 = idx < 3;
                          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
                          return (
                            <tr key={`rank-student-${idx}`} className="hover:bg-slate-950/5 light:hover:bg-slate-50">
                              <td className="px-5 py-3 text-center font-black">
                                {isTop3 ? medal : `${idx + 1}`}
                              </td>
                              <td className="px-5 py-3 font-bold" style={{ color: 'var(--text-primary)' }}>{st.name}</td>
                              <td className="px-5 py-3 text-center text-slate-400 font-semibold" style={{ color: 'var(--text-muted)' }}>{st.total}</td>
                              {(monthlySortOption === 'pct' || monthlySortOption === 'present') && (
                                <td className="px-5 py-3 text-center text-emerald-400 font-semibold">{st.present}</td>
                              )}
                              {(monthlySortOption === 'pct' || monthlySortOption === 'absent') && (
                                <td className="px-5 py-3 text-center text-red-400 font-semibold">{st.absent}</td>
                              )}
                              {(monthlySortOption === 'pct' || monthlySortOption === 'absentApproved') && (
                                <td className="px-5 py-3 text-center text-teal-400 font-semibold">{st.absentApproved}</td>
                              )}
                              {(monthlySortOption === 'pct' || monthlySortOption === 'leave') && (
                                <td className="px-5 py-3 text-center text-amber-500 font-semibold">{st.leave}</td>
                              )}
                              {(monthlySortOption === 'pct' || monthlySortOption === 'leaveApproved') && (
                                <td className="px-5 py-3 text-center text-purple-400 font-semibold">{st.leaveApproved}</td>
                              )}
                              <td className="px-5 py-3 text-right font-black">
                                <span className={st.pct >= 90 ? 'text-emerald-400' : st.pct >= Number(defaulterThreshold) ? 'text-amber-500' : 'text-red-400'}>
                                  {st.pct}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Defaulter list block */}
                {monthlyData.defaulters.length > 0 && (
                  <div className="space-y-3 print-avoid-break">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-red-400 flex items-center gap-1.5">
                      <AlertCircle size={14} /> Attendance Defaulter List (Below {defaulterThreshold}%)
                    </h3>

                    <div className="border border-red-500/20 rounded-2xl overflow-x-auto bg-red-500/5">
                      <table className="min-w-[550px] w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-red-500/10 border-b border-red-500/20 text-red-400 font-extrabold uppercase">
                            <th className="px-5 py-3">Student Name</th>
                            <th className="px-5 py-3 text-center">Periods Attended</th>
                            <th className="px-5 py-3 text-right">Attendance Percentage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-500/10">
                          {monthlyData.defaulters.map((d, idx) => (
                            <tr key={`defaulter-${idx}`} className="hover:bg-red-500/10 text-red-305">
                              <td className="px-5 py-3 font-bold">{d.name}</td>
                              <td className="px-5 py-3 text-center font-medium">{d.present} / {d.total}</td>
                              <td className="px-5 py-3 text-right font-black text-red-400">{d.pct}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Print Signatures */}
                <div className="pt-10 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-6 font-bold text-[10px] text-slate-400 print-avoid-break light:border-slate-200" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                  <div className="flex flex-col gap-1">
                    <div>Prepared By: ____________________</div>
                    <span className="block font-medium text-slate-500 text-[9px]">Class Coordinator signature</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:items-end sm:text-right print:items-end print:text-right">
                    <div>Approved By Academic Director: ____________________</div>
                    <span className="block font-medium text-slate-500 text-[9px]">Ahlussuffa Administration</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
}
