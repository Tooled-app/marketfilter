// SEC EDGAR ingestion
// Uses SEC's free public API. Requires a descriptive User-Agent (SEC policy).
// Docs: https://www.sec.gov/edgar/sec-api-documentation

import https from 'node:https';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// site data dir (deployed to Vercel with the site) - marketfilter/site/data
const DATA_DIR = path.join(__dirname, '..', '..', 'site', 'data');
const CACHE_FILE = path.join(DATA_DIR, 'sec-tickers.json');
const FILINGS_FILE = path.join(DATA_DIR, 'filings.json');

const USER_AGENT = 'MarketFilter research contact@example.com';

// Watchlist — start with liquid, high-coverage names. Expand later.
const WATCHLIST = ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'JPM', 'BAC', 'XOM'];

// Filing types that matter for story generation
const INTERESTING_FORMS = new Set([
  '8-K',    // material events
  '10-Q',   // quarterly
  '10-K',   // annual
  'S-1',    // IPO
  'S-4',    // merger
  'SC 13D', // activist stake
  'SC 13G', // passive stake
  '4',      // insider trading
  '3',      // insider holding
  '144',    // proposed sale
  'DEF 14A',// proxy
]);

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Bad JSON from ${url}: ${e.message}`)); }
      });
    });
    req.on('error', reject);
  });
}

// Fetch the full ticker map once, cache it
async function getTickerMap() {
  if (fs.existsSync(CACHE_FILE)) {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  }
  const data = await httpsGet('https://www.sec.gov/files/company_tickers.json');
  const map = {};
  for (const entry of Object.values(data)) {
    map[entry.ticker] = { cik: String(entry.cik_str).padStart(10, '0'), title: entry.title };
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(map));
  return map;
}

// Fetch recent submissions for a CIK
async function getSubmissions(cik) {
  const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
  const data = await httpsGet(url);
  const recent = data.filings?.recent;
  if (!recent) return [];
  const out = [];
  for (let i = 0; i < recent.form.length; i++) {
    out.push({
      form: recent.form[i],
      filed: recent.filingDate[i],
      accession: recent.accessionNumber[i],
      primaryDoc: recent.primaryDocument[i],
      reportDate: recent.reportDate?.[i] ?? null,
      items: recent.items?.[i] ?? null,
    });
  }
  return out;
}

// Filter to interesting forms within N days
function filterInteresting(filings, days = 7) {
  const cutoff = Date.now() - days * 86400000;
  return filings.filter((f) => {
    if (!INTERESTING_FORMS.has(f.form)) return false;
    const t = new Date(f.filed).getTime();
    return t >= cutoff;
  });
}

export async function ingestSec({ days = 7, watchlist = WATCHLIST } = {}) {
  const tickerMap = await getTickerMap();
  const results = [];
  for (const ticker of watchlist) {
    const info = tickerMap[ticker];
    if (!info) { console.log(`  [skip] ${ticker} not in SEC map`); continue; }
    try {
      const filings = await getSubmissions(info.cik);
      const interesting = filterInteresting(filings, days);
      if (interesting.length) {
        console.log(`  ${ticker} (${info.title}): ${interesting.length} interesting filing(s)`);
        results.push({ ticker, title: info.title, cik: info.cik, filings: interesting });
      }
    } catch (e) {
      console.log(`  [err] ${ticker}: ${e.message}`);
    }
    // SEC rate limit: 10 req/sec. Be polite.
    await new Promise((r) => setTimeout(r, 150));
  }
  // persist for the site
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILINGS_FILE, JSON.stringify(results, null, 2));
  return results;
}

// CLI entry
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const days = parseInt(process.argv[2] || '7', 10);
  console.log(`SEC EDGAR ingestion — last ${days} days, watchlist: ${WATCHLIST.join(', ')}`);
  ingestSec({ days }).then((res) => {
    const total = res.reduce((n, r) => n + r.filings.length, 0);
    console.log(`\nDone. ${res.length} companies, ${total} interesting filings.`);
  }).catch((e) => { console.error('Fatal:', e.message); process.exit(1); });
}
