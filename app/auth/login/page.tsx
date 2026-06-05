"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { tokens as T } from "@/lib/tokens";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        fontFamily: "'IBM Plex Sans',-apple-system,sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          background: T.card,
          border: `1px solid ${T.line}`,
          borderRadius: 14,
          padding: "32px 28px",
          boxShadow: T.shadow,
        }}
      >
        <div
          style={{
            fontFamily: "'Fraunces',serif",
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: ".01em",
            marginBottom: 6,
          }}
        >
          STEREO<span style={{ color: T.gold }}>SCOPE</span>
        </div>
        <p style={{ fontSize: 13.5, color: T.soft, marginBottom: 24 }}>
          Sign in to save your journal and commitments.
        </p>

        {sent ? (
          <div
            style={{
              padding: "14px 16px",
              background: T.growthSoft,
              border: `1px solid ${T.growthLine}`,
              borderRadius: 8,
              fontSize: 13,
              color: T.growth,
            }}
          >
            Check your email for a magic link. You can close this tab.
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <label style={{ fontSize: 12, color: T.soft, display: "block", marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${T.line}`,
                borderRadius: 8,
                fontSize: 13.5,
                marginBottom: 14,
                outline: "none",
                fontFamily: "'IBM Plex Sans',sans-serif",
              }}
            />
            <button
              type="submit"
              disabled={loading || !email}
              style={{
                width: "100%",
                padding: "11px",
                background: email && !loading ? T.ink : T.line,
                color: email && !loading ? "#fff" : T.faint,
                border: "none",
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: email && !loading ? "pointer" : "default",
                fontFamily: "'IBM Plex Sans',sans-serif",
              }}
            >
              {loading ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
