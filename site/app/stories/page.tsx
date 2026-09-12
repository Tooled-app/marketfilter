import type { Metadata } from "next";
import { getStories, formatFilingDate } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Original Investigations",
  description:
    "Market Filter original investigations — stories mined from SEC filings and primary sources that the mainstream missed. Factual, sourced, no plagiarism.",
  alternates: { canonical: "/stories" },
};

const SIGNAL_LABELS: Record<string, string> = {
  earnings: "Earnings",
  insider: "Insider",
  regulatory: "Regulatory",
  merger: "Merger",
  ipo: "IPO",
  dilution: "Dilution",
  guidance: "Guidance",
  "sector-move": "Sector",
  economic: "Economic",
  other: "Other",
};

export default function StoriesPage() {
  const stories = getStories() ?? [];

  return (
    <div className="max-w-6xl mx-auto px-6">
      <section className="hero py-10 border-b border-[var(--line)]">
        <div className="kicker">// Original Investigations</div>
        <h1 className="text-[clamp(24px,3.5vw,36px)] leading-[1.1] font-bold mt-3">
          The story behind the filing.
        </h1>
        <p className="text-[var(--dim)] max-w-[620px] mt-3">
          Market Filter mines primary sources — SEC filings, regulatory dockets, company
          announcements — and surfaces the angles the mainstream missed. Every claim is
          cited. Original analysis is clearly labeled.
        </p>
        <div className="mt-4 flex gap-6 text-[12px] text-[var(--faint)]">
          <span>Investigations <b className="text-[var(--ink)]">{stories.length}</b></span>
        </div>
      </section>

      <div className="sec flex items-baseline justify-between my-8">
        <h2>Latest Investigations</h2>
      </div>

      <section className="stories">
        {stories.map((s) => (
          <article key={s.id} className="story">
            <div className="time">{formatFilingDate(s.published)}</div>
            <div>
              <div className="title">
                <span className={`tag ${s.signal === "merger" ? "reg" : "news"}`}>
                  {SIGNAL_LABELS[s.signal] ?? s.signal}
                </span>
                {s.headline}
              </div>
              <div className="src">
                {s.tickers.join(", ")} · novelty {s.novelty}/10 · impact {s.impact}/10 · confidence {s.confidence}/10
              </div>
              <p className="desc text-[var(--dim)] text-[13px] mt-3 leading-relaxed">{s.finding}</p>
            </div>
            <div className="score">
              <b>{s.novelty}</b>novelty
            </div>
          </article>
        ))}
        {stories.length === 0 && (
          <div className="story">
            <div className="title">No investigations yet.</div>
          </div>
        )}
      </section>

      <p className="text-[11px] text-[var(--faint)] mt-3">
        Original analysis is labeled as such. All facts are cited to the underlying filing
        and sources. See the <a href="/method" className="text-[var(--blue)] underline">method</a>.
      </p>
    </div>
  );
}
