const FINNHUB_BASE = "https://finnhub.io/api/v1";

interface FinnhubQuote {
  c: number;  // current price
  d: number;  // change
  dp: number; // percent change
  h: number;  // day high
  l: number;  // day low
  o: number;  // open
  pc: number; // previous close
}

// Returns the live price for a ticker, or null if unavailable / key not set.
// Null means the caller should fall back to Gemini's extracted price.
export async function fetchLivePrice(ticker: string): Promise<number | null> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(ticker)}&token=${key}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data: FinnhubQuote = await res.json();
    return data.c > 0 ? data.c : null;
  } catch {
    return null;
  }
}

// Returns a formatted price context string to inject into scout prompts.
export function priceContext(ticker: string, price: number | null): string {
  if (!price) return "";
  return ` The current market price of ${ticker} is $${price.toFixed(2)} (sourced live — use this exact figure for band calculations and payingForDesc).`;
}
