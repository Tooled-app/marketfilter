"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface IndexEntry {
  t: "news" | "story" | "filing";
  title: string;
  snippet: string;
  href: string;
  meta: string;
  hay: string;
}

const TYPE_LABEL: Record<IndexEntry["t"], string> = {
  news: "NEWS",
  story: "STORY",
  filing: "FILING",
};

const TYPE_UNIT: Record<IndexEntry["t"], string> = {
  news: "matches",
  story: "stories",
  filing: "filings",
};

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [index, setIndex] = useState<IndexEntry[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  // Read ?q= on mount (client-side, so the page itself stays static).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q") ?? "";
    const trimmed = q.trim();
    setQuery(trimmed);
    setSubmitted(trimmed);
  }, []);

  // Fetch the slim search index once the page is interactive.
  useEffect(() => {
    let cancelled = false;
    fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("index unavailable"))))
      .then((data: IndexEntry[]) => {
        if (!cancelled) setIndex(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const needle = submitted.toLowerCase();
  const hasQuery = needle.length > 0;

  const results = hasQuery && index ? index.filter((e) => e.hay.includes(needle)) : [];

  const counts = {
    news: results.filter((r) => r.t === "news").length,
    story: results.filter((r) => r.t === "story").length,
    filing: results.filter((r) => r.t === "filing").length,
  };

  const loading = hasQuery && index === null && !loadError;

  return (
    <div className="max-w-6xl mx-auto px-6">
      <section className="hero py-10 border-b border-[var(--line)]">
        <div className="kicker">// Search</div>
        <h1 className="text-[clamp(24px,3.5vw,36px)] leading-[1.1] font-bold mt-3">
          {hasQuery ? (
            <>
              Results for <span className="accent">&ldquo;{submitted}&rdquo;</span>
            </>
          ) : (
            <>Search Market Filter</>
          )}
        </h1>
        <p className="text-[var(--dim)] max-w-[620px] mt-3">
          {loadError
            ? "The search index could not be loaded. Try reloading the page."
            : loading
              ? "Searching…"
              : hasQuery
                ? `${results.length} result${results.length === 1 ? "" : "s"} across news, investigations and filings.`
                : "Search news headlines, original investigations and SEC filings by company, ticker or keyword."}
        </p>
        {hasQuery && !loading && !loadError && (
          <div className="mt-4 flex gap-6 text-[12px] text-[var(--faint)]">
            <span>
              News <b className="text-[var(--ink)]">{counts.news}</b>
            </span>
            <span>
              Investigations <b className="text-[var(--ink)]">{counts.story}</b>
            </span>
            <span>
              Filings <b className="text-[var(--ink)]">{counts.filing}</b>
            </span>
          </div>
        )}
      </section>

      {/* Navigates properly (full page load) so ?q= is picked up on mount. */}
      <form action="/search" method="get" className="mt-6 flex gap-2 max-w-xl">
        <input
          type="text"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ticker, company or keyword…"
          className="flex-1 px-4 py-2 bg-[var(--panel)] border border-[var(--line)] text-[var(--ink)] rounded focus:outline-none focus:border-[var(--green)]"
        />
        <button type="submit" className="btn solid px-5">
          Search
        </button>
      </form>

      <section className="stories mt-8">
        {!hasQuery && (
          <div className="story">
            <div className="title">Enter a query above to search.</div>
          </div>
        )}
        {hasQuery && loading && (
          <div className="story">
            <div className="title">Loading index…</div>
          </div>
        )}
        {hasQuery && !loading && !loadError && results.length === 0 && (
          <div className="story">
            <div className="title">No matches for &ldquo;{submitted}&rdquo;.</div>
            <div className="src mt-1">
              Try a ticker (e.g. NVDA), a company name, or a topic keyword.
            </div>
          </div>
        )}
        {results.map((r, i) => (
          <article key={`${r.href}-${i}`} className="story">
            <div className="time">{TYPE_LABEL[r.t]}</div>
            <div>
              <div className="title">
                {r.t === "story" ? (
                  <Link href={r.href} className="hover:text-[var(--green)]">
                    {r.title}
                  </Link>
                ) : r.t === "news" ? (
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--green)]"
                  >
                    {r.title}
                  </a>
                ) : (
                  <a href={r.href} className="hover:text-[var(--green)]">
                    {r.title}
                  </a>
                )}
              </div>
              {r.snippet && (
                <p className="desc text-[var(--dim)] text-[13px] mt-3 leading-relaxed">
                  {r.snippet}
                </p>
              )}
              <p className="text-[11px] text-[var(--dim)] mt-2">{r.meta}</p>
            </div>
            <div className="score">
              <b>{counts[r.t]}</b>
              {TYPE_UNIT[r.t]}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
