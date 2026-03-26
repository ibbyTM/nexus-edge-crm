import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import LeadDetailPanel from '../components/LeadDetailPanel';

const STATUS_OPTIONS = ['all', 'new', 'called', 'interested', 'demo_booked', 'closed', 'dead'];
const STATUS_LABELS  = { all: 'All Statuses', new: 'New', called: 'Called', interested: 'Interested', demo_booked: 'Demo Booked', closed: 'Closed', dead: 'Dead' };

function fmt(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
}

export default function Leads() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [leads, setLeads]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(new Set());
  const [activeLead, setActiveLead] = useState(null);
  const [activeIdx, setActiveIdx]   = useState(-1);

  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState(searchParams.get('status') || 'all');
  const [city,     setCity]     = useState('all');
  const [industry, setIndustry] = useState('all');

  const searchTimer = useRef(null);

  const load = useCallback(async (override = {}) => {
    setLoading(true);
    try {
      const p = {
        ...(search   && { search }),
        ...(status   !== 'all' && { status }),
        ...(city     !== 'all' && { city }),
        ...(industry !== 'all' && { industry }),
        ...override,
      };
      const { leads: l, total: t } = await api.leads.list(p);
      setLeads(l || []);
      setTotal(t || 0);

      // Auto-highlight a lead if navigated here with ?highlight=
      const highlight = searchParams.get('highlight');
      if (highlight) {
        const idx = (l || []).findIndex(x => x.id === parseInt(highlight));
        if (idx >= 0) { setActiveLead(l[idx]); setActiveIdx(idx); }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, status, city, industry, searchParams]);

  useEffect(() => { load(); }, [status, city, industry]);
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(), 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === ' ' && activeIdx >= 0) {
        e.preventDefault();
        handleQuickCall(leads[activeIdx]);
      }
      if (e.key === 'Enter' && activeIdx >= 0) {
        e.preventDefault();
        const next = leads[activeIdx + 1];
        if (next) { setActiveLead(next); setActiveIdx(activeIdx + 1); }
      }
      if (e.key === 'Escape') { setActiveLead(null); setActiveIdx(-1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeIdx, leads]);

  const handleQuickCall = async (lead) => {
    if (!lead) return;
    try {
      const updated = await api.leads.update(lead.id, { status: 'called' });
      setLeads(ls => ls.map(l => l.id === updated.id ? updated : l));
      if (activeLead?.id === lead.id) setActiveLead(updated);
    } catch (e) {}
  };

  const handleCallNext = () => {
    const next = leads.find(l => l.status === 'new');
    if (next) {
      const idx = leads.indexOf(next);
      setActiveLead(next);
      setActiveIdx(idx);
    }
  };

  const handleLeadUpdate = (updated) => {
    setLeads(ls => ls.map(l => l.id === updated.id ? updated : l));
    setActiveLead(updated);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    await api.leads.delete(id);
    setLeads(ls => ls.filter(l => l.id !== id));
    if (activeLead?.id === id) { setActiveLead(null); setActiveIdx(-1); }
  };

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === leads.length) setSelected(new Set());
    else setSelected(new Set(leads.map(l => l.id)));
  };

  const handleBulkStatus = async (newStatus) => {
    if (!newStatus || selected.size === 0) return;
    try {
      await api.leads.bulkUpdate([...selected], newStatus);
      setSelected(new Set());
      await load();
    } catch (e) {}
  };

  // Extract filter options
  const cities      = [...new Set(leads.map(l => l.city).filter(Boolean))].sort();
  const industries  = [...new Set(leads.map(l => l.industry).filter(Boolean))].sort();
  const newCount    = leads.filter(l => l.status === 'new').length;

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div className="page-header" style={{ flexShrink: 0 }}>
        <div>
          <div className="page-title">Leads</div>
          <div className="page-sub">{total} total{selected.size > 0 && ` · ${selected.size} selected`}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {newCount > 0 && (
            <button className="btn btn-cyan" onClick={handleCallNext}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 1h3l1.5 3.5L6 6a10 10 0 004 4l1.5-1.5L15 10v3a1 1 0 01-1 1A13 13 0 012 2a1 1 0 011-1z"/>
              </svg>
              Call Next <span className="chip" style={{ marginLeft: '2px' }}>{newCount}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ flexShrink: 0 }}>
        <input
          className="input search-input"
          placeholder="Search company, phone, city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" style={{ width: 'auto' }} value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select className="input" style={{ width: 'auto' }} value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" style={{ width: 'auto' }} value={industry} onChange={(e) => setIndustry(e.target.value)}>
          <option value="all">All Industries</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>

        {selected.size > 0 && (
          <>
            <div style={{ height: '24px', width: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{selected.size} selected:</span>
            {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
              <button key={s} className="btn btn-secondary btn-sm" onClick={() => handleBulkStatus(s)}>
                → {STATUS_LABELS[s]}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Keyboard hint */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexShrink: 0 }}>
        <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span className="kbd">Space</span> Mark called
        </span>
        <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span className="kbd">Enter</span> Next lead
        </span>
        <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span className="kbd">Esc</span> Close panel
        </span>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner" />
          </div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div>No leads found</div>
            <div style={{ fontSize: '12px' }}>Try adjusting your filters or import leads from Apify.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '36px' }}>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selected.size === leads.length && leads.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Company</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Industry</th>
                    <th>Status</th>
                    <th>Calls</th>
                    <th>Last Called</th>
                    <th>Rating</th>
                    <th style={{ width: '80px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, idx) => (
                    <tr
                      key={lead.id}
                      onClick={() => { setActiveLead(lead); setActiveIdx(idx); }}
                      className={`${selected.has(lead.id) ? 'row-selected' : ''} ${activeLead?.id === lead.id ? 'row-active' : ''}`}
                    >
                      <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={selected.has(lead.id)}
                          onChange={(e) => toggleSelect(lead.id, e)}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: '500', maxWidth: '200px' }} className="truncate">{lead.company_name}</div>
                        {lead.website && (
                          <div className="truncate" style={{ fontSize: '11px', color: 'var(--muted)', maxWidth: '200px' }}>
                            {lead.website.replace(/^https?:\/\//, '')}
                          </div>
                        )}
                      </td>
                      <td>
                        {lead.phone ? (
                          <a
                            href={`tel:${lead.phone}`}
                            className="mono text-cyan"
                            style={{ fontSize: '12px' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {lead.phone}
                          </a>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td style={{ color: 'var(--text-2)' }}>{lead.city || '—'}</td>
                      <td style={{ color: 'var(--text-2)' }}>{lead.industry || '—'}</td>
                      <td><span className={`badge badge-${lead.status}`}>{STATUS_LABELS[lead.status] || lead.status}</span></td>
                      <td>
                        <span className="mono" style={{ fontSize: '13px', color: lead.call_count > 0 ? 'var(--cyan)' : 'var(--muted)' }}>
                          {lead.call_count || 0}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{fmt(lead.last_called_at)}</td>
                      <td>
                        {lead.rating ? (
                          <span style={{ fontSize: '12px', color: 'var(--yellow)' }}>
                            ★ {lead.rating}
                          </span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            title="Mark as Called (Space)"
                            onClick={() => handleQuickCall(lead)}
                            style={{ padding: '4px 6px' }}
                          >
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M3 1h3l1.5 3.5L6 6a10 10 0 004 4l1.5-1.5L15 10v3a1 1 0 01-1 1A13 13 0 012 2a1 1 0 011-1z"/>
                            </svg>
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            title="Delete"
                            onClick={() => handleDelete(lead.id)}
                            style={{ padding: '4px 6px', color: 'var(--red)' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5L11 4"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Lead detail panel */}
      {activeLead && (
        <LeadDetailPanel
          lead={activeLead}
          onClose={() => { setActiveLead(null); setActiveIdx(-1); }}
          onUpdate={handleLeadUpdate}
        />
      )}
    </div>
  );
}
