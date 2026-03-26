import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db.js';
import leadsRouter from './routes/leads.js';
import apifyRouter from './routes/apify.js';
import statsRouter from './routes/stats.js';

dotenv.config();

const app = express();

app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], credentials: true }));
app.use(express.json({ limit: '50mb' }));

initDb();

app.use('/api/leads', leadsRouter);
app.use('/api/apify', apifyRouter);
app.use('/api/stats', statsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║        NEXUS EDGE CRM — API          ║
  ║   Listening on http://localhost:${PORT}  ║
  ╚══════════════════════════════════════╝
  `);
});
