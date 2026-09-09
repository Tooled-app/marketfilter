# Market Filter — Project Source of Truth

> Single source of truth for this project. Updated as the project evolves.

## Quick Facts

| | |
|---|---|
| **Name** | Market Filter (rebranded from StockPulse, 2026-09-08) |
| **Type** | Web / API (Next.js site + Node ingestion engine) |
| **Stack** | Next.js 16 (App Router, TS, Tailwind 4), Node.js 24, SQLite (better-sqlite3), Ollama (planned) |
| **Location** | `C:\Users\Clawdette\.openclaw\workspace\stockpulse\` |
| **Entry point** | `site/` (Next.js) + `src/ingest/` (engine) |
| **Build/run** | see **Build & Run** below |

## What it is

A stocks & markets news site that mines primary sources (SEC filings, financial RSS) for original, sourced stories. The differentiator: it reads the paperwork (8-Ks, Form 4s, 10-Qs) and surfaces angles the press misses — plus an hourly-refreshed news feed to catch breaking news.

**Audience:** retail investors / market watchers who want the story behind the filings.

## Architecture

```
ENGINE (this PC, always-on)          PUBLIC SITE (Vercel, planned)
┌──────────────────────────┐          ┌──────────────────┐
│ SEC EDGAR / financial RSS │          │  Next.js site    │
│ → data/*.json             │  push    │  reads static    │
│ → Ollama story engine     │ ───────► │  (no open ports) │
│ → editorial queue          │          └──────────────────┘
└──────────────────────────┘
```

- **Engine runs on this PC** (192.168.1.150) — Node.js + local Ollama, cron-scheduled
- **Public site on Vercel** (planned) — engine builds static pages, pushes via Vercel CLI
- **No open ports** — engine pushes finished content, never exposes an API
- **Data in `data/*.json`** — shared between engine and site; site reads at request time (`force-dynamic`), so cron updates appear on next page load

## Structure

```
stockpulse/
  data/            # shared JSON: news.json, filings.json, sec-tickers.json, news-meta.json
  src/
    ingest/
      news.js      # RSS aggregation (hourly) — 9 financial sources
      sec.js       # SEC EDGAR filings (daily) — watchlist
    engine/
      story-prompt.md  # AI story-generation prompt (drafted, not wired)
    dev-server.js  # LAN preview server (port 4173)
  site/            # Next.js frontend (port 4174)
    app/           # /, /news, /filings, /about + sitemap.ts + robots.ts
    components/    # Header, Footer
    lib/data.ts    # reads data/*.json
  docs/            # schema.md, advertising.md
  designs/         # 5 HTML design mockups (chose 01-terminal.html)
```

## Build & Run

```powershell
# 1. Ingest news (hourly via cron, or manually)
node src/ingest/news.js

# 2. Ingest SEC filings (daily via cron, or manually)
node src/ingest/sec.js 7

# 3. Run the site (production, port 4174)
cd site
$env:PORT="4174"
.\node_modules\.bin\next.cmd start -H 0.0.0.0

# Build
cd site
.\node_modules\.bin\next.cmd build
```

**Ports:** site = 4174, dev preview = 4173. **LAN:** 192.168.1.150 (Mac previews at `http://192.168.1.150:4174`).

## Endpoints / Pages

| Route | Purpose |
|-------|---------|
| `/` | Home — hero, markets grid, breaking news, filings |
| `/news` | Full hourly-refreshed news feed |
| `/filings` | SEC filings from the watchlist |
| `/about` | What the site is |
| `/sitemap.xml` | SEO sitemap |
| `/robots.txt` | SEO robots |

## Data Sources

- **News (9 RSS):** CNBC, BBC Business, Investing.com, MarketWatch, The Guardian, FT, Seeking Alpha, Benzinga, Yahoo Finance
- **SEC EDGAR:** free API, no key, descriptive User-Agent required, ~10 req/sec limit
- **Watchlist:** NVDA, AAPL, MSFT, GOOGL, AMZN, META, TSLA, JPM, BAC, XOM

## Crons

| Job | Schedule | ID |
|-----|----------|-----|
| Hourly news refresh | top of every hour (Europe/London) | `a4e42e20` |
| Daily SEC filings | 07:30 daily | `ec4b6ada` |

## Key Decisions & Gotchas

- **Design:** 01 · The Terminal (dark, monospace, Bloomberg-style). Rejected 02-05 as too AI-ish or too close to demystify.
- **Domain:** marketfilter.biz — **purchased 2026-09-08**. Rebranded from StockPulse.
- **Deploy:** Vercel project `marketfilter` created + deployed (live at `marketfilter-4n0j2jqmr-colin-maxwells-projects.vercel.app`). Domain attached but **DNS not configured**.
- **DNS blocker:** GoDaddy bot-detection blocks automated browser login ("Your browser is a bit unusual" challenge persists). GoDaddy API needs key/secret (not just login). Manual A record needed: `@ → 76.76.21.21` (+ `www`). Colin has GoDaddy creds (customer# 699756251).
- **Ads:** AdSense at launch, then Ezoic → Mediavine → Raptive ladder. Finance is high-CPM. See `docs/advertising.md`.
- **SEO:** baked in — metadata, JSON-LD (WebSite + NewsArticle), sitemap, robots, semantic HTML.
- **Use `node_modules/.bin/next.cmd`** not `npx next` (network flaky).
- **Type market arrays** as `[string, number, number][]` or `.toFixed()` fails TS.
- **Set `turbopack.root`** in next.config.ts (multiple lockfiles in workspace).
- **Data dir:** `__dirname` in `src/ingest/` → use `"..", "..", "data"` to reach root `data/`.
- **Windows firewall:** Node.js needs inbound Allow on Private profile for LAN preview.
- **Market prices in the grid are static demo values** — real-time quotes need a data API (not yet wired).

## Status

**Live (LAN):** site running on port 4174, 164 real news items, 26 SEC filings, two crons active.
**Live (Vercel):** `marketfilter.vercel.app` returns 200. Custom domain `marketfilter.biz` returns 404 (DNS not connected).
**Version control:** local git repo initialized + committed (2026-09-09). GitHub push + Vercel link pending token permission.

**Done:**
- SEC EDGAR ingestion (ticker map + filings → data/filings.json)
- News ingestion (9 RSS sources → data/news.json, hourly)
- Next.js site (Design 01 · The Terminal) with SEO
- Two crons (hourly news, daily filings)
- Skill distilled: `news-site-autopilot` (vanilla, applied)

**Planned / not yet built:**
- LSE RNS ingestion
- AI story engine wired to Ollama (prompt drafted)
- Editorial queue
- Vercel push flow (deploy)
- AdSense integration + privacy policy + cookie consent
- Real-time market data API
- Domain purchase (marketfilter.biz) — **DONE 2026-09-08**

## Changelog

### 2026-09-09 — Version control + repo hygiene
- **Renamed** production folder `site-rebuild/site-rebuild` → `demystify/` (workspace root) to remove the confusing "site-rebuild" misnomer. Git + Vercel linkage intact, live site unaffected.
- **Initialized git** in `stockpulse/` (the marketfilter source): committed 52 files on `main`, clean `.gitignore` (excludes node_modules, .next, .vercel, .env). Commit author `Tooled-app <tooled.app@gmail.com>`.
- **GitHub account email:** `tooled.app@gmail.com` (NOT signinguptononsense@gmail.com). Username `Tooled-app`.
- **Vercel:** marketfilter live at `marketfilter.vercel.app` (200). Custom domain `marketfilter.biz` returns 404 — DNS not connected yet.
- **Blockers:** (1) GitHub PAT in `iCloudDrive/github access token.rtf` — fine-grained token, needs repo-create permission (Administration R/W) and may have rotated after permission edit; old value in file returns 401. (2) Vercel token in `details.txt` is deploy-only (403 on account API).
- **Network note:** this PC is on a Three mobile hotspot (`Three_3455`, Public profile). Mac/iPhone on same LAN (192.168.1.x) can ping the PC but not reach port 4174 — likely hotspot client isolation. Site confirmed working locally (200).

### 2026-09-06 — Initial build
- SEC EDGAR ingestion (`src/ingest/sec.js`) — ticker map + filings
- News ingestion (`src/ingest/news.js`) — 9 RSS sources, dedupe, hourly
- Next.js site (`site/`) — Design 01 · The Terminal, 4 pages + SEO
- Two crons (hourly news `a4e42e20`, daily filings `ec4b6ada`)
- 5 design mockups (`designs/`), chose 01-terminal
- Advertising research (`docs/advertising.md`)
- Skill distilled: `news-site-autopilot` (vanilla, applied, SEO baked in)

### 2026-09-06 — Anti-plagiarism + attribution
- Added explicit "Via [source]" attribution link to every news item (home + /news)
- Added aggregation disclosure note ("Headlines aggregated from cited sources, no full articles reproduced")
- Added `/method` page documenting sourcing/attribution approach
- Added `/sources` page listing all aggregation sources
- Updated sitemap with /method + /sources
- Hardened story-engine prompt: explicit NO PLAGIARISM rule, attribution requirement (original analysis vs cited facts)

### 2026-09-08 — Rebrand: StockPulse → Market Filter
- Purchased **marketfilter.biz**; rebranded site + engine from StockPulse to Market Filter
- Updated all branding: layout metadata, header logo, footer, homepage JSON-LD + hero, about/method/sources/stories/filings pages, robots, sitemap
- Domain switched stockpulse.biz → marketfilter.biz across metadata, JSON-LD, sitemap, robots
- Updated engine files (dev-server, ingest scripts, story prompt), docs, README, design mockups
- **Deployed to Vercel** (project `marketfilter`), live at `marketfilter-4n0j2jqmr-colin-maxwells-projects.vercel.app`; domain marketfilter.biz attached to project
- **BLOCKED:** DNS not configured — needs GoDaddy A record `@ → 76.76.21.21` (or nameservers → ns1/ns2.vercel-dns.com). No GoDaddy creds available.

## Notes from Colin (testing log)

> Add every note here so nothing is lost. Mark resolved items when fixed.

- **2026-09-06:** StockPulse name is "ok but not stellar" — wants a better name, domain must be available. — status: ✅ resolved (rebranded to **Market Filter**, marketfilter.biz purchased 2026-09-08)
- **2026-09-06:** Buy stockpulse.biz (£1.99/yr first year) on Tuesday. — status: ✅ superseded (bought **marketfilter.biz** instead, 2026-09-08)
- **2026-09-06:** Skill must be vanilla (any topic), not StockPulse-specific. — status: ✅ fixed (renamed to news-site-autopilot)
- **2026-09-06:** SEO must be baked into both skill and site. — status: ✅ fixed (site live, skill updated)
- **2026-09-06:** Site must not plagiarise and must attribute sources. — status: ✅ fixed (Via links, disclosure, /method, /sources, hardened story prompt)
- **2026-09-09:** Wants proper version control for marketfilter (avoid demystify-style disaster where no repo meant rebuild from scratch). — status: 🔄 in progress (local git done; GitHub push + Vercel link pending PAT permission)
- **2026-09-09:** Confusing folder naming — wants a dev folder and a production folder, straightforward. — status: 🔄 in progress (production renamed to `demystify/`; dev copy not yet created)
