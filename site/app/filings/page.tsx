import type { Metadata } from "next";
import { getFilings, formatFilingDate } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SEC Filings",
  description: "Recent SEC filings from the watchlist — 8-K, 10-Q, 10-K, Form 4 insider trades and more.",
  alternates: { canonical: "/filings" },
};

const FORM_TAG: Record<string, string> = {
  "8-K": "reg",
  "10-Q": "earn",
  "10-K": "earn",
  "4": "insider",
  "3": "insider",
  "S-1": "reg",
  "S-4": "reg",
  "SC 13D": "insider",
  "SC 13G": "insider",
};

export default function FilingsPage() {
  const filings = getFilings() ?? [];
  const total = filings.reduce((n, c) => n + c.filings.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-6">
      <section className="hero py-10 border-b border-[var(--line)]">
        <div className="kicker">// SEC Filings</div>
        <h1 className="text-[clamp(24px,3.5vw,36px)] leading-[1.1] font-bold mt-3">
          Raw filings from the watchlist.
        </h1>
        <p className="text-[var(--dim)] max-w-[620px] mt-3">
          {filings.length} companies, {total} filings in the last 7 days. The raw
          material behind every Market Filter story.
        </p>
      </section>

      <div className="sec flex items-baseline justify-between my-8">
        <h2>Recent Filings</h2>
      </div>

      <section className="stories">
        {filings.map((c) =>
          c.filings.map((f, i) => (
            <div key={`${c.ticker}-${i}`} className="story">
              <div className="time">{formatFilingDate(f.filed)}</div>
              <div>
                <div className="title">
                  <span className={`tag ${FORM_TAG[f.form] ?? "reg"}`}>{f.form}</span>
                  {c.ticker} — {c.title}
                </div>
                <div className="src">
                  SEC {f.form} · filed {formatFilingDate(f.filed)}
                  {f.items ? ` · items ${f.items}` : ""}
                  {f.reportDate ? ` · report ${formatFilingDate(f.reportDate)}` : ""}
                </div>
              </div>
              <div className="score">CIK<b>{c.cik.slice(-4)}</b></div>
            </div>
          ))
        )}
        {filings.length === 0 && (
          <div className="story">
            <div className="title">No filings cached — run the SEC ingestion engine.</div>
          </div>
        )}
      </section>
    </div>
  );
}
