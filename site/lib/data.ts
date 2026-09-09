import fs from "fs";
import path from "path";

// Path to the market filter engine data directory (shared with the ingestion engine)
const DATA_DIR = path.join(process.cwd(), "..", "data");

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
};
