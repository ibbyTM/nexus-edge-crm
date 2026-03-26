const BASE = '/api';

function headers() {
  const token = localStorage.getItem('apify_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'x-apify-token': token } : {}),
  };
}

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, { ...opts, headers: { ...headers(), ...opts.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  stats: () => req('/stats'),

  leads: {
    list:        (p = {}) => req(`/leads?${new URLSearchParams(p)}`),
    create:      (d)      => req('/leads', { method: 'POST', body: JSON.stringify(d) }),
    update:      (id, d)  => req(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(d) }),
    delete:      (id)     => req(`/leads/${id}`, { method: 'DELETE' }),
    calls:       (id)     => req(`/leads/${id}/calls`),
    import:      (leads)  => req('/leads/import', { method: 'POST', body: JSON.stringify({ leads }) }),
    bulkUpdate:  (ids, status) => req('/leads/bulk', { method: 'PATCH', body: JSON.stringify({ ids, status }) }),
  },

  apify: {
    actors:   ()           => req('/apify/actors'),
    run:      (id, input)  => req(`/apify/actors/${id}/run`, { method: 'POST', body: JSON.stringify(input || {}) }),
    lastRun:  (id)         => req(`/apify/actors/${id}/last-run`),
    runs:     (id)         => req(`/apify/actors/${id}/runs`),
  },
};
