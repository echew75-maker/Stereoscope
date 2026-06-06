import { ReportData, ValuationAssumptions, GaapVsNonGaap } from "@/lib/types";

export const ANALYSIS_SCHEMA_PROMPT = `After completing your analysis, you MUST output the JSON object wrapped in <json> and </json> tags, exactly like this:

<json>
{ ... your JSON here ... }
</json>

No other text after the closing </json> tag. No markdown. No backticks. The schema:

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
  "sources": "2-3 sentences listing all sources with filing dates and URLs.",
  "valuation_assumptions": {
    "model_type": "DCF",
    "base_case": {
      "revenue_cagr": "8.5%",
      "terminal_growth_rate": "2.5%",
      "discount_rate": "9.0%",
      "exit_multiple_or_margin": "22% FCF margin",
      "key_assumption": "Non-GAAP operating margin expands from 18.4% to 23% by FY2027."
    },
    "bull_case_delta": "Revenue CAGR steps up to 12% on faster enterprise adoption.",
    "bear_case_delta": "Discount rate widens to 11% as risk-free rate stays elevated.",
    "range_low": 145,
    "range_high": 215
  },
  "gaap_vs_non_gaap": {
    "gaap_eps": "-0.22",
    "non_gaap_eps": "0.85",
    "delta_pct": 486,
    "sbc_pct_revenue": 18.5,
    "explainer": "The $1.07 gap between GAAP and non-GAAP EPS is almost entirely stock-based compensation — real dilution paid in shares rather than cash. SBC of ~18.5% of revenue is high; per-share economics look very different through a GAAP lens."
  }
}

CRITICAL RULES:
- "s" field: "b" = bullish (green), "n" = neutral (amber), "r" = bearish (red). Assign based on the guru's framework applied to this stock's specific data.
- "c" field for metrics: "b" = positive/green, "r" = negative/red, "" = neutral
- "overview" and "conclusion" MUST be separate fields with different content. Overview = analysis. Conclusion = actionable implication referencing at least one specific number.
- The crux must be a genuine analytical tension — not a restatement of "growth vs value"
- Premortem assumes a 50% price decline over 5 years and builds a specific, plausible narrative with actual financial figures
- Band positions: calculate left% and width% to place bands on a 0-100% axis where 0% = $0 and 100% = 1.5× the highest target price. markerLeft places current price on same axis.
- All numbers must come from web search results, NOT pre-trained memory
- "gaap_vs_non_gaap" is the Value Guard's responsibility. Include this block ONLY when the gap is material: either |non_gaap_eps − gaap_eps| / |gaap_eps| > 0.20 (i.e. delta_pct > 20) OR sbc_pct_revenue > 10. If both conditions are false (typical of mature profitable companies where the gap is cosmetic), omit the "gaap_vs_non_gaap" field entirely — do not emit it as null or with placeholder zeros. The Growth Scout should never emit this block; if it does it will be ignored.
- "explainer" must be 2-3 plain-English sentences a retail investor can follow. Name the specific cause (stock-based compensation, restructuring charges, one-time tax items) and quantify what it means per share.
- Return ONLY the JSON object, nothing else`;

// Escape raw control characters (newlines, tabs, CRs) that appear *inside*
// JSON string literals. Gemini occasionally emits these unescaped when an
// "overview"/"conclusion"/"key_assumption" string runs long, which makes
// JSON.parse throw "Bad control character in string literal".
function escapeControlCharsInStrings(s: string): string {
  let out = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (escaped) { out += c; escaped = false; continue; }
    if (c === "\\") { out += c; escaped = true; continue; }
    if (c === '"') { out += c; inString = !inString; continue; }
    if (inString) {
      if (c === "\n") { out += "\\n"; continue; }
      if (c === "\r") { out += "\\r"; continue; }
      if (c === "\t") { out += "\\t"; continue; }
    }
    out += c;
  }
  return out;
}

