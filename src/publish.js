// Market Filter publish helper
// Commits the site/data JSON (and code) and pushes to origin so the Vercel
// git integration auto-redeploys. Run AFTER an ingest has refreshed site/data.
//   node src/publish.js [message]
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const message = process.argv[2] || `chore: refresh market filter data (${new Date().toISOString()})`;

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { cwd: ROOT, stdio: 'pipe', ...opts }).toString();
}

try {
  // Stage data + any site/src changes
  run(`git add site/data site/lib src package.json`);
  // Commit only if there's something staged
  const status = run(`git status --porcelain`);
  if (!status.trim()) {
    console.log('Nothing to commit. Data unchanged.');
    process.exit(0);
  }
  run(`git commit -m ${JSON.stringify(message)}`);
  // Push to trigger Vercel auto-deploy
  run(`git push origin main`);
  console.log('Published. Vercel auto-deploy triggered.');
} catch (e) {
  console.error('Publish failed:', e.stderr ? e.stderr.toString() : e.message);
  process.exit(1);
}
