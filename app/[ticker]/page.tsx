"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { tokens as T } from "@/lib/tokens";
import { ReportData, JournalMessage, Commitment } from "@/lib/types";
import { parseCommitment } from "@/lib/commitment";
import { GlossaryTerm } from "@/components/GlossaryTerm";
import { GLOSSARY } from "@/lib/glossary";
import { disagreementScore } from "@/lib/reportMeta";
import Link from "next/link";

// Components
import { Masthead } from "@/components/layout/Masthead";
import { AnalyzingSequence } from "@/components/analyzing/AnalyzingSequence";
import { StockHeader } from "@/components/report/StockHeader";
import { ValuationOverlay } from "@/components/report/ValuationOverlay";
import { GuruPanel } from "@/components/report/GuruPanel";
import { MungerPremortem } from "@/components/report/MungerPremortem";
import { LensFailurePanel } from "@/components/report/LensFailurePanel";
import { CatalystCalendar } from "@/components/report/CatalystCalendar";
import { InvalidationMatrix } from "@/components/report/InvalidationMatrix";
import { JournalThread } from "@/components/journal/JournalThread";
import { CommitmentCard } from "@/components/journal/CommitmentCard";

type Screen = "loading" | "analyzing" | "report";

export default function TickerPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params.ticker as string).toUpperCase();

  const [screen, setScreen] = useState<Screen>("loading");
  const [stageStatus, setStageStatus] = useState<[number, number, number]>([0, 0, 0]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [limitExceeded, setLimitExceeded] = useState<{ used: number; limit: number; tier: string } | null>(null);
  const [reportTab, setReportTab] = useState<"report" | "journal">("report");
  const [priorView, setPriorView] = useState<"bullish" | "neutral" | "bearish" | null>(null);

  // Journal state
  const [msgs, setMsgs] = useState<JournalMessage[]>([]);
  const [commits, setCommits] = useState<Commitment[]>([]);
  const [jInput, setJInput] = useState("");
  const [jThinking, setJThinking] = useState(false);
  const [jPanel, setJPanel] = useState<"thread" | "commitments">("thread");
  const [pending, setPending] = useState<{
    text: string;
    threshold: string;
    checkDate: string;
  } | null>(null);
  const [addingC, setAddingC] = useState(false);
  const [cForm, setCForm] = useState({ text: "", threshold: "", check: "" });
  const bottomRef = useRef<HTMLDivElement>(null);

  // Storage helpers (localStorage fallback for unauthenticated users)
  const saveLocal = useCallback((key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, []);

  const loadLocal = useCallback(<T,>(key: string, fallback: T): T => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  }, []);

  // Load journal from localStorage on mount
  useEffect(() => {
    setMsgs(loadLocal<JournalMessage[]>(`stereo:${ticker}:msgs`, []));
    setCommits(loadLocal<Commitment[]>(`stereo:${ticker}:commits`, []));
  }, [ticker, loadLocal]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, jThinking, pending]);

  // Trigger analysis
  const analyzeStock = useCallback(async (force = false) => {
    setScreen("analyzing");
    setStageStatus([1, 1, 0]); // both scouts start in parallel
    setAnalyzeError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, force }),
      });

      setStageStatus([2, 2, 1]); // both scouts done, arbiter now active

      const data = await res.json();

      if (!data.success) {
        if (data.error === "limit_exceeded") {
          setLimitExceeded({ used: data.used, limit: data.limit, tier: data.tier });
          setScreen("loading");
          return;
        }
        const errMsg =
          typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error) || "Analysis failed";
        throw new Error(errMsg);
      }

      setStageStatus([2, 2, 1]);

      // Small pause for visual completion
      await new Promise((r) => setTimeout(r, 800));
      setStageStatus([2, 2, 2]);
      await new Promise((r) => setTimeout(r, 400));

      setReportData(data.data);
      setGeneratedAt(data.generated_at ?? new Date().toISOString());
      setScreen("report");
      // If user recorded a prior view, seed it as the first journal message
      if (priorView) {
        const priorMsg: JournalMessage = {
          id: "prior-" + Date.now(),
          role: "user",
          content: `Before reading this report, my instinct on ${ticker} was ${priorView.toUpperCase()}.`,
          ts: Date.now(),
        };
        const existing = loadLocal<JournalMessage[]>(`stereo:${ticker}:msgs`, []);
        if (existing.length === 0) {
          const seeded = [priorMsg];
          setMsgs(seeded);
          saveLocal(`stereo:${ticker}:msgs`, seeded);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setAnalyzeError(`Analysis failed: ${message}. Please retry.`);
      setStageStatus([2, 2, 0]);
    }
  }, [ticker]);

  // On mount: check cache, then run
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`/api/report/${ticker}`);
        const data = await res.json();
        if (data.exists && data.data) {
          setReportData(data.data);
          setGeneratedAt(data.generated_at ?? null);
          setScreen("report");
          return;
        }
      } catch {}
      // No cache — run analysis
      analyzeStock();
    }
    init();
  }, [ticker, analyzeStock]);

  // Journal: send message
  async function sendMsg() {
    const text = jInput.trim();
    if (!text || jThinking || !reportData) return;

    const um: JournalMessage = {
      id: "m" + Date.now(),
      role: "user",
      content: text,
      ts: Date.now(),
    };
    const updMsgs = [...msgs, um];
    setMsgs(updMsgs);
    saveLocal(`stereo:${ticker}:msgs`, updMsgs);
    setJInput("");
    setJThinking(true);

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          messages: updMsgs.map((m) => ({ role: m.role, content: m.content })),
          reportData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Journal API error ${res.status}`);
      const rawReply = data.reply || "Connection issue — try again.";
      const commitment = data.commitment_detected
        ? parseCommitment(`[COMMITMENT: ${data.commitment_detected.text} | THRESHOLD: ${data.commitment_detected.threshold} | CHECK: ${data.commitment_detected.checkDate}]`)
        : null;

      const am: JournalMessage = {
        id: "m" + (Date.now() + 1),
        role: "assistant",
        content: rawReply,
        ts: Date.now(),
      };
      const withReply = [...updMsgs, am];
      setMsgs(withReply);
      saveLocal(`stereo:${ticker}:msgs`, withReply);

      if (commitment) {
        setPending(commitment);
      }
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : "unknown error";
      const em: JournalMessage = {
        id: "m" + (Date.now() + 1),
        role: "assistant",
        content: `Error: ${detail}`,
        ts: Date.now(),
      };
      const withErr = [...updMsgs, em];
      setMsgs(withErr);
      saveLocal(`stereo:${ticker}:msgs`, withErr);
    }

    setJThinking(false);
  }

  function acceptCommitment() {
    if (!pending) return;
    const nc: Commitment = {
      id: "c" + Date.now(),
      text: pending.text,
      threshold: pending.threshold,
      checkDate: pending.checkDate,
      status: "watching",
      sourceMessageId: null,
      createdAt: Date.now(),
    };
    const updated = [...commits, nc];
    setCommits(updated);
    saveLocal(`stereo:${ticker}:commits`, updated);
    setPending(null);
  }

  function addManualCommitment() {
    if (!cForm.text.trim()) return;
    const nc: Commitment = {
      id: "c" + Date.now(),
      text: cForm.text,
      threshold: cForm.threshold || "—",
      checkDate: cForm.check || "—",
      status: "watching",
      sourceMessageId: null,
      createdAt: Date.now(),
    };
    const updated = [...commits, nc];
    setCommits(updated);
    saveLocal(`stereo:${ticker}:commits`, updated);
    setCForm({ text: "", threshold: "", check: "" });
    setAddingC(false);
  }

  function removeCommitment(id: string) {
    const updated = commits.filter((c) => c.id !== id);
    setCommits(updated);
    saveLocal(`stereo:${ticker}:commits`, updated);
  }

  function handleDownloadPDF() {
    setReportTab("report");
    setTimeout(() => window.print(), 300);
  }

  // ── SCREENS ──

  if (screen === "loading" && limitExceeded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: T.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          fontFamily: "'IBM Plex Sans',-apple-system,sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            background: T.card,
            border: `1px solid ${T.line}`,
            borderRadius: 14,
            padding: "32px 28px",
            boxShadow: T.shadow,
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 8 }}>📊</div>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
            Monthly limit reached
          </h2>
          <p style={{ fontSize: 13.5, color: T.soft, marginBottom: 20, lineHeight: 1.6 }}>
            You've used {limitExceeded.used} of {limitExceeded.limit} analyses this month on the{" "}
            <strong>Free</strong> plan. Upgrade to continue.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a
              href="/account"
              style={{
                display: "block",
                padding: "11px",
                background: T.ink,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              View account &amp; upgrade
            </a>
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "11px",
                background: "transparent",
                border: `1px solid ${T.line}`,
                borderRadius: 8,
                fontSize: 13.5,
                color: T.soft,
                cursor: "pointer",
                fontFamily: "'IBM Plex Sans',sans-serif",
              }}
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.faint,
          fontSize: 13,
          fontFamily: "'IBM Plex Mono',monospace",
        }}
      >
        Loading…
      </div>
    );
  }

  if (screen === "analyzing") {
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
              maxWidth: 900,
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
            <span
              onClick={() => router.push("/")}
              style={{ fontSize: 12, color: T.soft, cursor: "pointer" }}
            >
              ← Back
            </span>
          </div>
        </header>
        <AnalyzingSequence
          ticker={ticker}
          stageStatus={stageStatus}
          error={analyzeError}
          onRetry={analyzeStock}
          onBack={() => router.push("/")}
          onPriorView={(v) => {
            setPriorView(v);
            saveLocal(`stereo:${ticker}:prior`, v);
          }}
        />
      </>
    );
  }

  if (!reportData) return null;
  const rd = reportData;

  return (
    <>
      {/* Masthead with tab switcher */}
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
            {(
              [
                ["report", "Analysis"],
                ["journal", "Journal"],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setReportTab(k)}
                style={{
                  border: `1px solid ${reportTab === k ? T.ink : T.line}`,
                  background: reportTab === k ? T.ink : T.card,
                  color: reportTab === k ? "#fff" : T.soft,
                  borderRadius: 7,
                  padding: "5px 14px",
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "'IBM Plex Mono',monospace",
                  letterSpacing: ".03em",
                  transition: "all .15s",
                }}
              >
                {l}
                {k === "journal" ? ` (${commits.length})` : ""}
              </button>
            ))}
            <button
              onClick={() => analyzeStock(true)}
              className="no-print"
              title="Fetch fresh analysis from the web"
              style={{
                border: `1px solid ${T.line}`,
                background: T.card,
                color: T.soft,
                borderRadius: 7,
                padding: "5px 14px",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "'IBM Plex Mono',monospace",
                letterSpacing: ".03em",
                transition: "all .15s",
              }}
            >
              ↻ Refresh
            </button>
            <button
              onClick={handleDownloadPDF}
              className="no-print"
              style={{
                border: `1px solid ${T.line}`,
                background: T.card,
                color: T.soft,
                borderRadius: 7,
                padding: "5px 14px",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "'IBM Plex Mono',monospace",
                letterSpacing: ".03em",
                transition: "all .15s",
              }}
            >
              ↓ PDF
            </button>
          </div>
        </div>
      </header>

      {/* ── REPORT TAB ── */}
      {reportTab === "report" && (
        <div
          style={{
            maxWidth: 1060,
            margin: "0 auto",
            padding: "0 16px",
            paddingBottom: 60,
          }}
        >
          <StockHeader rd={rd} generatedAt={generatedAt} />

          {/* No-verdict banner */}
          <div
            style={{
              marginTop: 18,
              border: `1px solid ${T.goldSoft}`,
              background: "linear-gradient(0deg,#FCF8EE,#FFFDF8)",
              borderRadius: 12,
              padding: "13px 16px",
              display: "flex",
              gap: 11,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: T.goldSoft,
                color: T.gold,
                display: "grid",
                placeItems: "center",
                fontSize: 13,
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              ◎
            </div>
            <p style={{ fontSize: 12.5, color: T.soft, lineHeight: 1.55 }}>
              <b style={{ color: T.ink }}>
                Stereoscope does not issue a{" "}
                <GlossaryTerm label={GLOSSARY.ANALYST_VERDICT.label} definition={GLOSSARY.ANALYST_VERDICT.definition}>
                  buy, hold, or sell rating
                </GlossaryTerm>
                .
              </b>{" "}
              A Growth Scout and a Value Guard analysed {rd.ticker} independently — each blind
              to the other&apos;s work — then a third engine, the Arbiter, reconciled their
              findings without averaging them. Below is what each found and the single question
              that divides them.{" "}
              <Link
                href="/methodology"
                style={{ color: T.gold, textDecoration: "underline", fontWeight: 500 }}
              >
                How this works →
              </Link>
            </p>
          </div>

          {/* Valuation Overlay / Arbiter */}
          <section style={{ marginTop: 30 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 9,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 10.5,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: T.faint,
                }}
              >
                The Synthesis
              </span>
              <h2
                style={{
                  fontFamily: "'Fraunces',serif",
                  fontWeight: 500,
                  fontSize: 20,
                }}
              >
                Where the two lenses meet
              </h2>
              {(() => {
                const d = disagreementScore(rd);
                if (!d) return null;
                const accent =
                  d.label === "Sharply Divided"
                    ? T.bear
                    : d.label === "Material Tension"
                    ? T.gold
                    : T.growth;
                const tint =
                  d.label === "Sharply Divided"
                    ? "#FBEAE7"
                    : d.label === "Material Tension"
                    ? T.goldSoft
                    : T.growthSoft;
                return (
                  <span
                    title="Distance between the Growth and Value bands on the price axis. 0 = bands aligned, 100 = bands at opposite ends."
                    style={{
                      marginLeft: "auto",
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: 10.5,
                      letterSpacing: ".04em",
                      color: accent,
                      background: tint,
                      border: `1px solid ${accent}33`,
                      padding: "3px 9px",
                      borderRadius: 12,
                      fontWeight: 600,
                    }}
                  >
                    {d.label.toUpperCase()} · {d.score}/100
                  </span>
                );
              })()}
            </div>
            <p
              style={{
                fontSize: 12,
                color: T.soft,
                lineHeight: 1.55,
                marginTop: -4,
                marginBottom: 12,
                maxWidth: 760,
              }}
            >
              Generated independently, then reconciled — never averaged. The score above
              measures how far apart the two lenses landed on price.
            </p>
            <ValuationOverlay rd={rd} />
          </section>

          {/* Two panels side by side */}
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
                The Independent Reads
              </span>
              <h2
                style={{
                  fontFamily: "'Fraunces',serif",
                  fontWeight: 500,
                  fontSize: 20,
                }}
              >
                Two engines, run blind
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {rd.growthScoutOk ? (
                <GuruPanel type="growth" gurus={rd.growthGurus} metrics={rd.growthMetrics} />
              ) : (
                <LensFailurePanel lens="Growth Scout" onRetry={() => analyzeStock(true)} />
              )}
              {rd.valueScoutOk ? (
                <GuruPanel
                  type="value"
                  gurus={rd.valueGurus}
                  metrics={rd.valueMetrics}
                  gaapVsNonGaap={rd.gaapVsNonGaap}
                />
              ) : (
                <LensFailurePanel lens="Value Guard" onRetry={() => analyzeStock(true)} />
              )}
            </div>
          </section>

          <MungerPremortem rd={rd} />

          <CatalystCalendar
            catalysts={rd.catalysts}
            onJournal={(title) => {
              setReportTab("journal");
              setTimeout(
                () =>
                  setJInput(
                    `${title} — here's what I'm thinking about my position...`
                  ),
                100
              );
            }}
          />

          <InvalidationMatrix triggers={rd.triggers} />

          {/* Capture-your-read CTA */}
          <section
            className="no-print"
            style={{
              marginTop: 32,
              border: `1.5px solid ${T.goldLine}`,
              borderRadius: 12,
              padding: "18px 20px",
              background: "linear-gradient(0deg,#FCF8EE,#FFFDF8)",
              display: "flex",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: T.goldSoft,
                color: T.gold,
                display: "grid",
                placeItems: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              ✎
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div
                style={{
                  fontFamily: "'Fraunces',serif",
                  fontWeight: 500,
                  fontSize: 16,
                  color: T.ink,
                  marginBottom: 4,
                }}
              >
                Now capture your own read.
              </div>
              <div style={{ fontSize: 12.5, color: T.soft, lineHeight: 1.55 }}>
                You&apos;ve seen both lenses and the question that divides them. Writing
                down your thesis — and the threshold that would prove it wrong — is what
                turns reading into conviction.
              </div>
            </div>
            <button
              onClick={() => {
                setReportTab("journal");
                setTimeout(
                  () =>
                    setJInput(
                      `My read on ${rd.ticker}: I lean [bull/bear] because...\n\nThe Crux question is: ${rd.crux || "—"}\n\nMy answer:`
                    ),
                  100
                );
              }}
              style={{
                border: "none",
                background: T.ink,
                color: "#fff",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'IBM Plex Sans',sans-serif",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              ✎ Open the Journal →
            </button>
          </section>

          {/* Footer */}
          <footer style={{ marginTop: 36, borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
            {rd.sources && (
              <div style={{ fontSize: 10.5, color: T.faint, lineHeight: 1.7 }}>
                <b>Sources.</b> {rd.sources}
              </div>
            )}
            <div
              style={{
                marginTop: 12,
                fontSize: 10.5,
                color: T.faint,
                background: T.card,
                border: `1px solid ${T.line}`,
                borderRadius: 8,
                padding: "10px 13px",
              }}
            >
              <b>Stereoscope</b> does not provide{" "}
              <GlossaryTerm label={GLOSSARY.PERSONALISED_ADVICE.label} definition={GLOSSARY.PERSONALISED_ADVICE.definition}>
                personalised financial advice
              </GlossaryTerm>{" "}
              and issues no buy/hold/sell recommendation.{" "}
              <GlossaryTerm label={GLOSSARY.CONVICTION.label} definition={GLOSSARY.CONVICTION.definition}>
                Conviction
              </GlossaryTerm>{" "}
              needs two eyes — the decision is yours.
            </div>
            {rd.filingPeriod && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 10,
                  color: T.faint,
                  fontFamily: "'IBM Plex Mono',monospace",
                }}
              >
                Report grounded in {rd.filingPeriod} filing ({rd.filingDate}). Next filing
                expected {rd.nextFiling || "~90 days"}.
              </div>
            )}
          </footer>
        </div>
      )}

      {/* ── JOURNAL TAB ── */}
      {reportTab === "journal" && (
        <div
          style={{ maxWidth: 820, margin: "0 auto", padding: "0 16px", paddingBottom: 110 }}
        >
          {/* Journal header card */}
          <div
            style={{
              marginTop: 14,
              border: `1px solid ${T.line}`,
              borderRadius: 11,
              padding: "12px 14px",
              background: T.card,
              boxShadow: T.shadow,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: `linear-gradient(135deg,${T.growthSoft},${T.valueSoft})`,
                  border: `1px solid ${T.line}`,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontWeight: 600,
                  fontSize: 11,
                }}
              >
                {rd.ticker}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Fraunces',serif",
                    fontWeight: 500,
                    fontSize: 15,
                  }}
                >
                  {rd.name}
                </div>
                <div style={{ fontSize: 11, color: T.faint }}>
                  @{" "}
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontWeight: 500,
                      color: T.ink,
                    }}
                  >
                    ${rd.price}
                  </span>{" "}
                  · {rd.filingPeriod || "Latest"} filing
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["thread", "commitments"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setJPanel(tab)}
                  style={{
                    border: `1px solid ${jPanel === tab ? T.ink : T.line}`,
                    background: jPanel === tab ? T.ink : T.card,
                    color: jPanel === tab ? "#fff" : T.soft,
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 10,
                    cursor: "pointer",
                    fontFamily: "'IBM Plex Mono',monospace",
                    transition: "all .15s",
                    textTransform: "capitalize",
                  }}
                >
                  {tab === "commitments" ? `Commitments (${commits.length})` : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Journal intro */}
          <div
            style={{
              marginTop: 12,
              border: `1px solid ${T.goldLine}`,
              borderRadius: 11,
              padding: "16px 18px",
              background: "linear-gradient(0deg,#FCF8EE,#FFFDF8)",
            }}
          >
            <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: T.goldSoft,
                  color: T.gold,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 14,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                ✎
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Fraunces',serif",
                    fontWeight: 500,
                    fontSize: 15,
                    marginBottom: 6,
                  }}
                >
                  This is not a note-taking tool. It&apos;s a sparring partner.
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: T.soft,
                    lineHeight: 1.6,
                    marginBottom: 10,
                  }}
                >
                  Write about your {rd.ticker} position and a peer who has read the full
                  dual-lens report responds with specific, data-grounded challenges and
                  alternative perspectives.
                </div>
                <div style={{ fontSize: 11.5, color: T.soft, lineHeight: 1.7 }}>
                  <span style={{ color: T.gold }}>→</span>{" "}
                  <b style={{ color: T.ink }}>State your thesis in your own words</b> — the act
                  of writing forces clarity.
                  <br />
                  <span style={{ color: T.gold }}>→</span>{" "}
                  <b style={{ color: T.ink }}>Name your line in the sand</b> — it becomes a
                  tracked commitment.
                  <br />
                  <span style={{ color: T.gold }}>→</span>{" "}
                  <b style={{ color: T.ink }}>Come back when something changes</b> — the thread
                  captures how your thinking evolves.
                </div>
              </div>
            </div>
          </div>

          {/* Thread panel */}
          {jPanel === "thread" && (
            <>
              <JournalThread msgs={msgs} ticker={ticker} thinking={jThinking} />

              {/* Pending commitment */}
              {pending && (
                <div
                  style={{
                    marginTop: 14,
                    border: `1.5px solid ${T.gold}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                    background: "#FFFDF8",
                  }}
                >
                  <div
                    style={{
                      fontSize: 9.5,
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: T.gold,
                      fontWeight: 600,
                      fontFamily: "'IBM Plex Mono',monospace",
                      marginBottom: 6,
                    }}
                  >
                    Commitment detected
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 3 }}>
                    {pending.text}
                  </div>
                  <div style={{ fontSize: 11.5, color: T.soft }}>
                    Threshold:{" "}
                    <span
                      style={{ fontFamily: "'IBM Plex Mono',monospace", color: T.ink }}
                    >
                      {pending.threshold}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: T.soft, marginBottom: 10 }}>
                    Check:{" "}
                    <span
                      style={{ fontFamily: "'IBM Plex Mono',monospace", color: T.ink }}
                    >
                      {pending.checkDate}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 7 }}>
                    <button
                      onClick={acceptCommitment}
                      style={{
                        border: "none",
                        background: T.ink,
                        color: "#fff",
                        borderRadius: 7,
                        padding: "6px 14px",
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Track this
                    </button>
                    <button
                      onClick={() => setPending(null)}
                      style={{
                        border: `1px solid ${T.line}`,
                        background: T.card,
                        color: T.soft,
                        borderRadius: 7,
                        padding: "6px 14px",
                        fontSize: 11.5,
                        cursor: "pointer",
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </>
          )}

          {/* Commitments panel */}
          {jPanel === "commitments" && (
            <div style={{ paddingTop: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Fraunces',serif",
                      fontWeight: 500,
                      fontSize: 16,
                    }}
                  >
                    Your commitments
                  </div>
                  <div style={{ fontSize: 11.5, color: T.faint, marginTop: 1 }}>
                    Testable assumptions from your conversation.
                  </div>
                </div>
                <button
                  onClick={() => setAddingC(!addingC)}
                  style={{
                    border: `1px solid ${T.line}`,
                    background: T.card,
                    borderRadius: 7,
                    padding: "5px 10px",
                    fontSize: 11,
                    color: T.soft,
                    cursor: "pointer",
                    fontFamily: "'IBM Plex Mono',monospace",
                  }}
                >
                  {addingC ? "Cancel" : "+ Add"}
                </button>
              </div>

              {addingC && (
                <div
                  style={{
                    border: `1.5px solid ${T.gold}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                    background: "#FFFDF8",
                    marginBottom: 12,
                  }}
                >
                  {[
                    { k: "text" as const, l: "Commitment", ph: "e.g., Revenue growth holds above 30%" },
                    { k: "threshold" as const, l: "Threshold", ph: "e.g., YoY revenue growth ≥ 30%" },
                    { k: "check" as const, l: "Check date", ph: "e.g., Q3 2026 earnings" },
                  ].map((f) => (
                    <div key={f.k} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10.5, color: T.soft, marginBottom: 2 }}>
                        {f.l}
                      </div>
                      <input
                        value={cForm[f.k]}
                        onChange={(e) =>
                          setCForm((p) => ({ ...p, [f.k]: e.target.value }))
                        }
                        placeholder={f.ph}
                        style={{
                          width: "100%",
                          padding: "7px 9px",
                          border: `1px solid ${T.line}`,
                          borderRadius: 6,
                          fontSize: 12.5,
                          outline: "none",
                          background: T.card,
                          fontFamily: "'IBM Plex Sans',sans-serif",
                        }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={addManualCommitment}
                    disabled={!cForm.text.trim()}
                    style={{
                      border: "none",
                      background: cForm.text.trim() ? T.ink : T.line,
                      color: cForm.text.trim() ? "#fff" : T.faint,
                      borderRadius: 7,
                      padding: "6px 14px",
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: cForm.text.trim() ? "pointer" : "default",
                    }}
                  >
                    Track
                  </button>
                </div>
              )}

              {commits.length === 0 && !addingC && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "30px 20px",
                    color: T.faint,
                    fontSize: 13,
                  }}
                >
                  No commitments yet. As you journal, Stereoscope will detect testable
                  assumptions and offer to track them.
                </div>
              )}

              {commits.map((c) => (
                <CommitmentCard key={c.id} commitment={c} onRemove={removeCommitment} />
              ))}
            </div>
          )}

          {/* Journal input bar */}
          {jPanel === "thread" && (
            <div
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                background: "rgba(248,247,243,.95)",
                backdropFilter: "blur(12px)",
                borderTop: `1px solid ${T.line}`,
                padding: "9px 16px 13px",
                zIndex: 30,
              }}
            >
              <div
                style={{
                  maxWidth: 820,
                  margin: "0 auto",
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-end",
                }}
              >
                <textarea
                  value={jInput}
                  onChange={(e) => setJInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMsg();
                    }
                  }}
                  placeholder={`Write about your ${rd.ticker} position — reasoning, concerns, what you're watching...`}
                  rows={1}
                  style={{
                    flex: 1,
                    fontFamily: "'IBM Plex Sans',sans-serif",
                    fontSize: 13,
                    padding: "9px 12px",
                    border: `1.5px solid ${T.line}`,
                    borderRadius: 9,
                    background: T.card,
                    color: T.ink,
                    resize: "none",
                    outline: "none",
                    lineHeight: 1.5,
                    minHeight: 40,
                    maxHeight: 100,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = T.ink)}
                  onBlur={(e) => (e.target.style.borderColor = T.line)}
                  onInput={(e) => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = "40px";
                    t.style.height = Math.min(t.scrollHeight, 100) + "px";
                  }}
                />
                <button
                  onClick={sendMsg}
                  disabled={!jInput.trim() || jThinking}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    border: "none",
                    background:
                      jInput.trim() && !jThinking ? T.ink : T.line,
                    color: jInput.trim() && !jThinking ? "#fff" : T.faint,
                    fontSize: 15,
                    cursor: jInput.trim() && !jThinking ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ↑
                </button>
              </div>
              <div
                style={{
                  maxWidth: 820,
                  margin: "4px auto 0",
                  fontSize: 9.5,
                  color: T.faint,
                  textAlign: "center",
                }}
              >
                Thoughtful peer, not an advisor. No recommendations. Enter to send.
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
