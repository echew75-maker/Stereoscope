import { createServerClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { action, id, ticker, text, threshold, check_date, status } = body;

  if (action === "create") {
    const { data, error } = await supabase
      .from("commitments")
      .insert({
        user_id: user.id,
        ticker: ticker.toUpperCase(),
        text,
        threshold: threshold || null,
        check_date: check_date || null,
        status: "watching",
      })
      .select()
      .single();

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }
    return Response.json({ success: true, data });
  }

  if (action === "delete") {
    const { error } = await supabase
      .from("commitments")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }
    return Response.json({ success: true });
  }

  if (action === "update_status") {
    const { error } = await supabase
      .from("commitments")
      .update({ status })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }
    return Response.json({ success: true });
  }

  if (action === "list") {
    const { data, error } = await supabase
      .from("commitments")
      .select("*")
      .eq("user_id", user.id)
      .eq("ticker", ticker.toUpperCase())
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }
    return Response.json({ success: true, data });
  }

  return Response.json({ success: false, error: "Unknown action" }, { status: 400 });
}
