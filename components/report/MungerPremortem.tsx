import { tokens as T } from "@/lib/tokens";
import { ReportData } from "@/lib/types";

interface Props {
  rd: ReportData;
}

export function MungerPremortem({ rd }: Props) {
  if (!rd.premortemSteps?.length) return null;

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
          The Inversion
        </span>
        <h2
          style={{
            fontFamily: "'Fraunces',serif",
            fontWeight: 500,
            fontSize: 20,
          }}
        >
          Charlie Munger Pre-Mortem
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
        <div
          style={{
            padding: "16px 18px 12px",
            background: T.mungerSoft,
            borderBottom: "1px solid #D5C6E6",
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: T.munger,
            }}
          >
            ☽ Adversarial Inversion
          </div>
          <div
            style={{
              fontFamily: "'Fraunces',serif",
              fontWeight: 500,
              fontSize: 17,
              marginTop: 4,
            }}
          >
            5 years from now, {rd.ticker} trades at{" "}
            <span
              style={{
                color: T.bear,
                fontFamily: "'IBM Plex Mono',monospace",
              }}
            >
              {rd.premortemPrice}
            </span>
            . What happened?
          </div>
        </div>

        <div style={{ padding: "18px 20px" }}>
          {rd.premortemQuote && (
            <div
              style={{
                fontFamily: "'Fraunces',serif",
                fontSize: 15,
                fontWeight: 500,
                color: T.munger,
                marginBottom: 14,
              }}
            >
              &ldquo;{rd.premortemQuote}&rdquo;
            </div>
          )}

          <div style={{ position: "relative", paddingLeft: 24 }}>
            <div
              style={{
                position: "absolute",
                left: 7,
                top: 4,
                bottom: 14,
                width: 2,
                background: "#D5C6E6",
              }}
            />
            {rd.premortemSteps.map((s, i) => (
              <div key={i} style={{ position: "relative", marginBottom: 14 }}>
                <div
                  style={{
                    position: "absolute",
                    left: -20,
                    top: 3,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: T.card,
                    border: `2px solid ${T.munger}`,
                  }}
                />
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 11,
                    fontWeight: 500,
                    color: T.munger,
                    marginBottom: 2,
                  }}
                >
                  {s.yr}
                </div>
                <div style={{ fontSize: 12, color: T.soft, lineHeight: 1.55 }}>{s.txt}</div>
              </div>
            ))}
          </div>

          {rd.premortemCoda && (
            <div
              style={{
                marginTop: 10,
                padding: "10px 13px",
                background: T.mungerSoft,
                borderRadius: 8,
                fontSize: 11.5,
                color: "#3d1d5e",
              }}
            >
              <b style={{ color: T.munger }}>Lesson:</b> {rd.premortemCoda}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
