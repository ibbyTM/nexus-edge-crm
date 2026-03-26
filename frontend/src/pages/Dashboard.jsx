import { useState, useEffect } from 'react';
import { api } from '../api';
import StatCard from '../components/StatCard';
import KanbanBoard from '../components/KanbanBoard';
import ActivityFeed from '../components/ActivityFeed';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const [s, l] = await Promise.all([
        api.stats(),
        api.leads.list({ limit: 500 }),
      ]);
      setStats(s);
      setLeads(l.leads || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--muted)' }}>
          <div className="spinner" style={{ width: '28px', height: '28px' }} />
          <div style={{ fontSize: '13px' }}>Loading dashboard…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
          <div style={{ color: 'var(--red)', fontWeight: '600', marginBottom: '6px' }}>Connection Error</div>
          <div style={{ color: 'var(--text-2)', fontSize: '13px', marginBottom: '12px' }}>{error}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
            Make sure the backend is running: <span className="mono" style={{ color: 'var(--cyan)' }}>cd backend && npm run dev</span>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }} onClick={load}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const s = stats || {};

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Your pipeline at a glance</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 8A6 6 0 112 8"/>
            <path d="M14 2v6h-6"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard
          label="Total Leads"
          value={s.total || 0}
          color="cyan"
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
              <circle cx="18" cy="7" r="3"/><path d="M21 21v-2a3 3 0 00-2-2.83"/>
            </svg>
          }
        />
        <StatCard
          label="Called Today"
          value={s.calledToday || 0}
          color="purple"
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M5 4h3l1.5 3.5L8 9a11 11 0 004 4l1.5-1.5L17 13v3a1 1 0 01-1 1A15 15 0 014 4a1 1 0 011-1z"/>
            </svg>
          }
        />
        <StatCard
          label="Demos Booked"
          value={s.demosBooked || 0}
          color="green"
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              <path d="M9 16l2 2 4-4"/>
            </svg>
          }
        />
        <StatCard
          label="Conversion Rate"
          value={s.conversionRate || 0}
          suffix="%"
          decimals={1}
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
          }
        />
      </div>

      {/* Main grid */}
      <div className="dash-grid">
        {/* Left: Kanban */}
        <div>
          <div className="dash-section-title">Pipeline</div>
          <KanbanBoard leads={leads} />
        </div>

        {/* Right: Activity */}
        <div>
          <div className="dash-section-title">Recent Activity</div>
          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>Live Feed</span>
              <span className="pulse-dot" />
            </div>
            <div style={{ padding: '4px 18px', maxHeight: '520px', overflowY: 'auto' }}>
              <ActivityFeed items={s.recentActivity || []} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Status breakdown */}
      <div style={{ marginTop: '20px' }}>
        <div className="dash-section-title">Status Breakdown</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { key: 'new',         label: 'New',         color: 'var(--s-new)' },
            { key: 'called',      label: 'Called',       color: 'var(--s-called)' },
            { key: 'interested',  label: 'Interested',   color: 'var(--s-interested)' },
            { key: 'demo_booked', label: 'Demo Booked',  color: 'var(--s-demo)' },
            { key: 'closed',      label: 'Closed',       color: 'var(--s-closed)' },
            { key: 'dead',        label: 'Dead',         color: 'var(--s-dead)' },
          ].map(({ key, label, color }) => {
            const count = s.byStatus?.[key] || 0;
            const pct = s.total > 0 ? Math.round((count / s.total) * 100) : 0;
            return (
              <div key={key} className="card" style={{ flex: '1', minWidth: '120px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '700', fontFamily: 'var(--mono)', color }}>{count}</div>
                <div style={{ marginTop: '8px', height: '3px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 1s ease' }} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
