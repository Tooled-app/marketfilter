import type { Metadata } from "next";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Market Filter — news headlines, original investigations and SEC filings.",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return <SearchClient />;
}
