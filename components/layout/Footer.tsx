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
        }}
      >
        <b>Stereoscope</b> is an educational decision-support tool. It does not provide
        personalised financial advice and issues no buy/hold/sell recommendation. Conviction
        needs two eyes — the decision is yours.
      </div>
    </footer>
  );
}
