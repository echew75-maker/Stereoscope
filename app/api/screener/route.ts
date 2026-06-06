import { createServerClient } from "@/lib/supabase/server";
import {
  disagreementScore,
  convergenceMetrics,
  ConvergenceDirection,
} from "@/lib/reportMeta";
import { ReportData } from "@/lib/types";

export const dynamic = "force-dynamic";

export interface ScreenerRow {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  disagreementScore: number;
  disagreementLabel: "Largely Aligned" | "Material Tension" | "Sharply Divided";
  direction: ConvergenceDirection;
  midpointPrice: number;
  upsidePct: number;
  growthBandLabel: string;
  valueBandLabel: string;
  ageHours: number;
  crux: string;
}

export async function GET() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("reports")
    .select("ticker, report_data, created_at, expires_at")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    return Response.json(
      { rows: [], error: error.message, universe: { totalCached: 0 } },
      { status: 500 }
    );
  }

  const seen = new Set<string>();
  const rows: ScreenerRow[] = [];
  let totalConsidered = 0;

  for (const row of data ?? []) {
    if (seen.has(row.ticker)) continue;
    seen.add(row.ticker);
    totalConsidered++;

    const rd = row.report_data as ReportData | null;
    if (!rd || !rd.price || rd.price <= 0) continue;

    // Older cached rows may pre-date the scout-ok flags; fall back to gurus
    // array shape for backward compatibility.
    const growthOk =
      rd.growthScoutOk ??
      (Array.isArray(rd.growthGurus) && rd.growthGurus.length > 0);
    const valueOk =
      rd.valueScoutOk ??
      (Array.isArray(rd.valueGurus) && rd.valueGurus.length > 0);
    if (!growthOk || !valueOk) continue;

    const d = disagreementScore(rd);
    if (!d) continue;
    const c = convergenceMetrics(rd);
    if (!c) continue;

    const ageHours = Math.round(
      (Date.now() - new Date(row.created_at).getTime()) / 3600000
    );

    rows.push({
      ticker: rd.ticker || row.ticker,
      name: rd.name || row.ticker,
      sector: rd.sector || "",
      price: rd.price,
      disagreementScore: d.score,
      disagreementLabel: d.label,
      direction: c.direction,
      midpointPrice: c.midpointPrice,
      upsidePct: c.upsidePct,
      growthBandLabel: rd.growthBandLabel || "",
      valueBandLabel: rd.valueBandLabel || "",
      ageHours,
      crux: rd.crux || "",
    });
  }

  return Response.json({
    rows,
    universe: {
      totalCached: totalConsidered,
      totalReturned: rows.length,
    },
  });
}
