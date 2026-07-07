import React, { useState, useEffect } from 'react';
import { X, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig } from '../supabase';

export default function SupabaseSettings({ isOpen, onClose }) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [config, setConfig] = useState({ url: '', key: '', isEnv: false });

  useEffect(() => {
    const activeConfig = getSupabaseConfig();
    setConfig(activeConfig);
    setUrl(activeConfig.url || '');
    setKey(activeConfig.key || '');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveSupabaseConfig(url.trim(), key.trim());
  };

  const handleClear = () => {
    saveSupabaseConfig('', '');
  };

  const maskKey = (str) => {
    if (!str) return '';
    if (str.length <= 12) return '************';
    return `${str.substring(0, 6)}...${str.substring(str.length - 6)}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transition-all duration-300 light:bg-white light:border-slate-200"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2.5">
            <Database 
              size={20} 
              className={config.url ? 'text-teal-400' : 'text-slate-400'} 
              style={{ color: config.url ? 'var(--accent-teal)' : 'var(--text-muted)' }} 
            />
            <h3 className="text-lg font-bold text-slate-100" style={{ color: 'var(--text-primary)' }}>
              Supabase Connection Settings
            </h3>
          </div>
          <button 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors" 
            style={{ color: 'var(--text-muted)' }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="p-6 space-y-4">
            
            {/* Status alerts */}
            {config.url && (
              <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm font-semibold">
                <CheckCircle size={18} />
                <span>Connected to Supabase {config.isEnv ? '(via .env file)' : '(via Local Config)'}</span>
              </div>
            )}

            {!config.url && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-xl text-xs leading-relaxed">
                <strong>Demo Mode Active:</strong> You are currently operating on browser-local storage. Any reports created will be saved locally. Configure below to synchronize with your Supabase database.
              </div>
            )}

            {/* Inputs */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-300" style={{ color: 'var(--text-secondary)' }} htmlFor="supa-url">
                Supabase Project URL
              </label>
              <input
                id="supa-url"
                type="url"
                placeholder="https://your-project-id.supabase.co"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={config.isEnv}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-300" style={{ color: 'var(--text-secondary)' }} htmlFor="supa-key">
                Supabase Anon Key
              </label>
              <input
                id="supa-key"
                type="password"
                placeholder="your-anon-key"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                disabled={config.isEnv}
                required
              />
              {config.url && !config.isEnv && (
                <span className="text-xs text-slate-500 mt-0.5">
                  Currently saved key: <code className="bg-slate-950/60 px-1.5 py-0.5 rounded text-indigo-400">{maskKey(config.key)}</code>
                </span>
              )}
            </div>

            {config.isEnv && (
              <p className="text-xs text-slate-500">
                Credentials are loaded from the environment (<code>.env</code> file) and cannot be changed here.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'rgba(17, 24, 39, 0.3)' }}>
            {!config.isEnv && config.url && (
              <button 
                type="button" 
                className="mr-auto px-4 py-2 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all" 
                onClick={handleClear}
              >
                Disconnect API
              </button>
            )}
            
            <button 
              type="button" 
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              style={{
                backgroundColor: 'var(--bg-surface-active)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }}
              onClick={onClose}
            >
              Cancel
            </button>
            
            {!config.isEnv && (
              <button 
                type="submit" 
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo transition-all hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-indigo), #4f46e5)',
                  boxShadow: 'var(--shadow-glow-indigo)'
                }}
              >
                Save & Connect
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
