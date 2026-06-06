"use client";

import { tokens as T } from "@/lib/tokens";

interface Props {
  lens: "Growth Scout" | "Value Guard";
  onRetry: () => void;
}

export function LensFailurePanel({ lens, onRetry }: Props) {
  const accent = lens === "Growth Scout" ? T.growth : T.value;
  const tint = lens === "Growth Scout" ? T.growthSoft : T.valueSoft;
  const icon = lens === "Growth Scout" ? "◇" : "◆";

  return (
    <div
      style={{
        background: T.card,
        border: `1px dashed ${accent}66`,
        borderRadius: 12,
        boxShadow: T.shadow,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: `1px solid ${T.line}`,
          background: tint,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: accent,
          }}
        >
          {icon} {lens}
        </div>
        <div
          style={{
            fontFamily: "'Fraunces',serif",
            fontWeight: 500,
            fontSize: 17,
            marginTop: 2,
          }}
        >
          Analysis incomplete on this run
        </div>
      </div>
      <div style={{ padding: "18px 16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 12 }}>
        <div style={{ fontSize: 12.5, color: T.soft, lineHeight: 1.6 }}>
          The {lens} didn&apos;t return a usable structured analysis on the last
          attempt — usually a transient timeout or token-limit issue rather than
          something specific to this ticker. The other lens&apos;s conclusions
          are unaffected.
        </div>
        <div style={{ fontSize: 11.5, color: T.faint, lineHeight: 1.55 }}>
          The Crux, valuation overlay, and Munger pre-mortem on this page reflect
          only the lens that succeeded. Re-running typically resolves it.
        </div>
        <button
          onClick={onRetry}
          className="no-print"
          style={{
            marginTop: 4,
            border: "none",
            background: accent,
            color: "#fff",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'IBM Plex Sans',sans-serif",
          }}
        >
          ↻ Re-run {lens}
        </button>
      </div>
    </div>
  );
}
