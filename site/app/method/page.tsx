import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Method",
  description:
    "How Market Filter sources and attributes content: we aggregate and cite, never plagiarize.",
  alternates: { canonical: "/method" },
};

export default function MethodPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="kicker">// Method</div>
      <h1 className="text-[clamp(24px,3.5vw,36px)] leading-[1.1] font-bold mt-3">
        How we source and attribute.
      </h1>
      <div className="mt-6 space-y-4 text-[var(--dim)] leading-relaxed">
        <h2 className="text-[var(--ink)] font-bold text-base">Attribution</h2>
        <p>
          Every news headline and summary on Market Filter is attributed to its
          original source. Each item shows the publisher name and links directly
          to the original article. We never reproduce full articles — only
          headlines and brief summaries for informational purposes.
        </p>

        <h2 className="text-[var(--ink)] font-bold text-base">No plagiarism</h2>
        <p>
          Aggregate content is clearly labelled as such. We do not present
          another outlet&apos;s reporting as our own. Original analysis and
          filings coverage is written from primary sources (SEC filings) and
          links to the underlying document.
        </p>

        <h2 className="text-[var(--ink)] font-bold text-base">Primary sources</h2>
        <p>
          Where we cover filings, we cite the SEC document (by form and accession)
          so readers can verify the facts themselves. Our commentary is clearly
          marked as analysis, separate from the underlying facts.
        </p>

        <h2 className="text-[var(--ink)] font-bold text-base">Sources</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>CNBC</li>
          <li>BBC Business</li>
          <li>Investing.com</li>
          <li>MarketWatch</li>
          <li>The Guardian</li>
          <li>Financial Times</li>
          <li>Seeking Alpha</li>
          <li>Benzinga</li>
          <li>Yahoo Finance</li>
          <li>U.S. SEC EDGAR (filings)</li>
        </ul>

        <h2 className="text-[var(--ink)] font-bold text-base">Editorial independence</h2>
        <p>
          We do not reproduce other outlets&apos; content for profit. Ad-supported
          aggregation is limited to cited summaries and links. Original content is
          generated from primary documents we can verify.
        </p>
      </div>
    </div>
  );
}
