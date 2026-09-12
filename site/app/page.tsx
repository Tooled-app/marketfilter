import type { Metadata } from "next";
import Link from "next/link";
import { getNews, getNewsMeta, getFilings, getTickerCount, getStories, SOURCE_NAMES, formatFilingDate } from "@/lib/data";

export const metadata: Metadata = {
  title: "Market Intelligence Feed",
  description:
    "Stories mined from the filings nobody reads. SEC, LSE and Nasdaq in real time, plus hourly market news.",
  alternates: { canonical: "/" },
};

const MARKET_TICKERS: [string, string, number, number][] = [
  ["NVDA", "NVIDIA Corp", 128.4, 1.2], ["AAPL", "Apple Inc", 232.1, -0.4],
  ["MSFT", "Microsoft", 415.3, 0.8], ["GOOGL", "Alphabet", 178.9, 0.2],
  ["AMZN", "Amazon", 201.5, -0.9], ["META", "Meta", 512.7, 1.6],
  ["TSLA", "Tesla", 244.8, -2.1], ["JPM", "JPMorgan", 214.3, 0.5],
];

function sparkPoints(c: number): string {
  let v = 14;
  const pts: string[] = [];
  for (let i = 0; i <= 10; i++) {
    v += (Math.random() - 0.5) * (c >= 0 ? 6 : 8);
    pts.push(`${i * 10},${Math.max(2, Math.min(26, v))}`);
  }
  return pts.join(" ");
}

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

function formatPubDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const dynamic = "force-dynamic";

