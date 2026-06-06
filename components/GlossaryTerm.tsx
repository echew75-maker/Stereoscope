"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface Props {
  label: string;
  definition: string;
  children: ReactNode;
}

export function GlossaryTerm({ label, definition, children }: Props) {
  const [open, setOpen]   = useState(false);
  const [above, setAbove] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  // Flip to "above" if there isn't enough space below the term
  useEffect(() => {
    if (!open || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setAbove(spaceBelow < 180);
  }, [open]);

  // Close on outside click / tap
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent | TouchEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      style={{
        position: "relative",
        borderBottom: "1.5px dotted currentColor",
        cursor: "help",
        display: "inline",
        whiteSpace: "normal",
      }}
    >
      {children}

      {open && (
        <span
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            zIndex: 100,
            left: "50%",
            transform: "translateX(-50%)",
            [above ? "bottom" : "top"]: "calc(100% + 8px)" as unknown as number,
            width: "max-content",
            maxWidth: 260,
            background: "#fff",
            border: "0.5px solid rgba(0,0,0,0.12)",
            borderRadius: 12,
            padding: "12px 14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            textAlign: "left",
            cursor: "default",
            color: "#1a1a1a",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 400,
            letterSpacing: "normal",
            textTransform: "none",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#6b6b6b",
              marginBottom: 6,
            }}
          >
            {label}
          </span>
          <span style={{ display: "block", fontSize: 13, lineHeight: 1.6, color: "#1a1a1a" }}>
            {definition}
          </span>
        </span>
      )}
    </span>
  );
}
