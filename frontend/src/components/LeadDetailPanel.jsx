import { useState, useEffect } from 'react';
import { api } from '../api';

const STATUS_OPTIONS = [
  { value: 'new',         label: 'New' },
  { value: 'called',      label: 'Called' },
  { value: 'interested',  label: 'Interested' },
  { value: 'demo_booked', label: 'Demo Booked' },
  { value: 'closed',      label: 'Closed' },
  { value: 'dead',        label: 'Dead' },
];

const OUTCOME_OPTIONS = [
  { value: 'answered',       label: '✅ Answered' },
  { value: 'no_answer',      label: '📵 No Answer' },
  { value: 'callback',       label: '🔁 Callback Requested' },
  { value: 'not_interested', label: '❌ Not Interested' },
];

const OUTCOME_BADGE = {
  answered:       'closed',
  no_answer:      'new',
  callback:       'interested',
  not_interested: 'dead',
  status_change:  'called',
};

function relTime(str) {
  const diff = Date.now() - new Date(str).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(str).toLocaleDateString();
}

export default function LeadDetailPanel({ lead, onClose, onUpdate }) {
  const [calls, setCalls]       = useState([]);
  const [notes, setNotes]       = useState('');
  const [status, setStatus]     = useState('new');
  const [outcome, setOutcome]   = useState('answered');
  const [callNote, setCallNote] = useState('');
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (!lead) return;
    setNotes(lead.notes || '');
    setStatus(lead.status || 'new');
    setCalls([]);
    api.leads.calls(lead.id).then(setCalls).catch(() => {});
  }, [lead?.id]);

  if (!lead) return null;

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const updated = await api.leads.update(lead.id, { notes });
      onUpdate(updated);
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (val) => {
    setStatus(val);
    try {
      const updated = await api.leads.update(lead.id, { status: val });
      onUpdate(updated);
    } catch (e) {}
  };

  const handleLogCall = async () => {
    setSaving(true);
    try {
      const updated = await api.leads.update(lead.id, { outcome, call_notes: callNote });
      onUpdate(updated);
      setCallNote('');
      const fresh = await api.leads.calls(lead.id);
      setCalls(fresh);
    } finally { setSaving(false); }
  };

  return (
    <div className="panel-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="panel">
        {/* Header */}
        <div className="panel-header">
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)', marginBottom: '3px' }} className="truncate">
              {lead.company_name}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className={`badge badge-${lead.status}`}>{STATUS_OPTIONS.find(s => s.value === lead.status)?.label || lead.status}</span>
              {lead.city && <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{lead.city}</span>}
              {lead.industry && lead.industry !== 'Unknown' && (
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{lead.industry}</span>
              )}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2l12 12M14 2L2 14"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="panel-body">

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {lead.phone ? (
              <a href={`tel:${lead.phone}`} className="btn btn-primary btn-sm">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 1h3l1.5 3.5L6 6a10 10 0 004 4l1.5-1.5L15 10v3a1 1 0 01-1 1A13 13 0 012 2a1 1 0 011-1z"/>
                </svg>
                {lead.phone}
              </a>
            ) : (
              <span className="btn btn-secondary btn-sm" style={{ opacity: 0.4, cursor: 'default' }}>No phone</span>
            )}
            {lead.website && (
              <a
                href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="8" cy="8" r="6.5"/>
                  <path d="M1.5 8h13M8 1.5a9 9 0 010 13M8 1.5a9 9 0 000 13"/>
                </svg>
                Website
              </a>
            )}
          </div>

          {/* Status */}
          <div>
            <div className="panel-section-label">Status</div>
            <select className="input" value={status} onChange={(e) => handleStatusChange(e.target.value)}>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Info */}
          <div>
            <div className="panel-section-label">Lead Info</div>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              {[
                { k: 'Phone',       v: lead.phone || '—', mono: true },
                { k: 'City',        v: lead.city || '—' },
                { k: 'Postcode',    v: lead.postcode || '—' },
                { k: 'Industry',    v: lead.industry || '—' },
                { k: 'Rating',      v: lead.rating ? `⭐ ${lead.rating} (${lead.review_count ?? 0} reviews)` : '—' },
                { k: 'Calls Made',  v: lead.call_count || 0, mono: true, color: 'var(--cyan)' },
                { k: 'Last Called', v: lead.last_called_at ? new Date(lead.last_called_at).toLocaleString() : '—' },
                { k: 'Source',      v: <span className={`badge badge-${lead.source}`}>{lead.source}</span> },
              ].map(({ k, v, mono, color }) => (
                <div key={k} className="panel-info-row" style={{ padding: '7px 12px' }}>
                  <span className="panel-info-key">{k}</span>
                  <span className="panel-info-value" style={{ fontFamily: mono ? 'var(--mono)' : undefined, color: color || undefined }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="panel-section-label">Notes</div>
            <textarea
              className="input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this lead..."
              rows={4}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="btn btn-primary btn-sm" onClick={handleSaveNotes} disabled={saving}>
                {saving ? 'Saving…' : 'Save Notes'}
              </button>
            </div>
          </div>

          {/* Log Call */}
          <div>
            <div className="panel-section-label">Log a Call</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <select className="input" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
                {OUTCOME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button className="btn btn-cyan btn-sm" onClick={handleLogCall} disabled={saving} style={{ flexShrink: 0 }}>
                + Log
              </button>
            </div>
            <input
              className="input"
              value={callNote}
              onChange={(e) => setCallNote(e.target.value)}
              placeholder="Optional call notes…"
              onKeyDown={(e) => e.key === 'Enter' && handleLogCall()}
            />
          </div>

          {/* Call history */}
          <div>
            <div className="panel-section-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Call History</span>
              <span style={{ color: 'var(--accent)' }}>{calls.length}</span>
            </div>
            {calls.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--muted)', padding: '10px 0' }}>No calls logged yet.</div>
            ) : (
              <div className="call-history">
                {calls.map((call) => (
                  <div key={call.id} className="call-entry">
                    <div className="call-entry-row">
                      <span className={`badge badge-${OUTCOME_BADGE[call.outcome] || 'new'}`}>
                        {call.outcome?.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                        {relTime(call.created_at)}
                      </span>
                    </div>
                    {call.notes && <div className="call-entry-notes">{call.notes}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
