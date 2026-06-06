"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { tokens as T } from "@/lib/tokens";
import { createClient } from "@/lib/supabase/client";

export function Masthead() {
  const [v, setV] = useState("");
  const [err, setErr] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleSearch() {
    const t = v.trim().toUpperCase();
    if (t.length >= 1 && t.length <= 6 && /^[A-Z]+$/.test(t)) {
      setErr(false);
      router.push(`/${t}`);
    } else if (t.length > 0) {
      setErr(true);
      setTimeout(() => setErr(false), 3000);
    }
  }

  return (
    <>
      <span
        style={{
          fontFamily: "'Fraunces',serif",
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: ".01em",
          cursor: "pointer",
          flexShrink: 0,
        }}
        onClick={() => router.push("/")}
      >
        STEREO<span style={{ color: T.gold }}>SCOPE</span>
      </span>

      <div style={{ flex: 1, maxWidth: 280, position: "relative" }}>
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Analyse a ticker…"
          style={{
            width: "100%",
            fontSize: 12.5,
            padding: "7px 10px 7px 28px",
            border: `1px solid ${err ? T.bear : T.line}`,
            borderRadius: 7,
            background: T.bg,
            color: T.ink,
            fontFamily: "'IBM Plex Sans',sans-serif",
            outline: "none",
            textTransform: "uppercase",
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: T.faint,
            fontSize: 12,
            pointerEvents: "none",
          }}
        >
          ⌕
        </span>
        {err && (
          <div
            style={{
              position: "absolute",
              top: 36,
              left: 0,
              right: 0,
              background: T.card,
              border: `1px solid ${T.bear}`,
              borderRadius: 7,
              padding: "7px 10px",
              fontSize: 11,
              color: T.bear,
              boxShadow: T.shadow,
              zIndex: 50,
            }}
          >
            Enter a valid ticker (1-6 letters)
          </div>
        )}
      </div>

      <Link
        href="/screener"
        style={{
          fontSize: 12,
          color: T.soft,
          textDecoration: "none",
          fontFamily: "'IBM Plex Mono',monospace",
          letterSpacing: ".02em",
          whiteSpace: "nowrap",
        }}
      >
        Screener
      </Link>

      {userEmail ? (
        <Link
          href="/account"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: T.goldSoft,
              border: `1px solid ${T.goldLine}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: T.gold,
              flexShrink: 0,
            }}
          >
            {userEmail.charAt(0).toUpperCase()}
          </span>
          <span
            style={{
              fontSize: 12,
              color: T.soft,
              fontFamily: "'IBM Plex Mono',monospace",
              letterSpacing: ".02em",
            }}
          >
            Account
          </span>
        </Link>
      ) : (
        <Link
          href="/auth/login"
          style={{
            fontSize: 12,
            color: T.soft,
            textDecoration: "none",
            fontFamily: "'IBM Plex Mono',monospace",
            letterSpacing: ".02em",
            whiteSpace: "nowrap",
          }}
        >
          Sign in
        </Link>
      )}
    </>
  );
}
