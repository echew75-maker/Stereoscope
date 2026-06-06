"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { tokens as T } from "@/lib/tokens";
import { Footer } from "@/components/layout/Footer";
import { GlossaryTerm } from "@/components/GlossaryTerm";
import { GLOSSARY } from "@/lib/glossary";

interface SearchResult { symbol: string; name: string; exchange: string }

export default function LandingPage() {
  const [heroInput, setHeroInput] = useState("");
  const [heroErr, setHeroErr] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [searching, setSearching] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced ticker / company-name search
  useEffect(() => {
    const q = heroInput.trim();
    if (q.length < 1) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/ticker-search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results || []);
        setHighlighted(0);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [heroInput]);

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(symbol: string) {
    setShowDropdown(false);
    setHeroErr(false);
    router.push(`/${symbol.toUpperCase()}`);
  }

  function handleSearch(val: string) {
    const t = val.trim().toUpperCase();
    // If user picked from dropdown (or typed a clean ticker), use that
    if (t.length >= 1 && t.length <= 6 && /^[A-Z]+$/.test(t)) {
      go(t);
      return;
    }
    // Otherwise, jump to the first search result if we have one
    if (results.length > 0) {
      go(results[0].symbol);
      return;
    }
    setHeroErr(true);
    setTimeout(() => setHeroErr(false), 3000);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || results.length === 0) {
      if (e.key === "Enter") handleSearch(heroInput);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[highlighted].symbol);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

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
            padding: "0 20px",
            height: 54,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "'Fraunces',serif",
              fontWeight: 600,
              fontSize: 20,
              letterSpacing: ".01em",
            }}
          >
            STEREO<span style={{ color: T.gold }}>SCOPE</span>
          </span>
          <nav style={{ display: "flex", gap: 18, fontSize: 12, color: T.soft }}>
            <a href="#how" style={{ color: "inherit", textDecoration: "none" }}>
              How it works
            </a>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 20px" }}>
        <section
          style={{ padding: "72px 0 50px", textAlign: "center", animation: "fadeIn .6s ease" }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: T.gold,
              fontWeight: 600,
              marginBottom: 14,
            }}
          >
            Institutional rigour · Retail clarity
          </div>
          <h1
            style={{
              fontFamily: "'Fraunces',serif",
              fontWeight: 500,
              fontSize: 44,
              lineHeight: 1.08,
              letterSpacing: "-.02em",
              maxWidth: 720,
              margin: "0 auto 16px",
            }}
          >
            <em style={{ fontStyle: "italic", color: T.gold }}>
              <GlossaryTerm label={GLOSSARY.CONVICTION.label} definition={GLOSSARY.CONVICTION.definition}>
                Conviction
              </GlossaryTerm>
            </em>{" "}
            needs two eyes.
          </h1>
          <p
            style={{
              fontSize: 15.5,
              color: T.soft,
              maxWidth: 560,
              margin: "0 auto 32px",
              lineHeight: 1.55,
            }}
          >
            A growth scout and a value guard analyse every stock independently — blind to each
            other. You see both perspectives and the single question that divides them.
          </p>

          <div ref={dropdownRef} style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
            <input
              value={heroInput}
              onChange={(e) => { setHeroInput(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={onKeyDown}
              placeholder="Search by ticker or company name (e.g. AAPL, Apple)"
              autoComplete="off"
              style={{
                width: "100%",
                fontFamily: "'IBM Plex Sans',sans-serif",
                fontSize: 16,
                padding: "16px 54px 16px 20px",
                background: T.card,
                border: `1.5px solid ${heroErr ? T.bear : T.line}`,
                borderRadius: 13,
                color: T.ink,
                outline: "none",
                boxShadow: T.shadow,
                letterSpacing: ".01em",
                transition: "all .2s",
              }}
            />
            <button
              onClick={() => handleSearch(heroInput)}
              style={{
                position: "absolute",
                right: 7,
                top: 7,
                bottom: 7,
                width: 42,
                border: 0,
                borderRadius: 8,
                background: T.ink,
                color: "#fff",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              →
            </button>

            {showDropdown && heroInput.trim().length > 0 && (results.length > 0 || searching) && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  right: 0,
                  background: T.card,
                  border: `1px solid ${T.line}`,
                  borderRadius: 11,
                  boxShadow: "0 12px 32px rgba(20,20,20,.10)",
                  zIndex: 50,
                  overflow: "hidden",
                  textAlign: "left",
                }}
              >
                {results.length === 0 && searching && (
                  <div style={{ padding: "11px 14px", fontSize: 12, color: T.faint, fontFamily: "'IBM Plex Mono',monospace" }}>
                    Searching…
                  </div>
                )}
                {results.map((r, i) => (
                  <div
                    key={r.symbol}
                    onMouseDown={(e) => { e.preventDefault(); go(r.symbol); }}
                    onMouseEnter={() => setHighlighted(i)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      cursor: "pointer",
                      background: i === highlighted ? T.bg : "transparent",
                      borderTop: i === 0 ? "none" : `1px solid ${T.lineSoft}`,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 13, color: T.ink }}>
                        {r.symbol}
                      </span>
                      <span style={{ fontSize: 12, color: T.soft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.name}
                      </span>
                    </div>
                    <span style={{ fontSize: 10, color: T.faint, fontFamily: "'IBM Plex Mono',monospace", marginLeft: 12, flexShrink: 0 }}>
                      {r.exchange}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {heroErr && (
              <div style={{ marginTop: 8, fontSize: 12.5, color: T.bear }}>
                No results — try a different ticker or company name.
              </div>
            )}
          </div>
          <div style={{ marginTop: 22, fontSize: 11.5, color: T.faint }}>
            Search by ticker or company name. Analysis takes 60–120 seconds.
          </div>
        </section>

        <section id="how" style={{ padding: "40px 0 50px" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: T.faint,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              The pipeline
            </div>
            <h2
              style={{
                fontFamily: "'Fraunces',serif",
                fontWeight: 500,
                fontSize: 26,
              }}
            >
              Two engines, run blind. One synthesis.
            </h2>
          </div>
          <div
            style={{
              display: "flex",
              gap: 0,
              alignItems: "stretch",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {[
              {
                icon: "◇",
                label: "Growth Scout",
                labelKey: "GROWTH_SCOUT" as const,
                subPrefix: "7 gurus · ",
                subTerm: "hyper-scaling engines",
                subTermKey: "HYPER_SCALING" as const,
                color: T.growth,
                bg: T.growthSoft,
              },
              null,
              {
                icon: "◆",
                label: "Value Guard",
                labelKey: "VALUE_GUARD" as const,
                subPrefix: "7 gurus · ",
                subTerm: "forensic accounting",
                subTermKey: "FORENSIC_ACCOUNTING" as const,
                color: T.value,
                bg: T.valueSoft,
              },
              null,
              {
                icon: "◎",
                label: "The Arbiter",
                labelKey: "ARBITER" as const,
                subPrefix: "No verdict · frames the bet",
                subTerm: "",
                subTermKey: null,
                color: T.gold,
                bg: T.goldSoft,
              },
            ].map((s, i) =>
              s ? (
                <div
                  key={i}
                  style={{
                    padding: "20px 22px",
                    border: `1px solid ${T.line}`,
                    borderRadius: 12,
                    background: s.bg,
                    textAlign: "center",
                    width: 220,
                    flexShrink: 0,
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
                    {s.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      color: s.color,
                      marginBottom: 4,
                    }}
                  >
                    <GlossaryTerm label={GLOSSARY[s.labelKey].label} definition={GLOSSARY[s.labelKey].definition}>
                      {s.label}
                    </GlossaryTerm>
                  </div>
                  <div style={{ fontSize: 12, color: T.soft }}>
                    {s.subPrefix}
                    {s.subTermKey && (
                      <GlossaryTerm label={GLOSSARY[s.subTermKey].label} definition={GLOSSARY[s.subTermKey].definition}>
                        {s.subTerm}
                      </GlossaryTerm>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                    color: T.faint,
                    fontSize: 16,
                  }}
                >
                  →
                </div>
              )
            )}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
