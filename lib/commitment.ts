export function parseCommitment(text: string) {
  const m = text.match(
    /\[COMMITMENT:\s*(.+?)\s*\|\s*THRESHOLD:\s*(.+?)\s*\|\s*CHECK:\s*(.+?)\s*\]/
  );
  return m ? { text: m[1], threshold: m[2], checkDate: m[3] } : null;
}

export function stripCommitment(text: string) {
  return text.replace(/\n?\[COMMITMENT:.*?\]/, "").trim();
}
