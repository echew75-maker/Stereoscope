import { tokens as T } from "@/lib/tokens";
import { JournalMessage } from "@/lib/types";

function fmtTs(ts: number) {
  const d = new Date(ts);
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${mo[d.getMonth()]} ${d.getFullYear()}`;
}

interface Props {
  msgs: JournalMessage[];
  ticker: string;
  thinking: boolean;
}

export function JournalThread({ msgs, ticker, thinking }: Props) {
  return (
    <div style={{ paddingTop: 6 }}>
      {msgs.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "30px 20px",
            color: T.faint,
            fontSize: 13,
          }}
        >
          No journal entries yet for {ticker}. Write your thesis below to start the conversation.
        </div>
      )}

      {msgs.map((m, i) => (
        <div
          key={m.id}
          style={{
            marginTop: i === 0 ? 6 : 14,
            display: "flex",
            flexDirection: "column",
            alignItems: m.role === "user" ? "flex-end" : "flex-start",
          }}
        >
          <div
            style={{
              fontSize: 9.5,
              color: T.faint,
              marginBottom: 3,
              fontFamily: "'IBM Plex Mono',monospace",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {m.role === "assistant" && (
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: T.goldSoft,
                  color: T.gold,
                  display: "inline-grid",
                  placeItems: "center",
                  fontSize: 7,
                  fontWeight: 700,
                  fontFamily: "'Fraunces',serif",
                }}
              >
                S
              </span>
            )}
            {fmtTs(m.ts)} · {m.role === "user" ? "You" : "Stereoscope"}
          </div>
          <div
            style={{
              maxWidth: m.role === "user" ? "80%" : "88%",
              padding: "11px 14px",
              fontSize: 12.5,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              borderRadius:
                m.role === "user"
                  ? "11px 11px 3px 11px"
                  : "11px 11px 11px 3px",
              background: m.role === "user" ? T.ink : T.card,
              color: m.role === "user" ? "#E8E9EB" : T.ink,
              border: m.role === "user" ? "none" : `1px solid ${T.line}`,
            }}
          >
            {m.content}
          </div>
        </div>
      ))}

      {thinking && (
        <div
          style={{
            marginTop: 14,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              fontSize: 9.5,
              color: T.faint,
              marginBottom: 3,
              fontFamily: "'IBM Plex Mono',monospace",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: T.goldSoft,
                color: T.gold,
                display: "inline-grid",
                placeItems: "center",
                fontSize: 7,
                fontWeight: 700,
                fontFamily: "'Fraunces',serif",
              }}
            >
              S
            </span>
            Reviewing against report...
          </div>
          <div
            style={{
              padding: "11px 14px",
              borderRadius: "11px 11px 11px 3px",
              background: T.card,
              border: `1px solid ${T.line}`,
              display: "flex",
              gap: 4,
            }}
          >
            {[0, 1, 2].map((j) => (
              <span
                key={j}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: T.gold,
                  display: "inline-block",
                  animation: `pulse 1.2s infinite ${j * 0.15}s`,
                  opacity: 0.3,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
