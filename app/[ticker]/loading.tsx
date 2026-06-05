import { tokens as T } from "@/lib/tokens";

export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: T.bg,
        color: T.faint,
        fontSize: 13,
        fontFamily: "'IBM Plex Mono',monospace",
      }}
    >
      Loading…
    </div>
  );
}
