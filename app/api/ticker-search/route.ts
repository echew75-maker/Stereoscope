import { NextRequest } from "next/server";

// Lightweight Yahoo Finance search proxy. Browser → /api/ticker-search?q=apple →
// Yahoo. Server-side fetch sidesteps CORS and lets us strip the response down
// to just what the autocomplete dropdown needs.

interface YahooQuote {
  symbol?: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
  exchange?: string;
  exchDisp?: string;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) return Response.json({ results: [] });

  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&listsCount=0`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Stereoscope/1.0)" },
    });
    if (!res.ok) return Response.json({ results: [] });

    const data: { quotes?: YahooQuote[] } = await res.json();
    const results = (data.quotes ?? [])
      // Only US equities; skip mutual funds, futures, crypto, etc.
      .filter((it) =>
        it.symbol &&
        it.quoteType === "EQUITY" &&
        /^[A-Z]{1,6}$/.test(it.symbol)
      )
      .slice(0, 6)
      .map((it) => ({
        symbol: it.symbol!,
        name: it.longname || it.shortname || it.symbol!,
        exchange: it.exchDisp || it.exchange || "",
      }));

    return Response.json({ results });
  } catch {
    return Response.json({ results: [] });
  }
}
