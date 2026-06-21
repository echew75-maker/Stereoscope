import Stripe from "stripe";

// Constructed lazily — these routes are server-only and always dynamic, but
// Next.js still imports the module during build to collect page data. A
// top-level `new Stripe(...)` would throw there if STRIPE_SECRET_KEY isn't
// set in the build environment, even though it's only ever needed at request
// time. The Proxy defers construction until a method is actually called.
let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-05-27.dahlia",
      typescript: true,
    });
  }
  return stripeClient;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripeClient(), prop, receiver);
  },
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
