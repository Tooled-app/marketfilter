// Market Filter news ingestion — fetches financial RSS feeds, dedupes, stores to JSON
// Run hourly via cron. The Next.js site reads the output JSON.
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// site data dir (deployed to Vercel with the site) - marketfilter/site/data
const DATA_DIR = path.join(__dirname, '..', '..', 'site', 'data');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');
const META_FILE = path.join(DATA_DIR, 'news-meta.json');

// Financial news RSS sources (all verified working 2026-09-06)
const SOURCES = [
  { id: 'cnbc',        name: 'CNBC',            url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
  { id: 'bbc',         name: 'BBC Business',    url: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
  { id: 'investing',   name: 'Investing.com',   url: 'https://www.investing.com/rss/news.rss' },
  { id: 'marketwatch', name: 'MarketWatch',     url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories' },
  { id: 'guardian',    name: 'The Guardian',    url: 'https://www.theguardian.com/business/economics/rss' },
  { id: 'ft',          name: 'Financial Times', url: 'https://www.ft.com/rss/home' },
  { id: 'seekingalpha',name: 'Seeking Alpha',   url: 'https://seekingalpha.com/market_currents.xml' },
  { id: 'benzinga',    name: 'Benzinga',        url: 'https://www.benzinga.com/feed' },
  { id: 'yahoo',       name: 'Yahoo Finance',   url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC,^IXIC,^DJI&region=US&lang=en-US' },
];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MarketFilter/0.1';

async function fetchFeed(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

// Parse RSS/Atom XML into items (lightweight, no deps)
function parseFeed(xml, sourceId) {
  const items = [];
  // item blocks (RSS) or entry blocks (Atom)
  const itemRe = /<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const grab = (tag) => {
      const r = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(block);
      return r ? stripTags(r[1]).trim() : '';
    };
    const link = (() => {
      const l = /<link\b[^>]*href="([^"]+)"/i.exec(block);
      if (l) return l[1];
      const l2 = /<link\b[^>]*>([\s\S]*?)<\/link>/i.exec(block);
      return l2 ? l2[1].trim() : '';
    })();
    const title = grab('title');
    const desc = grab('description') || grab('summary');
    const pubDate = grab('pubDate') || grab('published') || grab('updated');
    if (!title) continue;
    items.push({ source: sourceId, title, desc, link, pubDate });
  }
  return items;
}

function stripTags(html) {
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export async function ingestNews() {
  const now = new Date().toISOString();
  const results = { fetched: 0, failed: 0, newItems: 0, total: 0, sources: [] };

  // Load existing
  let existing = [];
  if (fs.existsSync(NEWS_FILE)) {
    try { existing = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8')); } catch { existing = []; }
  }
  const seen = new Set(existing.map((i) => normalizeTitle(i.title)));

  const fresh = [];
  for (const src of SOURCES) {
    try {
      const xml = await fetchFeed(src.url);
      const items = parseFeed(xml, src.id);
      let added = 0;
      for (const it of items) {
        const key = normalizeTitle(it.title);
        if (seen.has(key)) continue;
        seen.add(key);
        fresh.push({ ...it, fetchedAt: now });
        added++;
      }
      results.fetched++;
      results.newItems += added;
      results.sources.push({ id: src.id, name: src.name, items: items.length, added });
      console.log(`  [${src.id}] ${items.length} items, ${added} new`);
    } catch (e) {
      results.failed++;
      results.sources.push({ id: src.id, name: src.name, items: 0, added: 0, error: e.message });
      console.log(`  [${src.id}] FAILED: ${e.message}`);
    }
    // be polite between feeds
    await new Promise((r) => setTimeout(r, 500));
  }

  // Merge: fresh first, then existing (dedupe by title), cap at 200
  const merged = [...fresh, ...existing];
  const byTitle = new Map();
  for (const it of merged) {
    const key = normalizeTitle(it.title);
    if (!byTitle.has(key)) byTitle.set(key, it);
  }
  const final = [...byTitle.values()].slice(0, 200);
  results.total = final.length;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(NEWS_FILE, JSON.stringify(final, null, 2));
  fs.writeFileSync(META_FILE, JSON.stringify({ lastRun: now, ...results }, null, 2));

  return results;
}

// CLI entry
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('Market Filter news ingestion - fetching financial RSS feeds...');
  ingestNews().then((r) => {
    console.log(`\nDone. ${r.fetched} sources OK, ${r.failed} failed, ${r.newItems} new items. Total: ${r.total}`);
  }).catch((e) => { console.error('Fatal:', e); process.exit(1); });
}
