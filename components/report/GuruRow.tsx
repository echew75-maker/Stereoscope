"use client";

import { useState } from "react";
import { tokens as T } from "@/lib/tokens";
import { Guru } from "@/lib/types";

function dotColor(s: "b" | "n" | "r") {
  return s === "b" ? T.bull : s === "r" ? T.bear : T.neutral;
}

interface Props {
  g: Guru;
}

export function GuruRow({ g }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "9px 10px",
          cursor: "pointer",
          transition: "background .12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = T.bg)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: dotColor(g.s),
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 600, fontSize: 12, width: 90, flexShrink: 0 }}>{g.n}</span>
        <span style={{ fontSize: 11, color: T.soft, flex: 1, minWidth: 0, wordBreak: "break-word" }}>{g.f}</span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 11.5,
            fontWeight: 500,
            color: dotColor(g.s),
            textAlign: "right",
            wordBreak: "break-word",
            maxWidth: 130,
          }}
        >
          {g.m}
        </span>
        <span
          style={{
            color: T.faint,
            fontSize: 9,
            transition: "transform .2s",
            transform: open ? "rotate(90deg)" : "none",
            width: 10,
            flexShrink: 0,
          }}
        >
          ▶
        </span>
      </div>
      {open && (
        <div style={{ padding: "0 10px 12px 26px", animation: "fadeIn .2s ease" }}>
          <div style={{ fontSize: 12, color: T.soft, lineHeight: 1.6 }}>{g.overview}</div>
          {g.conclusion && (
            <div
              style={{
                marginTop: 10,
                padding: "10px 13px",
                borderRadius: 8,
                background: T.bg,
                border: `1px solid ${T.lineSoft}`,
                borderLeft: `3px solid ${dotColor(g.s)}`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  color: dotColor(g.s),
                  marginBottom: 4,
                }}
              >
                {g.n.split(" ").pop()}&apos;s Conclusion
              </div>
              <div style={{ fontSize: 12, color: T.ink, lineHeight: 1.6 }}>{g.conclusion}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
