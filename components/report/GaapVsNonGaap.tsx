import { tokens as T } from "@/lib/tokens";
import { GaapVsNonGaap as GaapVsNonGaapType } from "@/lib/types";

interface Props {
  data: GaapVsNonGaapType;
}

function formatEps(s: string): string {
  if (!s) return "";
  const trimmed = s.trim();
  if (trimmed.startsWith("$") || trimmed.startsWith("-$") || trimmed.startsWith("(")) {
    return trimmed;
  }
  const n = parseFloat(trimmed);
  if (Number.isFinite(n)) {
    const sign = n < 0 ? "-$" : "$";
    return `${sign}${Math.abs(n).toFixed(2)}`;
  }
  return trimmed;
}

export function GaapVsNonGaap({ data }: Props) {
  const gaap = formatEps(data.gaap_eps);
  const nonGaap = formatEps(data.non_gaap_eps);
  const gaapNum = parseFloat(data.gaap_eps);
  const isGaapNegative = Number.isFinite(gaapNum) && gaapNum < 0;

  return (
    <div
      style={{
        marginTop: 12,
        border: `1px solid ${T.valueLine}`,
        borderRadius: 10,
        background: T.card,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 13px",
          background: T.valueSoft,
          borderBottom: `1px solid ${T.valueLine}`,
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 9.5,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: T.value,
          }}
        >
          ⚠ GAAP vs Non-GAAP
        </span>
        <span
          style={{
            fontSize: 11,
            color: T.soft,
            fontFamily: "'Fraunces',serif",
            fontStyle: "italic",
          }}
        >
          The accounting gap is material here.
        </span>
      </div>

      <div style={{ padding: "12px 14px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              border: `1px solid ${T.line}`,
              borderRadius: 8,
              padding: "9px 11px",
              background: T.bg,
            }}
          >
            <div
              style={{
                fontSize: 9.5,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: T.faint,
                marginBottom: 3,
              }}
            >
              GAAP EPS
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 18,
                fontWeight: 500,
                color: isGaapNegative ? T.bear : T.ink,
              }}
            >
              {gaap}
            </div>
            <div
              style={{
                fontSize: 10,
                color: T.faint,
                marginTop: 2,
                fontStyle: "italic",
              }}
            >
              what shareholders actually own
            </div>
          </div>

          <div
            style={{
              border: `1px solid ${T.line}`,
              borderRadius: 8,
              padding: "9px 11px",
              background: T.bg,
            }}
          >
            <div
              style={{
                fontSize: 9.5,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: T.faint,
                marginBottom: 3,
              }}
            >
              Non-GAAP EPS
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 18,
                fontWeight: 500,
                color: T.ink,
              }}
            >
              {nonGaap}
            </div>
            <div
              style={{
                fontSize: 10,
                color: T.faint,
                marginTop: 2,
                fontStyle: "italic",
              }}
            >
              what management highlights
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            marginBottom: 10,
            fontSize: 11,
            color: T.soft,
          }}
        >
          <span>
            Gap:{" "}
            <b
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                color: T.bear,
              }}
            >
              {data.delta_pct >= 1000
                ? `${(data.delta_pct / 100).toFixed(0)}×`
                : `${Math.round(data.delta_pct)}%`}
            </b>
          </span>
          <span>
            SBC as % of revenue:{" "}
            <b
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                color: data.sbc_pct_revenue > 15 ? T.bear : T.gold,
              }}
            >
              {data.sbc_pct_revenue.toFixed(1)}%
            </b>
          </span>
        </div>

        <div
          style={{
            fontSize: 12,
            color: T.soft,
            lineHeight: 1.55,
            paddingTop: 8,
            borderTop: `1px solid ${T.line}`,
          }}
        >
          {data.explainer}
        </div>
      </div>
    </div>
  );
}
