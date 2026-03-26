import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import SettingsModal from './SettingsModal';

const nav = [
  {
    to: '/', label: 'Dashboard', exact: true,
    icon: (
      <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="6" height="6" rx="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5"/>
      </svg>
    ),
  },
  {
    to: '/leads', label: 'Leads',
    icon: (
      <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="5" r="2.5"/>
        <path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5"/>
        <circle cx="12.5" cy="5" r="2" strokeWidth="1.3"/>
        <path d="M15 13c0-2.21-1.12-4-2.5-4" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    to: '/import', label: 'Import',
    icon: (
      <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 1v8M5 6l3 3 3-3"/>
        <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/>
      </svg>
    ),
  },
  {
    to: '/scripts', label: 'Scripts',
    icon: (
      <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="1" width="12" height="14" rx="1.5"/>
        <path d="M5 5h6M5 8h6M5 11h4"/>
      </svg>
    ),
  },
];

export default function Layout() {
  const [showSettings, setShowSettings] = useState(false);
  const token = localStorage.getItem('apify_token');

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <div className="sidebar-logo-icon">⚡</div>
            <div>
              <div>NEXUS EDGE</div>
            </div>
          </div>
          <div className="sidebar-tagline">Cold Call CRM</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {nav.map(({ to, label, icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div
            className="sidebar-token-status"
            onClick={() => setShowSettings(true)}
            title="Apify Settings"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="2.5"/>
              <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/>
            </svg>
            <span style={{ fontSize: '12px' }}>Apify Settings</span>
            {token ? (
              <span className="pulse-dot" style={{ marginLeft: 'auto' }} />
            ) : (
              <span className="pulse-dot-idle" style={{ marginLeft: 'auto' }} />
            )}
          </div>
        </div>
      </aside>

      <div className="main-content">
        <Outlet />
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
