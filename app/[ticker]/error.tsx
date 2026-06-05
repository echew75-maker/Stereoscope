"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokens as T } from "@/lib/tokens";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: T.bg,
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          textAlign: "center",
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
            fontWeight: 500,
            fontSize: 22,
            marginBottom: 10,
            color: T.bear,
          }}
        >
          Analysis failed
        </div>
        <p style={{ fontSize: 13, color: T.soft, marginBottom: 20 }}>
          {error.message || "Something went wrong. Please try again."}
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              border: "none",
              background: T.ink,
              color: "#fff",
              borderRadius: 8,
              padding: "9px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
          <button
            onClick={() => router.push("/")}
            style={{
              border: `1px solid ${T.line}`,
              background: T.card,
              color: T.soft,
              borderRadius: 8,
              padding: "9px 20px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Back to search
          </button>
        </div>
      </div>
    </div>
  );
}
