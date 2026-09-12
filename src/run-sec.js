// Market Filter autonomous refresh: run SEC filings ingest, then publish (commit+push -> Vercel redeploy)
// Cron entrypoint. Usage: node src/run-sec.js
import { ingestSec } from './ingest/sec.js';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

try {
  console.log('=== SEC filings ingest ===');
  const r = await ingestSec({ days: 7 });
  const total = r.reduce((n, x) => n + x.filings.length, 0);
  console.log(`Ingest done: ${r.length} companies, ${total} filings.`);

  console.log('=== Publish (commit + push) ===');
  const msg = `chore: daily SEC filings refresh (${new Date().toISOString()})`;
  execSync('git add site/data site/app site/public site/components src', { cwd: ROOT, stdio: 'inherit' });
  const st = execSync('git status --porcelain', { cwd: ROOT }).toString();
  if (!st.trim()) { console.log('Nothing to commit — data unchanged.'); process.exit(0); }
  execSync(`git commit -m ${JSON.stringify(msg)}`, { cwd: ROOT, stdio: 'inherit' });
  execSync('git push origin main', { cwd: ROOT, stdio: 'inherit' });
  console.log('PUSHED OK — Vercel auto-deploy triggered.');
} catch (e) {
  console.error('FAILED:', e.message);
  process.exit(1);
}
