"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { tokens as T } from "@/lib/tokens";
import { TIER_LIMITS } from "@/lib/usageLimit";

interface Profile {
  email: string | null;
  tier: "free" | "researcher" | "pro";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
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

function AccountPageInner() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [usedThisMonth, setUsedThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const justUpgraded = searchParams.get("upgraded") === "1";
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
          .select("email, tier, stripe_customer_id, stripe_subscription_id, created_at")
          .eq("id", user.id)
          .single(),
        supabase
          .from("analysis_usage")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", startOfMonth.toISOString()),
      ]);

      setProfile(
        profileRes.data ?? {
          email: user.email ?? null,
          tier: "free",
          stripe_customer_id: null,
          stripe_subscription_id: null,
          created_at: user.created_at,
        }
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

  async function handleUpgrade(priceId: string) {
    setUpgrading(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setUpgrading(null);
    }
  }

  async function handleManageBilling() {
    setUpgrading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setUpgrading(null);
    }
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

        {justUpgraded && (
          <div
            style={{
              background: "#0f2d1a",
              border: `1px solid ${T.growth}`,
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 16,
              fontSize: 13,
              color: T.growth,
            }}
          >
            Subscription activated — welcome to {tierLabel[tier]}!
          </div>
        )}

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

            {/* Upgrade cards — shown only to free users */}
            {tier === "free" && (
              <div style={{ marginBottom: 16 }}>
                {/* Researcher */}
                <div
                  style={{
                    background: T.card,
                    border: `1px solid ${T.line}`,
                    borderRadius: 12,
                    padding: "18px 20px",
                    marginBottom: 10,
                    boxShadow: T.shadow,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.value, marginBottom: 2 }}>Researcher</div>
                      <div style={{ fontSize: 12, color: T.soft }}>15 analyses / month</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: T.ink }}>$9<span style={{ fontSize: 12, fontWeight: 400, color: T.soft }}>/mo</span></div>
                      <div style={{ fontSize: 11, color: T.soft }}>or $90/yr (2 months free)</div>
                    </div>
                  </div>
                  <ul
                    style={{
                      margin: "0 0 12px 0",
                      padding: 0,
                      listStyle: "none",
                      fontSize: 12,
                      color: T.soft,
                      lineHeight: 1.7,
                    }}
                  >
                    {[
                      "Growth Scout · Value Guard · Arbiter synthesis",
                      "Full valuation bands with Crux question",
                      "Catalysts, triggers & Munger pre-mortem",
                      "Investment Journal with AI follow-up",
                    ].map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ color: T.value, fontSize: 10, flexShrink: 0 }}>✦</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_RESEARCHER_PRICE_ID!)}
                      disabled={upgrading !== null}
                      style={{
                        flex: 1,
                        padding: "9px 0",
                        background: T.value,
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#fff",
                        cursor: upgrading ? "not-allowed" : "pointer",
                        opacity: upgrading ? 0.6 : 1,
                        fontFamily: "'IBM Plex Sans',sans-serif",
                      }}
                    >
                      {upgrading === process.env.NEXT_PUBLIC_STRIPE_RESEARCHER_PRICE_ID ? "Redirecting…" : "Monthly — $9"}
                    </button>
                    <button
                      onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_RESEARCHER_ANNUAL_PRICE_ID!)}
                      disabled={upgrading !== null}
                      style={{
                        flex: 1,
                        padding: "9px 0",
                        background: "transparent",
                        border: `1px solid ${T.value}`,
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.value,
                        cursor: upgrading ? "not-allowed" : "pointer",
                        opacity: upgrading ? 0.6 : 1,
                        fontFamily: "'IBM Plex Sans',sans-serif",
                      }}
                    >
                      {upgrading === process.env.NEXT_PUBLIC_STRIPE_RESEARCHER_ANNUAL_PRICE_ID ? "Redirecting…" : "Annual — $90"}
                    </button>
                  </div>
                </div>

                {/* Pro */}
                <div
                  style={{
                    background: T.card,
                    border: `1px solid ${T.goldLine}`,
                    borderRadius: 12,
                    padding: "18px 20px",
                    boxShadow: T.shadow,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.gold, marginBottom: 2 }}>Pro</div>
                      <div style={{ fontSize: 12, color: T.soft }}>Unlimited analyses</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: T.ink }}>$19<span style={{ fontSize: 12, fontWeight: 400, color: T.soft }}>/mo</span></div>
                      <div style={{ fontSize: 11, color: T.soft }}>or $190/yr (2 months free)</div>
                    </div>
                  </div>
                  <ul
                    style={{
                      margin: "0 0 12px 0",
                      padding: 0,
                      listStyle: "none",
                      fontSize: 12,
                      color: T.soft,
                      lineHeight: 1.7,
                    }}
                  >
                    {[
                      "Everything in Researcher",
                      "No monthly cap — analyse any number of tickers",
                      "Screen the full cached universe without limits",
                      "Early access to new lenses and features",
                    ].map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ color: T.gold, fontSize: 10, flexShrink: 0 }}>✦</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!)}
                      disabled={upgrading !== null}
                      style={{
                        flex: 1,
                        padding: "9px 0",
                        background: T.gold,
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#000",
                        cursor: upgrading ? "not-allowed" : "pointer",
                        opacity: upgrading ? 0.6 : 1,
                        fontFamily: "'IBM Plex Sans',sans-serif",
                      }}
                    >
                      {upgrading === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ? "Redirecting…" : "Monthly — $19"}
                    </button>
                    <button
                      onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID!)}
                      disabled={upgrading !== null}
                      style={{
                        flex: 1,
                        padding: "9px 0",
                        background: "transparent",
                        border: `1px solid ${T.goldLine}`,
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.gold,
                        cursor: upgrading ? "not-allowed" : "pointer",
                        opacity: upgrading ? 0.6 : 1,
                        fontFamily: "'IBM Plex Sans',sans-serif",
                      }}
                    >
                      {upgrading === process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID ? "Redirecting…" : "Annual — $190"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Manage billing — shown to paid users */}
            {tier !== "free" && profile?.stripe_subscription_id && (
              <button
                onClick={handleManageBilling}
                disabled={upgrading === "portal"}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 18px",
                  background: "transparent",
                  border: `1px solid ${T.line}`,
                  borderRadius: 8,
                  fontSize: 13,
                  color: T.soft,
                  cursor: upgrading ? "not-allowed" : "pointer",
                  fontFamily: "'IBM Plex Sans',sans-serif",
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                {upgrading === "portal" ? "Opening…" : "Manage billing"}
              </button>
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

export default function AccountPage() {
  return (
    <Suspense>
      <AccountPageInner />
    </Suspense>
  );
}
