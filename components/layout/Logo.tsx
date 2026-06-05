"use client";

import { tokens as T } from "@/lib/tokens";

interface LogoProps {
  size?: number;
  onClick?: () => void;
}

export function Logo({ size = 20, onClick }: LogoProps) {
  return (
    <span
      style={{
        fontFamily: "'Fraunces',serif",
        fontWeight: 600,
        fontSize: size,
        letterSpacing: ".01em",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      STEREO<span style={{ color: T.gold }}>SCOPE</span>
    </span>
  );
}
