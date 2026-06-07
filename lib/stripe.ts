import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});

const PRICE_TIER_MAP: Record<string, "researcher" | "pro"> = {};

function buildMap() {
  const entries: Array<[string | undefined, "researcher" | "pro"]> = [
    [process.env.STRIPE_RESEARCHER_PRICE_ID, "researcher"],
    [process.env.STRIPE_RESEARCHER_ANNUAL_PRICE_ID, "researcher"],
    [process.env.STRIPE_PRO_PRICE_ID, "pro"],
    [process.env.STRIPE_PRO_ANNUAL_PRICE_ID, "pro"],
  ];
  for (const [id, tier] of entries) {
    if (id) PRICE_TIER_MAP[id] = tier;
  }
}

export function priceToTier(priceId: string): "researcher" | "pro" | null {
  if (Object.keys(PRICE_TIER_MAP).length === 0) buildMap();
  return PRICE_TIER_MAP[priceId] ?? null;
}
