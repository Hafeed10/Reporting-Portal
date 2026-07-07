import React, { useState } from 'react';
import { Mail, Lock, ShieldAlert, ArrowLeft, Key } from 'lucide-react';

const AhlussuffaLogo = ({ className = "w-10 h-10" }) => (
  <img src="/logo.png" className={className} alt="Ahlussuffa Logo" />
);

const CREDENTIALS = [
  { role: 'System Admin', email: 'admin@ahlussuffa.org', password: 'admin123', dars: 'All Dars' },
  { role: 'Imam Navavi Coordinator', email: 'navavi@ahlussuffa.org', password: 'navavi123', dars: 'Imam Navavi Garden' },
  { role: 'Imam Rafi Coordinator', email: 'rafi@ahlussuffa.org', password: 'rafi123', dars: 'Imam Rafi Garden' },
  { role: 'Imam Gazli Coordinator', email: 'gazli@ahlussuffa.org', password: 'gazli123', dars: 'Imam Gazli Garden' },
  { role: 'RootExc Coordinator', email: 'rootexc@ahlussuffa.org', password: 'rootexc123', dars: 'RootExc' },
];

export default function LoginPage({ onLoginSuccess, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showHelper, setShowHelper] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const user = CREDENTIALS.find(
      (c) => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password
    );

    if (user) {
      onLoginSuccess({
        email: user.email,
        role: user.role.includes('Admin') ? 'admin' : 'coordinator',
        dars: user.dars,
        name: user.role.split(' ')[0], // First name as display name
      });
    } else {
      setError('Invalid email address or password. Please try again.');
    }
  };

  const handleQuickFill = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 animate-fadeIn space-y-6">
      {/* Back Button */}
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-450 transition-all hover:bg-slate-800 hover:text-slate-100 cursor-pointer light:bg-white light:border-slate-200 light:text-slate-600"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={14} /> Back to Welcome
      </button>

      {/* Main Login Card */}
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-6 light:bg-white light:border-slate-200"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <AhlussuffaLogo className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Sign In
          </h2>
          <p className="text-xxs" style={{ color: 'var(--text-muted)' }}>
            Ahlussuffa Coordinator & Management Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex gap-2.5 items-start bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl text-xs leading-relaxed">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--accent-danger)' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }} htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-500" style={{ color: 'var(--text-muted)' }}>
                <Mail size={16} />
              </span>
              <input
                id="login-email"
                type="email"
                required
                placeholder="e.g. coordinator@ahlussuffa.org"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm light:bg-white light:border-slate-250"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xxs font-bold text-slate-400 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }} htmlFor="login-password">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-500" style={{ color: 'var(--text-muted)' }}>
                <Lock size={16} />
              </span>
              <input
                id="login-password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm light:bg-white light:border-slate-250"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-glow-indigo transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--accent-indigo), #4f46e5)' }}
            >
              Sign In to Portal
            </button>
          </div>
        </form>
      </div>

      {/* Demo Credentials Helper Legend */}
      {showHelper && (
        <div
          className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-3.5 light:bg-slate-50/50 light:border-slate-200"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 light:border-slate-200" style={{ borderColor: 'var(--border-color)' }}>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <Key size={12} /> Test Credentials (Click to Autofill)
            </span>
            <button
              onClick={() => setShowHelper(false)}
              className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors font-bold cursor-pointer"
            >
              Hide
            </button>
          </div>

          <div className="space-y-2">
            {CREDENTIALS.filter(cred => cred.role !== 'System Admin').map((cred) => (
              <div
                key={cred.email}
                onClick={() => handleQuickFill(cred)}
                className="group flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-2 rounded-xl border border-transparent hover:border-slate-700/50 bg-slate-950/20 hover:bg-slate-950/50 transition-all cursor-pointer text-left gap-1"
                style={{ backgroundColor: 'rgba(2, 6, 23, 0.1)' }}
              >
                <div>
                  <div className="text-[11px] font-extrabold" style={{ color: 'var(--text-secondary)' }}>{cred.role}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{cred.email}</div>
                </div>
                <div className="text-xxs font-semibold flex items-center gap-1 sm:text-right">
                  <span className="text-slate-500">Pass:</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 font-bold border border-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-all light:bg-slate-200 light:border-slate-300">
                    {cred.password}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
