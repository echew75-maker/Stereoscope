"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tokens as T } from "@/lib/tokens";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else if (data.session) {
      // Email confirmation disabled — immediately logged in
      router.push("/");
      router.refresh();
    } else {
      // Email confirmation required
      setConfirmed(true);
    }
  }

  const passwordStrong = password.length >= 8;
  const ready = email.length > 0 && passwordStrong && !loading;

  if (confirmed) {
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
              marginBottom: 16,
            }}
          >
            STEREO<span style={{ color: T.gold }}>SCOPE</span>
          </div>
          <div
            style={{
              padding: "14px 16px",
              background: T.growthSoft,
              border: `1px solid ${T.growthLine}`,
              borderRadius: 8,
              fontSize: 13.5,
              color: T.growth,
              lineHeight: 1.5,
            }}
          >
            Check your email for a confirmation link. Once confirmed, you can
            sign in.
          </div>
          <p style={{ fontSize: 12, color: T.soft, marginTop: 16 }}>
            Already confirmed?{" "}
            <Link
              href="/auth/login"
              style={{ color: T.gold, textDecoration: "none" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
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
          Create your free account. 5 analyses/month, no credit card.
        </p>

        <form onSubmit={handleSignup}>
          <label
            style={{
              fontSize: 12,
              color: T.soft,
              display: "block",
              marginBottom: 5,
            }}
          >
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
              marginBottom: 12,
              outline: "none",
              fontFamily: "'IBM Plex Sans',sans-serif",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              fontSize: 12,
              color: T.soft,
              display: "block",
              marginBottom: 5,
            }}
          >
            Password{" "}
            <span style={{ color: T.faint }}>(8+ characters)</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${password.length > 0 && !passwordStrong ? T.bear : T.line}`,
              borderRadius: 8,
              fontSize: 13.5,
              marginBottom: password.length > 0 && !passwordStrong ? 6 : 16,
              outline: "none",
              fontFamily: "'IBM Plex Sans',sans-serif",
              boxSizing: "border-box",
            }}
          />

          {password.length > 0 && !passwordStrong && (
            <p
              style={{
                fontSize: 11.5,
                color: T.bear,
                marginBottom: 14,
                marginTop: 0,
              }}
            >
              Password must be at least 8 characters.
            </p>
          )}

          {error && (
            <div
              style={{
                padding: "10px 12px",
                background: "#FEF2F2",
                border: `1px solid #FCA5A5`,
                borderRadius: 8,
                fontSize: 13,
                color: T.bear,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!ready}
            style={{
              width: "100%",
              padding: "11px",
              background: ready ? T.ink : T.line,
              color: ready ? "#fff" : T.faint,
              border: "none",
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: ready ? "pointer" : "default",
              fontFamily: "'IBM Plex Sans',sans-serif",
            }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: `1px solid ${T.line}`,
            fontSize: 12,
            color: T.soft,
            textAlign: "center",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/auth/login"
            style={{ color: T.gold, textDecoration: "none" }}
          >
            Sign in
          </Link>
        </p>

        <p
          style={{
            fontSize: 11,
            color: T.faint,
            marginTop: 12,
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          By creating an account you agree to our Terms of Service. You must be
          18 or older to use Stereoscope.
        </p>
      </div>
    </div>
  );
}
