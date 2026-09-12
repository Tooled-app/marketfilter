// Market Filter dev server — serves engine status + latest filings on the LAN
// Run: node src/dev-server.js  (binds 0.0.0.0 so the Mac can reach it)
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'site', 'data');
const DESIGNS_DIR = path.join(__dirname, '..', 'designs');
const PORT = process.env.PORT || 4173;
const HOST = '0.0.0.0';

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
};

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}

function html(body) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Market Filter — Engine</title>
<style>
  body{font-family:system-ui,sans-serif;background:#0f1115;color:#e6e8eb;margin:0;padding:2rem;max-width:900px;margin:0 auto}
  h1{font-size:1.6rem;margin-bottom:.2rem} h2{font-size:1.1rem;color:#9aa3af;font-weight:500;margin-top:2rem}
  .card{background:#1a1d24;border:1px solid #2a2f3a;border-radius:8px;padding:1rem 1.2rem;margin:.6rem 0}
  .ticker{font-weight:700;color:#4da3ff} .form{color:#ffb454;font-weight:600}
  .date{color:#7d8794;font-size:.85rem} .muted{color:#7d8794}
  .ok{color:#3ddc84} .badge{display:inline-block;background:#2a2f3a;border-radius:4px;padding:.1rem .5rem;font-size:.8rem;margin-left:.4rem}
  a{color:#4da3ff;text-decoration:none}
</style></head><body>${body}</body></html>`;
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/' || url === '/index.html') {
    const tickers = readJson(path.join(DATA_DIR, 'sec-tickers.json'));
    const tickerCount = tickers ? Object.keys(tickers).length : 0;
    const body = `
      <h1>📈 Market Filter <span class="badge">dev server</span></h1>
      <p class="muted">Engine status — running on this PC (192.168.1.150:${PORT})</p>
      <h2>Status</h2>
      <div class="card"><span class="ok">● Online</span> &nbsp; SEC ticker map cached: <b>${tickerCount}</b> companies</div>
      <h2>Endpoints</h2>
      <div class="card"><a href="/filings">/filings</a> — latest ingested SEC filings (JSON)</div>
      <div class="card"><a href="/health">/health</a> — health check</div>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html(body));
    return;
  }

  // Serve design files (static)
  if (url.startsWith('/designs/')) {
    const rel = url.replace('/designs/', '');
    const safe = path.normalize(rel).replace(/^(\\.\.)+/, '');
    const file = path.join(DESIGNS_DIR, safe);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(file));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  if (url === '/designs' || url === '/designs/') {
    res.writeHead(302, { 'Location': '/designs/index.html' });
    res.end();
    return;
  }

  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'marketfilter-engine', time: new Date().toISOString() }));
    return;
  }

  if (url === '/filings') {
    // Re-run a quick ingest on demand so the Mac always sees fresh data
    import('./ingest/sec.js').then(async (m) => {
      try {
        const results = await m.ingestSec({ days: 7 });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ generated: new Date().toISOString(), companies: results.length, filings: results }, null, 2));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, HOST, () => {
  console.log(`Market Filter dev server running:`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://192.168.1.150:${PORT}  (Mac can reach this)`);
});
