import type { Metadata } from "next";
import { getNewsMeta, SOURCE_NAMES } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sources",
  description:
    "The sources Market Filter aggregates news from — financial outlets and primary documents.",
  alternates: { canonical: "/sources" },
};

export default function SourcesPage() {
  const meta = getNewsMeta();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="kicker">// Sources</div>
      <h1 className="text-[clamp(24px,3.5vw,36px)] leading-[1.1] font-bold mt-3">
        Where the news comes from.
      </h1>
      <p className="text-[var(--dim)] mt-3">
        Market Filter aggregates from the following sources. Every item links to its
        original publisher for full attribution.
      </p>
      <ul className="mt-6 space-y-2 text-[var(--dim)]">
        {Object.entries(SOURCE_NAMES).map(([id, name]) => (
          <li key={id} className="border-b border-[var(--line)] pb-2">
            {name}
          </li>
        ))}
        <li className="border-b border-[var(--line)] pb-2">
          U.S. SEC EDGAR — primary filings (8-K, 10-Q, 10-K, Form 4)
        </li>
      </ul>
      <p className="text-[11px] text-[var(--faint)] mt-6">
        Last refresh: {meta?.lastRun ? new Date(meta.lastRun).toLocaleString("en-GB") : "—"} · {meta?.fetched ?? 0} sources online.
      </p>
    </div>
  );
}
