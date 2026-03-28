import { useState, useEffect } from 'react';
import { api } from '../api';

function relTime(str) {
  if (!str) return '—';
  const diff = Date.now() - new Date(str).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(str).toLocaleDateString();
}

const GOOGLE_MAPS_ID = 'compass/crawler-google-places';

function ActorCard({ actor, onRun, onImport, importing }) {
  const isRunning = actor.stats?.lastRunStatus === 'RUNNING' ||
    (actor.lastRun && actor.lastRun.status === 'RUNNING');
  const isGoogleMaps = actor.id === GOOGLE_MAPS_ID;
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('United Kingdom');
  const [maxResults, setMaxResults] = useState(50);

  return (
    <div className={`actor-card ${isRunning ? 'actor-card-running' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
        <div>
          <div className="actor-name">{actor.name || actor.id}</div>
          <div className="actor-meta mono" style={{ fontSize: '11px', marginTop: '2px' }}>{actor.id}</div>
        </div>
        {isRunning && (
          <span style={{ fontSize: '10px', background: 'rgba(34,197,94,0.1)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '99px', padding: '2px 8px', white: 'nowrap', flexShrink: 0 }}>
            LIVE
          </span>
        )}
      </div>

      <div className="actor-status-row">
        {isRunning ? <span className="pulse-dot" /> : <span className="pulse-dot-idle" />}
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          {isRunning ? 'Running…' : 'Idle'}
        </span>
        {actor.stats?.lastRunStartedAt && !isRunning && (
          <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: 'auto' }}>
            Last run {relTime(actor.stats.lastRunStartedAt)}
          </span>
        )}
      </div>

      <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '12px', display: 'flex', gap: '12px' }}>
        <span>Runs: <strong style={{ color: 'var(--text-2)' }}>{actor.stats?.totalRuns ?? '—'}</strong></span>
        <span>Builds: <strong style={{ color: 'var(--text-2)' }}>{actor.stats?.totalBuilds ?? '—'}</strong></span>
      </div>

      {/* Search form for Google Maps Scraper */}
      {isGoogleMaps && showForm && (
        <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Search Term</label>
            <input
              className="input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. HVAC companies in London"
              autoFocus
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Location / Country</label>
            <input
              className="input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="United Kingdom"
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Max Results</label>
            <input
              className="input"
              type="number"
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              min={1} max={500}
              style={{ width: '100px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary btn-sm"
              disabled={!searchTerm.trim()}
              onClick={() => {
                const fullSearch = location.trim() ? `${searchTerm.trim()}, ${location.trim()}` : searchTerm.trim();
                onRun(actor.id, { searchStringsArray: [fullSearch], maxCrawledPlacesPerSearch: maxResults });
                setShowForm(false);
              }}
            >
              ▶ Start Run
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="actor-actions">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => isGoogleMaps ? setShowForm(f => !f) : onRun(actor.id, {})}
          disabled={isRunning}
          title={isGoogleMaps ? 'Configure search and run' : 'Trigger a new run with default input'}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="4,2 14,8 4,14"/>
          </svg>
          Run Actor
        </button>
        <button
          className="btn btn-cyan btn-sm"
          onClick={() => onImport(actor.id)}
          disabled={importing === actor.id}
          title="Import results from last successful run"
        >
          {importing === actor.id ? (
            <span className="spinner" style={{ width: '11px', height: '11px', borderWidth: '1.5px' }} />
          ) : (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 1v9M5 7l3 3 3-3"/>
              <path d="M2 12v2a1 1 0 001 1h10a1 1 0 001-1v-2"/>
            </svg>
          )}
          Import Leads
        </button>
      </div>
    </div>
  );
}

export default function Import() {
  const [actors,    setActors]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [importing, setImporting] = useState(null);
  const [results,   setResults]   = useState(null);
  const [runMsg,    setRunMsg]    = useState(null);

  const token = localStorage.getItem('apify_token');

  const loadActors = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.apify.actors();
      setActors(list || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) loadActors(); else setLoading(false); }, [token]);

  const handleRun = async (actorId, input = {}) => {
    setRunMsg(null);
    try {
      const run = await api.apify.run(actorId, input);
      setRunMsg({ type: 'success', text: `Run started (ID: ${run.id}). Status: ${run.status}` });
      setTimeout(loadActors, 3000);
    } catch (e) {
      setRunMsg({ type: 'error', text: e.message });
    }
  };

  const handleImport = async (actorId) => {
    setImporting(actorId);
    setResults(null);
    try {
      const { run, items } = await api.apify.lastRun(actorId);
      if (!run) {
        setResults({ type: 'error', msg: 'No successful run found for this actor.' });
        return;
      }
      if (run.status !== 'SUCCEEDED') {
        setResults({ type: 'error', msg: `Last run status is "${run.status}". Wait for it to succeed.` });
        return;
      }
      if (!items || items.length === 0) {
        setResults({ type: 'warn', msg: 'Last run returned 0 items.' });
        return;
      }
      const r = await api.leads.import(items);
      setResults({ type: 'success', ...r });
    } catch (e) {
      setResults({ type: 'error', msg: e.message });
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Import from Apify</div>
          <div className="page-sub">Run actors and import leads directly into your CRM</div>
        </div>
        {token && (
          <button className="btn btn-secondary btn-sm" onClick={loadActors} disabled={loading}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 8A6 6 0 112 8"/><path d="M14 2v6h-6"/>
            </svg>
            Refresh
          </button>
        )}
      </div>

      {/* No token */}
      {!token && (
        <div className="card" style={{ borderColor: 'rgba(108,99,255,0.3)', background: 'rgba(108,99,255,0.05)', maxWidth: '500px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '28px', lineHeight: 1 }}>🔑</div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '6px' }}>Apify token required</div>
              <div style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px' }}>
                Add your Apify API token in Settings to connect your actors.
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                Click the <strong>Apify Settings</strong> gear icon in the sidebar.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Run message */}
      {runMsg && (
        <div style={{
          background: runMsg.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${runMsg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: 'var(--radius)',
          padding: '10px 14px',
          fontSize: '13px',
          color: runMsg.type === 'success' ? 'var(--green)' : 'var(--red)',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {runMsg.text}
          <button className="btn btn-ghost btn-sm" onClick={() => setRunMsg(null)}>✕</button>
        </div>
      )}

      {/* Import results */}
      {results && (
        <div className="import-result" style={{
          marginBottom: '20px',
          borderColor: results.type === 'success' ? 'rgba(34,197,94,0.3)' : results.type === 'warn' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)',
          background: results.type === 'success' ? 'rgba(34,197,94,0.06)' : results.type === 'warn' ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)',
        }}>
          {results.type === 'success' ? (
            <>
              <div className="import-stat">
                <div className="import-stat-num text-green">{results.imported}</div>
                <div className="import-stat-label">Imported</div>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />
              <div className="import-stat">
                <div className="import-stat-num text-muted">{results.skipped}</div>
                <div className="import-stat-label">Skipped (dupes)</div>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />
              <div className="import-stat">
                <div className="import-stat-num text-2">{results.total}</div>
                <div className="import-stat-label">Total in Run</div>
              </div>
              <div style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: '13px', fontWeight: '500' }}>
                ✓ Import complete
              </div>
            </>
          ) : (
            <div style={{ color: results.type === 'warn' ? 'var(--yellow)' : 'var(--red)', fontSize: '13px' }}>
              {results.type === 'warn' ? '⚠️' : '❌'} {results.msg}
            </div>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => setResults(null)} style={{ marginLeft: 'auto' }}>✕</button>
        </div>
      )}

      {/* Supported actor info */}
      {token && (
        <div style={{
          background: 'rgba(0,212,255,0.05)',
          border: '1px solid rgba(0,212,255,0.15)',
          borderRadius: 'var(--radius)',
          padding: '10px 14px',
          fontSize: '12px',
          color: 'var(--muted)',
          marginBottom: '20px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}>
          <span style={{ color: 'var(--cyan)' }}>ℹ</span>
          <span>
            Optimised for <strong style={{ color: 'var(--cyan)' }}>apify/google-maps-scraper</strong>.
            Fields imported: title, phone, address, city, website, rating, reviewsCount.
          </span>
        </div>
      )}

      {/* Loading */}
      {token && loading && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '40px 0', color: 'var(--muted)' }}>
          <div className="spinner" />
          <span style={{ fontSize: '13px' }}>Loading actors…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)', marginBottom: '16px' }}>
          <div style={{ color: 'var(--red)', fontWeight: '600', marginBottom: '4px' }}>Failed to load actors</div>
          <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>{error}</div>
        </div>
      )}

      {/* Actor grid */}
      {!loading && actors.length > 0 && (
        <div className="actor-grid">
          {actors.map((actor) => (
            <ActorCard
              key={actor.id}
              actor={actor}
              onRun={handleRun}
              onImport={handleImport}
              importing={importing}
            />
          ))}
        </div>
      )}

      {/* No actors */}
      {token && !loading && !error && actors.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🤖</div>
          <div>No actors found</div>
          <div style={{ fontSize: '12px' }}>
            Create actors at <span className="mono text-cyan">console.apify.com</span>
          </div>
        </div>
      )}
    </div>
  );
}
