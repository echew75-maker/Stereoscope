export interface ReportData {
  name: string;
  ticker: string;
  exchange: string;
  sector: string;
  price: number;
  chg: string;
  range: string;
  asof: string;
  currency: string;
  filingPeriod: string;
  filingDate: string;
  nextFiling: string;
  stats: Stat[];
  growthGurus: Guru[];
  valueGurus: Guru[];
  growthMetrics: Metric[];
  valueMetrics: Metric[];
  valueBandLabel: string;
  valueBandLeft: string;
  valueBandWidth: string;
  growthBandLabel: string;
  growthBandLeft: string;
  growthBandWidth: string;
  markerLeft: string;
  overlapType: "disjoint" | "overlap" | "value-biased";
  overlapNote: string;
  crux: string;
  cruxGrowth: string;
  cruxValue: string;
  payingForTitle: string;
  payingForDesc: string;
  decisiveDate: string;
  decisiveText: string;
  premortemPrice: string;
  premortemQuote: string;
  premortemSteps: TimelineStep[];
  premortemCoda: string;
  catalysts: Catalyst[];
  triggers: Trigger[];
  sources: string;
}

export interface Stat {
  k: string;
  v: string;
  c?: string;
}

export interface Guru {
  n: string;
  f: string;
  m: string;
  s: "b" | "n" | "r";
  overview: string;
  conclusion: string;
}

export interface Metric {
  k: string;
  v: string;
  c: "b" | "r" | "";
}

export interface TimelineStep {
  yr: string;
  txt: string;
}

export interface Catalyst {
  dateLabel: string;
  type: string;
  title: string;
  desc: string;
  detail: string;
  watchMetrics: string[];
}

export interface Trigger {
  n: number;
  title: string;
  tag: string;
  tagColor: string;
  desc: string;
  cur: string;
  curC: string;
  trig: string;
  extra: string | null;
}

export interface Commitment {
  id: string;
  text: string;
  threshold: string;
  checkDate: string;
  status: "watching" | "ok" | "warning" | "fired";
  sourceMessageId: string | null;
  createdAt: number;
}

export interface JournalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}
