import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/leads
router.get('/', (req, res) => {
  const { status, city, industry, search, limit = 500, offset = 0 } = req.query;

  let query = 'SELECT * FROM leads WHERE 1=1';
  const params = [];

  if (status && status !== 'all') { query += ' AND status = ?'; params.push(status); }
  if (city && city !== 'all') { query += ' AND city = ?'; params.push(city); }
  if (industry && industry !== 'all') { query += ' AND industry = ?'; params.push(industry); }
  if (search) {
    query += ' AND (company_name LIKE ? OR phone LIKE ? OR city LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as cnt');
  const { cnt } = db.prepare(countQuery).get(...params);

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const leads = db.prepare(query).all(...params);
  res.json({ leads, total: cnt });
});

// POST /api/leads/import  — must come before /:id routes
router.post('/import', (req, res) => {
  const { leads: raw } = req.body;
  if (!Array.isArray(raw) || raw.length === 0)
    return res.status(400).json({ error: 'No leads provided' });

  let imported = 0;
  let skipped = 0;

  const checkDupe = db.prepare('SELECT id FROM leads WHERE phone = ? AND phone IS NOT NULL AND phone != ""');
  const stmt = db.prepare(`
    INSERT INTO leads (company_name, phone, website, city, industry, rating, review_count, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'apify')
  `);

  const run = db.transaction(() => {
    for (const item of raw) {
      // Map Google Maps scraper fields
      const name = item.title || item.company_name || item.name || '';
      if (!name) { skipped++; continue; }

      const phone = item.phone || item.phoneUnformatted || null;
      if (phone && checkDupe.get(phone)) { skipped++; continue; }

      let city = item.city || '';
      if (!city && item.address) {
        const parts = item.address.split(',');
        if (parts.length >= 2) city = parts[parts.length - 2].trim();
      }

      stmt.run(
        name,
        phone,
        item.website || item.url || null,
        city || null,
        item.categoryName || item.industry || 'Unknown',
        item.rating || item.totalScore || null,
        item.reviewsCount || item.review_count || null,
      );
      imported++;
    }
  });

  run();
  res.json({ imported, skipped, total: raw.length });
});

// PATCH /api/leads/bulk  — must come before /:id routes
router.patch('/bulk', (req, res) => {
  const { ids, status } = req.body;
  if (!Array.isArray(ids) || !status)
    return res.status(400).json({ error: 'ids array and status required' });

  const run = db.transaction(() => {
    for (const id of ids) {
      const lead = db.prepare('SELECT status FROM leads WHERE id = ?').get(id);
      if (!lead) continue;
      if (lead.status !== status) {
        db.prepare('UPDATE leads SET status = ?, updated_at = datetime("now") WHERE id = ?').run(status, id);
        db.prepare(`INSERT INTO call_log (lead_id, outcome, notes) VALUES (?, 'status_change', ?)`).run(
          id, `Bulk update: ${lead.status} → ${status}`
        );
      }
    }
  });

  run();
  res.json({ updated: ids.length });
});

// POST /api/leads
router.post('/', (req, res) => {
  const { company_name, phone, website, city, postcode, industry, notes, source = 'manual' } = req.body;
  if (!company_name) return res.status(400).json({ error: 'company_name is required' });

  const r = db.prepare(`
    INSERT INTO leads (company_name, phone, website, city, postcode, industry, notes, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(company_name, phone || null, website || null, city || null, postcode || null, industry || 'Unknown', notes || '', source);

  res.status(201).json(db.prepare('SELECT * FROM leads WHERE id = ?').get(r.lastInsertRowid));
});

// GET /api/leads/:id/calls  — specific path before /:id
router.get('/:id/calls', (req, res) => {
  const calls = db.prepare(
    'SELECT * FROM call_log WHERE lead_id = ? ORDER BY created_at DESC'
  ).all(req.params.id);
  res.json(calls);
});

// PATCH /api/leads/:id
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const allowed = ['company_name', 'phone', 'website', 'city', 'postcode', 'industry', 'status', 'notes', 'rating', 'review_count'];
  const sets = [];
  const vals = [];

  for (const f of allowed) {
    if (req.body[f] !== undefined) { sets.push(`${f} = ?`); vals.push(req.body[f]); }
  }

  // Status change → log it
  if (req.body.status && req.body.status !== lead.status) {
    const next = req.body.status;
    if (next === 'called' && lead.status === 'new') {
      sets.push('call_count = call_count + 1');
      sets.push('last_called_at = datetime("now")');
    }
    db.prepare(`INSERT INTO call_log (lead_id, outcome, notes) VALUES (?, 'status_change', ?)`).run(
      id, `Status: ${lead.status} → ${next}`
    );
  }

  // Explicit call outcome logging
  if (req.body.outcome) {
    db.prepare(`INSERT INTO call_log (lead_id, outcome, notes) VALUES (?, ?, ?)`).run(
      id, req.body.outcome, req.body.call_notes || ''
    );
    sets.push('call_count = call_count + 1');
    sets.push('last_called_at = datetime("now")');
  }

  if (sets.length === 0) return res.json(lead);

  sets.push('updated_at = datetime("now")');
  vals.push(id);
  db.prepare(`UPDATE leads SET ${sets.join(', ')} WHERE id = ?`).run(...vals);

  res.json(db.prepare('SELECT * FROM leads WHERE id = ?').get(id));
});

// DELETE /api/leads/:id
router.delete('/:id', (req, res) => {
  const r = db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Lead not found' });
  res.json({ success: true });
});

export default router;
