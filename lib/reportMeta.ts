import { ReportData } from "./types";

export function formatAgeFromIso(iso: string | null, nowMs = Date.now()): string {
  if (!iso) return "just now";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "just now";
  const diffMs = Math.max(0, nowMs - then);
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  return `${weeks}w ago`;
}

function parsePct(s: string | undefined | null): number | null {
  if (!s) return null;
  const m = /(-?\d+(\.\d+)?)/.exec(s);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return Number.isFinite(n) ? n : null;
}

export interface DisagreementResult {
  score: number;
  label: "Largely Aligned" | "Material Tension" | "Sharply Divided";
}

export function disagreementScore(rd: ReportData): DisagreementResult | null {
  const gLeft = parsePct(rd.growthBandLeft);
  const gWidth = parsePct(rd.growthBandWidth);
  const vLeft = parsePct(rd.valueBandLeft);
  const vWidth = parsePct(rd.valueBandWidth);
  if (gLeft === null || gWidth === null || vLeft === null || vWidth === null) {
    return null;
  }

  const gMid = gLeft + gWidth / 2;
  const vMid = vLeft + vWidth / 2;
  const centerDistance = Math.abs(gMid - vMid);

  const overlapLeft = Math.max(gLeft, vLeft);
  const overlapRight = Math.min(gLeft + gWidth, vLeft + vWidth);
  const overlap = Math.max(0, overlapRight - overlapLeft);
  const minWidth = Math.max(1, Math.min(gWidth, vWidth));
  const overlapRatio = Math.min(1, overlap / minWidth);

  const distanceScore = Math.min(100, centerDistance * 2);
  const overlapPenalty = (1 - overlapRatio) * 30;
  const raw = Math.round(Math.min(100, distanceScore * 0.7 + overlapPenalty));

  let label: DisagreementResult["label"] = "Largely Aligned";
  if (raw > 55) label = "Sharply Divided";
  else if (raw > 25) label = "Material Tension";

  return { score: raw, label };
}
