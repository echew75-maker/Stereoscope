import { SupabaseClient } from "@supabase/supabase-js";

export const TIER_LIMITS: Record<string, number> = {
  free: 5,
  researcher: 15,
  pro: Infinity,
};

export interface UsageStatus {
  tier: "free" | "researcher" | "pro";
  used: number;
  limit: number | null; // null = unlimited
  allowed: boolean;
}

export async function getUsageStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<UsageStatus> {
  const [profileRes, usageRes] = await Promise.all([
    supabase.from("profiles").select("tier").eq("id", userId).single(),
    supabase
      .from("analysis_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth()),
  ]);

  const tier = (profileRes.data?.tier ?? "free") as UsageStatus["tier"];
  const limit = TIER_LIMITS[tier];
  const used = usageRes.count ?? 0;

  return {
    tier,
    used,
    limit: limit === Infinity ? null : limit,
    allowed: limit === Infinity || used < limit,
  };
}

export async function recordUsage(
  supabase: SupabaseClient,
  userId: string,
  ticker: string
): Promise<void> {
  await supabase
    .from("analysis_usage")
    .insert({ user_id: userId, ticker });
}

function startOfMonth(): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}
