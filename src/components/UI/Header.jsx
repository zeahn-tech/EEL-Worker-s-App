import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldAlert, 
  UserCheck, 
  Settings, 
  Download, 
  ChevronDown, 
  Building2,
  Lock
} from 'lucide-react';

export const Header = ({ onOpenAdmin, installPrompt, onInstallApp }) => {
  const { currentUser, users, switchUser, settings, isAdmin, isSuspended, isBanned } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="glass-panel amber-border" style={{ 
      height: '60px', 
      padding: '0 12px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      zIndex: 30,
      flexShrink: 0
    }}>
      {/* Brand & Dynamic Logo Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--navy-dark)',
          border: '1px solid var(--amber-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: 'var(--shadow-glow)'
        }}>
          {settings.appLogo ? (
            <img 
              src={settings.appLogo} 
              alt="Company Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          ) : (
            <div style={{ 
              fontWeight: 800, 
              color: 'var(--amber-primary)', 
              fontSize: '16px',
              fontFamily: 'Outfit' 
            }}>
              EEL
            </div>
          )}
        </div>

        <div style={{ overflow: 'hidden' }}>
          <h1 className="app-header-title" style={{ 
            fontSize: '15px', 
            fontWeight: 700, 
            color: 'var(--text-main)', 
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
          }}>
            {settings.companyName || 'Elite Express Logistics Liberia (EEL)'}
          </h1>
          <p className="app-header-tagline" style={{ fontSize: '10px', color: 'var(--amber-primary)', fontWeight: 600 }}>
            {settings.tagline || 'Real-Time Enterprise Operational Messenger'}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* PWA Install Button */}
        {installPrompt && (
          <button 
            className="btn btn-primary animate-fade-in" 
            onClick={onInstallApp}
            style={{ padding: '6px 12px', fontSize: '12px' }}
            title="Install PWA App to Mobile or Desktop"
          >
            <Download size={15} />
            <span className="mobile-hide">Install App</span>
          </button>
        )}

        {/* Admin Portal Button (Admin Only) */}
        {isAdmin && (
          <button 
            className="btn btn-secondary amber-border"
            onClick={onOpenAdmin}
            style={{ color: 'var(--amber-primary)', fontWeight: 600, padding: '6px 10px', fontSize: '12px' }}
            title="Admin Dashboard"
          >
            <Settings size={15} />
            <span className="mobile-hide">Admin</span>
          </button>
        )}

        {/* User Account Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            style={{
              background: 'rgba(30, 41, 59, 0.9)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 8px 4px 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              color: 'var(--text-main)'
            }}
          >
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: isBanned ? '#EF4444' : isSuspended ? '#F59E0B' : 'var(--amber-primary)',
              color: 'var(--navy-dark)',
              fontWeight: 700,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {currentUser?.initials || 'U'}
            </div>
            <div style={{ textAlign: 'left' }} className="mobile-hide">
              <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.1 }}>
                {currentUser?.name}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                {currentUser?.role}
              </div>
            </div>
            <ChevronDown size={12} color="var(--text-muted)" />
          </button>

          {/* User Selection Dropdown Menu */}
          {showUserDropdown && (
            <div className="glass-panel animate-fade-in" style={{
              position: 'absolute',
              top: '44px',
              right: 0,
              width: '240px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-amber)',
              padding: '6px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 50
            }}>
              <div style={{ padding: '6px', fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Switch Profile (Demo)
              </div>

              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u);
                    setShowUserDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: u.id === currentUser?.id ? 'var(--amber-light)' : 'transparent',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: '2px'
                  }}
                >
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: u.status === 'Banned' ? '#EF4444' : u.status === 'Suspended' ? '#F59E0B' : 'var(--bg-tertiary)',
                    color: u.status !== 'Active' ? 'white' : 'var(--amber-primary)',
                    fontWeight: 700,
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {u.initials}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {u.name} {u.role === 'Admin' && '👑'}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                      {u.role} ({u.status})
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
