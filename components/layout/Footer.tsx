import Link from "next/link";
import { tokens as T } from "@/lib/tokens";

export function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${T.line}`, padding: "20px 0 40px" }}>
      <div
        style={{
          maxWidth: 1060,
          margin: "0 auto",
          padding: "0 20px",
          fontSize: 11,
          color: T.faint,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: 1, minWidth: 260, maxWidth: 760 }}>
          <b>Stereoscope</b> is an educational decision-support tool. It does not provide
          personalised financial advice and issues no buy/hold/sell recommendation.
          Conviction needs two eyes — the decision is yours.
        </div>
        <Link
          href="/methodology"
          style={{
            color: T.soft,
            textDecoration: "underline",
            whiteSpace: "nowrap",
            fontSize: 11,
          }}
        >
          Methodology →
        </Link>
      </div>
    </footer>
  );
}
