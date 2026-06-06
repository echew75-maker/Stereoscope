import { callClaude } from "@/lib/claude";
import { parseCommitment, stripCommitment } from "@/lib/commitment";
import { buildSparringPrompt } from "@/lib/prompts/sparring";
import { createServerClient } from "@/lib/supabase/server";
import { ReportData } from "@/lib/types";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { ticker, messages, reportData: clientReportData } = await req.json();

    if (!ticker || !messages?.length) {
      return Response.json({ error: "Missing ticker or messages" }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Load report data — prefer Supabase cache, fall back to client-supplied data
    let reportData: ReportData | null = null;
    const { data: reportRow } = await supabase
      .from("reports")
      .select("report_data")
      .eq("ticker", ticker.toUpperCase())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (reportRow) {
      reportData = reportRow.report_data as ReportData;
    } else if (clientReportData) {
      reportData = clientReportData as ReportData;
    }

    if (!reportData) {
      return Response.json({ error: "Report not found — run analysis first" }, { status: 404 });
    }

    const systemPrompt = buildSparringPrompt(reportData);
    const rawReply = await callClaude(systemPrompt, messages);

    const commitment = parseCommitment(rawReply);
    const reply = stripCommitment(rawReply);

    if (user) {
      const lastUserMsg = messages[messages.length - 1];
      if (lastUserMsg?.role === "user") {
        await supabase.from("journal_messages").insert([
          { user_id: user.id, ticker: ticker.toUpperCase(), role: "user", content: lastUserMsg.content },
          { user_id: user.id, ticker: ticker.toUpperCase(), role: "assistant", content: reply },
        ]);
      }
    }

    return Response.json({ reply, commitment_detected: commitment });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Journal failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
