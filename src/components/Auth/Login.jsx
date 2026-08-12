import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { Lock, Mail, Eye, EyeOff, LogIn, AlertCircle, Info, Download, Share } from 'lucide-react';

export const Login = () => {
  const { login, settings, users, supabaseMode } = useAuth();
  const { installPrompt, showIosInstallHint, promptInstall } = useInstallPrompt();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDemoHint, setShowDemoHint] = useState(false);
  const [showIosPanel, setShowIosPanel] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error || 'Sign in failed.');
    }
  };

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Install banner — visible immediately on landing, before any login */}
      {(installPrompt || showIosInstallHint) && (
        <div className="glass-panel amber-border animate-fade-in" style={{
          width: '100%', maxWidth: 380, borderRadius: 'var(--radius-md)',
          padding: '10px 14px', marginBottom: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-main)', minWidth: 0 }}>
            <Download size={16} color="var(--amber-primary)" style={{ flexShrink: 0 }} />
            <span>Install this app on your device for the best experience</span>
          </div>
          {installPrompt ? (
            <button className="btn btn-primary" onClick={promptInstall}
              style={{ fontSize: 12, padding: '6px 12px', minHeight: 30, flexShrink: 0 }}>
              Install
            </button>
          ) : (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button className="btn btn-primary" onClick={() => setShowIosPanel(v => !v)}
                style={{ fontSize: 12, padding: '6px 12px', minHeight: 30 }}>
                Install
              </button>
              {showIosPanel && (
                <div className="glass-panel amber-border animate-fade-in" style={{
                  position: 'absolute', top: 38, right: 0, width: 240,
                  borderRadius: 'var(--radius-md)', padding: 14,
                  boxShadow: 'var(--shadow-lg)', zIndex: 200, fontSize: 12, color: 'var(--text-main)'
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--amber-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Share size={13} /> Install on iPhone / iPad
                  </div>
                  <ol style={{ paddingLeft: 18, lineHeight: 1.6, color: 'var(--text-muted)' }}>
                    <li>Tap the <strong style={{ color: 'var(--text-main)' }}>Share</strong> icon in Safari's toolbar</li>
                    <li>Tap <strong style={{ color: 'var(--text-main)' }}>Add to Home Screen</strong></li>
                    <li>Tap <strong style={{ color: 'var(--text-main)' }}>Add</strong> to confirm</li>
                  </ol>
                  <button className="btn btn-secondary" onClick={() => setShowIosPanel(false)}
                    style={{ width: '100%', marginTop: 10, fontSize: 12, minHeight: 30 }}>
                    Got it
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="glass-panel amber-border animate-fade-in" style={{
        width: '100%', maxWidth: 380, borderRadius: 'var(--radius-lg)',
        padding: '32px 28px', boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 14,
            background: 'var(--navy-dark)', border: '2px solid var(--amber-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', marginBottom: 14, boxShadow: 'var(--shadow-glow)'
          }}>
            {settings.appLogo
              ? <img src={settings.appLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <span style={{ fontFamily: 'Outfit', fontWeight: 900, color: 'var(--amber-primary)', fontSize: 22 }}>EEL</span>
            }
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: 'var(--text-main)', textAlign: 'center' }}>
            {settings.companyName || 'Elite Express Logistics Liberia'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, textAlign: 'center' }}>
            Sign in to your dispatch account
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Company Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                className="input-field"
                style={{ paddingLeft: 36 }}
                placeholder="you@eel-logistics.com"
                autoComplete="username"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                style={{ paddingLeft: 36, paddingRight: 38 }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 6,
                  display: 'flex', color: 'var(--text-dim)'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: 'var(--radius-sm)', padding: '8px 10px', marginBottom: 14,
              fontSize: 12, color: '#FCA5A5'
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={submitting}
            style={{ width: '100%', minHeight: 42, fontSize: 14 }}>
            <LogIn size={16} />
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials hint — only relevant when running in local (no Supabase)
            mode. In Supabase mode these are real accounts, so nothing is surfaced. */}
        {!supabaseMode && (
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowDemoHint(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, color: 'var(--text-dim)'
            }}
          >
            <Info size={12} />
            {showDemoHint ? 'Hide demo accounts' : 'This is a demo — show test accounts'}
          </button>

          {showDemoHint && (
            <div className="animate-fade-in" style={{
              marginTop: 10, textAlign: 'left', fontSize: 11, color: 'var(--text-muted)',
              background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)', padding: 10, maxHeight: 160, overflowY: 'auto'
            }}>
              <div style={{ marginBottom: 6, color: 'var(--text-dim)' }}>
                Demo password for every seed account: <strong style={{ color: 'var(--amber-primary)' }}>Welcome123!</strong>
              </div>
              {users.map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>{u.name} {u.role === 'Admin' && '👑'}</span>
                  <span style={{ color: 'var(--text-dim)' }}>{u.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};
