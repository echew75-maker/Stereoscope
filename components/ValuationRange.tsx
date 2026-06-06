"use client";

import { useState } from "react";
import { tokens as T } from "@/lib/tokens";
import { ValuationAssumptions } from "@/lib/types";

interface Props {
  label: "Growth Scout" | "Value Guard";
  rangeLow: number;
  rangeHigh: number;
  currentPrice: number;
  assumptions: ValuationAssumptions | null;
}

export function ValuationRange({ label, rangeLow, rangeHigh, currentPrice, assumptions }: Props) {
  const [open, setOpen] = useState(false);

  const isGrowth = label === "Growth Scout";
  const accent = isGrowth ? T.growth : T.value;
  const accentSoft = isGrowth ? T.growthSoft : T.valueSoft;
  const accentLine = isGrowth ? T.growthLine : T.valueLine;

  // Axis spans from min(rangeLow, currentPrice) * 0.9 to max(rangeHigh, currentPrice) * 1.1
  const axisLow = Math.min(rangeLow, currentPrice) * 0.9;
  const axisHigh = Math.max(rangeHigh, currentPrice) * 1.1;
  const axisSpan = axisHigh - axisLow || 1;
  const pct = (v: number) => `${((v - axisLow) / axisSpan) * 100}%`;
  const bandLeftPct = pct(rangeLow);
  const bandWidthPct = `${((rangeHigh - rangeLow) / axisSpan) * 100}%`;
  const markerPct = pct(currentPrice);

  const fmt = (n: number) =>
    `$${n >= 1000 ? n.toLocaleString(undefined, { maximumFractionDigits: 0 }) : n.toFixed(n < 10 ? 2 : 0)}`;

  return (
    <div
      style={{
        border: `1px solid ${T.line}`,
        borderRadius: 10,
        padding: "14px 15px 12px",
        background: T.card,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span
          style={{
            fontSize: 10,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: accent,
            background: accentSoft,
            padding: "3px 8px",
            borderRadius: 4,
            fontWeight: 600,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 11,
            color: T.soft,
          }}
        >
          {fmt(rangeLow)} – {fmt(rangeHigh)}
        </span>
      </div>

      {/* Range bar */}
      <div style={{ position: "relative", height: 36, margin: "10px 0 4px" }}>
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 0,
            right: 0,
            height: 4,
            borderRadius: 2,
            background: T.lineSoft,
            border: `1px solid ${T.line}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 19,
            left: bandLeftPct,
            width: bandWidthPct,
            height: 10,
            borderRadius: 5,
            background: accentSoft,
            border: `1.5px solid ${accentLine}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 6,
            left: markerPct,
            width: 2,
            height: 28,
            background: T.ink,
            borderRadius: 1,
            transform: "translateX(-1px)",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: -16,
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              background: T.ink,
              color: "#fff",
              fontSize: 9.5,
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: 3,
              fontFamily: "'IBM Plex Mono',monospace",
            }}
          >
            Now {fmt(currentPrice)}
          </span>
        </div>
      </div>

      {/* Disclosure */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          marginTop: 6,
          background: "none",
          border: "none",
          padding: 0,
          fontSize: 13,
          color: T.faint,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {open ? "Hide ↑" : "See assumptions ↓"}
      </button>

      {open && (
        <div style={{ display: "block", marginTop: 12 }}>
          {assumptions ? (
            <>
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 10,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: T.gold,
                    background: T.goldSoft,
                    border: `1px solid ${T.goldLine}`,
                    padding: "2px 8px",
                    borderRadius: 999,
                    fontWeight: 600,
                  }}
                >
                  {assumptions.model_type}
                </span>
              </div>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                  marginBottom: 10,
                }}
              >
                <tbody>
                  {[
                    ["Revenue CAGR", assumptions.base_case.revenue_cagr],
                    ["Terminal growth rate", assumptions.base_case.terminal_growth_rate ?? "N/A"],
                    ["Discount rate / WACC", assumptions.base_case.discount_rate ?? "N/A"],
                    ["Exit multiple/margin", assumptions.base_case.exit_multiple_or_margin ?? "N/A"],
                  ].map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
                      <td style={{ padding: "6px 8px 6px 0", color: T.soft }}>{k}</td>
                      <td
                        style={{
                          padding: "6px 0 6px 8px",
                          textAlign: "right",
                          fontFamily: "'IBM Plex Mono',monospace",
                          color: T.ink,
                        }}
                      >
                        {v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div
                style={{
                  fontSize: 13,
                  fontStyle: "italic",
                  color: T.ink,
                  lineHeight: 1.5,
                  marginBottom: 10,
                }}
              >
                &ldquo;{assumptions.base_case.key_assumption}&rdquo;
              </div>

              <div style={{ fontSize: 13, color: T.soft, lineHeight: 1.55 }}>
                <div style={{ marginBottom: 4 }}>
                  <b style={{ color: T.ink }}>Top of range:</b> {assumptions.bull_case_delta}
                </div>
                <div>
                  <b style={{ color: T.ink }}>Bottom of range:</b> {assumptions.bear_case_delta}
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, fontStyle: "italic", color: T.faint }}>
              Assumptions not available — regenerate this report to see full methodology.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
