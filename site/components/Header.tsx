"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Markets" },
  { href: "/news", label: "News" },
  { href: "/stories", label: "Stories" },
  { href: "/filings", label: "Filings" },
  { href: "/news/archive", label: "Archive" },
];

const TICKERS: [string, number, number][] = [
  ["NVDA", 128.4, 1.2], ["AAPL", 232.1, -0.4], ["MSFT", 415.3, 0.8],
  ["GOOGL", 178.9, 0.2], ["AMZN", 201.5, -0.9], ["META", 512.7, 1.6],
  ["TSLA", 244.8, -2.1], ["JPM", 214.3, 0.5], ["BAC", 41.2, 0.1],
  ["XOM", 118.6, -0.3],
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [clock, setClock] = useState("--:--:--");
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = setInterval(() => {
      setClock(new Date().toTimeString().slice(0, 8));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const tape = [...TICKERS, ...TICKERS]
    .map(
      ([s, p, c]) =>
        `<span>${s} <b>$${p.toFixed(2)}</b> <span class="${c >= 0 ? "up" : "down"}">${
          c >= 0 ? "▲" : "▼"
        } ${Math.abs(c).toFixed(2)}%</span></span>`
    )
    .join("");

  return (
    <>
      <div className="tape" dangerouslySetInnerHTML={{ __html: `<div class="tape-inner">${tape}</div>` }} />
      <header className="site-header">
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <Link href="/" className="logo">
            MARKET<span className="pulse">FILTER</span>
            <span className="cursor" />
          </Link>
          <nav className="nav flex gap-7">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`nav-link ${pathname === n.href ? "active" : ""}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <form onSubmit={submitSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="hidden md:block w-[140px] px-3 py-1.5 text-[12px] bg-[var(--panel)] border border-[var(--line)] text-[var(--ink)] rounded focus:outline-none focus:border-[var(--green)]"
              />
              <button type="submit" className="btn">Search</button>
            </form>
            <button className="btn solid">Live</button>
            <span className="hidden lg:block text-[12px] text-[var(--dim)]">{clock}</span>
          </div>
        </div>
      </header>
    </>
  );
}
