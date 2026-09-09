import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: "What Market Filter is — a market intelligence feed that mines SEC, LSE and Nasdaq filings for original stories.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="kicker">// About</div>
      <h1 className="text-[clamp(24px,3.5vw,36px)] leading-[1.1] font-bold mt-3">
        What Market Filter is.
      </h1>
      <div className="mt-6 space-y-4 text-[var(--dim)] leading-relaxed">
        <p>
          Market Filter is a market intelligence feed. It watches SEC, LSE and Nasdaq
          filings in real time, cross-references the paperwork, and surfaces the
          stories the press hasn&apos;t caught yet.
        </p>
        <p>
          The news section aggregates current market coverage from major financial
          sources, refreshed hourly, so if major news breaks we capture it.
        </p>
        <p>
          Every story is sourced and verifiable. Market Filter is not investment
          advice — it&apos;s the facts, presented clearly.
        </p>
      </div>
    </div>
  );
}
