// Central glossary config. Keys are stable internal IDs; `label` is the
// canonical surface form used in the tooltip header; `aliases` lets the
// matcher catch common variants. Add a term once here and it lights up
// everywhere automatically.

export interface GlossaryEntry {
  label: string;
  definition: string;
  aliases?: string[];
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  GROWTH_SCOUT: {
    label: "Growth Scout",
    definition:
      "Looks at a company's growth potential — revenue trajectory, market expansion, and whether the business can scale rapidly. Named after legendary growth investors like Philip Fisher and Peter Lynch.",
  },
  VALUE_GUARD: {
    label: "Value Guard",
    definition:
      "Scrutinises balance sheets, cash flow, and valuation ratios to assess whether a stock is trading below its intrinsic worth. Draws on the principles of Benjamin Graham and Warren Buffett.",
  },
  ARBITER: {
    label: "Arbiter",
    definition:
      "A neutral synthesis layer that identifies the single most important question dividing the growth and value perspectives. It frames the decision without issuing a buy, hold, or sell verdict.",
    aliases: ["the arbiter"],
  },
  PE_RATIO: {
    label: "P/E ratio",
    definition:
      "Price-to-Earnings ratio. Divides the stock price by annual earnings per share. A high P/E may signal growth expectations; a low P/E may signal undervaluation — or trouble.",
    aliases: ["P/E", "Fwd P/E"],
  },
  EPS: {
    label: "EPS",
    definition:
      "Earnings Per Share. The company's net profit divided by total shares outstanding. A rising EPS generally signals improving profitability.",
  },
  FCF: {
    label: "FCF",
    definition:
      "Free Cash Flow. The cash a company generates after paying for operations and capital expenditure. Often considered a cleaner measure of financial health than reported profit.",
  },
  TAM: {
    label: "TAM",
    definition:
      "Total Addressable Market. The maximum revenue opportunity available if a company captured 100% of its target market. Used to assess long-term growth ceiling.",
  },
  FORENSIC_ACCOUNTING: {
    label: "Forensic accounting",
    definition:
      "Scrutinising financial statements for signs of manipulation, aggressive revenue recognition, or hidden liabilities — the kind of issues that often precede accounting scandals.",
  },
  ANALYST_VERDICT: {
    label: "Analyst verdict",
    definition:
      "A buy/hold/sell rating issued by a financial analyst. Stereoscope deliberately avoids these to prevent overconfidence and encourage the user's own reasoning.",
  },
  PRICE_TARGET: {
    label: "Price target",
    definition:
      "A specific predicted future price for a stock. These are often wrong and create false precision. Stereoscope frames probabilities, not price targets.",
  },
  PERSONALISED_ADVICE: {
    label: "Personalised financial advice",
    definition:
      "Tailored guidance based on an individual's financial situation, goals, and risk tolerance — requires a licensed financial advisor. This tool provides general educational analysis only.",
  },
  CONVICTION: {
    label: "Conviction",
    definition:
      "In investing, a high-confidence belief in a position based on thorough research — as opposed to speculation or following trends.",
  },
  HYPER_SCALING: {
    label: "Hyper-scaling engines",
    definition:
      "Analytical frameworks that assess whether a business model can grow revenue exponentially without proportional cost increases. Key signal for growth investors.",
    aliases: ["hyper-scaling"],
  },
};

// Build a regex-ready list, longest surface forms first so "Growth Scout"
// is matched before "Growth".
export function getMatcherEntries(): Array<{ key: string; surface: string }> {
  const out: Array<{ key: string; surface: string }> = [];
  for (const [key, entry] of Object.entries(GLOSSARY)) {
    out.push({ key, surface: entry.label });
    for (const a of entry.aliases ?? []) out.push({ key, surface: a });
  }
  out.sort((a, b) => b.surface.length - a.surface.length);
  return out;
}
