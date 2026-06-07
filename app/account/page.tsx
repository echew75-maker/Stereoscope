"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { tokens as T } from "@/lib/tokens";

interface Profile {
  email: string | null;
  tier: "free" | "researcher" | "pro";
  created_at: string;
}

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login?next=/account"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("email, tier, created_at")
        .eq("id", user.id)
        .single();

      setProfile(
        data ?? { email: user.email ?? null, tier: "free", created_at: user.created_at }
      );
      setLoading(false);
    }
    load();
  }, []);

  async function handleSignOut() {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const tierLabel: Record<string, string> = {
    free: "Free — 5 analyses / month",
    researcher: "Researcher — 15 analyses / month",
    pro: "Pro — Unlimited analyses",
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
            {/* Profile card */}
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
                  marginBottom: 8,
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
                  marginBottom: 8,
                }}
              >
                Plan
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: tierColor[profile?.tier ?? "free"],
                }}
              >
                {tierLabel[profile?.tier ?? "free"]}
              </div>
            </div>

            {/* Upgrade nudge for free users */}
            {profile?.tier === "free" && (
              <div
                style={{
                  background: T.goldSoft,
                  border: `1px solid ${T.goldLine}`,
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: T.ink,
                  lineHeight: 1.5,
                }}
              >
                <strong>Researcher — $9/month</strong> · 15 analyses, annual
                option available.
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
