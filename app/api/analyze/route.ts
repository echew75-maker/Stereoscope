import { callGemini } from "@/lib/gemini";
import { GROWTH_SCOUT_PROMPT } from "@/lib/prompts/growth-scout";
import { VALUE_GUARD_PROMPT } from "@/lib/prompts/value-guard";
import { ARBITER_PROMPT } from "@/lib/prompts/arbiter";
import { ANALYSIS_SCHEMA_PROMPT, parseReportJSON } from "@/lib/prompts/analysis-schema";
import { createServerClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { ticker, force } = await req.json();

  if (!ticker || !/^[A-Z]{1,6}$/.test(ticker.toUpperCase())) {
    return Response.json({ success: false, error: "Invalid ticker" }, { status: 400 });
  }

  const normalizedTicker = ticker.toUpperCase();
  const supabase = await createServerClient();

  // Check cache (skipped when force=true)
  if (!force) {
    const { data: cached } = await supabase
      .from("reports")
      .select("*")
      .eq("ticker", normalizedTicker)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      return Response.json({
        success: true,
        data: cached.report_data,
        cached: true,
        age_hours: Math.round(
          (Date.now() - new Date(cached.created_at).getTime()) / 3600000
        ),
      });
    }
  }

  try {
    const startTime = Date.now();
    const schemaInstructions = ANALYSIS_SCHEMA_PROMPT;

    // ── STAGES 1+2: Growth Scout and Value Guard run in parallel ──
    const [growthRaw, valueRaw] = await Promise.all([
      callGemini(
        GROWTH_SCOUT_PROMPT + "\n\n---\n\nOUTPUT FORMAT INSTRUCTIONS:\n" + schemaInstructions,
        `Analyze the stock ${normalizedTicker}. Search the web for its most recent quarterly filing (10-Q or equivalent), current stock price, revenue growth, NDR, RPO, EPS history, institutional ownership, and analyst targets. Produce the complete Growth Scout Phase 1 scratchpad and Phase 2 guru analysis. Then return the structured JSON object as specified.`,
        true
      ),
      callGemini(
        VALUE_GUARD_PROMPT + "\n\n---\n\nOUTPUT FORMAT INSTRUCTIONS:\n" + schemaInstructions,
        `Analyze the stock ${normalizedTicker}. Search the web for its most recent quarterly filing (10-Q or equivalent), balance sheet, cash flow statement, share count, SBC, debt, warrant liabilities, and analyst targets. Produce the complete Value Guard Phase 1 scratchpad and Phase 2 guru analysis. Then return the structured JSON object as specified.`,
        true
      ),
    ]);

    // ── STAGE 3: Arbiter (uses both outputs above) ──
    const arbiterRaw = await callGemini(
      ARBITER_PROMPT +
        "\n\n---\n\nOUTPUT FORMAT INSTRUCTIONS:\n" +
        schemaInstructions,
      `Here is the Growth Scout report for ${normalizedTicker}:\n\n${growthRaw}\n\nHere is the Value Guard report for ${normalizedTicker}:\n\n${valueRaw}\n\nProduce the Arbiter synthesis: factual reconciliation, valuation overlay with band positions, the Crux, the decisive data point, the Munger pre-mortem, 3 catalysts, 3 invalidation triggers, and the "what you're paying for" conditional. Return as the structured JSON object specified.`,
      false
    );

    // ── Merge into final ReportData ──
    const reportData = parseReportJSON(growthRaw, valueRaw, arbiterRaw, normalizedTicker);

    // Debug: if price is still 0, return raw snippets so we can diagnose
    if (!reportData.price || reportData.price === 0) {
      return Response.json({
        success: true,
        data: reportData,
        cached: false,
        analysis_time_ms: Date.now() - startTime,
        debug: {
          growthSnippet: growthRaw.substring(0, 500),
          valueSnippet: valueRaw.substring(0, 500),
          arbiterSnippet: arbiterRaw.substring(0, 500),
          growthLen: growthRaw.length,
          valueLen: valueRaw.length,
          arbiterLen: arbiterRaw.length,
        },
      });
    }

    // ── Save to cache (non-fatal: report still returns even if caching fails) ──
    const { error: upsertError } = await supabase.from("reports").upsert(
      {
        ticker: normalizedTicker,
        report_data: reportData,
        filing_period: reportData.filingPeriod,
        filing_date: reportData.filingDate,
        gemini_model: "gemini-2.5-flash",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "ticker,filing_period" }
    );

    return Response.json({
      success: true,
      data: reportData,
      cached: false,
      analysis_time_ms: Date.now() - startTime,
      cache_warning: upsertError ? upsertError.message : undefined,
    });
  } catch (err: unknown) {
    let message: string;
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    } else {
      try {
        message = JSON.stringify(err);
      } catch {
        message = "Analysis failed (unserializable error)";
      }
    }
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
