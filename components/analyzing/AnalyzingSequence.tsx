"use client";

import { tokens as T } from "@/lib/tokens";

interface Props {
  ticker: string;
  stageStatus: [number, number, number]; // 0=dim, 1=active, 2=done
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
}

const stages = [
  { icon: "◇", name: "Growth Scout", color: T.growth, bg: T.growthSoft, sub: "Researching filings…" },
  { icon: "◆", name: "Value Guard", color: T.value, bg: T.valueSoft, sub: "Forensic audit…" },
  { icon: "◎", name: "Arbiter", color: T.gold, bg: T.goldSoft, sub: "Finding the Crux…" },
];

export function AnalyzingSequence({ ticker, stageStatus, error, onRetry, onBack }: Props) {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 54px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 880, width: "100%", textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: T.faint,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          Live analysis in progress
        </div>
        <h1
          style={{
            fontFamily: "'Fraunces',serif",
            fontWeight: 500,
            fontSize: 30,
            marginBottom: 8,
          }}
        >
          Analysing{" "}
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontWeight: 600,
              color: T.gold,
            }}
          >
            {ticker}
          </span>
        </h1>
        <p style={{ fontSize: 13, color: T.soft, maxWidth: 480, margin: "0 auto 32px" }}>
          Searching filings, running 14 guru lenses, synthesising the Crux. This takes 60–120
          seconds.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {stages.map((s, idx) => {
            const st = stageStatus[idx];
            return (
              <div
                key={idx}
                style={{
                  width: 220,
                  padding: "20px 18px",
                  border: `1.5px solid ${st === 1 ? T.gold : st === 2 ? T.bull : T.line}`,
                  borderRadius: 12,
                  background: T.card,
                  transition: "all .4s",
                  textAlign: "center",
                  opacity: st === 0 ? 0.35 : 1,
                  boxShadow:
                    st === 1
                      ? `0 0 0 3px rgba(158,116,32,.16),0 10px 28px rgba(14,16,18,.08)`
                      : "none",
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    color: s.color,
                    fontFamily: "'Fraunces',serif",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  {st === 2 ? "✓" : s.icon}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: T.soft, marginTop: 4 }}>
                  {st === 2 ? "Complete" : st === 1 ? s.sub : "Waiting…"}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    height: 3,
                    background: T.lineSoft,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: st === 2 ? "100%" : st === 1 ? "60%" : "0%",
                      background: st === 2 ? T.bull : T.gold,
                      borderRadius: 2,
                      transition: "width 8s linear",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div
            style={{
              marginTop: 24,
              padding: "14px 18px",
              background: "#FDF2F1",
              border: `1px solid ${T.bear}`,
              borderRadius: 10,
              color: T.bear,
              fontSize: 13,
              maxWidth: 500,
              margin: "24px auto 0",
            }}
          >
            {error}
            <div style={{ marginTop: 10 }}>
              <button
                onClick={onRetry}
                style={{
                  border: "none",
                  background: T.ink,
                  color: "#fff",
                  borderRadius: 7,
                  padding: "7px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginRight: 8,
                }}
              >
                Retry
              </button>
              <button
                onClick={onBack}
                style={{
                  border: `1px solid ${T.line}`,
                  background: T.card,
                  color: T.soft,
                  borderRadius: 7,
                  padding: "7px 16px",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
