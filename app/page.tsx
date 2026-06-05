"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tokens as T } from "@/lib/tokens";
import { Footer } from "@/components/layout/Footer";

export default function LandingPage() {
  const [heroInput, setHeroInput] = useState("");
  const [heroErr, setHeroErr] = useState(false);
  const router = useRouter();

  function handleSearch(val: string) {
    const t = val.trim().toUpperCase();
    if (t.length >= 1 && t.length <= 6 && /^[A-Z]+$/.test(t)) {
      setHeroErr(false);
      router.push(`/${t}`);
    } else if (t.length > 0) {
      setHeroErr(true);
      setTimeout(() => setHeroErr(false), 3000);
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
            <em style={{ fontStyle: "italic", color: T.gold }}>Conviction</em> needs two eyes.
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

          <div style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
            <input
              value={heroInput}
              onChange={(e) => setHeroInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch(heroInput);
              }}
              placeholder="Enter any ticker (e.g. AAPL, MSFT, PLTR)"
              style={{
                width: "100%",
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 17,
                padding: "16px 54px 16px 20px",
                background: T.card,
                border: `1.5px solid ${heroErr ? T.bear : T.line}`,
                borderRadius: 13,
                color: T.ink,
                outline: "none",
                boxShadow: T.shadow,
                textTransform: "uppercase",
                letterSpacing: ".03em",
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
            {heroErr && (
              <div style={{ marginTop: 8, fontSize: 12.5, color: T.bear }}>
                Enter a valid ticker (1–6 letters, e.g. AAPL)
              </div>
            )}
          </div>
          <div style={{ marginTop: 22, fontSize: 11.5, color: T.faint }}>
            Enter any publicly traded US stock ticker. Analysis takes 60–120 seconds.
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
                sub: "7 gurus · hyper-scaling engines",
                color: T.growth,
                bg: T.growthSoft,
              },
              null,
              {
                icon: "◆",
                label: "Value Guard",
                sub: "7 gurus · forensic accounting",
                color: T.value,
                bg: T.valueSoft,
              },
              null,
              {
                icon: "◎",
                label: "The Arbiter",
                sub: "No verdict · frames the bet",
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
                    {s.label}
                  </div>
                  <div style={{ fontSize: 12, color: T.soft }}>{s.sub}</div>
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
