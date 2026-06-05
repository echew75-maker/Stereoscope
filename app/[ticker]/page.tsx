"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { tokens as T } from "@/lib/tokens";
import { ReportData, JournalMessage, Commitment } from "@/lib/types";

// Components
import { Masthead } from "@/components/layout/Masthead";
import { AnalyzingSequence } from "@/components/analyzing/AnalyzingSequence";
import { StockHeader } from "@/components/report/StockHeader";
import { ValuationOverlay } from "@/components/report/ValuationOverlay";
import { GuruPanel } from "@/components/report/GuruPanel";
import { MungerPremortem } from "@/components/report/MungerPremortem";
import { CatalystCalendar } from "@/components/report/CatalystCalendar";
import { InvalidationMatrix } from "@/components/report/InvalidationMatrix";
import { JournalThread } from "@/components/journal/JournalThread";
import { CommitmentCard } from "@/components/journal/CommitmentCard";

type Screen = "loading" | "analyzing" | "report" | "error";

function parseCommitment(text: string) {
  const m = text.match(
    /\[COMMITMENT:\s*(.+?)\s*\|\s*THRESHOLD:\s*(.+?)\s*\|\s*CHECK:\s*(.+?)\s*\]/
  );
  return m ? { text: m[1], threshold: m[2], checkDate: m[3] } : null;
}

export default function TickerPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params.ticker as string).toUpperCase();

  const [screen, setScreen] = useState<Screen>("loading");
  const [stageStatus, setStageStatus] = useState<[number, number, number]>([0, 0, 0]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [reportTab, setReportTab] = useState<"report" | "journal">("report");

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
  const analyzeStock = useCallback(async () => {
    setScreen("analyzing");
    setStageStatus([1, 0, 0]);
    setAnalyzeError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });

      setStageStatus([2, 1, 0]);

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      setStageStatus([2, 2, 1]);

      // Small pause for visual completion
      await new Promise((r) => setTimeout(r, 800));
      setStageStatus([2, 2, 2]);
      await new Promise((r) => setTimeout(r, 400));

      setReportData(data.data);
      setScreen("report");
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
        }),
      });

      const data = await res.json();
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
    } catch {
      const em: JournalMessage = {
        id: "m" + (Date.now() + 1),
        role: "assistant",
        content: "Connection interrupted. Your entry was saved.",
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
          <StockHeader rd={rd} />

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
                Stereoscope does not issue a buy, hold, or sell rating.
              </b>{" "}
              Two independent engines analysed {rd.ticker} blind to each other. Below is what
              each found and the single question that divides them.
            </p>
          </div>

          {/* Valuation Overlay / Arbiter */}
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
            </div>
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
              <GuruPanel type="growth" gurus={rd.growthGurus} metrics={rd.growthMetrics} />
              <GuruPanel type="value" gurus={rd.valueGurus} metrics={rd.valueMetrics} />
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
              <b>Stereoscope</b> does not provide personalised financial advice and issues no
              buy/hold/sell recommendation. Conviction needs two eyes — the decision is yours.
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
