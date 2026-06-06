"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { tokens as T } from "@/lib/tokens";
import { Masthead } from "@/components/layout/Masthead";
import { Footer } from "@/components/layout/Footer";
import type { ScreenerRow } from "@/app/api/screener/route";

type SortKey = "disagreement" | "upside" | "recent";
type DirectionFilter = Record<ScreenerRow["direction"], boolean>;

const DIRECTION_LABEL: Record<ScreenerRow["direction"], string> = {
  upside: "Upside",
  fair: "Fair value",
  downside: "Downside",
  mixed: "Mixed",
};

function directionAccent(d: ScreenerRow["direction"]) {
  if (d === "upside") return T.bull;
  if (d === "downside") return T.bear;
  if (d === "fair") return T.value;
  return T.faint;
}

function disagreementAccent(label: ScreenerRow["disagreementLabel"]) {
  if (label === "Sharply Divided") return T.bear;
  if (label === "Material Tension") return T.gold;
  return T.growth;
}

function disagreementTint(label: ScreenerRow["disagreementLabel"]) {
  if (label === "Sharply Divided") return "#FBEAE7";
  if (label === "Material Tension") return T.goldSoft;
  return T.growthSoft;
}

function formatAgeHours(h: number): string {
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 14) return `${d}d ago`;
  const w = Math.round(d / 7);
  return `${w}w ago`;
}

