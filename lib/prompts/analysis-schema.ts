import { ReportData } from "@/lib/types";

export const ANALYSIS_SCHEMA_PROMPT = `After completing your analysis, return ONLY a single JSON object (no markdown, no backticks, no preamble) with this exact schema:

{
  "name": "Full Company Name",
  "ticker": "TICK",
  "exchange": "NASDAQ/NYSE/etc",
  "sector": "Industry · Sub-sector",
  "price": 123.45,
  "chg": "+5.2% YTD",
  "range": "$100 – $200",
  "asof": "2 Jun 2026",
  "currency": "USD · Millions",
  "filingPeriod": "Q1 2026",
  "filingDate": "14 May 2026",
  "nextFiling": "~10 Aug 2026",
  "stats": [
    {"k":"Market cap","v":"$345B"},
    {"k":"Enterprise value","v":"$337B"},
    {"k":"Rev growth","v":"+25%","c":"bull"},
    {"k":"Fwd P/E","v":"22×"},
    {"k":"EV / Fwd sales","v":"8×"},
    {"k":"Net cash/debt","v":"$10B"}
  ],
  "growthGurus": [
    {"n":"Peter Lynch","f":"Growth classification","m":"Fast Grower","s":"b","overview":"2-3 sentence analysis referencing specific figures...","conclusion":"3-5 sentence actionable conclusion referencing specific numbers..."},
    {"n":"Philip Fisher","f":"Scaling R&D","m":"Rule of 40: X%","s":"b","overview":"...","conclusion":"..."},
    {"n":"W. O'Neil","f":"EPS accel & sponsorship","m":"EPS +X% TTM","s":"b","overview":"...","conclusion":"..."},
    {"n":"Bill Gurley","f":"Unit economics","m":"NDR: X%","s":"b","overview":"...","conclusion":"..."},
    {"n":"Chuck Akre","f":"Reinvestment runway","m":"ROIC: X%","s":"n","overview":"...","conclusion":"..."},
    {"n":"Druckenmiller","f":"Macro & liquidity","m":"Runway: X mo","s":"n","overview":"...","conclusion":"..."},
    {"n":"Howard Marks","f":"Second-level read","m":"Consensus risk: X","s":"n","overview":"...","conclusion":"..."}
  ],
  "valueGurus": [
    {"n":"W. Buffett","f":"Moat & compounding","m":"Moat: X/10","s":"n","overview":"...","conclusion":"..."},
    {"n":"B. Graham","f":"NCAV / liquidation","m":"P/B ≈ X×","s":"r","overview":"...","conclusion":"..."},
    {"n":"J. Chanos","f":"Accounting integrity","m":"OCF/NI: X×","s":"b","overview":"...","conclusion":"..."},
    {"n":"J. Greenblatt","f":"Capital efficiency","m":"Earnings yield: X%","s":"r","overview":"...","conclusion":"..."},
    {"n":"M. Pabrai","f":"Dhandho downside","m":"Net cash/sh: $X","s":"r","overview":"...","conclusion":"..."},
    {"n":"S. Klarman","f":"Liquidity option","m":"Self-funds: X yrs","s":"b","overview":"...","conclusion":"..."},
    {"n":"H. Schilit","f":"Shenanigans audit","m":"Clean / Flags","s":"b","overview":"...","conclusion":"..."}
  ],
  "growthMetrics": [
    {"k":"Revenue Growth YoY","v":"+X%","c":"b"},
    {"k":"Rule of 40","v":"X%","c":"b"},
    {"k":"NDR / Book-to-Bill","v":"X%","c":"b"},
    {"k":"Gross Margin","v":"X%","c":"b"},
    {"k":"FCF Margin","v":"X%","c":""},
    {"k":"3-Yr Fwd Yield","v":"X%","c":"b"}
  ],
  "valueMetrics": [
    {"k":"Graham NCAV/sh","v":"$X","c":"r"},
    {"k":"P/E × P/B","v":"X (>22.5)","c":"r"},
    {"k":"Earnings Yield","v":"X%","c":"r"},
    {"k":"True Owner FCF","v":"$XM","c":"b"},
    {"k":"Cash/sh","v":"$X","c":"b"},
    {"k":"OCF Quality","v":"X×","c":"b"}
  ],
  "valueBandLabel": "Value · $X–$Y",
  "valueBandLeft": "24%",
  "valueBandWidth": "16%",
  "growthBandLabel": "Growth · $X–$Y",
  "growthBandLeft": "74%",
  "growthBandWidth": "18%",
  "markerLeft": "57%",
  "overlapType": "disjoint",
  "overlapNote": "One sentence describing the overlay finding...",
  "crux": "The single question that divides the two lenses — name the specific metric and numbers on each side.",
  "cruxGrowth": "2 sentences: how growth lens reads the crux metric with specific figure.",
  "cruxValue": "2 sentences: how value lens reads the same figure with its own supporting number.",
  "payingForTitle": "Short evocative title",
  "payingForDesc": "3-4 sentences: At $X price, you are paying $Y above the $Z value floor. That premium only pays off if [named assumption]. If it does, Growth target $A is in reach. If not, Value floor $B protects you — a Z% drawdown.",
  "decisiveDate": "Approximate date (e.g. 3 Aug 2026)",
  "decisiveText": "2 sentences: the one data point to watch and what it means for both lenses.",
  "premortemPrice": "$XX",
  "premortemQuote": "One evocative sentence in quotes about what went wrong.",
  "premortemSteps": [
    {"yr":"Late 2026","txt":"What goes wrong first with specific numbers..."},
    {"yr":"2027","txt":"How the problem compounds..."},
    {"yr":"2028","txt":"The structural shift..."},
    {"yr":"2029-2031","txt":"The final state — what the stock trades at and why..."}
  ],
  "premortemCoda": "2-3 sentences: Munger's lesson from this specific case with specific numbers.",
  "catalysts": [
    {"dateLabel":"3 Aug 2026","type":"Micro","title":"Event name","desc":"1 sentence summary","detail":"2-3 sentences of what specifically to watch","watchMetrics":["Metric 1","Metric 2","Metric 3"]},
    {"dateLabel":"Oct 2026","type":"Macro","title":"Event name","desc":"1 sentence","detail":"2-3 sentences","watchMetrics":["Metric 1","Metric 2"]},
    {"dateLabel":"Ongoing","type":"Dilution","title":"Event name","desc":"1 sentence","detail":"2-3 sentences","watchMetrics":["Metric 1","Metric 2"]}
  ],
  "triggers": [
    {"n":1,"title":"Trigger name","tag":"Margin","tagColor":"growth","desc":"2 sentences with specific threshold and current value...","cur":"60%","curC":"bull","trig":"<50% / 2 qtrs","extra":null},
    {"n":2,"title":"Trigger name","tag":"Growth","tagColor":"value","desc":"2 sentences...","cur":"$4.5B","curC":"bull","trig":"−10% QoQ","extra":null},
    {"n":3,"title":"Trigger name","tag":"Dilution","tagColor":"warn","desc":"2 sentences...","cur":"$807M","curC":"neutral","trig":"$1.0B","extra":"⚠ WITHIN 20%"}
  ],
  "sources": "2-3 sentences listing all sources with filing dates and URLs."
}

CRITICAL RULES:
- "s" field: "b" = bullish (green), "n" = neutral (amber), "r" = bearish (red). Assign based on the guru's framework applied to this stock's specific data.
- "c" field for metrics: "b" = positive/green, "r" = negative/red, "" = neutral
- "overview" and "conclusion" MUST be separate fields with different content. Overview = analysis. Conclusion = actionable implication referencing at least one specific number.
- The crux must be a genuine analytical tension — not a restatement of "growth vs value"
- Premortem assumes a 50% price decline over 5 years and builds a specific, plausible narrative with actual financial figures
- Band positions: calculate left% and width% to place bands on a 0-100% axis where 0% = $0 and 100% = 1.5× the highest target price. markerLeft places current price on same axis.
- All numbers must come from web search results, NOT pre-trained memory
- Return ONLY the JSON object, nothing else`;

