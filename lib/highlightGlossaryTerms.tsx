// Post-processing utility for plain prose strings (report fields like
// crux / payingForDesc / sources etc. arrive as plain strings via JSON —
// not markdown — so we don't need a remark plugin).
//
// `highlightGlossaryTerms(text)` returns a React.ReactNode that renders the
// original prose with each glossary term wrapped in a <GlossaryTerm>.
//
// Matching rules:
//  • case-insensitive, whole-word (\b boundaries)
//  • each glossary key matched at most once per call (first occurrence)
//  • longer surface forms tried first (so "Growth Scout" beats "Growth")

import { ReactNode } from "react";
import { GLOSSARY, getMatcherEntries } from "./glossary";
import { GlossaryTerm } from "@/components/GlossaryTerm";

interface Hit {
  start: number;
  end: number;
  key: string;
  matched: string;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightGlossaryTerms(text: string): ReactNode {
  if (!text) return text;

  const entries = getMatcherEntries();
  const used = new Set<string>();
  const hits: Hit[] = [];

  for (const { key, surface } of entries) {
    if (used.has(key)) continue;
    // Whole-word, case-insensitive; first match only.
    const re = new RegExp(`\\b${escapeRegex(surface)}\\b`, "i");
    const m = re.exec(text);
    if (!m) continue;

    // Skip if this slice overlaps an already-claimed range
    const start = m.index;
    const end   = start + m[0].length;
    const overlaps = hits.some((h) => start < h.end && end > h.start);
    if (overlaps) continue;

    hits.push({ start, end, key, matched: m[0] });
    used.add(key);
  }

  if (hits.length === 0) return text;

  hits.sort((a, b) => a.start - b.start);

  const out: ReactNode[] = [];
  let cursor = 0;
  hits.forEach((h, i) => {
    if (h.start > cursor) out.push(text.slice(cursor, h.start));
    const entry = GLOSSARY[h.key];
    out.push(
      <GlossaryTerm key={`g-${i}-${h.start}`} label={entry.label} definition={entry.definition}>
        {h.matched}
      </GlossaryTerm>
    );
    cursor = h.end;
  });
  if (cursor < text.length) out.push(text.slice(cursor));

  return <>{out}</>;
}

// Convenience wrapper — usable directly in JSX:
// <GlossaryText text={rd.crux} />
export function GlossaryText({ text }: { text: string }) {
  return <>{highlightGlossaryTerms(text)}</>;
}
