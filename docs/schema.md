# Market Filter — Data Schema & Source List

## SQLite Schema (engine DB, lives on this PC)

### `filings` — raw ingested events
```sql
CREATE TABLE filings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,            -- 'sec' | 'lse' | 'nasdaq' | 'press'
  source_ref TEXT NOT NULL,        -- SEC accession / LSE RNS number / URL
  ticker TEXT,
  company TEXT,
  form TEXT,                       -- 8-K, 10-Q, Form 4, etc.
  filed_at TEXT,                   -- ISO date
  items TEXT,                      -- SEC item numbers, comma-separated
  title TEXT,
  url TEXT,
  raw_json TEXT,                   -- full original payload
  ingested_at TEXT DEFAULT (datetime('now')),
  UNIQUE(source, source_ref)       -- dedupe
);
```

### `stories` — AI-generated story angles
```sql
CREATE TABLE stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filing_id INTEGER REFERENCES filings(id),
  headline TEXT,
  angle TEXT,
  body TEXT,
  signal TEXT,                     -- earnings|insider|regulatory|merger|ipo|dilution|guidance|sector-move|economic|other
  novelty INTEGER,                 -- 1-10
  impact INTEGER,                  -- 1-10
  confidence INTEGER,              -- 1-10
  score REAL,                      -- weighted (novelty+impact+confidence)/3
  status TEXT DEFAULT 'queued',    -- queued|approved|published|discarded
  created_at TEXT DEFAULT (datetime('now'))
);
```

### `published` — what's been pushed to Vercel
```sql
CREATE TABLE published (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id INTEGER REFERENCES stories(id),
  slug TEXT UNIQUE,
  url TEXT,
  deployed_at TEXT DEFAULT (datetime('now'))
);
```

## Source List

| # | Source | Type | Access | Priority |
|---|--------|------|--------|----------|
| 1 | **SEC EDGAR** | Filings (8-K, 10-Q, 10-K, S-1, Form 4) | Free API, no key | ⭐ Core |
| 2 | **LSE RNS** | UK regulatory announcements | Public feed | ⭐ Core |
| 3 | **Nasdaq** | Company announcements, market data | API / feeds | High |
| 4 | **Press RSS** | Reuters, CNBC, FT, Bloomberg | RSS (paywall risk) | Medium |
| 5 | **Earnings calendars** | Upcoming report dates | Free APIs | Medium |
| 6 | **Economic calendar** | CPI, jobs, Fed, rate decisions | Free APIs | Medium |

## Watchlist (start)

NVDA, AAPL, MSFT, GOOGL, AMZN, META, TSLA, JPM, BAC, XOM
→ Expand to ~50-100 liquid names, then sector ETFs, then UK LSE names.

## Scoring Formula

```
score = (novelty * 0.4) + (impact * 0.4) + (confidence * 0.2)
```
Surface to editorial queue when `score >= 5.0` AND `novelty >= 5` AND `impact >= 5` AND `confidence >= 6`.
