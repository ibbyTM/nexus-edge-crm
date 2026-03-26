import { initDb } from './db.js';
import db from './db.js';

initDb();

const leads = [
  {
    company_name: 'Arctic Air HVAC Solutions',
    phone: '(555) 234-7890',
    website: 'arcticairhvac.com',
    city: 'Denver',
    postcode: '80203',
    industry: 'HVAC',
    status: 'new',
    source: 'manual',
    rating: 4.8,
    review_count: 312,
    notes: "Owner is Mike. Best time to call is 8–10am. Asked about commercial contracts last year.",
    call_count: 0,
    last_called_at: null,
  },
  {
    company_name: 'Precision Plumbing Co.',
    phone: '(555) 891-2345',
    website: 'precisionplumbingco.com',
    city: 'Austin',
    postcode: '73301',
    industry: 'Plumbing',
    status: 'called',
    source: 'manual',
    rating: 4.5,
    review_count: 198,
    notes: 'Left voicemail. Follow up Thursday morning.',
    call_count: 1,
    last_called_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    company_name: 'CoolBreeze Climate Control',
    phone: '(555) 678-4321',
    website: 'coolbreezeclimate.com',
    city: 'Phoenix',
    postcode: '85001',
    industry: 'HVAC',
    status: 'interested',
    source: 'manual',
    rating: 4.9,
    review_count: 541,
    notes: 'Spoke with Sarah (ops manager). Very interested. Wants to see ROI numbers. Suggested a demo next Tuesday.',
    call_count: 2,
    last_called_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    company_name: 'FlowRight Plumbing & Drain',
    phone: '(555) 345-6789',
    website: 'flowrightplumbing.com',
    city: 'Seattle',
    postcode: '98101',
    industry: 'Plumbing',
    status: 'demo_booked',
    source: 'apify',
    rating: 4.7,
    review_count: 87,
    notes: 'Demo booked for Friday 2pm PST. Decision maker is Tom Briggs (owner). He wants to see the dashboard live.',
    call_count: 3,
    last_called_at: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    company_name: 'ThermoTech HVAC Services',
    phone: '(555) 456-7890',
    website: 'thermotechhvac.com',
    city: 'Miami',
    postcode: '33101',
    industry: 'HVAC',
    status: 'new',
    source: 'apify',
    rating: 4.3,
    review_count: 156,
    notes: '',
    call_count: 0,
    last_called_at: null,
  },
];

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO leads
    (company_name, phone, website, city, postcode, industry, status, source, rating, review_count, notes, call_count, last_called_at)
  VALUES
    (@company_name, @phone, @website, @city, @postcode, @industry, @status, @source, @rating, @review_count, @notes, @call_count, @last_called_at)
`);

const insertAll = db.transaction((items) => {
  for (const item of items) insertStmt.run(item);
});

insertAll(leads);

// Seed call log entries for the non-new leads
const seededLeads = db.prepare("SELECT id, status FROM leads WHERE status != 'new'").all();
const logStmt = db.prepare(`INSERT INTO call_log (lead_id, outcome, notes, created_at) VALUES (?, ?, ?, ?)`);

const seedLogs = db.transaction(() => {
  for (const lead of seededLeads) {
    if (lead.status === 'called') {
      logStmt.run(lead.id, 'no_answer', 'First attempt — left voicemail', new Date(Date.now() - 86400000).toISOString());
    }
    if (lead.status === 'interested') {
      logStmt.run(lead.id, 'no_answer', 'First attempt', new Date(Date.now() - 300000000).toISOString());
      logStmt.run(lead.id, 'answered', 'Spoke with Sarah. Showed interest.', new Date(Date.now() - 172800000).toISOString());
    }
    if (lead.status === 'demo_booked') {
      logStmt.run(lead.id, 'no_answer', 'Cold call attempt', new Date(Date.now() - 500000000).toISOString());
      logStmt.run(lead.id, 'answered', 'Good conversation. Agreed to a demo.', new Date(Date.now() - 200000000).toISOString());
      logStmt.run(lead.id, 'callback', 'Confirmed demo time. Friday 2pm PST.', new Date(Date.now() - 43200000).toISOString());
    }
  }
});

seedLogs();

console.log(`\n  ✅  Seeded ${leads.length} leads with call history\n`);
process.exit(0);
