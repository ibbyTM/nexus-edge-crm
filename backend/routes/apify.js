import { Router } from 'express';
import { ApifyClient } from 'apify-client';
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
    // my: false so bookmarked/public actors like Google Maps Scraper show up
    const { items } = await client.actors().list({ limit: 50 });
    // Always ensure Google Maps Scraper is in the list
    const list = items || [];
    const hasGoogleMaps = list.some(a => a.id === 'compass/crawler-google-places');
    if (!hasGoogleMaps) {
      list.unshift({ id: 'compass/crawler-google-places', name: 'Google Maps Scraper', stats: {} });
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/apify/actors/*/run  (wildcard handles slashes in actor IDs like compass/crawler-google-places)
router.post('/actors/*/run', async (req, res) => {
  try {
    const client = getClient(req);
    const actorId = req.params[0];
    const run = await client.actor(actorId).start(req.body || {});
    res.json(run);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/apify/actors/*/runs
router.get('/actors/*/runs', async (req, res) => {
  try {
    const client = getClient(req);
    const actorId = req.params[0];
    const { items } = await client.actor(actorId).runs().list({ limit: 10, desc: true });
    res.json(items || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/apify/actors/*/last-run
router.get('/actors/*/last-run', async (req, res) => {
  try {
    const client = getClient(req);
    const actorId = req.params[0];
    const { items: runs } = await client.actor(actorId).runs().list({ limit: 1, desc: true });

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