function tryParse(s: string): Record<string, unknown> | null {
  try { return JSON.parse(s); } catch {}
  try { return JSON.parse(s.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]")); } catch {}
  try { return JSON.parse(escapeControlCharsInStrings(s)); } catch {}
  return null;
}

// Extracts the report JSON object from a raw Gemini response. Prefers the
// <json>...</json> delimiter, then falls back to direct parse and bracket scan.
export function extractReportJSON(text: string): Record<string, unknown> | null {
  // Primary: extract between <json> ... </json> delimiters
  const tagged = text.match(/<json>([\s\S]*?)<\/json>/i);
  if (tagged) {
    const r = tryParse(tagged[1].trim());
    if (r) return r;
  }

  // Fallback: direct parse after stripping markdown fences
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const direct = tryParse(cleaned);
  if (direct) return direct;

  // Fallback: scan all { positions last-to-first, prefer objects with schema keys
  const starts: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === "{") starts.push(i);
  }

  const bracketExtract = (start: number): Record<string, unknown> | null => {
    let depth = 0;
    for (let i = start; i < cleaned.length; i++) {
      if (cleaned[i] === "{") depth++;
      if (cleaned[i] === "}") { depth--; if (depth === 0) return tryParse(cleaned.substring(start, i + 1)); }
    }
    return null;
  };

  for (let i = starts.length - 1; i >= 0; i--) {
    const r = bracketExtract(starts[i]);
    if (r && ("name" in r || "price" in r)) return r;
  }
  for (let i = starts.length - 1; i >= 0; i--) {
    const r = bracketExtract(starts[i]);
    if (r) return r;
  }

  return null;
}

function validateAssumptions(
  raw: unknown,
  lens: "Growth Scout" | "Value Guard",
  ticker: string
): ValuationAssumptions | null {
  if (!raw || typeof raw !== "object") {
    console.warn(
      `[Stereoscope] valuation_assumptions missing or invalid for ${lens} on ticker ${ticker}`
    );
    return null;
  }
  const a = raw as Record<string, unknown>;
  const base = a.base_case as Record<string, unknown> | undefined;
  const ok =
    typeof a.model_type === "string" &&
    base !== undefined &&
    typeof base === "object" &&
    typeof base.revenue_cagr === "string" &&
    typeof base.key_assumption === "string" &&
    typeof a.bull_case_delta === "string" &&
    typeof a.bear_case_delta === "string" &&
    typeof a.range_low === "number" &&
    typeof a.range_high === "number";

  if (!ok) {
    console.warn(
      `[Stereoscope] valuation_assumptions missing or invalid for ${lens} on ticker ${ticker}`
    );
    return null;
  }

  return {
    model_type: a.model_type as string,
    base_case: {
      revenue_cagr: base.revenue_cagr as string,
      terminal_growth_rate:
        typeof base.terminal_growth_rate === "string" ? base.terminal_growth_rate : null,
      discount_rate:
        typeof base.discount_rate === "string" ? base.discount_rate : null,
      exit_multiple_or_margin:
        typeof base.exit_multiple_or_margin === "string"
          ? base.exit_multiple_or_margin
          : null,
      key_assumption: base.key_assumption as string,
    },
    bull_case_delta: a.bull_case_delta as string,
    bear_case_delta: a.bear_case_delta as string,
    range_low: a.range_low as number,
    range_high: a.range_high as number,
  };
}

function validateGaapVsNonGaap(raw: unknown): GaapVsNonGaap | null {
  if (!raw || typeof raw !== "object") return null;
  const g = raw as Record<string, unknown>;
  const ok =
    (typeof g.gaap_eps === "string" || typeof g.gaap_eps === "number") &&
    (typeof g.non_gaap_eps === "string" || typeof g.non_gaap_eps === "number") &&
    typeof g.delta_pct === "number" &&
    typeof g.sbc_pct_revenue === "number" &&
    typeof g.explainer === "string" &&
    g.explainer.trim().length > 0;
  if (!ok) return null;
  // Re-apply the materiality gate defensively in case the model emitted the
  // block even when the gap is cosmetic.
  if ((g.delta_pct as number) <= 20 && (g.sbc_pct_revenue as number) <= 10) return null;
  return {
    gaap_eps: String(g.gaap_eps),
    non_gaap_eps: String(g.non_gaap_eps),
    delta_pct: g.delta_pct as number,
    sbc_pct_revenue: g.sbc_pct_revenue as number,
    explainer: g.explainer as string,
  };
}

