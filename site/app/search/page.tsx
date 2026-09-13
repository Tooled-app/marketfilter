import type { Metadata } from "next";
import Link from "next/link";
import { getNews, getStories, getFilings, SOURCE_NAMES, formatNewsDate, formatFilingDate } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Market Filter — news headlines, original investigations and SEC filings.",
};

// ---- helpers (kept local to this page) ----

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const SIGNAL_LABELS: Record<string, string> = {
  earnings: "Earnings", insider: "Insider", regulatory: "Regulatory", merger: "Merger",
  ipo: "IPO", dilution: "Dilution", guidance: "Guidance", "sector-move": "Sector",
  economic: "Economic", other: "Other",
};

/** Case-insensitive substring search against a set of fields. */
function match(text: string, q: string): boolean {
  return text.toLowerCase().includes(q);
}

interface SearchResult {
  type: "news" | "story" | "filing";
  title: string;
  snippet: string;
  href: string;
  meta: string;
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();
  const hasQuery = query.length > 0;

  const results: SearchResult[] = [];

  if (hasQuery) {
    const news = getNews() ?? [];
    const stories = getStories() ?? [];
    const filings = getFilings() ?? [];

    // News headlines + descriptions
    for (const n of news) {
      if (match(n.title, query) || match(n.desc ?? "", query)) {
        results.push({
          type: "news",
          title: n.title,
          snippet: n.desc ? n.desc.slice(0, 160) : "",
          href: n.link,
          meta: `${SOURCE_NAMES[n.source] ?? n.source} · ${n.pubDate ? formatNewsDate(n.pubDate) : "news"}`,
        });
      }
    }

    // Original investigations (headline + tickers + body + findings)
    for (const s of stories) {
      const hay = [s.headline, s.finding, s.analysis, s.kicker, s.tickers.join(" "), ...(s.body ?? [])].join(" ");
      if (match(hay, query)) {
        results.push({
          type: "story",
          title: s.headline,
          snippet: s.finding,
          href: `/stories/${s.id}`,
          meta: `Investigation · ${s.tickers.join(", ")} · ${formatFilingDate(s.published)}`,
        });
      }
    }

    // Filings (company name + ticker + form)
    for (const c of filings) {
      const hay = `${c.ticker} ${c.title} CIK ${c.cik}`.toLowerCase();
      if (match(hay, query)) {
        for (const f of c.filings) {
          results.push({
            type: "filing",
            title: `${c.ticker} — ${c.title}`,
            snippet: `SEC ${f.form} · filed ${formatFilingDate(f.filed)}${f.items ? ` · items ${f.items}` : ""}`,
            href: `/filings`,
            meta: `Filing · ${f.form} · ${formatFilingDate(f.filed)}`,
          });
        }
      }
    }
  }

  // Count by type for the header
  const counts = {
    news: results.filter((r) => r.type === "news").length,
    story: results.filter((r) => r.type === "story").length,
    filing: results.filter((r) => r.type === "filing").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-6">
      <section className="hero py-10 border-b border-[var(--line)]">
        <div className="kicker">// Search</div>
        <h1 className="text-[clamp(24px,3.5vw,36px)] leading-[1.1] font-bold mt-3">
          {hasQuery ? (
            <>Results for <span className="accent">“{q.trim()}”</span></>
          ) : (
            <>Search Market Filter</>
          )}
        </h1>
        <p className="text-[var(--dim)] max-w-[620px] mt-3">
          {hasQuery
            ? `${results.length} result${results.length === 1 ? "" : "s"} across news, investigations and filings.`
            : "Search news headlines, original investigations and SEC filings by company, ticker or keyword."}
        </p>
        {hasQuery && (
          <div className="mt-4 flex gap-6 text-[12px] text-[var(--faint)]">
            <span>News <b className="text-[var(--ink)]">{counts.news}</b></span>
            <span>Investigations <b className="text-[var(--ink)]">{counts.story}</b></span>
            <span>Filings <b className="text-[var(--ink)]">{counts.filing}</b></span>
          </div>
        )}
      </section>

      {/* Inline search form so /search itself is searchable */}
      <form action="/search" method="get" className="mt-6 flex gap-2 max-w-xl">
        <input
          type="text"
          name="q"
          defaultValue={q?.trim() ?? ""}
          placeholder="Search ticker, company or keyword…"
          className="flex-1 px-4 py-2 bg-[var(--panel)] border border-[var(--line)] text-[var(--ink)] rounded focus:outline-none focus:border-[var(--green)]"
        />
        <button type="submit" className="btn solid px-5">Search</button>
      </form>

      <section className="stories mt-8">
        {!hasQuery && (
          <div className="story">
            <div className="title">Enter a query above to search.</div>
          </div>
        )}
        {hasQuery && results.length === 0 && (
          <div className="story">
            <div className="title">No matches for “{q.trim()}”.</div>
            <div className="src mt-1">Try a ticker (e.g. NVDA), a company name, or a topic keyword.</div>
          </div>
        )}
        {results.map((r, i) => (
          <article key={i} className="story">
            <div className="time">
              {r.type === "news" && "NEWS"}
              {r.type === "story" && "STORY"}
              {r.type === "filing" && "FILING"}
            </div>
            <div>
              <div className="title">
                {r.type === "story" && (
                  <span className={`tag ${r.signal === "merger" ? "reg" : "news"}`}>
                    {r.meta.split("·")[0].trim()}
                  </span>
                )}
                {r.type === "story" ? (
                  <Link href={r.href} className="hover:text-[var(--green)]">{r.title}</Link>
                ) : (
                  <a href={r.href} target={r.type === "news" ? "_blank" : undefined} rel={r.type === "news" ? "noopener noreferrer" : undefined} className={r.type === "filing" ? "" : "hover:text-[var(--green)]"}>
                    {r.title}
                  </a>
                )}
              </div>
              {r.snippet && <p className="desc text-[var(--dim)] text-[13px] mt-3 leading-relaxed">{r.snippet}</p>}
              <p className="text-[11px] text-[var(--dim)] mt-2">{r.meta}</p>
            </div>
            <div className="score">
              <b>{r.type === "news" ? counts.news : r.type === "story" ? counts.story : counts.filing}</b>
              {r.type === "news" ? "matches" : r.type === "story" ? "stories" : "filings"}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