export default function Home() {
  const news = getNews() ?? [];
  const meta = getNewsMeta();
  const filings = getFilings() ?? [];
  const tickerCount = getTickerCount();
  const stories = getStories() ?? [];
  const topStory = stories[0];

  const topNews = news.slice(0, 8);
  const filingCount = filings.reduce((n, c) => n + c.filings.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Market Filter",
            url: "https://marketfilter.biz",
            description: "Market intelligence feed mining SEC, LSE and Nasdaq filings for original stories.",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://marketfilter.biz/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      {/* NewsArticle structured data for top stories */}
      {topNews.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Market Filter — Latest Market News",
              itemListElement: topNews.slice(0, 5).map((n, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                  "@type": "NewsArticle",
                  headline: n.title,
                  url: n.link,
                  datePublished: n.pubDate || n.fetchedAt,
                  source: { "@type": "Organization", name: SOURCE_NAMES[n.source] ?? n.source },
                },
              })),
            }),
          }}
        />
      )}
      {/* hero */}
      <section className="hero py-14 border-b border-[var(--line)]">
        <div className="kicker">// Market Intelligence Feed</div>
        <h1 className="text-[clamp(28px,4.5vw,46px)] leading-[1.1] font-bold max-w-[760px] mt-4">
          Stories mined from the <span className="accent">filings</span> nobody reads.
        </h1>
        <p className="text-[var(--dim)] max-w-[620px] mt-4">
          Market Filter watches SEC, LSE and Nasdaq in real time, cross-references the
          data, and surfaces the angles the press misses — before they&apos;re headlines.
        </p>
        <div className="mt-6 flex gap-6 text-[12px] text-[var(--faint)]">
          <span>Last scan <b className="text-[var(--ink)]">{meta?.lastRun ? timeAgo(meta.lastRun) + " ago" : "—"}</b></span>
          <span>Sources <b className="text-[var(--ink)]">{meta?.fetched ?? 0}</b></span>
          <span>News items <b className="text-[var(--ink)]">{news.length}</b></span>
          <span>Filings <b className="text-[var(--ink)]">{filingCount}</b></span>
        </div>
      </section>

      {/* latest investigation */}
      {topStory && (
        <section className="mt-8 border border-[var(--line)] bg-[var(--panel)] p-6">
          <div className="flex items-baseline justify-between">
            <div className="kicker text-[var(--green)] text-[12px] tracking-[2px] uppercase">
              // Original Investigation
            </div>
            <Link href="/stories" className="text-[12px] text-[var(--dim)] hover:text-[var(--green)]">
              all stories →
            </Link>
          </div>
          <h2 className="text-[clamp(18px,2.5vw,24px)] leading-[1.2] font-bold mt-3">
            <Link href={`/stories/${topStory.id}`} className="hover:text-[var(--green)]">
              {topStory.headline}
            </Link>
          </h2>
          <p className="text-[var(--dim)] text-[13px] mt-3 leading-relaxed max-w-[720px]">
            {topStory.finding}
          </p>
          <div className="mt-4 flex gap-4 text-[12px] text-[var(--faint)]">
            <span>Tickers <b className="text-[var(--ink)]">{topStory.tickers.join(", ")}</b></span>
            <span>Novelty <b className="text-[var(--ink)]">{topStory.novelty}/10</b></span>
            <span>Impact <b className="text-[var(--ink)]">{topStory.impact}/10</b></span>
            <Link href={`/stories/${topStory.id}`} className="text-[var(--blue)] underline">
              read the investigation →
            </Link>
          </div>
        </section>
      )}

      {/* markets */}
      <section className="markets my-8">
        {MARKET_TICKERS.map(([s, name, p, c]) => (
          <div key={s} className="mkt">
            <div className="sym">{s} · {name}</div>
            <div className="price">${p.toFixed(2)}</div>
            <div className={`chg ${c >= 0 ? "up" : "down"}`}>
              {c >= 0 ? "+" : ""}{c.toFixed(2)}%
            </div>
            <svg className="block mt-2.5 w-full h-7" viewBox="0 0 100 28" preserveAspectRatio="none">
              <polyline
                points={sparkPoints(c)}
                fill="none"
                stroke={c >= 0 ? "#3ddc84" : "#ff5c5c"}
                strokeWidth="1.5"
              />
            </svg>
          </div>
        ))}
      </section>

      {/* news section */}
      <div className="sec flex items-baseline justify-between my-10">
        <h2>Breaking News</h2>
        <Link href="/news">view all →</Link>
      </div>
      <section className="stories">
        {topNews.map((n, i) => (
          <article key={i} className="news-item">
            <div className="src">{SOURCE_NAMES[n.source] ?? n.source}</div>
            <div>
              <h3 className="title">
                <a href={n.link} target="_blank" rel="noopener noreferrer">
                  {n.title}
                </a>
              </h3>
              {n.desc && <p className="desc">{n.desc.slice(0, 140)}</p>}
              <p className="text-[11px] text-[var(--dim)] mt-2">
                Via <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-[var(--blue)] underline">{SOURCE_NAMES[n.source] ?? n.source}</a>
              </p>
            </div>
          </article>
        ))}
        {topNews.length === 0 && (
          <div className="story">
            <div className="title">No news yet — run the ingestion engine.</div>
          </div>
        )}
      </section>
      <p className="text-[11px] text-[var(--faint)] mt-3">
        News headlines and summaries are aggregated from the cited sources for informational purposes. Full text is
        available at the original publisher. No content is reproduced without attribution.
      </p>

      {/* filings section */}
      <div className="sec flex items-baseline justify-between my-10">
        <h2>Today&apos;s Filings</h2>
        <Link href="/filings">view all →</Link>
      </div>
      <section className="stories">
        {filings.slice(0, 6).map((c) =>
          c.filings.slice(0, 2).map((f, i) => (
            <div key={`${c.ticker}-${i}`} className="story">
              <div className="time">{formatFilingDate(f.filed)}</div>
              <div>
                <div className="title">
                  <span className={`tag ${f.form === "8-K" ? "reg" : f.form === "4" ? "insider" : "earn"}`}>
                    {f.form}
                  </span>
                  {c.ticker} — {c.title}
                </div>
                <div className="src">
                  SEC {f.form} · {formatFilingDate(f.filed)}
                  {f.items ? ` · items ${f.items}` : ""}
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
