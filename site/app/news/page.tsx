import type { Metadata } from "next";
import { getNews, getNewsMeta, SOURCE_NAMES } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Market News",
  description: "Current market news refreshed hourly from major financial sources. Breaking news captured within the hour.",
  alternates: { canonical: "/news" },
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

export default function NewsPage() {
  const news = getNews() ?? [];
  const meta = getNewsMeta();

  return (
    <div className="max-w-6xl mx-auto px-6">
      <section className="hero py-10 border-b border-[var(--line)]">
        <div className="kicker">// Live News Feed</div>
        <h1 className="text-[clamp(24px,3.5vw,36px)] leading-[1.1] font-bold mt-3">
          Current market news, refreshed hourly.
        </h1>
        <p className="text-[var(--dim)] max-w-[620px] mt-3">
          Aggregated from {meta?.fetched ?? 0} financial sources. If major news breaks,
          it lands here within the hour.
        </p>
        <div className="mt-4 flex gap-6 text-[12px] text-[var(--faint)]">
          <span>Last refresh <b className="text-[var(--ink)]">{meta?.lastRun ? timeAgo(meta.lastRun) : "—"}</b></span>
          <span>Items <b className="text-[var(--ink)]">{news.length}</b></span>
        </div>
      </section>

      <div className="sec flex items-baseline justify-between my-8">
        <h2>Latest</h2>
      </div>

      <section className="stories">
        {news.map((n, i) => (
          <article key={i} className="news-item">
            <div className="src">
              {SOURCE_NAMES[n.source] ?? n.source}
              <div className="text-[var(--faint)] mt-1">
                {n.pubDate ? timeAgo(n.pubDate) : ""}
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
        {news.length === 0 && (
          <div className="story">
            <div className="title">No news yet — run the ingestion engine.</div>
          </div>
        )}
      </section>
      <p className="text-[11px] text-[var(--faint)] mt-3">
        Headlines and summaries are aggregated from the cited sources for informational purposes. Each item links to
        the original publisher. No full articles are reproduced. See the <a href="/method" className="text-[var(--blue)] underline">method</a>.
      </p>
    </div>
  );
}
