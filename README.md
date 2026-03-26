# Nexus Edge CRM

A dark, high-performance cold call CRM for HVAC and plumbing businesses. Built with React, Node/Express, and SQLite.

## Stack

| Layer    | Tech                                |
|----------|-------------------------------------|
| Frontend | React 18 + Vite (port 3000)         |
| Backend  | Node/Express (port 3001)            |
| Database | SQLite via better-sqlite3           |
| Leads    | Apify client integration            |

## Quick Start

### 1. Clone / navigate

```bash
cd nexus-edge-crm
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Copy the environment file and add your Apify token (optional — you can also set it in the UI):

```bash
cp ../.env.example .env
# edit .env and add your APIFY_TOKEN if you have one
```

Seed the database with 5 sample HVAC/plumbing leads:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev     # development (with nodemon)
# or
npm start       # production
```

Backend runs on **http://localhost:3001**

### 3. Set up the frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:3000**

---

## Features

### Dashboard (`/`)
- Animated stat cards: Total Leads, Called Today, Demos Booked, Conversion Rate
- Pipeline Kanban grouped by status
- Live activity feed showing recent calls and status changes
- Status breakdown with progress bars

### Leads (`/leads`)
- Full sortable table with search, status, city, and industry filters
- Click any row to open a slide-out detail panel
- **Detail panel**: full info, call history, notes editor, status dropdown, click-to-call button
- Bulk select + bulk status update
- **"Call Next"** button — opens the next `new` lead automatically
- **Keyboard shortcuts**:
  - `Space` — mark the focused lead as Called
  - `Enter` — open the next lead
  - `Esc` — close the detail panel

### Import (`/import`)
- Lists all your Apify actors
- Animated green pulse on running actors
- **Run Actor** — triggers a new run with default input
- **Import Leads** — fetches results from the last successful run and imports them
- Handles Google Maps scraper format (title, phone, address, city, website, rating, reviewsCount)
- Duplicate detection by phone number

### Scripts (`/scripts`)
- Three call script variants: Pain-First, Curiosity Hook, Direct ROI
- Full Open → Bridge → Close structure
- Collapsible objection handles
- Copy script button

---

## Database Schema

### `leads`
| Column         | Type    | Notes                                         |
|----------------|---------|-----------------------------------------------|
| id             | INTEGER | Primary key                                   |
| company_name   | TEXT    | Required                                      |
| phone          | TEXT    |                                               |
| website        | TEXT    |                                               |
| city           | TEXT    |                                               |
| postcode       | TEXT    |                                               |
| industry       | TEXT    | Default: Unknown                              |
| status         | TEXT    | new / called / interested / demo_booked / closed / dead |
| source         | TEXT    | apify / manual                                |
| rating         | REAL    |                                               |
| review_count   | INTEGER |                                               |
| notes          | TEXT    |                                               |
| last_called_at | TEXT    | ISO datetime                                  |
| call_count     | INTEGER | Auto-increments on logged calls               |
| created_at     | TEXT    |                                               |
| updated_at     | TEXT    |                                               |

### `call_log`
| Column     | Type    | Notes                                                    |
|------------|---------|----------------------------------------------------------|
| id         | INTEGER | Primary key                                              |
| lead_id    | INTEGER | Foreign key → leads.id                                   |
| outcome    | TEXT    | answered / no_answer / callback / not_interested / status_change |
| notes      | TEXT    |                                                          |
| created_at | TEXT    | ISO datetime                                             |

---

## API Reference

| Method | Path                                | Description                     |
|--------|-------------------------------------|---------------------------------|
| GET    | `/api/leads`                        | List leads (with filters)       |
| POST   | `/api/leads`                        | Create lead                     |
| PATCH  | `/api/leads/:id`                    | Update lead (status, notes, etc)|
| DELETE | `/api/leads/:id`                    | Delete lead                     |
| GET    | `/api/leads/:id/calls`              | Call history for a lead         |
| POST   | `/api/leads/import`                 | Bulk import from Apify results  |
| PATCH  | `/api/leads/bulk`                   | Bulk status update              |
| GET    | `/api/apify/actors`                 | List Apify actors               |
| POST   | `/api/apify/actors/:id/run`         | Trigger an actor run            |
| GET    | `/api/apify/actors/:id/last-run`    | Get last run + dataset items    |
| GET    | `/api/stats`                        | Dashboard stats                 |

---

## Apify Setup

1. Sign up at [apify.com](https://apify.com)
2. Go to **Settings → Integrations** and copy your API token
3. Either:
   - Add `APIFY_TOKEN=your_token` to `backend/.env`, OR
   - Click the **Apify Settings** gear icon in the sidebar and paste it there

The recommended actor is **apify/google-maps-scraper**. Import maps directly to your leads table.

---

## Development Notes

- The database file is created at `backend/crm.db` on first run
- All status changes are automatically logged to `call_log`
- The Vite dev server proxies `/api` requests to `localhost:3001`
- Apify token stored in the browser's localStorage is sent via `x-apify-token` header
