const OUTCOME_COLORS = {
  answered:       'var(--green)',
  no_answer:      'var(--muted)',
  callback:       'var(--yellow)',
  not_interested: 'var(--red)',
  status_change:  'var(--accent)',
};

const OUTCOME_LABELS = {
  answered:       'Answered',
  no_answer:      'No Answer',
  callback:       'Callback',
  not_interested: 'Not Interested',
  status_change:  'Status Change',
};

function relTime(str) {
  const diff = Date.now() - new Date(str).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(str).toLocaleDateString();
}

export default function ActivityFeed({ items = [] }) {
  if (items.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="empty-state-icon">📋</div>
        <div style={{ fontSize: '13px' }}>No activity yet</div>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      {items.map((item, i) => (
        <div key={item.id || i} className="activity-item" style={{ animationDelay: `${i * 0.03}s` }}>
          <div
            className="activity-dot"
            style={{ background: OUTCOME_COLORS[item.outcome] || 'var(--muted)' }}
          />
          <div className="activity-content">
            <div className="activity-company">{item.company_name}</div>
            <div className="activity-outcome">
              {OUTCOME_LABELS[item.outcome] || item.outcome}
              {item.notes && item.outcome !== 'status_change' && ` · ${item.notes}`}
              {item.outcome === 'status_change' && item.notes && (
                <span style={{ color: 'var(--accent)' }}> {item.notes}</span>
              )}
            </div>
          </div>
          <div className="activity-time">{relTime(item.created_at)}</div>
        </div>
      ))}
    </div>
  );
}
