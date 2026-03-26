import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const total = db.prepare('SELECT COUNT(*) as n FROM leads').get().n;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const calledToday = db.prepare(
    "SELECT COUNT(*) as n FROM leads WHERE last_called_at >= ? AND status != 'new'"
  ).get(todayStart.toISOString()).n;

  const demosBooked = db.prepare("SELECT COUNT(*) as n FROM leads WHERE status = 'demo_booked'").get().n;
  const closed = db.prepare("SELECT COUNT(*) as n FROM leads WHERE status = 'closed'").get().n;
  const contacted = db.prepare("SELECT COUNT(*) as n FROM leads WHERE status != 'new'").get().n;
  const conversionRate = contacted > 0 ? +((closed / contacted) * 100).toFixed(1) : 0;

  const byStatus = db.prepare('SELECT status, COUNT(*) as n FROM leads GROUP BY status').all();

  const recentActivity = db.prepare(`
    SELECT cl.id, cl.lead_id, cl.outcome, cl.notes, cl.created_at, l.company_name
    FROM call_log cl
    JOIN leads l ON l.id = cl.lead_id
    ORDER BY cl.created_at DESC
    LIMIT 25
  `).all();

  res.json({
    total,
    calledToday,
    demosBooked,
    conversionRate,
    byStatus: Object.fromEntries(byStatus.map(r => [r.status, r.n])),
    recentActivity,
  });
});

export default router;
