/* eslint-disable @typescript-eslint/no-require-imports */
// Probe: runs Growth Scout + Value Guard against PYPL and inspects the
// valuation_assumptions block in each response. Standalone — no Supabase, no
// Arbiter. Run with: npx tsx scripts/probe-assumptions.ts
import * as fs from "node:fs";
import * as path from "node:path";

// Load .env.local manually (no dotenv dep)
const envFile = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
for (const line of envFile.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

import { callGemini } from "../lib/gemini";
import { GROWTH_SCOUT_PROMPT } from "../lib/prompts/growth-scout";
import { VALUE_GUARD_PROMPT } from "../lib/prompts/value-guard";
import { ANALYSIS_SCHEMA_PROMPT, extractReportJSON } from "../lib/prompts/analysis-schema";

const TICKER = process.argv[2] || "PYPL";

function check(name: string, raw: string) {
  console.log(`\n================ ${name} (${raw.length} chars) ================`);
  const json = extractReportJSON(raw) as Record<string, unknown> | null;
  if (!json) {
    console.log("❌ Could not extract JSON. First 1500 chars of raw:");
    console.log(raw.substring(0, 1500));
    return;
  }

  const va = (json as { valuation_assumptions?: unknown }).valuation_assumptions;
  console.log(`\nCheck 1 — valuation_assumptions key present? ${va ? "✅" : "❌"}`);

  if (!va) {
    console.log("Raw response (last 2000 chars, where the JSON usually sits):");
    console.log(raw.substring(Math.max(0, raw.length - 2000)));
    return;
  }

  console.log("\nFull valuation_assumptions block:");
  console.log(JSON.stringify(va, null, 2));

  const v = va as {
    base_case?: { key_assumption?: unknown };
    range_low?: unknown;
    range_high?: unknown;
  };
  const ka = v.base_case?.key_assumption;
  const isOneSentence =
    typeof ka === "string" && ka.trim().length > 0 &&
    (ka.match(/[.!?]/g) || []).length <= 1;
  const hasNumber = typeof ka === "string" && /\d/.test(ka);
  console.log(`\nCheck 2 — key_assumption single sentence with a number? ${isOneSentence && hasNumber ? "✅" : "❌"}`);
  console.log(`         "${ka}"`);
  console.log(`         (one-sentence: ${isOneSentence}, contains digit: ${hasNumber})`);

  const rangeStr = (json as { range?: string }).range;
  console.log(`\nCheck 3 — range_low / range_high vs stated 'range' field`);
  console.log(`         valuation_assumptions.range_low  = ${v.range_low}`);
  console.log(`         valuation_assumptions.range_high = ${v.range_high}`);
  console.log(`         json.range string                = "${rangeStr}"`);

  // Try to extract two numbers from the rangeStr ("$58 – $92")
  const nums = typeof rangeStr === "string"
    ? (rangeStr.match(/\d+(?:\.\d+)?/g) || []).map(Number)
    : [];
  if (nums.length >= 2 && typeof v.range_low === "number" && typeof v.range_high === "number") {
    const lowMatch = Math.abs(nums[0] - v.range_low) < 0.01;
    const highMatch = Math.abs(nums[1] - v.range_high) < 0.01;
    console.log(`         Low match:  ${lowMatch ? "✅" : "❌"} (${nums[0]} vs ${v.range_low})`);
    console.log(`         High match: ${highMatch ? "✅" : "❌"} (${nums[1]} vs ${v.range_high})`);
  } else {
    console.log("         ⚠ Could not extract two numbers from json.range to compare.");
  }
}

async function main() {
  console.log(`Probing PYPL with both scouts in parallel… (this takes 30–90s)`);
  const userMsgGrowth = `Analyze the stock ${TICKER}. Search the web for its most recent quarterly filing (10-Q or equivalent), current stock price, revenue growth, NDR, RPO, EPS history, institutional ownership, and analyst targets. Produce the complete Growth Scout Phase 1 scratchpad and Phase 2 guru analysis. Then return the structured JSON object as specified.`;
  const userMsgValue = `Analyze the stock ${TICKER}. Search the web for its most recent quarterly filing (10-Q or equivalent), balance sheet, cash flow statement, share count, SBC, debt, warrant liabilities, and analyst targets. Produce the complete Value Guard Phase 1 scratchpad and Phase 2 guru analysis. Then return the structured JSON object as specified.`;

  const schema = ANALYSIS_SCHEMA_PROMPT;

  const t0 = Date.now();
  const [growthRaw, valueRaw] = await Promise.all([
    callGemini(GROWTH_SCOUT_PROMPT + "\n\n---\n\nOUTPUT FORMAT INSTRUCTIONS:\n" + schema, userMsgGrowth, true),
    callGemini(VALUE_GUARD_PROMPT  + "\n\n---\n\nOUTPUT FORMAT INSTRUCTIONS:\n" + schema, userMsgValue, true),
  ]);
  console.log(`Both scouts finished in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);

  // Persist for inspection
  fs.mkdirSync("scripts/out", { recursive: true });
  fs.writeFileSync(`scripts/out/${TICKER}-growth.txt`, growthRaw);
  fs.writeFileSync(`scripts/out/${TICKER}-value.txt`, valueRaw);

  check("GROWTH SCOUT", growthRaw);
  check("VALUE GUARD", valueRaw);

  console.log(`\nFull raw responses saved to scripts/out/${TICKER}-growth.txt and ${TICKER}-value.txt`);
}

main().catch((e) => {
  console.error("Probe failed:", e);
  process.exit(1);
});
