import { tokens as T } from "@/lib/tokens";
import { Trigger } from "@/lib/types";

const tagColors: Record<string, { bg: string; c: string }> = {
  growth: { bg: T.growthSoft, c: T.growth },
  value: { bg: T.valueSoft, c: T.value },
  warn: { bg: "#FEF2E7", c: "#B54708" },
  margin: { bg: T.growthSoft, c: T.growth },
};

interface Props {
  triggers: Trigger[];
}

export function InvalidationMatrix({ triggers }: Props) {
  if (!triggers?.length) return null;

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
          Risk Monitoring
        </span>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontWeight: 500, fontSize: 20 }}>
          Thesis Invalidation Matrix
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
        {triggers.map((t, i) => {
          const tc2 = tagColors[t.tagColor] || tagColors.warn;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "stretch",
                borderBottom: i < triggers.length - 1 ? `1px solid ${T.line}` : "none",
              }}
            >
              <div
                style={{
                  flex: "0 0 44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 16,
                  fontWeight: 600,
                  color: T.bear,
                  borderRight: `1px solid ${T.line}`,
                }}
              >
                {t.n}
              </div>
              <div style={{ flex: 1, padding: "12px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                  {t.title}{" "}
                  <span
                    style={{
                      fontSize: 9,
                      padding: "2px 6px",
                      borderRadius: 3,
                      background: tc2.bg,
                      color: tc2.c,
                      fontFamily: "'IBM Plex Mono',monospace",
                      marginLeft: 6,
                      fontWeight: 500,
                      verticalAlign: "middle",
                    }}
                  >
                    {t.tag}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: T.soft, marginBottom: 6 }}>{t.desc}</div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 11,
                    padding: "3px 8px",
                    borderRadius: 5,
                    background: T.bg,
                    border: `1px solid ${T.line}`,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: 10, color: T.faint }}>Current →</span>
                  <span
                    style={{
                      fontWeight: 500,
                      color:
                        t.curC === "bull"
                          ? T.bull
                          : t.curC === "neutral"
                          ? T.neutral
                          : T.bear,
                    }}
                  >
                    {t.cur}
                  </span>
                  <span style={{ fontSize: 10, color: T.faint }}>Trigger →</span>
                  <span style={{ fontWeight: 500, color: T.bear }}>{t.trig}</span>
                  {t.extra && (
                    <span
                      style={{
                        fontSize: 9,
                        padding: "1px 5px",
                        borderRadius: 3,
                        background: "#FEF2E7",
                        color: "#B54708",
                        fontWeight: 600,
                      }}
                    >
                      {t.extra}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
