"use client";

import { tokens as T } from "@/lib/tokens";
import { Commitment } from "@/lib/types";

const statusStyle: Record<string, { bg: string; c: string; l: string }> = {
  watching: { bg: T.goldSoft, c: T.gold, l: "WATCHING" },
  ok: { bg: T.growthSoft, c: T.growth, l: "ON TRACK" },
  warning: { bg: "#FEF2E7", c: "#B54708", l: "AT RISK" },
  fired: { bg: "#FDECEA", c: T.bear, l: "TRIGGERED" },
};

function fmtTs(ts: number) {
  const d = new Date(ts);
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${mo[d.getMonth()]} ${d.getFullYear()}`;
}

interface Props {
  commitment: Commitment;
  onRemove: (id: string) => void;
}

export function CommitmentCard({ commitment: c, onRemove }: Props) {
  const st = statusStyle[c.status] || statusStyle.watching;

  return (
    <div
      style={{
        border: `1px solid ${T.line}`,
        borderRadius: 10,
        padding: "12px 14px",
        background: T.card,
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <span
              style={{
                padding: "2px 7px",
                borderRadius: 3,
                fontSize: 9,
                fontFamily: "'IBM Plex Mono',monospace",
                fontWeight: 600,
                background: st.bg,
                color: st.c,
              }}
            >
              {st.l}
            </span>
            <span
              style={{
                fontSize: 10,
                color: T.faint,
                fontFamily: "'IBM Plex Mono',monospace",
              }}
            >
              since {fmtTs(c.createdAt)}
            </span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{c.text}</div>
          <div style={{ fontSize: 11.5, color: T.soft }}>
            Threshold:{" "}
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: T.ink }}>
              {c.threshold}
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: T.soft, marginTop: 1 }}>
            Check:{" "}
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: T.ink }}>
              {c.checkDate}
            </span>
          </div>
        </div>
        <button
          onClick={() => onRemove(c.id)}
          style={{
            border: "none",
            background: "none",
            color: T.faint,
            cursor: "pointer",
            fontSize: 13,
            padding: 3,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
