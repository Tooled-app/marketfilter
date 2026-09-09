# 📈 Market Filter — Stocks & Markets News Site Proposal

**Status:** Draft for review | **Date:** 2026-09-06 | **Author:** Clawdette (C3) | **Note:** Rebranded from StockPulse 2026-09-08

---

## 1. Concept

**Market Filter** is an AI-assisted financial news site that mines **primary sources** (SEC filings, LSE RNS, Nasdaq, company announcements) and turns them into **original, defensible story angles** — not rewritten headlines.

The core value: instead of a journalist staring at 50 tabs, the system watches everything and surfaces *"here's what matters today, and here's the angle nobody's covering."*

## 2. Architecture (Option 2 — confirmed)

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

- **Engine runs on this PC** — Node v24, Ollama local, always-on, cron-scheduled
- **Public site on Vercel** — engine builds static pages and deploys via Vercel CLI (same flow as demystify)
- **No open ports** — engine pushes finished content, never exposes an API

## 3. The Pipeline

```
SOURCES → INGESTION → AI STORY ENGINE → EDITORIAL QUEUE → PUBLISH
  SEC      cron,      detect anomalies,   human (you)     Vercel push
  LSE      dedupe,    cross-reference,     reviews,        static pages
  Nasdaq   tag        generate angles,     approves
  press               score
```

## 4. Story Types

| Type | Source | Example Angle |
|------|--------|---------------|
| Earnings alerts | 10-Q/K, press | "X beat, but margins shrank — here's why" |
| Insider flags | Form 4 | "CEO sold $2M right before guidance cut" |
| Regulatory | 8-K | "X filed a surprise 8-K — what changed?" |
| Merger/IPO | S-1, S-4 | "X filed confidentially for IPO" |
| Sector moves | Nasdaq feeds | "Semis rallying — 3 stocks leading" |
| Economic data | Calendars | "CPI hot — rate cut odds shift" |
| Contrarian | Cross-referencing | "Everyone's bullish on X, but filings show..." |

## 5. Tech Stack (reuses what you have)

- **Backend:** Node.js v24 + SQLite (better-sqlite3) — already installed
- **AI:** Ollama local (already running) — no API costs
- **Scheduling:** existing cron system
- **Frontend:** Next.js (already used for demystify)
- **Hosting:** Vercel (already set up)
- **SEC data:** free public API, no key required

## 6. Monetization

- Display ads (AdSense/Mediavine) — needs traffic first
- Newsletter — reuse the dispatch pattern from demystify
- Premium tier — deeper analysis, watchlists, alerts
- Affiliate — broker signups (IBKR, Trading212)

## 7. MVP Scope (4-6 weeks)

- **Wk 1-2:** SEC EDGAR + LSE RNS + 3-5 press RSS → raw feed
- **Wk 3-4:** AI story engine → 5-10 story ideas/day with angles
- **Wk 5-6:** Editorial queue + publish flow + basic Next.js site
- **Launch gate:** AdSense integration + privacy policy + cookie consent (required for ad approval and EU/UK compliance)

**Out of scope for MVP:** insider-trading detection, sentiment scoring, premium tier, mobile app.

## 8. Key Decisions for You

1. **Originality vs aggregation** — I strongly recommend the "AI angles on public filings" route (defensible, original) over "rewriting press headlines" (thin, SEO-risky).
2. **Compliance** — financial content has disclosure rules. Clear disclaimer, no investment advice, cite every source.
3. **Data reliability** — SEC/LSE are authoritative; press scraping is fragile (paywalls, ToS). Need fallbacks.
4. **Speed** — financial news is time-sensitive. Pipeline must be fast.

## 9. What's Already Built (prototype)

- ✅ **SEC EDGAR ingestion working** — pulled 26 real filings across 6 companies in the last 7 days (NVDA 8-K, MSFT 8-K, insider Form 4s, etc.)
- ✅ **AI story-engine prompt** drafted (factual-only, no advice, scoring, cross-reference hooks)
- ✅ **Data schema** (filings / stories / published tables)
- ✅ **Source list + watchlist** defined
- ✅ **Design direction chosen** — **01 · The Terminal** (dark, monospace, Bloomberg-terminal aesthetic). Rejected 02-05 as too AI-ish or too close to demystify.

## 10. Next Steps

1. **You review this proposal** — confirm concept, name, scope
2. Build LSE RNS + press RSS ingestion
3. Wire the AI story engine to Ollama
4. Build the editorial queue + Vercel push flow
5. Stand up the Next.js public site (Design 01 · The Terminal)
6. **AdSense integration + privacy policy + cookie consent** (launch requirement)
7. Apply for AdSense once live with real content

---

*Not investment advice. For informational purposes only.*
