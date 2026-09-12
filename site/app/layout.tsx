import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ADSENSE_CLIENT = "ca-pub-1023878090475896";

export const metadata: Metadata = {
  metadataBase: new URL("https://marketfilter.biz"),
  title: {
    default: "Market Filter — Market Intelligence Feed",
    template: "%s | Market Filter",
  },
  description:
    "Stories mined from the filings nobody reads. SEC, LSE and Nasdaq in real time, plus hourly market news.",
  keywords: ["stock market news", "SEC filings", "market intelligence", "financial news", "insider trading"],
  authors: [{ name: "Market Filter" }],
  openGraph: {
    type: "website",
    siteName: "Market Filter",
    title: "Market Filter — Market Intelligence Feed",
    description:
      "Stories mined from the filings nobody reads. SEC, LSE and Nasdaq in real time, plus hourly market news.",
    url: "https://marketfilter.biz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Market Filter — Market Intelligence Feed",
    description:
      "Stories mined from the filings nobody reads. SEC, LSE and Nasdaq in real time, plus hourly market news.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
        <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`} crossOrigin="anonymous" strategy="afterInteractive" />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
