import { createServerClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("ticker", ticker.toUpperCase())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return Response.json({ exists: false });
  }

  // Treat stale $0 reports (saved before the source-aware merge fix) as
  // non-existent so the page falls through to a fresh analysis.
  if (!data.report_data?.price || data.report_data.price === 0) {
    return Response.json({ exists: false });
  }

  const ageHours = Math.round(
    (Date.now() - new Date(data.created_at).getTime()) / 3600000
  );
  const expiresInDays = data.expires_at
    ? Math.round(
        (new Date(data.expires_at).getTime() - Date.now()) / 86400000
      )
    : null;

  return Response.json({
    exists: true,
    data: data.report_data,
    age_hours: ageHours,
    expires_in_days: expiresInDays,
    generated_at: data.created_at,
  });
}