export function parseReportJSON(
  growthRaw: string,
  valueRaw: string,
  arbiterRaw: string,
  ticker: string
): ReportData {
  const extractJSON = extractReportJSON;

  const growth = extractJSON(growthRaw) || {};
  const value  = extractJSON(valueRaw)  || {};
  const arbiter = extractJSON(arbiterRaw) || {};

  // A scout "succeeded" when it produced a non-empty gurus array of its own
  // lens. Empty array → the scout failed to emit usable structured output and
  // the UI should surface that explicitly rather than render misleading zeros.
  const growthScoutOk = Array.isArray(growth.growthGurus) && growth.growthGurus.length > 0;
  const valueScoutOk = Array.isArray(value.valueGurus) && value.valueGurus.length > 0;

  // Per-lens assumptions: Growth Scout owns growthAssumptions, Value Guard owns
  // valueAssumptions. Validate each independently; missing/malformed → null so
  // the UI renders the fallback line instead of crashing.
  const growthAssumptions = validateAssumptions(
    growth.valuation_assumptions,
    "Growth Scout",
    ticker
  );
  const valueAssumptions = validateAssumptions(
    value.valuation_assumptions,
    "Value Guard",
    ticker
  );

  // GAAP-vs-non-GAAP block is Value Guard's responsibility. Returns null when
  // either the model omitted the block (gap was cosmetic) or the materiality
  // gate isn't met when the validator re-checks it.
  const gaapVsNonGaap = validateGaapVsNonGaap(value.gaap_vs_non_gaap);

  // Helpers
  type GA = ReportData["growthGurus"];   type VA = ReportData["valueGurus"];
  type SA = ReportData["stats"];         type MA = ReportData["growthMetrics"];
  type VMA = ReportData["valueMetrics"]; type PA = ReportData["premortemSteps"];
  type CA = ReportData["catalysts"];     type TA = ReportData["triggers"];

  // first<T>: return first truthy value from candidate list
  function first<T>(...vals: (T | null | undefined)[]): T | undefined {
    return vals.find((v) => v !== null && v !== undefined && v !== 0 && v !== "") as T | undefined;
  }
  // firstArr<T>: return first non-empty array
  function firstArr<T>(a: unknown, b: unknown, c: unknown): T[] {
    const pick = (x: unknown) => (Array.isArray(x) && x.length > 0 ? x as T[] : null);
    return pick(a) ?? pick(b) ?? pick(c) ?? [];
  }

  // SOURCE RULES
  // Scouts (Growth + Value) own: price, basic identifiers, filing data, gurus, metrics.
  //   The Arbiter does NOT search the web and reliably outputs price=0 — do not let it
  //   override scout prices.
  // Arbiter owns: synthesis fields (crux, valuation bands, premortem, catalysts, triggers).

  const result: ReportData = {
    // ── Scout-owned: prefer Growth → Value → Arbiter ──
    name:         first<string>(growth.name as string, value.name as string, arbiter.name as string) ?? ticker,
    ticker:       first<string>(growth.ticker as string, value.ticker as string, arbiter.ticker as string) ?? ticker,
    exchange:     first<string>(growth.exchange as string, value.exchange as string, arbiter.exchange as string) ?? "",
    sector:       first<string>(growth.sector as string, value.sector as string, arbiter.sector as string) ?? "",
    price:        first<number>(growth.price as number, value.price as number, arbiter.price as number) ?? 0,
    chg:          first<string>(growth.chg as string, value.chg as string, arbiter.chg as string) ?? "",
    range:        first<string>(growth.range as string, value.range as string, arbiter.range as string) ?? "",
    asof:         first<string>(growth.asof as string, value.asof as string, arbiter.asof as string)
                    ?? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    currency:     first<string>(growth.currency as string, value.currency as string, arbiter.currency as string) ?? "USD · Millions",
    filingPeriod: first<string>(growth.filingPeriod as string, value.filingPeriod as string, arbiter.filingPeriod as string) ?? "",
    filingDate:   first<string>(growth.filingDate as string, value.filingDate as string, arbiter.filingDate as string) ?? "",
    nextFiling:   first<string>(growth.nextFiling as string, value.nextFiling as string, arbiter.nextFiling as string) ?? "~90 days",
    stats:        firstArr<SA[number]>(growth.stats, value.stats, arbiter.stats),
    growthGurus:  firstArr<GA[number]>(growth.growthGurus, arbiter.growthGurus, value.growthGurus),
    valueGurus:   firstArr<VA[number]>(value.valueGurus, arbiter.valueGurus, growth.valueGurus),
    growthMetrics: firstArr<MA[number]>(growth.growthMetrics, arbiter.growthMetrics, value.growthMetrics),
    valueMetrics:  firstArr<VMA[number]>(value.valueMetrics, arbiter.valueMetrics, growth.valueMetrics),

    // ── Arbiter-owned: prefer Arbiter → fallback to scouts ──
    valueBandLabel: first<string>(arbiter.valueBandLabel as string, value.valueBandLabel as string, growth.valueBandLabel as string) ?? "Value",
    valueBandLeft:  first<string>(arbiter.valueBandLeft as string, value.valueBandLeft as string, growth.valueBandLeft as string) ?? "20%",
    valueBandWidth: first<string>(arbiter.valueBandWidth as string, value.valueBandWidth as string, growth.valueBandWidth as string) ?? "15%",
    growthBandLabel: first<string>(arbiter.growthBandLabel as string, growth.growthBandLabel as string, value.growthBandLabel as string) ?? "Growth",
    growthBandLeft:  first<string>(arbiter.growthBandLeft as string, growth.growthBandLeft as string, value.growthBandLeft as string) ?? "70%",
    growthBandWidth: first<string>(arbiter.growthBandWidth as string, growth.growthBandWidth as string, value.growthBandWidth as string) ?? "15%",
    markerLeft:   first<string>(arbiter.markerLeft as string, growth.markerLeft as string, value.markerLeft as string) ?? "50%",
    overlapType:  (arbiter.overlapType ?? growth.overlapType ?? value.overlapType ?? "disjoint") as ReportData["overlapType"],
    overlapNote:  first<string>(arbiter.overlapNote as string, growth.overlapNote as string, value.overlapNote as string) ?? "",
    crux:         first<string>(arbiter.crux as string, growth.crux as string, value.crux as string) ?? "",
    cruxGrowth:   first<string>(arbiter.cruxGrowth as string, growth.cruxGrowth as string) ?? "",
    cruxValue:    first<string>(arbiter.cruxValue as string, value.cruxValue as string) ?? "",
    payingForTitle: first<string>(arbiter.payingForTitle as string, growth.payingForTitle as string, value.payingForTitle as string) ?? "",
    payingForDesc:  first<string>(arbiter.payingForDesc as string, growth.payingForDesc as string, value.payingForDesc as string) ?? "",
    decisiveDate:   first<string>(arbiter.decisiveDate as string, growth.decisiveDate as string, value.decisiveDate as string) ?? "",
    decisiveText:   first<string>(arbiter.decisiveText as string, growth.decisiveText as string, value.decisiveText as string) ?? "",
    premortemPrice: first<string>(arbiter.premortemPrice as string, growth.premortemPrice as string, value.premortemPrice as string) ?? "",
    premortemQuote: first<string>(arbiter.premortemQuote as string, growth.premortemQuote as string, value.premortemQuote as string) ?? "",
    premortemSteps: firstArr<PA[number]>(arbiter.premortemSteps, growth.premortemSteps, value.premortemSteps),
    premortemCoda:  first<string>(arbiter.premortemCoda as string, growth.premortemCoda as string, value.premortemCoda as string) ?? "",
    catalysts: firstArr<CA[number]>(arbiter.catalysts, growth.catalysts, value.catalysts),
    triggers:  firstArr<TA[number]>(arbiter.triggers, growth.triggers, value.triggers),
    sources:   first<string>(arbiter.sources as string, growth.sources as string, value.sources as string) ?? "",

    // ── Per-lens valuation assumptions ──
    growthAssumptions,
    valueAssumptions,
    gaapVsNonGaap,
    growthScoutOk,
    valueScoutOk,
  };

  return result;
}
