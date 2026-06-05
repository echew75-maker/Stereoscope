import { tokens as T } from "@/lib/tokens";
import { ReportData } from "@/lib/types";

interface Props {
  rd: ReportData;
}

export function StockHeader({ rd }: Props) {
  return (
    <div style={{ paddingTop: 22, animation: "fadeIn .5s ease" }}>
      <div
        style={{
          fontSize: 11,
          color: T.faint,
          letterSpacing: ".06em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {rd.sector}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Fraunces',serif",
              fontWeight: 500,
              fontSize: 30,
              letterSpacing: "-.01em",
            }}
          >
            {rd.name}
          </h1>
          <div style={{ fontSize: 13, color: T.soft, marginTop: 5 }}>
            <b style={{ color: T.ink }}>
              {rd.exchange}: {rd.ticker}
            </b>{" "}
            <span
              style={{
                marginLeft: 8,
                padding: "2px 7px",
                border: `1px solid ${T.line}`,
                borderRadius: 16,
                fontSize: 10.5,
                color: T.soft,
              }}
            >
              {rd.currency}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 30,
              fontWeight: 500,
            }}
          >
            ${rd.price}
          </div>
          <div style={{ fontSize: 12.5, color: T.soft, marginTop: 2 }}>{rd.chg}</div>
          <div style={{ fontSize: 10.5, color: T.faint, marginTop: 3 }}>
            {rd.asof}
            {rd.range ? ` · 52-wk ${rd.range}` : ""}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
          gap: 1,
          background: T.line,
          border: `1px solid ${T.line}`,
          borderRadius: 10,
          overflow: "hidden",
          marginTop: 14,
        }}
      >
        {(rd.stats || []).map((s, i) => (
          <div key={i} style={{ background: T.card, padding: "10px 12px" }}>
            <div
              style={{
                fontSize: 10,
                color: T.faint,
                letterSpacing: ".03em",
                textTransform: "uppercase",
              }}
            >
              {s.k}
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 15,
                fontWeight: 500,
                marginTop: 2,
                color:
                  s.c === "bull" ? T.bull : s.c === "bear" ? T.bear : T.ink,
              }}
            >
              {s.v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
