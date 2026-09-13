import fs from "fs";
import path from "path";

// Path to the market filter data directory (deployed with the site on Vercel)
const DATA_DIR = path.join(process.cwd(), "data");

export interface NewsItem {
  source: string;
  title: string;
  desc: string;
  link: string;
  pubDate: string;
  fetchedAt: string;
}

export interface NewsMeta {
  lastRun: string;
  fetched: number;
  failed: number;
  newItems: number;
  total: number;
  sources: { id: string; name: string; items: number; added: number; error?: string }[];
}

export interface Filing {
  form: string;
  filed: string;
  accession: string;
  primaryDoc: string;
  reportDate: string | null;
  items: string | null;
}

export interface CompanyFilings {
  ticker: string;
  title: string;
  cik: string;
  filings: Filing[];
}

export interface StorySource {
  label: string;
  url: string;
}

export interface Story {
  id: string;
  headline: string;
  kicker: string;
  published: string;
  tickers: string[];
  signal: string;
  novelty: number;
  impact: number;
  confidence: number;
  finding: string;
  body: string[];
  analysis: string;
  implications: string[];
  sources: StorySource[];
  disclaimer: string;
}

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
}

export function getNews(): NewsItem[] {
  return readJson<NewsItem[]>(path.join(DATA_DIR, "news.json")) ?? [];
}

export function getNewsMeta(): NewsMeta | null {
  return readJson<NewsMeta>(path.join(DATA_DIR, "news-meta.json"));
}

export function getFilings(): CompanyFilings[] {
  return readJson<CompanyFilings[]>(path.join(DATA_DIR, "filings.json")) ?? [];
}

export function getStories(): Story[] {
  return readJson<Story[]>(path.join(DATA_DIR, "stories.json")) ?? [];
}

export function getTickerCount(): number {
  const map = readJson<Record<string, unknown>>(path.join(DATA_DIR, "sec-tickers.json"));
  return map ? Object.keys(map).length : 0;
}

// Format an ISO date (yyyy-mm-dd) as a human-friendly British date, e.g. "2026-09-11" -> "11 September 2026"
// Parsed manually from components to avoid UTC->local timezone off-by-one (new Date("2026-09-11") is UTC midnight).
export function formatFilingDate(iso: string): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) {
    // fall back: try Date parse
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }
  const [, y, mo, da] = m;
  const d = new Date(Number(y), Number(mo) - 1, Number(da)); // local midnight, no tz shift
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Format a news pubDate (RSS/ISO) as an absolute British date+time, e.g. "Fri, 11 Sep 2026 13:35:29 GMT" -> "11 Sep 2026, 14:35" (BST)
export function formatNewsDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso; // fall back to raw if unparseable
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Source display names
export const SOURCE_NAMES: Record<string, string> = {
  cnbc: "CNBC",
  bbc: "BBC Business",
  investing: "Investing.com",
  marketwatch: "MarketWatch",
  guardian: "The Guardian",
  ft: "Financial Times",
  seekingalpha: "Seeking Alpha",
  benzinga: "Benzinga",
  yahoo: "Yahoo Finance",
  zerohedge: "ZeroHedge",
  wsj: "WSJ Markets",
  nasdaq: "Nasdaq",
  fortune: "Fortune",
  investingeuro: "Investing Europe",
};
