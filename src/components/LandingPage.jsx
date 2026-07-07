import React from 'react';
import { ArrowRight, BookOpen, Clock, FileText, CheckCircle2 } from 'lucide-react';

const AhlussuffaLogo = ({ className = "w-16 h-16" }) => (
  <img src="/logo.png" className={className} alt="Ahlussuffa Logo" />
);

export default function LandingPage({ onLoginClick }) {
  return (
    <div className="space-y-16 py-6 md:py-12 animate-fadeIn">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto px-4">
        <div className="flex justify-center mb-6">
          <div className="p-3 sm:p-4 rounded-3xl bg-slate-900/50 border border-slate-800 shadow-glow-indigo transition-transform hover:scale-105"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <AhlussuffaLogo className="w-16 h-16 sm:w-20 sm:h-20" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
          Ahlussuffa Reporting Portal
        </h1>
        
        <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          A modern, streamlined monthly reporting portal for class coordinators. Access rosters, input attendance statistics, manage leave records, and compile comprehensive student activity insights.
        </p>
        
        <div className="pt-6">
          <button
            onClick={onLoginClick}
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-glow-indigo transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            style={{ background: 'linear-gradient(135deg, var(--accent-indigo), #4f46e5)' }}
          >
            Access Coordinator Portal <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="space-y-8 max-w-5xl mx-auto px-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Portal Features
          </h2>
          <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard
            icon={<FileText className="text-indigo-400" size={24} style={{ color: 'var(--accent-indigo)' }} />}
            title="Monthly Activity Reports"
            desc="Draft, edit, and export monthly summaries covering class learning outcomes, suggestions, and key milestones."
          />
          <FeatureCard
            icon={<CheckCircle2 className="text-teal-400" size={24} style={{ color: 'var(--accent-teal)' }} />}
            title="Attendance Analytics"
            desc="Log individual student attendances to automatically calculate averages, identifying regular vs. low attendance trends."
          />
          <FeatureCard
            icon={<Clock className="text-amber-400" size={24} style={{ color: 'var(--accent-warning)' }} />}
            title="Leave Log Tracking"
            desc="Restored student leave recording to register approved leaves and unapproved absences with specific reasons."
          />
          <FeatureCard
            icon={<BookOpen className="text-emerald-400" size={24} style={{ color: 'var(--accent-success)' }} />}
            title="Individual Performance"
            desc="Input specific achievements, grades, assessments, and teacher comments for each student roster."
          />
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center text-xs py-8 border-t flex flex-col items-center gap-3" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
        <AhlussuffaLogo className="w-8 h-8 opacity-50 hover:opacity-90 transition-all hover:scale-105 cursor-pointer" />
        <span className="font-semibold">© {new Date().getFullYear()} Ahlussuffa Systems. All rights reserved.</span>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div 
      className="p-6 rounded-2xl border flex gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-slate-600 shadow-sm"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
    >
      <div className="p-3.5 rounded-xl bg-slate-950/20 w-fit h-fit" style={{ backgroundColor: 'rgba(2, 6, 23, 0.2)' }}>
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="font-extrabold text-sm uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
      </div>
    </div>
  );
}