function ScreenerCard({ row }: { row: ScreenerRow }) {
  const dAccent = disagreementAccent(row.disagreementLabel);
  const dTint = disagreementTint(row.disagreementLabel);
  const dirAccent = directionAccent(row.direction);
  const upArrow = row.upsidePct > 0 ? "↑" : row.upsidePct < 0 ? "↓" : "→";
  const upsideColor =
    row.upsidePct > 5 ? T.bull : row.upsidePct < -5 ? T.bear : T.faint;

  return (
    <Link
      href={`/${row.ticker}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
      }}
    >
      <div
        style={{
          background: T.card,
          border: `1px solid ${T.line}`,
          borderRadius: 12,
          boxShadow: T.shadow,
          padding: "16px 18px",
          transition: "transform .12s, box-shadow .12s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow =
            "0 2px 4px rgba(14,16,18,.06),0 12px 28px rgba(14,16,18,.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = T.shadow;
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontWeight: 600,
                fontSize: 15,
                color: T.ink,
              }}
            >
              {row.ticker}
            </span>
            <span
              style={{
                fontFamily: "'Fraunces',serif",
                fontWeight: 500,
                fontSize: 14,
                color: T.soft,
              }}
            >
              {row.name}
            </span>
          </div>
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 10,
              color: T.faint,
              whiteSpace: "nowrap",
            }}
          >
            {formatAgeHours(row.ageHours)}
          </span>
        </div>

        {row.sector && (
          <div
            style={{
              fontSize: 10,
              color: T.faint,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            {row.sector}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 11,
              fontWeight: 600,
              color: dAccent,
              background: dTint,
              border: `1px solid ${dAccent}33`,
              padding: "3px 8px",
              borderRadius: 12,
              letterSpacing: ".03em",
              textTransform: "uppercase",
            }}
          >
            {row.disagreementLabel} · {row.disagreementScore}/100
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: dirAccent,
              background: T.bg,
              border: `1px solid ${T.line}`,
              padding: "3px 8px",
              borderRadius: 12,
              letterSpacing: ".03em",
              textTransform: "uppercase",
              fontFamily: "'IBM Plex Mono',monospace",
            }}
          >
            {DIRECTION_LABEL[row.direction]}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 10,
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 13,
          }}
        >
          <span style={{ color: T.faint, fontSize: 10 }}>NOW</span>
          <span style={{ fontWeight: 500, color: T.ink }}>
            ${row.price.toFixed(2)}
          </span>
          <span style={{ color: T.faint, fontSize: 14 }}>{upArrow}</span>
          <span style={{ color: T.faint, fontSize: 10 }}>MIDPOINT</span>
          <span style={{ fontWeight: 500, color: T.ink }}>
            ${row.midpointPrice.toFixed(2)}
          </span>
          <span style={{ color: upsideColor, fontWeight: 600, marginLeft: 4 }}>
            {row.upsidePct >= 0 ? "+" : ""}
            {row.upsidePct.toFixed(1)}%
          </span>
        </div>

        <div
          style={{
            fontSize: 10.5,
            color: T.faint,
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            marginBottom: 10,
            fontFamily: "'IBM Plex Mono',monospace",
          }}
        >
          {row.growthBandLabel && (
            <span style={{ color: T.growth }}>{row.growthBandLabel}</span>
          )}
          {row.valueBandLabel && (
            <span style={{ color: T.value }}>{row.valueBandLabel}</span>
          )}
        </div>

        {row.crux && (
          <div
            style={{
              fontSize: 11.5,
              color: T.soft,
              lineHeight: 1.55,
              paddingTop: 10,
              borderTop: `1px solid ${T.lineSoft}`,
            }}
          >
            <span
              style={{
                fontSize: 9,
                color: T.faint,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                marginRight: 6,
              }}
            >
              Crux
            </span>
            {row.crux.length > 200 ? row.crux.slice(0, 200) + "…" : row.crux}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function ScreenerPage() {
  const [rows, setRows] = useState<ScreenerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [universe, setUniverse] = useState({ totalCached: 0 });
  const [error, setError] = useState<string | null>(null);

  const [maxDisagreement, setMaxDisagreement] = useState(25);
  const [directions, setDirections] = useState<DirectionFilter>({
    upside: true,
    fair: true,
    downside: false,
    mixed: false,
  });
  const [sortKey, setSortKey] = useState<SortKey>("disagreement");

  useEffect(() => {
    fetch("/api/screener")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        setRows(data.rows ?? []);
        setUniverse(data.universe ?? { totalCached: 0 });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load screener");
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const out = rows.filter(
      (r) => r.disagreementScore <= maxDisagreement && directions[r.direction]
    );
    if (sortKey === "disagreement") {
      out.sort((a, b) => a.disagreementScore - b.disagreementScore);
    } else if (sortKey === "upside") {
      out.sort((a, b) => b.upsidePct - a.upsidePct);
    } else {
      out.sort((a, b) => a.ageHours - b.ageHours);
    }
    return out;
  }, [rows, maxDisagreement, directions, sortKey]);

  return (
    <>
      <header
        style={{
          borderBottom: `1px solid ${T.line}`,
          background: "rgba(248,247,243,.92)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1060,
            margin: "0 auto",
            padding: "0 16px",
            height: 54,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Masthead />
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            <Link
              href="/methodology"
              style={{
                border: `1px solid ${T.line}`,
                background: T.card,
                color: T.soft,
                borderRadius: 7,
                padding: "5px 14px",
                fontSize: 11,
                fontFamily: "'IBM Plex Mono',monospace",
                letterSpacing: ".03em",
                textDecoration: "none",
              }}
            >
              Methodology
            </Link>
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1060,
          margin: "0 auto",
          padding: "32px 16px 60px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: T.faint,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          The Screener
        </div>
        <h1
          style={{
            fontFamily: "'Fraunces',serif",
            fontWeight: 500,
            fontSize: 32,
            letterSpacing: "-.01em",
            lineHeight: 1.15,
            marginBottom: 12,
          }}
        >
          Names where the two lenses agree
        </h1>
        <p
          style={{
            fontSize: 14,
            color: T.soft,
            lineHeight: 1.6,
            maxWidth: 760,
            marginBottom: 22,
          }}
        >
          Tickers recently analysed by Stereoscope users, filtered by lens
          agreement and direction. The Growth Scout and Value Guard ran blind on
          each name; this page surfaces the ones where they landed in roughly
          the same place. Click any card to read the full report.
        </p>

        {/* Filter controls */}
        <div
          style={{
            background: T.card,
            border: `1px solid ${T.line}`,
            borderRadius: 12,
            padding: "16px 18px",
            marginBottom: 24,
            display: "grid",
            gap: 16,
            gridTemplateColumns: "1fr 1fr 1fr",
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: T.faint,
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              Max disagreement
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <input
                type="range"
                min={0}
                max={100}
                value={maxDisagreement}
                onChange={(e) => setMaxDisagreement(parseInt(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: T.gold,
                }}
              />
              <span
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 13,
                  fontWeight: 600,
                  minWidth: 38,
                  textAlign: "right",
                }}
              >
                {maxDisagreement}
              </span>
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: T.faint,
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              Direction
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {(Object.keys(DIRECTION_LABEL) as ScreenerRow["direction"][]).map(
                (d) => {
                  const on = directions[d];
                  const acc = directionAccent(d);
                  return (
                    <button
                      key={d}
                      onClick={() =>
                        setDirections((prev) => ({ ...prev, [d]: !prev[d] }))
                      }
                      style={{
                        border: `1px solid ${on ? acc : T.line}`,
                        background: on ? acc : T.card,
                        color: on ? "#fff" : T.soft,
                        borderRadius: 7,
                        padding: "4px 10px",
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "'IBM Plex Mono',monospace",
                        letterSpacing: ".03em",
                        transition: "all .12s",
                      }}
                    >
                      {DIRECTION_LABEL[d]}
                    </button>
                  );
                }
              )}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: T.faint,
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              Sort by
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {(
                [
                  ["disagreement", "Disagreement ↑"],
                  ["upside", "Upside ↓"],
                  ["recent", "Most recent"],
                ] as const
              ).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setSortKey(k)}
                  style={{
                    border: `1px solid ${sortKey === k ? T.ink : T.line}`,
                    background: sortKey === k ? T.ink : T.card,
                    color: sortKey === k ? "#fff" : T.soft,
                    borderRadius: 7,
                    padding: "4px 10px",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "'IBM Plex Mono',monospace",
                    letterSpacing: ".03em",
                    transition: "all .12s",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Universe disclosure */}
        <div
          style={{
            fontSize: 11,
            color: T.faint,
            marginBottom: 18,
            fontFamily: "'IBM Plex Mono',monospace",
            letterSpacing: ".02em",
          }}
        >
          {loading
            ? "Loading…"
            : error
            ? `Error: ${error}`
            : `Showing ${filtered.length} of ${universe.totalCached} tickers in the active cache.`}
        </div>

        {/* Results */}
        {!loading && !error && filtered.length === 0 && (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              border: `1px dashed ${T.line}`,
              borderRadius: 12,
              color: T.soft,
              fontSize: 13,
            }}
          >
            <div style={{ fontSize: 18, color: T.faint, marginBottom: 6 }}>∅</div>
            <div style={{ marginBottom: 4 }}>No matches with current filters.</div>
            <div style={{ fontSize: 11.5, color: T.faint }}>
              Try raising the disagreement threshold or selecting more directions.
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 14,
            }}
          >
            {filtered.map((r) => (
              <ScreenerCard key={r.ticker} row={r} />
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: 30,
            paddingTop: 18,
            borderTop: `1px solid ${T.line}`,
            fontSize: 11,
            color: T.faint,
            lineHeight: 1.6,
            maxWidth: 720,
          }}
        >
          <b>Honest universe note.</b> The screener queries Stereoscope&apos;s
          7-day report cache. The universe is whatever tickers users have
          analysed recently, not a market-wide screen. A name not appearing here
          means nobody has run an analysis on it in the last week, not that the
          methodology rejected it. To add a ticker, search and analyse it from
          the home page — it will appear here automatically.{" "}
          <Link
            href="/methodology"
            style={{ color: T.gold, textDecoration: "underline" }}
          >
            How the score is computed →
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
