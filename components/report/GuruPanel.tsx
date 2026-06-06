import { GuruRow } from "./GuruRow";
import { MetricGrid } from "./MetricGrid";
import { GaapVsNonGaap } from "./GaapVsNonGaap";
import { tokens as T } from "@/lib/tokens";
import { Guru, Metric, GaapVsNonGaap as GaapVsNonGaapType } from "@/lib/types";

interface Props {
  type: "growth" | "value";
  gurus: Guru[];
  metrics: Metric[];
  gaapVsNonGaap?: GaapVsNonGaapType | null;
}

export function GuruPanel({ type, gurus, metrics, gaapVsNonGaap }: Props) {
  const isGrowth = type === "growth";
  const color = isGrowth ? T.growth : T.value;
  const bg = isGrowth ? T.growthSoft : T.valueSoft;
  const icon = isGrowth ? "◇" : "◆";
  const label = isGrowth ? "Growth Scout" : "Value Guard";
  const subtitle = isGrowth ? "The secular-trend interceptor" : "The capital-preservation auditor";

  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.line}`,
        borderRadius: 12,
        boxShadow: T.shadow,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: `1px solid ${T.line}`,
          background: bg,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            fontWeight: 600,
            color,
          }}
        >
          {icon} {label}
        </div>
        <div
          style={{
            fontFamily: "'Fraunces',serif",
            fontWeight: 500,
            fontSize: 17,
            marginTop: 2,
          }}
        >
          {subtitle}
        </div>
      </div>
      <div style={{ padding: "3px 5px" }}>
        {(gurus || []).map((g, i) => (
          <GuruRow key={i} g={g} />
        ))}
      </div>
      <div
        style={{
          padding: "10px 12px",
          borderTop: `1px solid ${T.line}`,
          background: T.bg,
        }}
      >
        <MetricGrid metrics={metrics} />
        {!isGrowth && gaapVsNonGaap && <GaapVsNonGaap data={gaapVsNonGaap} />}
      </div>
    </div>
  );
}
