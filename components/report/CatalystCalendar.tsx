"use client";

import { useState } from "react";
import { tokens as T } from "@/lib/tokens";
import { Catalyst } from "@/lib/types";

interface RowProps {
  c: Catalyst;
  i: number;
  total: number;
  onJournal?: (title: string) => void;
}

function CatalystRow({ c, i, total, onJournal }: RowProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          borderBottom: i < total - 1 ? `1px solid ${T.line}` : "none",
          cursor: "pointer",
          transition: "background .12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = T.bg)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div
          style={{
            flex: "0 0 110px",
            padding: "12px 14px",
            borderRight: `1px solid ${T.line}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            {c.dateLabel}
          </div>
          <div
            style={{
              fontSize: 9.5,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: T.faint,
              marginTop: 1,
            }}
          >
            {c.type}
          </div>
        </div>
        <div style={{ flex: 1, padding: "12px 14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{c.title}</div>
            <span
              style={{
                color: T.faint,
                fontSize: 9,
                transition: "transform .2s",
                transform: open ? "rotate(90deg)" : "none",
              }}
            >
              ▶
            </span>
          </div>
          <div style={{ fontSize: 12, color: T.soft }}>{c.desc}</div>
        </div>
      </div>

      {open && (
        <div
          style={{
            padding: "0 14px 14px 124px",
            borderBottom: i < total - 1 ? `1px solid ${T.lineSoft}` : "none",
            animation: "fadeIn .2s ease",
          }}
        >
          <div style={{ fontSize: 12, color: T.soft, lineHeight: 1.6, marginBottom: 10 }}>
            {c.detail}
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
            <span
              style={{
                fontSize: 10,
                color: T.faint,
                fontFamily: "'IBM Plex Mono',monospace",
                marginRight: 3,
              }}
            >
              Watch:
            </span>
            {(c.watchMetrics || []).map((m, j) => (
              <span
                key={j}
                style={{
                  fontSize: 10,
                  fontFamily: "'IBM Plex Mono',monospace",
                  padding: "2px 7px",
                  borderRadius: 4,
                  background: T.bg,
                  border: `1px solid ${T.line}`,
                  color: T.ink,
                }}
              >
                {m}
              </span>
            ))}
          </div>
          {onJournal && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onJournal(c.title);
              }}
              style={{
                border: "none",
                background: T.ink,
                color: "#fff",
                borderRadius: 7,
                padding: "6px 13px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Journal your thoughts →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  catalysts: Catalyst[];
  onJournal?: (title: string) => void;
}

export function CatalystCalendar({ catalysts, onJournal }: Props) {
  if (!catalysts?.length) return null;

  return (
    <section style={{ marginTop: 30 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginBottom: 12 }}>
        <span
          style={{
            fontSize: 10.5,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: T.faint,
          }}
        >
          Forward Look
        </span>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 500, fontSize: 20 }}>
          Tactical Catalyst Calendar
        </h2>
      </div>
      <div
        style={{
          background: T.card,
          border: `1px solid ${T.line}`,
          borderRadius: 12,
          boxShadow: T.shadow,
          overflow: "hidden",
        }}
      >
        {catalysts.map((c, i) => (
          <CatalystRow key={i} c={c} i={i} total={catalysts.length} onJournal={onJournal} />
        ))}
      </div>
    </section>
  );
}
