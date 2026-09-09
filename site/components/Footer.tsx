import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] mt-14 py-7">
      <div className="max-w-6xl mx-auto px-6 flex justify-between flex-wrap gap-4">
        <span>
          MARKET FILTER — not investment advice. For informational purposes only.
        </span>
        <span>
          <Link href="/about" className="hover:text-[var(--green)]">About</Link>
          {" · "}
          <Link href="/method" className="hover:text-[var(--green)]">Method</Link>
          {" · "}
          <Link href="/sources" className="hover:text-[var(--green)]">Sources</Link>
        </span>
      </div>
    </footer>
  );
}
