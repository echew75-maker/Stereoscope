import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stereoscope — Conviction needs two eyes.",
  description:
    "A growth scout and a value guard analyse every stock independently — blind to each other. You see both perspectives and the single question that divides them.",
  openGraph: {
    title: "Stereoscope",
    description: "Institutional-grade dual-lens stock analysis. No buy/hold/sell. Just both sides.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          background: "#F8F7F3",
          fontFamily: "'IBM Plex Sans',-apple-system,sans-serif",
          color: "#141618",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {children}
      </body>
    </html>
  );
}
