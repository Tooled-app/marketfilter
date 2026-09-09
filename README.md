# Market Filter — Stocks & Markets News Engine

AI-assisted financial news site. Mines SEC/LSE/press sources, generates original story angles, pushes finished pages to Vercel.

## Architecture (Option 2 — confirmed)

```
THIS PC (engine)                         VERCEL (public site)
┌──────────────────────────┐             ┌──────────────────┐
│ SEC EDGAR / LSE RNS /    │             │  Next.js site    │
│ press RSS feeds          │             │  reads static    │
│ → SQLite DB              │  push       │  content         │
│ → Ollama story engine    │ ─────────► │  (no open ports) │
│ → editorial queue        │             └──────────────────┘
└──────────────────────────┘
```

- **Engine runs on this PC** (Node v24, Ollama local, always-on, cron-scheduled)
- **Public site on Vercel** — engine builds static pages and deploys via Vercel CLI (same flow as demystify)
- **No open ports** — engine pushes finished content, never exposes an API

## Setup
- Site name: Market Filter
- Domain: marketfilter.biz — **purchased** (2026-09-08)
- Engine host: Windows PC (192.168.1.150)
- Public hosting: Vercel (planned)
- News sources: CNBC, BBC Business, Investing.com, MarketWatch, Guardian, FT, Seeking Alpha, Benzinga, Yahoo Finance
- SEC watchlist: NVDA, AAPL, MSFT, GOOGL, AMZN, META, TSLA, JPM, BAC, XOM
- News cadence: hourly
- Filings cadence: daily
- Design: 01 · The Terminal (dark, monospace, Bloomberg-style)
- Ad network: AdSense at launch (planned)
- AI story engine: yes (Ollama, prompt drafted)

## Status

- [x] SEC EDGAR ticker lookup (verified working — NVDA/AAPL/GOOGL confirmed)
- [x] SEC EDGAR recent filings ingestion (persists to data/filings.json)
- [x] News ingestion — 9 financial RSS sources, dedupes, persists to data/news.json
- [x] Design direction chosen — **01 · The Terminal** (dark, monospace, Bloomberg-terminal)
- [x] Advertising research (see `docs/advertising.md`) — AdSense at launch, then Ezoic → Mediavine → Raptive
- [x] **Next.js site built** (site/) — Design 01, live on port 4174
- [x] **Hourly news refresh cron** (id a4e42e20) — runs news ingestion every hour
- [x] **Daily SEC filings cron** (id ec4b6ada) — runs SEC ingestion daily 07:30
- [ ] LSE RNS ingestion
- [ ] Press RSS ingestion (news RSS already covers this)
- [ ] AI story engine (Ollama)
- [ ] Editorial queue
- [ ] Vercel push flow
- [ ] AdSense integration + privacy policy (launch requirement)

## Sources

| Source | Type | Status |
|--------|------|--------|
| SEC EDGAR | Filings (8-K, 10-Q, 10-K, Form 4) | In progress |
| LSE RNS | Regulatory announcements | Planned |
| Nasdaq feeds | Company announcements | Planned |
| Press RSS | Reuters, CNBC, etc. | Planned |

## Run

```powershell
# 1. Ingest news (hourly via cron, or manually)
node src/ingest/news.js

# 2. Ingest SEC filings (daily via cron, or manually)
node src/ingest/sec.js 7

# 3. Run the site (production, port 4174)
cd site
$env:PORT="4174"
.\node_modules\.bin\next.cmd start -H 0.0.0.0
```

## Site (Next.js)

- **Home** (`/`): hero, markets grid, breaking news, filings
- **News** (`/news`): full hourly-refreshed news feed
- **Filings** (`/filings`): SEC filings from the watchlist
- **About** (`/about`)

Data lives in `data/` (shared with the engine). The site reads it at request time (`force-dynamic`), so cron updates appear on the next page load.
