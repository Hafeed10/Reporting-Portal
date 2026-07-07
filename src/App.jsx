import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles, CheckCircle2, AlertCircle, Home, BookOpenCheck, Clock, BarChart2 } from 'lucide-react';
import { reportService, isSupabaseConfigured, studentService } from './supabase';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import ReportPreview from './components/ReportPreview';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import AdminConsolidatedPreview from './components/AdminConsolidatedPreview';
import Classes from './components/Classes';
import SupabaseSettings from './components/SupabaseSettings';

const AhlussuffaLogo = ({ className = "w-8 h-8" }) => (
  <img src="/logo.png" className={className} alt="Ahlussuffa Logo" />
);

const DEFAULT_STUDENTS = {
  'Imam Navavi Garden': {
    'HS1': ['Ali', 'Aisha'],
    'HS2': ['Omar', 'Fatima'],
    'BS1': ['Zainab', 'Hamza'],
    'BS2': ['Bilal', 'Maryam'],
    'BS3': [],
    'BS4': [],
    'BS5': [],
    '8th Class': [],
    '9th Class': []
  },
  'Imam Rafi Garden': {
    'HS1': ['Youssef', 'Khadija'],
    'HS2': ['Ibrahim', 'Sara'],
    'BS1': ['Mustafa', 'Amira'],
    'BS2': ['Yahya', 'Hana'],
    'BS3': [],
    'BS4': [],
    'BS5': [],
    '8th Class': [],
    '9th Class': []
  },
  'Imam Gazli Garden': {
    'HS1': ['Suleiman', 'Layla'],
    'HS2': ['Hassan', 'Yasmin'],
    'BS1': ['Idris', 'Farah'],
    'BS2': ['Zakariya', 'Nour'],
    'BS3': [],
    'BS4': [],
    'BS5': [],
    '8th Class': [],
    '9th Class': []
  },
  'RootExc': {
    'HS1': ['Tariq', 'Salma'],
    'HS2': ['Imran', 'Rania'],
    'BS1': ['Luqman', 'Heba'],
    'BS2': ['Anas', 'Mona'],
    'BS3': [],
    'BS4': [],
    'BS5': [],
    '8th Class': [],
    '9th Class': []
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ahlussuffa_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('ahlussuffa_session');
    return saved ? 'dashboard' : 'landing';
  });
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [prefillDars, setPrefillDars] = useState('Imam Navavi Garden');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [consolidatedDarsFilter, setConsolidatedDarsFilter] = useState('All Dars');
  const [notification, setNotification] = useState(null);
  const [studentsRoster, setStudentsRoster] = useState(DEFAULT_STUDENTS);
  const [classesSubTab, setClassesSubTab] = useState('register');

  const handleUpdateRoster = async (newRoster) => {
    const oldRoster = { ...studentsRoster };
    setStudentsRoster(newRoster);

    try {
      for (const dars of Object.keys(newRoster)) {
        for (const classLevel of Object.keys(newRoster[dars] || {})) {
          const oldList = (oldRoster[dars] && oldRoster[dars][classLevel]) || [];
          const newList = (newRoster[dars] && newRoster[dars][classLevel]) || [];

          // Added students
          const added = newList.filter(s => !oldList.includes(s));
          for (const name of added) {
            await studentService.create(name, dars, classLevel);
          }

          // Removed students
          const removed = oldList.filter(s => !newList.includes(s));
          for (const name of removed) {
            await studentService.delete(name, dars, classLevel);
          }
        }
      }
      showToast('Student roster updated successfully.');
    } catch (err) {
      console.error('Error syncing student roster changes to database:', err);
      const errStr = JSON.stringify(err) + String(err) + (err && err.message ? err.message : '') + (err && err.details ? err.details : '');
      const isClassError = errStr.toLowerCase().includes('class') || errStr.includes('42703');
      const errorMsg = isClassError
        ? 'Failed to sync. Please run the SQL commands in supabase_setup.sql to add the class column.'
        : 'Failed to sync student roster to database.';
      showToast(errorMsg, 'error');
      // Revert local state to match database state
      setStudentsRoster(oldRoster);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (view === 'admin-consolidated' && (!currentUser || currentUser.role !== 'admin')) {
      setView('dashboard');
    }
  }, [view, currentUser]);

  useEffect(() => {
    loadReports();
    loadStudents();
    setDbConnected(isSupabaseConfigured());
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('ahlussuffa_session', JSON.stringify(user));
    setView('dashboard');
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('ahlussuffa_session');
    setCurrentUser(null);
    setView('landing');
    showToast('Logged out successfully.');
  };

  const filteredReports = reports.filter(r => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    const rDars = (r.dars || 'Imam Navavi Garden').trim().toLowerCase();
    const cDars = currentUser.dars.trim().toLowerCase();
    return rDars === cDars || rDars.startsWith(cDars) || rDars.includes(cDars);
  });

  const loadReports = async () => {
    try {
      const data = await reportService.getAll();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
      const errMsg = err?.message || err?.details || 'Failed to load reports from database.';
      showToast(`Failed to load reports: ${errMsg}`, 'error');
    }
  };

  const loadStudents = async () => {
    try {
      let data = await studentService.getAll();

      // Auto-seed if database is configured and empty
      if (isSupabaseConfigured() && data.length === 0) {
        console.log('Database students table is empty. Seeding default students...');
        const seededList = [];
        for (const [dars, classesMap] of Object.entries(DEFAULT_STUDENTS)) {
          for (const [classLevel, names] of Object.entries(classesMap)) {
            for (const name of names) {
              try {
                const newStudent = await studentService.create(name, dars, classLevel);
                seededList.push(newStudent);
              } catch (err) {
                console.error(`Failed to seed student ${name} for ${dars} - ${classLevel}:`, err);
              }
            }
          }
        }
        if (seededList.length > 0) {
          data = seededList;
          showToast('Default student roster seeded to database.');
        }
      }

      const roster = {
        'Imam Navavi Garden': { 'HS1': [], 'HS2': [], 'BS1': [], 'BS2': [], 'BS3': [], 'BS4': [], 'BS5': [], '8th Class': [], '9th Class': [] },
        'Imam Rafi Garden': { 'HS1': [], 'HS2': [], 'BS1': [], 'BS2': [], 'BS3': [], 'BS4': [], 'BS5': [], '8th Class': [], '9th Class': [] },
        'Imam Gazli Garden': { 'HS1': [], 'HS2': [], 'BS1': [], 'BS2': [], 'BS3': [], 'BS4': [], 'BS5': [], '8th Class': [], '9th Class': [] },
        'RootExc': { 'HS1': [], 'HS2': [], 'BS1': [], 'BS2': [], 'BS3': [], 'BS4': [], 'BS5': [], '8th Class': [], '9th Class': [] }
      };

      data.forEach(s => {
        const d = s.dars;
        const c = s.class || 'HS1'; // fallback
        if (!roster[d]) {
          roster[d] = { 'HS1': [], 'HS2': [], 'BS1': [], 'BS2': [], 'BS3': [], 'BS4': [], 'BS5': [], '8th Class': [], '9th Class': [] };
        }
        if (!roster[d][c]) {
          roster[d][c] = [];
        }
        if (!roster[d][c].includes(s.name)) {
          roster[d][c].push(s.name);
        }
      });

      setStudentsRoster(roster);
    } catch (err) {
      console.error('Failed to load students roster:', err);
    }
  };

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSaveReport = async (reportData, isQuickSave = false) => {
    try {
      if (view === 'create') {
        const newReport = await reportService.create(reportData);
        showToast(isQuickSave ? 'Auto-filled data saved to database!' : 'Monthly report created successfully!');
        setReports(prev => [newReport, ...prev]);
        if (isQuickSave) {
          setCurrentReport(newReport);
          setView('edit');
        } else {
          setView('dashboard');
        }
      } else if (view === 'edit' && currentReport) {
        const updatedReport = await reportService.update(currentReport.id, reportData);
        showToast(isQuickSave ? 'Auto-filled data saved to database!' : 'Monthly report updated successfully!');
        setReports(prev => prev.map(r => r.id === currentReport.id ? updatedReport : r));
        if (isQuickSave) {
          setCurrentReport(updatedReport);
        } else {
          setView('dashboard');
        }
      }
    } catch (err) {
      console.error('Error saving report to database:', err);
      const errMsg = err?.message || err?.details || 'Error saving report to database.';
      showToast(`Error saving report: ${errMsg}`, 'error');
    }
  };

  const handleSaveConsolidated = async (consolidatedData) => {
    try {
      const existing = reports.find(r => r.dars === 'Consolidated' && r.month === consolidatedData.month);
      if (existing) {
        const updated = await reportService.update(existing.id, consolidatedData);
        showToast('Consolidated report updated successfully!');
        setReports(prev => prev.map(r => r.id === existing.id ? updated : r));
      } else {
        const created = await reportService.create(consolidatedData);
        showToast('Consolidated report saved successfully!');
        setReports(prev => [created, ...prev]);
      }
    } catch (err) {
      console.error('Error saving consolidated report:', err);
      showToast('Error saving consolidated report to database.', 'error');
      throw err;
    }
  };

  const handleDeleteReport = async (id) => {
    try {
      await reportService.delete(id);
      showToast(Array.isArray(id) ? 'All selected reports deleted successfully.' : 'Report deleted successfully.');
      if (Array.isArray(id)) {
        setReports(prev => prev.filter(r => !id.includes(r.id)));
        if (currentReport && id.includes(currentReport.id)) {
          setCurrentReport(null);
          setView('dashboard');
        }
      } else {
        setReports(prev => prev.filter(r => r.id !== id));
        if (currentReport && currentReport.id === id) {
          setCurrentReport(null);
          setView('dashboard');
        }
      }
    } catch (err) {
      showToast('Error deleting report(s).', 'error');
    }
  };

  const handleEditTrigger = (report) => {
    setCurrentReport(report);
    setView('edit');
  };

  const handlePreviewTrigger = (report) => {
    setCurrentReport(report);
    setView('preview');
  };

  const handleCreateTrigger = (dars) => {
    const today = new Date();
    const day = today.getDate();
    const isAllowed = day >= 25 && day <= 30;
    const isAdmin = currentUser && currentUser.role === 'admin';

    if (!isAllowed && !isAdmin) {
      showToast('Monthly reports can only be created between the 25th and 30th of the month.', 'error');
      return;
    }

    setCurrentReport(null);
    if (typeof dars === 'string' && dars !== 'All Dars' && dars !== 'RootExc') {
      setPrefillDars(dars);
    } else {
      setPrefillDars('Imam Navavi Garden');
    }
    setView('create');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 pb-24 md:pb-8 md:px-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 z-50 font-semibold text-sm text-white md:left-auto md:right-6 md:translate-x-0 ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          style={{
            animation: 'slideDown 0.2s ease-out'
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* App Header */}
      <header className={`flex ${currentUser ? 'flex-col sm:flex-row gap-4 items-start' : 'flex-row items-center'} justify-between pb-5 border-b border-slate-800 mb-8 light:border-slate-200 no-print`} style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex flex-wrap items-center gap-6">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView(currentUser ? 'dashboard' : 'landing')}
          >
            <AhlussuffaLogo className="w-8 h-8 transition-transform group-hover:scale-110" />
            <h1 className="text-xl font-black bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent group-hover:opacity-90">
              Ahlussuffa
            </h1>
          </div>

          {currentUser && (
            <nav className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => setView('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  view === 'dashboard' || view === 'create' || view === 'edit' || view === 'preview' || view === 'admin-consolidated'
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 light:hover:bg-slate-100'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  setView('classes');
                  setClassesSubTab('register');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  view === 'classes' && classesSubTab === 'register'
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 light:hover:bg-slate-100'
                }`}
              >
                Attendance
              </button>
              <button
                onClick={() => {
                  setView('classes');
                  setClassesSubTab('log');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  view === 'classes' && classesSubTab === 'log'
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 light:hover:bg-slate-100'
                }`}
              >
                History
              </button>
              <button
                onClick={() => {
                  setView('classes');
                  setClassesSubTab('weekly');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  view === 'classes' && (classesSubTab === 'weekly' || classesSubTab === 'monthly')
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 light:hover:bg-slate-100'
                }`}
              >
                Reports
              </button>
            </nav>
          )}
        </div>

        <div className={`flex items-center justify-between ${currentUser ? 'w-full sm:w-auto' : 'w-auto'} gap-3`}>
          {currentUser && (
            <div className="flex items-center gap-2.5 mr-2">
              <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-350 light:bg-slate-50 light:border-slate-200" style={{ color: 'var(--text-secondary)' }}>
                {currentUser.name} ({currentUser.dars === 'All Dars' ? 'Admin' : currentUser.dars})
              </span>
              <button
                onClick={handleLogout}
                className="text-[10px] sm:text-xs font-bold text-red-400 hover:text-red-300 transition-colors px-2.5 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
          {/* Theme Toggle */}
          <button
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer light:bg-white light:border-slate-250 light:text-slate-600"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
            onClick={toggleTheme}
            title="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* Warning Banner when Supabase is not configured */}
      {!dbConnected && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-500 light:text-amber-700 light:bg-amber-50 light:border-amber-200 no-print">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0 text-amber-500 light:text-amber-600" />
            <div>
              <p className="font-bold text-sm">Database Disconnected</p>
              <p className="text-xs opacity-90 mt-0.5" style={{ color: 'var(--text-secondary)' }}>Please connect to your Supabase instance to load and store report data.</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 dark:bg-amber-600 dark:hover:bg-amber-500 dark:text-white text-slate-950 transition-all font-bold text-xs rounded-xl shadow-md cursor-pointer shrink-0"
          >
            Connect Database
          </button>
        </div>
      )}

      {/* Main View Router */}
      <main>
        {currentUser ? (
          <>
            {view === 'dashboard' && (
              <Dashboard
                reports={filteredReports}
                onCreateNew={handleCreateTrigger}
                onEdit={handleEditTrigger}
                onPreview={handlePreviewTrigger}
                onDelete={handleDeleteReport}
                studentsRoster={studentsRoster}
                onUpdateRoster={handleUpdateRoster}
                currentUser={currentUser}
                onGenerateConsolidated={(dars) => {
                  setConsolidatedDarsFilter(dars);
                  setView('admin-consolidated');
                }}
              />
            )}

            {(view === 'create' || view === 'edit') && (
              <ReportForm
                initialReport={currentReport}
                onSave={handleSaveReport}
                onCancel={() => setView('dashboard')}
                studentsRoster={studentsRoster}
                onUpdateRoster={handleUpdateRoster}
                currentUser={currentUser}
                prefillDars={prefillDars}
              />
            )}

            {view === 'preview' && (
              <ReportPreview
                report={currentReport}
                onBack={() => setView('dashboard')}
              />
            )}

            {view === 'admin-consolidated' && currentUser?.role === 'admin' && (
              <AdminConsolidatedPreview
                reports={reports}
                defaultDars={consolidatedDarsFilter}
                onBack={() => setView('dashboard')}
                onSaveConsolidated={handleSaveConsolidated}
                currentUser={currentUser}
              />
            )}

            {view === 'classes' && (
              <Classes
                currentUser={currentUser}
                studentsRoster={studentsRoster}
                onUpdateRoster={handleUpdateRoster}
                showToast={showToast}
                activeSubTab={classesSubTab}
                setActiveSubTab={setClassesSubTab}
              />
            )}
          </>
        ) : (
          <>
            {view === 'login' ? (
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onCancel={() => setView('landing')}
              />
            ) : (
              <LandingPage
                onLoginClick={() => setView('login')}
              />
            )}
          </>
        )}
      </main>

      <SupabaseSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      {currentUser && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md px-6 py-2.5 flex justify-around items-center mobile-safe-padding no-print" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              view === 'dashboard' || view === 'create' || view === 'edit' || view === 'preview' || view === 'admin-consolidated'
                ? 'text-indigo-400 font-extrabold scale-105'
                : 'text-slate-500 font-semibold hover:text-slate-350'
            }`}
          >
            <Home size={18} className={view === 'dashboard' || view === 'create' || view === 'edit' || view === 'preview' || view === 'admin-consolidated' ? 'text-indigo-400' : 'text-slate-500'} />
            <span className="text-[10px]">Home</span>
          </button>
          
          <button
            onClick={() => {
              setView('classes');
              setClassesSubTab('register');
            }}
            className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              view === 'classes' && classesSubTab === 'register'
                ? 'text-indigo-400 font-extrabold scale-105'
                : 'text-slate-500 font-semibold hover:text-slate-350'
            }`}
          >
            <BookOpenCheck size={18} className={view === 'classes' && classesSubTab === 'register' ? 'text-indigo-400' : 'text-slate-500'} />
            <span className="text-[10px]">Attendance</span>
          </button>

          <button
            onClick={() => {
              setView('classes');
              setClassesSubTab('log');
            }}
            className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              view === 'classes' && classesSubTab === 'log'
                ? 'text-indigo-400 font-extrabold scale-105'
                : 'text-slate-500 font-semibold hover:text-slate-350'
            }`}
          >
            <Clock size={18} className={view === 'classes' && classesSubTab === 'log' ? 'text-indigo-400' : 'text-slate-500'} />
            <span className="text-[10px]">History</span>
          </button>

          <button
            onClick={() => {
              setView('classes');
              setClassesSubTab('weekly');
            }}
            className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              view === 'classes' && (classesSubTab === 'weekly' || classesSubTab === 'monthly')
                ? 'text-indigo-400 font-extrabold scale-105'
                : 'text-slate-500 font-semibold hover:text-slate-350'
            }`}
          >
            <BarChart2 size={18} className={view === 'classes' && (classesSubTab === 'weekly' || classesSubTab === 'monthly') ? 'text-indigo-400' : 'text-slate-500'} />
            <span className="text-[10px]">Reports</span>
          </button>
        </nav>
      )}
    </div>
  );
}
