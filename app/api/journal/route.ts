import { callClaude } from "@/lib/claude";
import { buildSparringPrompt } from "@/lib/prompts/sparring";
import { createServerClient } from "@/lib/supabase/server";
import { ReportData } from "@/lib/types";
import { NextRequest } from "next/server";

function parseCommitment(text: string) {
  const m = text.match(
    /\[COMMITMENT:\s*(.+?)\s*\|\s*THRESHOLD:\s*(.+?)\s*\|\s*CHECK:\s*(.+?)\s*\]/
  );
  return m ? { text: m[1], threshold: m[2], checkDate: m[3] } : null;
}

function stripCommitment(text: string) {
  return text.replace(/\n?\[COMMITMENT:.*?\]/, "").trim();
}

export async function POST(req: NextRequest) {
  const { ticker, messages } = await req.json();

  if (!ticker || !messages?.length) {
    return Response.json({ success: false, error: "Missing ticker or messages" }, { status: 400 });
  }

  const supabase = await createServerClient();

  // Get auth user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Load report data for context
  const { data: reportRow } = await supabase
    .from("reports")
    .select("report_data")
    .eq("ticker", ticker.toUpperCase())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!reportRow) {
    return Response.json({ success: false, error: "Report not found — run analysis first" }, { status: 404 });
  }

  const reportData = reportRow.report_data as ReportData;
  const systemPrompt = buildSparringPrompt(reportData);

  // Call Claude Haiku
  const rawReply = await callClaude(systemPrompt, messages);

  const commitment = parseCommitment(rawReply);
  const reply = stripCommitment(rawReply);

  // Save messages if user is authenticated
  if (user) {
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg?.role === "user") {
      await supabase.from("journal_messages").insert([
        {
          user_id: user.id,
          ticker: ticker.toUpperCase(),
          role: "user",
          content: lastUserMsg.content,
        },
        {
          user_id: user.id,
          ticker: ticker.toUpperCase(),
          role: "assistant",
          content: reply,
        },
      ]);
    }
  }

  return Response.json({
    reply,
    commitment_detected: commitment,
  });
}