export function parseReportJSON(
  growthRaw: string,
  valueRaw: string,
  arbiterRaw: string,
  ticker: string
): ReportData {
  // Try to extract JSON from each response.
  // Gemini 2.5 Flash outputs analysis prose before the JSON, and prose can contain
  // bare {word} tokens that fool a naive "find first {" approach. We instead collect
  // all { positions and try from last-to-first, preferring the object that contains
  // schema keys ("name", "price") — i.e. the actual report JSON at the end.
  const extractJSON = (text: string): Record<string, unknown> | null => {
    const cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    // Direct parse — succeeds when the model obeyed "output only JSON"
    try {
      return JSON.parse(cleaned);
    } catch {}

    // Collect every { position
    const starts: number[] = [];
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === "{") starts.push(i);
    }

    const tryExtract = (start: number): Record<string, unknown> | null => {
      let depth = 0;
      for (let i = start; i < cleaned.length; i++) {
        if (cleaned[i] === "{") depth++;
        if (cleaned[i] === "}") {
          depth--;
          if (depth === 0) {
            const candidate = cleaned.substring(start, i + 1);
            try { return JSON.parse(candidate); } catch {}
            try {
              return JSON.parse(
                candidate.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]")
              );
            } catch {}
            return null;
          }
        }
      }
      return null;
    };

    // Pass 1: last-to-first, prefer objects that have schema keys
    for (let i = starts.length - 1; i >= 0; i--) {
      const r = tryExtract(starts[i]);
      if (r && ("name" in r || "price" in r)) return r;
    }

    // Pass 2: any parseable object (last-to-first)
    for (let i = starts.length - 1; i >= 0; i--) {
      const r = tryExtract(starts[i]);
      if (r) return r;
    }

    return null;
  };

  const growth = extractJSON(growthRaw) || {};
  const value = extractJSON(valueRaw) || {};
  const arbiter = extractJSON(arbiterRaw) || {};

  // Merge all three outputs into final ReportData
  // Priority: arbiter synthesis > value > growth for shared fields
  const merged = {
    ...growth,
    ...value,
    ...arbiter,
  } as Record<string, unknown>;

  // Ensure required fields
  const result: ReportData = {
    name: (merged.name as string) || ticker,
    ticker: (merged.ticker as string) || ticker,
    exchange: (merged.exchange as string) || "",
    sector: (merged.sector as string) || "",
    price: (merged.price as number) || 0,
    chg: (merged.chg as string) || "",
    range: (merged.range as string) || "",
    asof: (merged.asof as string) || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    currency: (merged.currency as string) || "USD · Millions",
    filingPeriod: (merged.filingPeriod as string) || "",
    filingDate: (merged.filingDate as string) || "",
    nextFiling: (merged.nextFiling as string) || "~90 days",
    stats: (merged.stats as ReportData["stats"]) || [],
    growthGurus: (merged.growthGurus as ReportData["growthGurus"]) || [],
    valueGurus: (merged.valueGurus as ReportData["valueGurus"]) || [],
    growthMetrics: (merged.growthMetrics as ReportData["growthMetrics"]) || [],
    valueMetrics: (merged.valueMetrics as ReportData["valueMetrics"]) || [],
    valueBandLabel: (merged.valueBandLabel as string) || "Value",
    valueBandLeft: (merged.valueBandLeft as string) || "20%",
    valueBandWidth: (merged.valueBandWidth as string) || "15%",
    growthBandLabel: (merged.growthBandLabel as string) || "Growth",
    growthBandLeft: (merged.growthBandLeft as string) || "70%",
    growthBandWidth: (merged.growthBandWidth as string) || "15%",
    markerLeft: (merged.markerLeft as string) || "50%",
    overlapType: (merged.overlapType as ReportData["overlapType"]) || "disjoint",
    overlapNote: (merged.overlapNote as string) || "",
    crux: (merged.crux as string) || "",
    cruxGrowth: (merged.cruxGrowth as string) || "",
    cruxValue: (merged.cruxValue as string) || "",
    payingForTitle: (merged.payingForTitle as string) || "",
    payingForDesc: (merged.payingForDesc as string) || "",
    decisiveDate: (merged.decisiveDate as string) || "",
    decisiveText: (merged.decisiveText as string) || "",
    premortemPrice: (merged.premortemPrice as string) || "",
    premortemQuote: (merged.premortemQuote as string) || "",
    premortemSteps: (merged.premortemSteps as ReportData["premortemSteps"]) || [],
    premortemCoda: (merged.premortemCoda as string) || "",
    catalysts: (merged.catalysts as ReportData["catalysts"]) || [],
    triggers: (merged.triggers as ReportData["triggers"]) || [],
    sources: (merged.sources as string) || "",
  };

  return result;
}
