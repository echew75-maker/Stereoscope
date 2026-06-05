import { tokens as T } from "@/lib/tokens";
import { Metric } from "@/lib/types";

interface Props {
  metrics: Metric[];
}

export function MetricGrid({ metrics }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 7 }}>
      {(metrics || []).map((m, i) => (
        <div
          key={i}
          style={{
            background: T.card,
            border: `1px solid ${T.line}`,
            borderRadius: 7,
            padding: "8px 10px",
          }}
        >
          <div style={{ fontSize: 10, color: T.faint }}>{m.k}</div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 13.5,
              fontWeight: 500,
              marginTop: 1,
              color: m.c === "b" ? T.bull : m.c === "r" ? T.bear : T.ink,
            }}
          >
            {m.v}
          </div>
        </div>
      ))}
    </div>
  );
}
