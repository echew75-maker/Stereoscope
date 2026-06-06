"use client";

import { useState, useEffect } from "react";
import { tokens as T } from "@/lib/tokens";

type PriorView = "bullish" | "neutral" | "bearish";

const GROWTH_GURUS = ["Peter Lynch", "Philip Fisher", "W. O'Neil", "Bill Gurley", "Chuck Akre", "Druckenmiller", "Howard Marks"];
const VALUE_GURUS  = ["W. Buffett", "B. Graham", "J. Chanos", "J. Greenblatt", "M. Pabrai", "S. Klarman", "H. Schilit"];
const GURU_INTERVAL_MS = 8500; // ~60s / 7 gurus

const GURU_SLUGS: Record<string, string> = {
  "Peter Lynch":   "peter-lynch",
  "Philip Fisher": "philip-fisher",
  "W. O'Neil":     "w-oneil",
  "Bill Gurley":   "bill-gurley",
  "Chuck Akre":    "chuck-akre",
  "Druckenmiller": "druckenmiller",
  "Howard Marks":  "howard-marks",
  "W. Buffett":    "warren-buffett",
  "B. Graham":     "benjamin-graham",
  "J. Chanos":     "jim-chanos",
  "J. Greenblatt": "joel-greenblatt",
  "M. Pabrai":     "mohnish-pabrai",
  "S. Klarman":    "seth-klarman",
  "H. Schilit":    "howard-schilit",
};

interface Props {
  ticker: string;
  stageStatus: [number, number, number]; // 0=dim, 1=active, 2=done
  error: string | null;
  onRetry: (force?: boolean) => void;
  onBack: () => void;
  onPriorView?: (view: PriorView) => void;
}

