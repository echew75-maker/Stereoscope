"use client";

import { useState, useEffect } from "react";
import { tokens as T } from "@/lib/tokens";

type PriorView = "bullish" | "neutral" | "bearish";

interface Props {
  ticker: string;
  stageStatus: [number, number, number]; // 0=dim, 1=active, 2=done
  error: string | null;
  onRetry: (force?: boolean) => void;
  onBack: () => void;
  onPriorView?: (view: PriorView) => void;
}

export function AnalyzingSequence({ ticker, stageStatus, error, onRetry, onBack, onPriorView }: Props) {
  const [priorView, setPriorView] = useState<PriorView | null>(null);
  const [showPrimer, setShowPrimer] = useState(false);

  const arbiterActive = stageStatus[2] === 1 || stageStatus[2] === 2;
  const bothScoutsDone = stageStatus[0] === 2 && stageStatus[1] === 2;

  // Primer appears after 3 seconds — enough time for the animation to register
  useEffect(() => {
    const t = setTimeout(() => setShowPrimer(true), 3000);
    return () => clearTimeout(t);
  }, []);

  function selectPrior(view: PriorView) {
    setPriorView(view);
    onPriorView?.(view);
  }

  const priorColors: Record<PriorView, { bg: string; border: string; text: string }> = {
    bullish: { bg: "#F0FAF4", border: T.bull, text: T.bull },
    neutral: { bg: "#FFFDF8", border: T.neutral, text: T.neutral },
    bearish: { bg: "#FDF2F1", border: T.bear, text: T.bear },
  };

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
      <div style={{ maxWidth: 860, width: "100%", textAlign: "center" }}>

        {/* Header */}
        <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: T.faint, fontWeight: 600, marginBottom: 10 }}>
          Live analysis in progress
        </div>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 500, fontSize: 28, marginBottom: 6 }}>
          Analysing{" "}
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: T.gold }}>
            {ticker}
          </span>
        </h1>
        <p style={{ fontSize: 13, color: T.soft, maxWidth: 440, margin: "0 auto 36px" }}>
          Two engines, run blind. One synthesis.
        </p>

        {/* ── TWO ROOMS ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 0,
            alignItems: "stretch",
            border: `1px solid ${T.line}`,
            borderRadius: 16,
            overflow: "hidden",
            background: T.card,
            boxShadow: T.shadow,
            marginBottom: 24,
          }}
        >
          {/* Growth Scout Room */}
          <div
            style={{
              padding: "28px 24px",
              background: stageStatus[0] === 1 ? `linear-gradient(135deg,${T.growthSoft},${T.card})` : T.card,
              transition: "background .8s ease",
              position: "relative",
              opacity: stageStatus[0] === 0 ? 0.4 : 1,
            }}
          >
            <div style={{ fontSize: 28, color: T.growth, marginBottom: 10 }}>◇</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: T.ink, marginBottom: 4 }}>Growth Scout</div>
            <div style={{ fontSize: 11, color: T.growth, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 12 }}>
              {stageStatus[0] === 2 ? "✓ Complete" : stageStatus[0] === 1 ? "Researching filings…" : "Waiting…"}
            </div>

            {/* Progress bar */}
            <div style={{ height: 2, background: T.lineSoft, borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: stageStatus[0] === 2 ? "100%" : stageStatus[0] === 1 ? "55%" : "0%",
                background: stageStatus[0] === 2 ? T.bull : T.growth,
                borderRadius: 2,
                transition: "width 12s linear",
              }} />
            </div>

            {/* Facing indicator */}
            <div
              style={{
                position: "absolute",
                bottom: 12,
                right: 14,
                fontSize: 14,
                color: T.faint,
                transition: "transform .6s ease, opacity .6s ease",
                transform: arbiterActive ? "scaleX(1)" : "scaleX(-1)",
                opacity: stageStatus[0] === 0 ? 0 : 0.5,
              }}
            >
              →
            </div>
          </div>

          {/* Divider / Arbiter */}
          <div
            style={{
              width: arbiterActive ? 220 : 48,
              background: arbiterActive
                ? `linear-gradient(180deg,${T.goldSoft},${T.card})`
                : T.bg,
              borderLeft: `1px solid ${T.line}`,
              borderRight: `1px solid ${T.line}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: arbiterActive ? "28px 16px" : "28px 0",
              transition: "width .6s ease, background .6s ease, padding .6s ease",
              overflow: "hidden",
            }}
          >
            {arbiterActive ? (
              <>
                <div style={{ fontSize: 26, color: T.gold, marginBottom: 8 }}>◎</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.ink, marginBottom: 4, whiteSpace: "nowrap" }}>The Arbiter</div>
                <div style={{ fontSize: 11, color: T.gold, fontFamily: "'IBM Plex Mono',monospace", whiteSpace: "nowrap" }}>
                  {stageStatus[2] === 2 ? "✓ Complete" : "Finding the Crux…"}
                </div>
                <div style={{ marginTop: 12, height: 2, width: "80%", background: T.lineSoft, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: stageStatus[2] === 2 ? "100%" : "40%",
                    background: stageStatus[2] === 2 ? T.bull : T.gold,
                    borderRadius: 2,
                    transition: "width 10s linear",
                  }} />
                </div>
              </>
            ) : (
              <div
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  fontSize: 9,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: T.faint,
                  fontWeight: 700,
                  userSelect: "none",
                }}
              >
                BLIND
              </div>
            )}
          </div>

          {/* Value Guard Room */}
          <div
            style={{
              padding: "28px 24px",
              background: stageStatus[1] === 1 ? `linear-gradient(225deg,${T.valueSoft},${T.card})` : T.card,
              transition: "background .8s ease",
              position: "relative",
              opacity: stageStatus[1] === 0 ? 0.4 : 1,
            }}
          >
            <div style={{ fontSize: 28, color: T.value, marginBottom: 10 }}>◆</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: T.ink, marginBottom: 4 }}>Value Guard</div>
            <div style={{ fontSize: 11, color: T.value, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 12 }}>
              {stageStatus[1] === 2 ? "✓ Complete" : stageStatus[1] === 1 ? "Forensic audit…" : "Waiting…"}
            </div>

            <div style={{ height: 2, background: T.lineSoft, borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: stageStatus[1] === 2 ? "100%" : stageStatus[1] === 1 ? "55%" : "0%",
                background: stageStatus[1] === 2 ? T.bull : T.value,
                borderRadius: 2,
                transition: "width 12s linear",
              }} />
            </div>

            {/* Facing indicator */}
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 14,
                fontSize: 14,
                color: T.faint,
                transition: "transform .6s ease, opacity .6s ease",
                transform: arbiterActive ? "scaleX(-1)" : "scaleX(1)",
                opacity: stageStatus[1] === 0 ? 0 : 0.5,
              }}
            >
              ←
            </div>
          </div>
        </div>

        {/* Blind label — shown before Arbiter */}
        {!arbiterActive && (
          <p style={{ fontSize: 11, color: T.faint, letterSpacing: ".08em", marginBottom: 24, textTransform: "uppercase" }}>
            Each engine works in isolation — blind to the other
          </p>
        )}
        {arbiterActive && !bothScoutsDone && (
          <p style={{ fontSize: 11, color: T.gold, letterSpacing: ".08em", marginBottom: 24, textTransform: "uppercase", fontWeight: 600 }}>
            The Arbiter is reconciling both perspectives
          </p>
        )}
        {bothScoutsDone && arbiterActive && (
          <p style={{ fontSize: 11, color: T.gold, letterSpacing: ".08em", marginBottom: 24, textTransform: "uppercase", fontWeight: 600 }}>
            Both lenses complete — synthesising the Crux
          </p>
        )}

        {/* ── COMMITMENT PRIMER ── */}
        {showPrimer && (
          <div
            style={{
              border: `1px solid ${priorView ? priorColors[priorView].border : T.goldLine}`,
              borderRadius: 14,
              padding: "22px 24px",
              background: priorView ? priorColors[priorView].bg : "linear-gradient(0deg,#FCF8EE,#FFFDF8)",
              maxWidth: 520,
              margin: "0 auto",
              animation: "fadeIn .5s ease",
              transition: "background .4s ease, border-color .4s ease",
            }}
          >
            {!priorView ? (
              <>
                <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: 10 }}>
                  Before you read the report
                </div>
                <p style={{ fontSize: 14, fontFamily: "'Fraunces',serif", fontWeight: 500, color: T.ink, marginBottom: 18, lineHeight: 1.5 }}>
                  What is your instinct on{" "}
                  <span style={{ color: T.gold }}>{ticker}</span>{" "}
                  right now?
                </p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  {(["bearish", "neutral", "bullish"] as PriorView[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => selectPrior(v)}
                      style={{
                        border: `1.5px solid ${v === "bullish" ? T.bull : v === "bearish" ? T.bear : T.neutral}`,
                        background: "transparent",
                        color: v === "bullish" ? T.bull : v === "bearish" ? T.bear : T.neutral,
                        borderRadius: 8,
                        padding: "8px 22px",
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "'IBM Plex Mono',monospace",
                        letterSpacing: ".06em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        transition: "all .15s",
                      }}
                      onMouseEnter={(e) => {
                        const c = v === "bullish" ? T.bull : v === "bearish" ? T.bear : T.neutral;
                        e.currentTarget.style.background = c;
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        const c = v === "bullish" ? T.bull : v === "bearish" ? T.bear : T.neutral;
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = c;
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 10.5, color: T.faint, marginTop: 12 }}>
                  Your answer is recorded before the report — so your prior isn&apos;t anchored by what the analysis finds.
                </p>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: priorColors[priorView].border,
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {priorView === "bullish" ? "↑" : priorView === "bearish" ? "↓" : "→"}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: ".08em" }}>Prior recorded</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: priorColors[priorView].text, textTransform: "capitalize", marginTop: 1 }}>
                    {priorView} on {ticker}
                  </div>
                  <div style={{ fontSize: 11, color: T.soft, marginTop: 2 }}>
                    Your view before reading the report. The journal will hold you to it.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error state */}
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
                onClick={() => onRetry(true)}
                style={{ border: "none", background: T.ink, color: "#fff", borderRadius: 7, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginRight: 8 }}
              >
                Retry
              </button>
              <button
                onClick={onBack}
                style={{ border: `1px solid ${T.line}`, background: T.card, color: T.soft, borderRadius: 7, padding: "7px 16px", fontSize: 12, cursor: "pointer" }}
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
