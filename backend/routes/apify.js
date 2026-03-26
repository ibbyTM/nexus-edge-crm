import { Router } from 'express';
import ApifyClient from 'apify-client';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

function getClient(req) {
  const token = req.headers['x-apify-token'] || process.env.APIFY_TOKEN;
  if (!token) throw new Error('No Apify token configured. Add it in Settings.');
  return new ApifyClient({ token });
}

// GET /api/apify/actors
router.get('/actors', async (req, res) => {
  try {
    const client = getClient(req);
    const { items } = await client.actors().list({ limit: 50, my: true });
    res.json(items || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/apify/actors/:actorId/run
router.post('/actors/:actorId/run', async (req, res) => {
  try {
    const client = getClient(req);
    const run = await client.actor(req.params.actorId).start(req.body || {});
    res.json(run);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/apify/actors/:actorId/runs
router.get('/actors/:actorId/runs', async (req, res) => {
  try {
    const client = getClient(req);
    const { items } = await client.actor(req.params.actorId).runs().list({ limit: 10, desc: true });
    res.json(items || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/apify/actors/:actorId/last-run
router.get('/actors/:actorId/last-run', async (req, res) => {
  try {
    const client = getClient(req);
    const { items: runs } = await client.actor(req.params.actorId).runs().list({ limit: 1, desc: true });

    if (!runs || runs.length === 0) return res.json({ run: null, items: [] });

    const lastRun = runs[0];

    if (lastRun.status !== 'SUCCEEDED') return res.json({ run: lastRun, items: [] });

    const { items } = await client.dataset(lastRun.defaultDatasetId).listItems({ limit: 1000 });
    res.json({ run: lastRun, items: items || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
