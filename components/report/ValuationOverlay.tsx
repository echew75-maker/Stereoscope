import { tokens as T } from "@/lib/tokens";
import { ReportData } from "@/lib/types";

interface Props {
  rd: ReportData;
}

export function ValuationOverlay({ rd }: Props) {
  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.line}`,
        borderRadius: 12,
        boxShadow: T.shadow,
        padding: "20px 20px 22px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span
          style={{
            fontSize: 10,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: T.gold,
            background: T.goldSoft,
            padding: "3px 8px",
            borderRadius: 4,
            fontWeight: 600,
          }}
        >
          Valuation overlay
        </span>
        <span
          style={{
            fontFamily: "'Fraunces',serif",
            fontWeight: 500,
            fontSize: 16,
          }}
        >
          One price axis, two independent ranges
        </span>
      </div>

      {/* Price axis */}
      <div style={{ position: "relative", height: 52, margin: "26px 0 6px" }}>
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 0,
            right: 0,
            height: 5,
            borderRadius: 3,
            background: T.lineSoft,
            border: `1px solid ${T.line}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 29,
            left: rd.valueBandLeft || "24%",
            width: rd.valueBandWidth || "16%",
            height: 10,
            borderRadius: 5,
            background: T.valueSoft,
            border: `1.5px solid ${T.valueLine}`,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: -18,
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              fontSize: 10,
              fontWeight: 600,
              color: T.value,
            }}
          >
            {rd.valueBandLabel || "Value"}
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 29,
            left: rd.growthBandLeft || "74%",
            width: rd.growthBandWidth || "18%",
            height: 10,
            borderRadius: 5,
            background: T.growthSoft,
            border: `1.5px solid ${T.growthLine}`,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: -18,
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              fontSize: 10,
              fontWeight: 600,
              color: T.growth,
            }}
          >
            {rd.growthBandLabel || "Growth"}
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 12,
            left: rd.markerLeft || "57%",
            width: 3,
            height: 38,
            background: T.ink,
            borderRadius: 2,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: -22,
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              background: T.ink,
              color: "#fff",
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 4,
              fontFamily: "'IBM Plex Mono',monospace",
            }}
          >
            Now ${rd.price}
          </span>
        </div>
      </div>

      {rd.overlapNote && (
        <div
          style={{
            marginTop: 26,
            background:
              rd.overlapType === "overlap"
                ? T.growthSoft
                : rd.overlapType === "value-biased"
                ? T.valueSoft
                : T.goldSoft,
            borderRadius: 8,
            padding: "9px 13px",
            fontSize: 11.5,
            color: T.soft,
          }}
        >
          <b>
            {rd.overlapType === "disjoint"
              ? "Disjoint case:"
              : rd.overlapType === "overlap"
              ? "Overlap case:"
              : "Value-biased case:"}
          </b>{" "}
          {rd.overlapNote}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginTop: 18 }}>
        <div
          style={{
            border: `1px solid ${T.line}`,
            borderRadius: 10,
            padding: "14px 15px",
            background: T.bg,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: T.faint,
              marginBottom: 7,
            }}
          >
            ◎ The Crux
          </div>
          <div
            style={{
              fontFamily: "'Fraunces',serif",
              fontWeight: 500,
              fontSize: 14.5,
              lineHeight: 1.3,
              marginBottom: 8,
            }}
          >
            {rd.crux}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              border: `1px solid ${T.line}`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "8px 10px", background: T.growthSoft }}>
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                  color: T.growth,
                  marginBottom: 3,
                }}
              >
                Growth
              </div>
              <div style={{ fontSize: 11, color: T.soft }}>{rd.cruxGrowth}</div>
            </div>
            <div
              style={{
                padding: "8px 10px",
                background: T.valueSoft,
                borderLeft: `1px solid ${T.line}`,
              }}
            >
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                  color: T.value,
                  marginBottom: 3,
                }}
              >
                Value
              </div>
              <div style={{ fontSize: 11, color: T.soft }}>{rd.cruxValue}</div>
            </div>
          </div>
        </div>

        <div
          style={{
            border: `1px solid ${T.line}`,
            borderRadius: 10,
            padding: "14px 15px",
            background: T.bg,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: T.faint,
              marginBottom: 7,
            }}
          >
            $ What you&apos;re paying for
          </div>
          <div
            style={{
              fontFamily: "'Fraunces',serif",
              fontWeight: 500,
              fontSize: 14.5,
              marginBottom: 7,
            }}
          >
            {rd.payingForTitle}
          </div>
          <div style={{ fontSize: 12, color: T.soft, lineHeight: 1.5 }}>{rd.payingForDesc}</div>
        </div>
      </div>

      {rd.decisiveDate && (
        <div
          style={{
            marginTop: 11,
            border: `1px dashed ${T.line}`,
            borderRadius: 8,
            padding: "10px 13px",
            background: T.card,
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Fraunces',serif",
              fontSize: 13,
              fontWeight: 500,
              color: T.gold,
              whiteSpace: "nowrap",
            }}
          >
            ▸ {rd.decisiveDate}
          </span>
          <span style={{ fontSize: 11.5, color: T.soft }}>{rd.decisiveText}</span>
        </div>
      )}
    </div>
  );
}
