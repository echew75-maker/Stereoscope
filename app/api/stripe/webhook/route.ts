import { stripe, priceToTier } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import Stripe from "stripe";

// Service-role client — bypasses RLS so webhook can write any user's profile
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response(`Webhook error: ${(err as Error).message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      if (!userId) break;

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (!subscriptionId) break;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id;
      const tier = priceId ? priceToTier(priceId) : null;

      if (tier) {
        await supabaseAdmin
          .from("profiles")
          .update({
            tier,
            stripe_customer_id: typeof session.customer === "string"
              ? session.customer
              : session.customer?.id,
            stripe_subscription_id: subscriptionId,
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const tier = priceId ? priceToTier(priceId) : null;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile && tier) {
        const active =
          subscription.status === "active" ||
          subscription.status === "trialing";
        await supabaseAdmin
          .from("profiles")
          .update({ tier: active ? tier : "free" })
          .eq("id", profile.id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile) {
        await supabaseAdmin
          .from("profiles")
          .update({ tier: "free", stripe_subscription_id: null })
          .eq("id", profile.id);
      }
      break;
    }
  }

  return new Response("ok", { status: 200 });
}
