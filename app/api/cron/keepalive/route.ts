import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

// Supabase's free tier auto-pauses projects after 7 days with no database
// activity. Vercel Cron hits this route twice a week to keep the project
// alive — no need for an actual report request to do it.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { error } = await supabaseAdmin.from("reports").select("id").limit(1);

  return Response.json({
    ok: !error,
    error: error?.message,
    ts: new Date().toISOString(),
  });
}
