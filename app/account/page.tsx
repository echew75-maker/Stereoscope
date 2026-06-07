"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { tokens as T } from "@/lib/tokens";
import { TIER_LIMITS } from "@/lib/usageLimit";

interface Profile {
  email: string | null;
  tier: "free" | "researcher" | "pro";
  created_at: string;
}

function UsageMeter({ used, limit }: { used: number; limit: number | null }) {
  if (limit === null) {
    return (
      <p style={{ fontSize: 13, color: T.growth, marginTop: 12 }}>
        ∞ Unlimited analyses
      </p>
    );
  }
  const pct = Math.min((used / limit) * 100, 100);
  const color = pct >= 100 ? T.bear : pct >= 80 ? T.neutral : T.growth;

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: T.soft,
          marginBottom: 6,
        }}
      >
        <span>This month</span>
        <span style={{ color, fontWeight: 600 }}>
          {used} / {limit} analyses
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: T.lineSoft,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 3,
            transition: "width .4s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [usedThisMonth, setUsedThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login?next=/account"); return; }

      const startOfMonth = new Date();
      startOfMonth.setUTCDate(1);
      startOfMonth.setUTCHours(0, 0, 0, 0);

      const [profileRes, usageRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("email, tier, created_at")
          .eq("id", user.id)
          .single(),
        supabase
          .from("analysis_usage")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", startOfMonth.toISOString()),
      ]);

      setProfile(
        profileRes.data ?? { email: user.email ?? null, tier: "free", created_at: user.created_at }
      );
      setUsedThisMonth(usageRes.count ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSignOut() {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const tier = profile?.tier ?? "free";
  const limit = TIER_LIMITS[tier];

  const tierLabel: Record<string, string> = {
    free: "Free",
    researcher: "Researcher",
    pro: "Pro",
  };

  const tierColor: Record<string, string> = {
    free: T.soft,
    researcher: T.value,
    pro: T.gold,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        fontFamily: "'IBM Plex Sans',-apple-system,sans-serif",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <span
            style={{
              fontFamily: "'Fraunces',serif",
              fontWeight: 600,
              fontSize: 20,
              letterSpacing: ".01em",
              cursor: "pointer",
            }}
            onClick={() => router.push("/")}
          >
            STEREO<span style={{ color: T.gold }}>SCOPE</span>
          </span>
        </div>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            marginBottom: 24,
            letterSpacing: "-.01em",
          }}
        >
          Your account
        </h1>

        {loading ? (
          <p style={{ color: T.soft, fontSize: 13.5 }}>Loading…</p>
        ) : (
          <>
            {/* Profile + usage card */}
            <div
              style={{
                background: T.card,
                border: `1px solid ${T.line}`,
                borderRadius: 12,
                padding: "20px 24px",
                marginBottom: 16,
                boxShadow: T.shadow,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: T.faint,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Email
              </div>
              <div style={{ fontSize: 14, color: T.ink, marginBottom: 20 }}>
                {profile?.email ?? "—"}
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: T.faint,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Plan
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: tierColor[tier],
                  marginBottom: 4,
                }}
              >
                {tierLabel[tier]}
              </div>

              <UsageMeter
                used={usedThisMonth}
                limit={limit === Infinity ? null : limit}
              />
            </div>

            {/* Upgrade nudge for free users */}
            {tier === "free" && (
              <div
                style={{
                  background: T.goldSoft,
                  border: `1px solid ${T.goldLine}`,
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: T.ink,
                  lineHeight: 1.6,
                }}
              >
                <strong>Researcher — $9/month</strong> · 15 analyses/month,
                annual option (pay 10 get 12) available.
                <br />
                <span style={{ color: T.soft }}>
                  Paid plans coming soon.
                </span>
              </div>
            )}

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              style={{
                padding: "10px 18px",
                background: "transparent",
                border: `1px solid ${T.line}`,
                borderRadius: 8,
                fontSize: 13,
                color: T.soft,
                cursor: "pointer",
                fontFamily: "'IBM Plex Sans',sans-serif",
              }}
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </div>
  );
}
