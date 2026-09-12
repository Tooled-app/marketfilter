import type { Metadata } from "next";
import Link from "next/link";
import { getStories, formatFilingDate } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const story = (getStories() ?? []).find((s) => s.id === id);
  if (!story) return { title: "Story not found" };
  return {
    title: story.headline,
    description: story.finding,
    alternates: { canonical: `/stories/${story.id}` },
  };
}

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = (getStories() ?? []).find((s) => s.id === id);

  if (!story) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-2xl font-bold">Story not found.</h1>
        <Link href="/stories" className="text-[var(--blue)] underline mt-4 inline-block">
          ← Back to investigations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/stories" className="text-[12px] text-[var(--dim)] hover:text-[var(--green)]">
        ← All investigations
      </Link>

      <div className="kicker text-[var(--green)] text-[12px] tracking-[2px] uppercase mt-6">
        {story.kicker} · {formatFilingDate(story.published)}
      </div>
      <h1 className="text-[clamp(24px,4vw,36px)] leading-[1.15] font-bold mt-3">
        {story.headline}
      </h1>
      <div className="mt-3 flex gap-4 text-[12px] text-[var(--faint)]">
        <span>Tickers: <b className="text-[var(--ink)]">{story.tickers.join(", ")}</b></span>
        <span>Novelty <b className="text-[var(--ink)]">{story.novelty}/10</b></span>
        <span>Impact <b className="text-[var(--ink)]">{story.impact}/10</b></span>
        <span>Confidence <b className="text-[var(--ink)]">{story.confidence}/10</b></span>
      </div>

      {/* Finding */}
      <div className="mt-8 border-l-2 border-[var(--green)] pl-4 py-1">
        <div className="text-[11px] text-[var(--green)] tracking-[1px] uppercase">The Finding</div>
        <p className="text-[15px] leading-relaxed mt-2 text-[var(--ink)]">{story.finding}</p>
      </div>

      {/* Body */}
      <div className="mt-8 space-y-5">
        {story.body.map((p, i) => (
          <p key={i} className="text-[14px] leading-relaxed text-[var(--ink)]">{p}</p>
        ))}
      </div>

      {/* Analysis */}
      <div className="mt-8 border border-[var(--line)] bg-[var(--panel)] p-5">
        <div className="text-[11px] text-[var(--amber)] tracking-[1px] uppercase">Analysis (opinion)</div>
        <p className="text-[14px] leading-relaxed mt-2 text-[var(--ink)]">{story.analysis}</p>
      </div>

      {/* Implications */}
      <div className="mt-8">
        <div className="text-[11px] text-[var(--green)] tracking-[1px] uppercase">Implications</div>
        <ul className="mt-3 space-y-2">
          {story.implications.map((imp, i) => (
            <li key={i} className="text-[14px] leading-relaxed text-[var(--ink)] flex gap-3">
              <span className="text-[var(--green)]">▸</span>
              <span>{imp}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sources */}
      <div className="mt-8">
        <div className="text-[11px] text-[var(--blue)] tracking-[1px] uppercase">Sources</div>
        <ul className="mt-3 space-y-2">
          {story.sources.map((src, i) => (
            <li key={i} className="text-[13px]">
              <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-[var(--blue)] underline">
                {src.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[11px] text-[var(--faint)] mt-8 border-t border-[var(--line)] pt-4">
        {story.disclaimer}
      </p>
    </div>
  );
}
