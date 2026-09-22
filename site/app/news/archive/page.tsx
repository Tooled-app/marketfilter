import type { Metadata } from "next";
import Link from "next/link";
import {
  getNewsSorted,
  getNewsMeta,
  SOURCE_NAMES,
  formatNewsDate,
  dayKey,
  dayLabel,
} from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "News Archive — Market Filter",
  description: "Full archive of market news, grouped by day.",
  alternates: { canonical: "/news/archive" },
};

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NewsArchivePage() {
  const all = getNewsSorted();
  const meta = getNewsMeta();

  // Group by day, preserving newest-first day order.
  const byDay = new Map<string, typeof all>();
  for (const n of all) {
    const k = dayKey(n.pubDate);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(n);
  }
  const days = Array.from(byDay.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="max-w-6xl mx-auto px-6">
      <section className="hero py-10 border-b border-[var(--line)]">
        <div className="kicker">// News Archive</div>
        <h1 className="text-[clamp(24px,3.5vw,36px)] leading-[1.1] font-bold mt-3">
          The full Market Filter archive, grouped by day.
        </h1>
        <p className="text-[var(--dim)] max-w-[620px] mt-3">
          {all.length} items from {meta?.fetched ?? 0} sources. The&nbsp;
          <Link href="/news" className="text-[var(--blue)] underline">live feed</Link>
          {" "}shows the most recent 48 hours; everything else is here.
        </p>
      </section>

      {days.map(([day, items]) => (
        <section key={day} className="py-6 border-b border-[var(--line)]">
          <div className="sec flex items-baseline justify-between mb-4">
            <h2 className="text-[20px] font-bold">{dayLabel(items[0].pubDate)}</h2>
            <span className="text-[12px] text-[var(--faint)]">{items.length} item{items.length !== 1 ? "s" : ""}</span>
          </div>
          <section className="stories">
            {items.map((n, i) => (
              <article key={i} className="news-item">
                <div className="src">
                  {SOURCE_NAMES[n.source] ?? n.source}
                  <div className="text-[var(--faint)] mt-1">
                    {n.pubDate ? timeAgo(n.pubDate) + " · " + formatNewsDate(n.pubDate) : ""}
                  </div>
                </div>
                <div>
                  <h3 className="title">
                    <a href={n.link} target="_blank" rel="noopener noreferrer">
                      {n.title}
                    </a>
                  </h3>
                  {n.desc && <p className="desc">{n.desc.slice(0, 200)}</p>}
                  <p className="text-[11px] text-[var(--dim)] mt-2">
                    Via <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-[var(--blue)] underline">{SOURCE_NAMES[n.source] ?? n.source}</a>
                  </p>
                </div>
              </article>
            ))}
          </section>
        </section>
      ))}

      {all.length === 0 && (
        <div className="py-12 text-[var(--dim)]">No archived news yet — run the ingestion engine.</div>
      )}

      <p className="text-[11px] text-[var(--faint)] mt-8 pb-8">
        Headlines and summaries are aggregated from the cited sources for informational purposes. Each item links to
        the original publisher. No full articles are reproduced. See the <Link href="/method" className="text-[var(--blue)] underline">method</Link>.
      </p>
    </div>
  );
}