function GuruList({ gurus, color, revealed, allDone }: {
  gurus: string[];
  color: string;
  revealed: number;
  allDone: boolean;
}) {
  return (
    <div style={{ marginTop: 14, textAlign: "left" }}>
      {gurus.map((name, i) => {
        const isDone = allDone || i < revealed;
        const isActive = !allDone && i === revealed - 1;
        const isHidden = !allDone && i >= revealed;
        return (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "3px 0",
              opacity: isHidden ? 0 : 1,
              animation: isDone || isActive ? "fadeIn .4s ease" : "none",
              transition: "opacity .3s",
            }}
          >
            {/* Dot */}
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                flexShrink: 0,
                background: isDone ? T.bull : isActive ? color : T.line,
                animation: isActive ? "pulse 1.2s infinite" : "none",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontFamily: "'IBM Plex Mono',monospace",
                color: isDone ? T.ink : isActive ? color : T.faint,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {name}
            </span>
            {isDone && !isActive && (
              <span style={{ fontSize: 9, color: T.bull, marginLeft: "auto" }}>✓</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Wikipedia page titles for thumbnail lookup (browser-side fetch at runtime)
const WIKI_TITLES: Record<string, string> = {
  "Peter Lynch":   "Peter_Lynch",
  "Philip Fisher": "Philip_Arthur_Fisher",
  "W. O'Neil":     "William_J._O%27Neil",
  "Bill Gurley":   "Bill_Gurley",
  "Chuck Akre":    "Chuck_Akre",
  "Druckenmiller": "Stanley_Druckenmiller",
  "Howard Marks":  "Howard_Marks_(investor)",
  "W. Buffett":    "Warren_Buffett",
  "B. Graham":     "Benjamin_Graham",
  "J. Chanos":     "Jim_Chanos",
  "J. Greenblatt": "Joel_Greenblatt",
  "M. Pabrai":     "Mohnish_Pabrai",
  "S. Klarman":    "Seth_Klarman",
  "H. Schilit":    "Howard_Schilit",
};

function GuruPortrait({ name, color }: { name: string; color: string }) {
  const slug = GURU_SLUGS[name] ?? name.toLowerCase().replace(/[\s.']+/g, "-").replace(/[^a-z0-9-]/g, "");
  const [wikiUrl, setWikiUrl]       = useState<string | null>(null);
  const [useWiki, setUseWiki]       = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Fetch Wikipedia thumbnail in the background
  useEffect(() => {
    const title = WIKI_TITLES[name];
    if (!title) return;
    let cancelled = false;
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`, {
      headers: { "User-Agent": "Stereoscope/1.0" },
    })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (!cancelled && d?.thumbnail?.source) setWikiUrl(d.thumbnail.source);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [name]);

  // If Wikipedia URL arrives after we already fell back, switch to it
  useEffect(() => {
    if (useFallback && wikiUrl) { setUseWiki(true); setUseFallback(false); }
  }, [wikiUrl, useFallback]);

  function handleImgError() {
    if (wikiUrl) { setUseWiki(true); }
    else         { setUseFallback(true); }
  }

  const imgSrc = useWiki ? wikiUrl! : `/gurus/${slug}.svg`;

  return (
    <div style={{ animation: "portraitIn .45s ease", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 14 }}>
      <div style={{
        width: 88, height: 106,
        border: `2px solid ${color}`,
        borderRadius: 8, overflow: "hidden",
        background: "#F2F0EB", position: "relative",
        boxShadow: `0 3px 14px ${color}28`,
      }}>
        {!useFallback ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={name}
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%) contrast(1.3) brightness(1.05)" }}
            onError={handleImgError}
          />
        ) : (
          <svg viewBox="0 0 88 106" width="88" height="106" style={{ display: "block" }}>
            <defs>
              {/* fine diagonal — general shading */}
              <pattern id={`pf-${slug}`} patternUnits="userSpaceOnUse" width="4.5" height="4.5" patternTransform="rotate(40)">
                <line x1="0" y1="0" x2="0" y2="4.5" stroke={color} strokeWidth="0.65" strokeOpacity="0.30" />
              </pattern>
              {/* cross-hatch — mid-tones */}
              <pattern id={`pc-${slug}`} patternUnits="userSpaceOnUse" width="4.5" height="4.5" patternTransform="rotate(130)">
                <line x1="0" y1="0" x2="0" y2="4.5" stroke={color} strokeWidth="0.5" strokeOpacity="0.18" />
              </pattern>
              {/* dense hatch — hair / deep shadow */}
              <pattern id={`pd-${slug}`} patternUnits="userSpaceOnUse" width="2.8" height="2.8" patternTransform="rotate(40)">
                <line x1="0" y1="0" x2="0" y2="2.8" stroke={color} strokeWidth="0.6" strokeOpacity="0.42" />
              </pattern>
              {/* background grain */}
              <pattern id={`pg-${slug}`} patternUnits="userSpaceOnUse" width="9" height="9" patternTransform="rotate(40)">
                <line x1="0" y1="0" x2="0" y2="9" stroke={color} strokeWidth="0.4" strokeOpacity="0.09" />
              </pattern>
            </defs>

            {/* Parchment + background grain */}
            <rect width="88" height="106" fill="#EDE9E2" />
            <rect width="88" height="106" fill={`url(#pg-${slug})`} />

            {/* Shoulders / bust */}
            <path d="M -2,106 Q 10,82 28,70 Q 36,66 44,66 Q 52,66 60,70 Q 78,82 90,106 Z"
              fill={`url(#pf-${slug})`} />
            <path d="M -2,106 Q 10,82 28,70 Q 36,66 44,66 Q 52,66 60,70 Q 78,82 90,106 Z"
              fill={`url(#pc-${slug})`} />

            {/* Neck */}
            <path d="M 38,55 L 36,68 Q 44,70 52,68 L 50,55 Z" fill={`url(#pf-${slug})`} />

            {/* Head (base fill first, then shading) */}
            <ellipse cx="44" cy="36" rx="20" ry="22" fill="#EDE9E2" />
            <ellipse cx="44" cy="36" rx="20" ry="22" fill={`url(#pf-${slug})`} />

            {/* Hair cap — denser hatching at top */}
            <path d="M 24,31 Q 25,12 44,12 Q 63,12 64,31 Q 55,22 44,21 Q 33,22 24,31 Z"
              fill={`url(#pd-${slug})`} />

            {/* Face highlight — lighter oval centre */}
            <ellipse cx="44" cy="38" rx="12" ry="14" fill="#F0EDE7" opacity="0.55" />

            {/* Eye socket shadows */}
            <ellipse cx="37" cy="33" rx="5.5" ry="3.5" fill={`url(#pd-${slug})`} opacity="0.45" />
            <ellipse cx="51" cy="33" rx="5.5" ry="3.5" fill={`url(#pd-${slug})`} opacity="0.45" />

            {/* Nose bridge shadow */}
            <path d="M 42,36 Q 41,41 43,44 Q 44,45 45,44 Q 47,41 46,36 Z"
              fill={`url(#pf-${slug})`} opacity="0.45" />

            {/* Cheek / temple shadows */}
            <ellipse cx="28" cy="40" rx="6" ry="9" fill={`url(#pf-${slug})`} opacity="0.35" />
            <ellipse cx="60" cy="40" rx="6" ry="9" fill={`url(#pf-${slug})`} opacity="0.35" />

            {/* Chin shadow */}
            <ellipse cx="44" cy="55" rx="9" ry="3" fill={`url(#pd-${slug})`} opacity="0.35" />

            {/* Outlines */}
            <ellipse cx="44" cy="36" rx="20" ry="22"
              fill="none" stroke={color} strokeWidth="1.4" strokeOpacity="0.6" />
            <path d="M -2,106 Q 10,82 28,70 Q 36,66 44,66 Q 52,66 60,70 Q 78,82 90,106"
              fill="none" stroke={color} strokeWidth="1.4" strokeOpacity="0.45" />
            <line x1="38" y1="55" x2="36" y2="68" stroke={color} strokeWidth="0.9" strokeOpacity="0.4" />
            <line x1="50" y1="55" x2="52" y2="68" stroke={color} strokeWidth="0.9" strokeOpacity="0.4" />
          </svg>
        )}
      </div>
      <div style={{ fontSize: 9.5, color, fontFamily: "'IBM Plex Mono',monospace", marginTop: 5, letterSpacing: ".06em", fontWeight: 600, textTransform: "uppercase" }}>
        {name}
      </div>
      <div style={{ fontSize: 9, color: "#939699", marginTop: 1 }}>applying lens</div>
    </div>
  );
}

export function AnalyzingSequence({ ticker, stageStatus, error, onRetry, onBack, onPriorView }: Props) {
  const [priorView, setPriorView] = useState<PriorView | null>(null);
  const [showPrimer, setShowPrimer] = useState(false);
  const [growthReveal, setGrowthReveal] = useState(0);
  const [valueReveal, setValueReveal] = useState(0);

  const arbiterActive = stageStatus[2] === 1 || stageStatus[2] === 2;
  const bothScoutsDone = stageStatus[0] === 2 && stageStatus[1] === 2;

  // Reveal growth gurus one by one while scout is active
  useEffect(() => {
    if (stageStatus[0] === 2) { setGrowthReveal(GROWTH_GURUS.length); return; }
    if (stageStatus[0] !== 1) return;
    setGrowthReveal(1);
    const id = setInterval(() => setGrowthReveal(r => Math.min(r + 1, GROWTH_GURUS.length)), GURU_INTERVAL_MS);
    return () => clearInterval(id);
  }, [stageStatus[0]]);

  // Reveal value gurus one by one while scout is active
  useEffect(() => {
    if (stageStatus[1] === 2) { setValueReveal(VALUE_GURUS.length); return; }
    if (stageStatus[1] !== 1) return;
    setValueReveal(1);
    const id = setInterval(() => setValueReveal(r => Math.min(r + 1, VALUE_GURUS.length)), GURU_INTERVAL_MS);
    return () => clearInterval(id);
  }, [stageStatus[1]]);

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
        <p style={{ fontSize: 13, color: T.soft, maxWidth: 440, margin: "0 auto 16px" }}>
          Two engines, run blind. One synthesis.
        </p>
        <div style={{ maxWidth: 520, margin: "0 auto 36px", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: T.ink, marginBottom: 6, letterSpacing: ".02em" }}>
            Independence eliminates echo chambers.
          </p>
          <p style={{ fontSize: 12, color: T.soft, lineHeight: 1.65 }}>
            Both engines reach their conclusions alone — blind to each other. Most tools think once and dress it up twice. Ours synthesises two genuinely separate views, so when they agree, it&apos;s for a reason — not by accident.
          </p>
        </div>

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
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 10 }}>
              {stageStatus[0] === 1 && (
                <div style={{
                  position: "absolute",
                  inset: -10,
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTopColor: T.growth,
                  borderRightColor: `${T.growth}55`,
                  animation: "spin 1.1s linear infinite",
                }} />
              )}
              <div style={{ fontSize: 28, color: stageStatus[0] === 2 ? T.bull : T.growth }}>◇</div>
            </div>
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

            {stageStatus[0] === 1 && growthReveal > 0 && (
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <GuruPortrait
                  key={GROWTH_GURUS[growthReveal - 1]}
                  name={GROWTH_GURUS[growthReveal - 1]}
                  color={T.growth}
                />
              </div>
            )}
            {growthReveal > 0 && (
              <GuruList
                gurus={GROWTH_GURUS}
                color={T.growth}
                revealed={growthReveal}
                allDone={stageStatus[0] === 2}
              />
            )}

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
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 10 }}>
              {stageStatus[1] === 1 && (
                <div style={{
                  position: "absolute",
                  inset: -10,
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTopColor: T.value,
                  borderRightColor: `${T.value}55`,
                  animation: "spin 1.1s linear infinite",
                }} />
              )}
              <div style={{ fontSize: 28, color: stageStatus[1] === 2 ? T.bull : T.value }}>◆</div>
            </div>
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

            {stageStatus[1] === 1 && valueReveal > 0 && (
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <GuruPortrait
                  key={VALUE_GURUS[valueReveal - 1]}
                  name={VALUE_GURUS[valueReveal - 1]}
                  color={T.value}
                />
              </div>
            )}
            {valueReveal > 0 && (
              <GuruList
                gurus={VALUE_GURUS}
                color={T.value}
                revealed={valueReveal}
                allDone={stageStatus[1] === 2}
              />
            )}

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
                  Lock in your baseline view before the data reveals the real story.
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
