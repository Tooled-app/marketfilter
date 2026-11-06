// Prebuild: generate small derived files so the site needs no runtime filesystem access.
// 1. data/ticker-stats.json  — ticker count only (avoids bundling a 644KB JSON)
// 2. public/search-index.json — slim index for client-side search
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const publicDir = path.join(root, "public");

const read = (f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8"));

// ---- 1. ticker stats ----
const tickers = read("sec-tickers.json");
const tickerCount = tickers ? Object.keys(tickers).length : 0;
fs.writeFileSync(
  path.join(dataDir, "ticker-stats.json"),
  JSON.stringify({ count: tickerCount }, null, 2),
  "utf8"
);
console.log(`ticker-stats.json: ${tickerCount} tickers`);

// ---- 2. search index ----
const news = read("news.json") || [];
const stories = read("stories.json") || [];
const filings = read("filings.json") || [];
const SOURCE_NAMES = {
  cnbc: "CNBC", bbc: "BBC Business", investing: "Investing.com", marketwatch: "MarketWatch",
  guardian: "The Guardian", ft: "Financial Times", seekingalpha: "Seeking Alpha",
  benzinga: "Benzinga", yahoo: "Yahoo Finance", zerohedge: "ZeroHedge", wsj: "WSJ Markets",
  nasdaq: "Nasdaq", fortune: "Fortune", investingeuro: "Investing Europe",
};

// Mirror the display formatting used on the site (server-side locale formatting
// is not available to the client index, so dates are pre-formatted here).
const fmtNewsDate = (iso) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};
const fmtFilingDate = (iso) => {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

const index = [];

for (const n of news) {
  index.push({
    t: "news",
    title: n.title || "",
    snippet: (n.desc || "").slice(0, 160),
    href: n.link || "#",
    meta: `${SOURCE_NAMES[n.source] || n.source} — ${n.pubDate ? fmtNewsDate(n.pubDate) : "news"}`,
    hay: `${n.title || ""} ${n.desc || ""}`.toLowerCase(),
  });
}

for (const s of stories) {
  index.push({
    t: "story",
    title: s.headline || "",
    snippet: s.finding || "",
    href: `/stories/${s.id}`,
    meta: `Investigation — ${(s.tickers || []).join(", ")} — ${fmtFilingDate(s.published)}`,
    hay: [s.headline, s.finding, s.analysis, s.kicker, (s.tickers || []).join(" "), ...(s.body || [])]
      .join(" ")
      .toLowerCase(),
  });
}

for (const c of filings) {
  for (const f of c.filings || []) {
    index.push({
      t: "filing",
      title: `${c.ticker} — ${c.title}`,
      snippet: `SEC ${f.form} — filed ${fmtFilingDate(f.filed)}${f.items ? ` — items ${f.items}` : ""}`,
      href: "/filings",
      meta: `Filing — ${f.form} — ${fmtFilingDate(f.filed)}`,
      hay: `${c.ticker} ${c.title} CIK ${c.cik} ${f.form}`.toLowerCase(),
    });
  }
}

fs.mkdirSync(publicDir, { recursive: true });
const outPath = path.join(publicDir, "search-index.json");
fs.writeFileSync(outPath, JSON.stringify(index), "utf8");
const bytes = fs.statSync(outPath).size;
console.log(`search-index.json: ${index.length} entries, ${(bytes / 1024).toFixed(0)}KB`);
