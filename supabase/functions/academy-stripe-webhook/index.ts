import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";

/**
 * Stripe sends this webhook raw, signed with STRIPE_ACADEMY_WEBHOOK_SECRET.
 * It is the only writer of all_access_subscriptions going forward — the
 * client only has SELECT on that table, so entitlement can't be spoofed
 * from the app (see the RLS policy added alongside the Stripe columns).
 */
serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_ACADEMY_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    return new Response("Academy billing not configured", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
  } catch (err) {
    console.error("academy-stripe-webhook signature error:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ?? session.metadata?.supabase_user_id;
        if (!userId || !session.subscription || !session.customer) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await admin.from("all_access_subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            billing_cycle: session.metadata?.plan === "yearly" ? "yearly" : "monthly",
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          },
          { onConflict: "user_id" },
        );
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        const query = admin.from("all_access_subscriptions").update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });
        if (userId) {
          await query.eq("user_id", userId);
        } else {
          await query.eq("stripe_subscription_id", subscription.id);
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("academy-stripe-webhook handler error:", err);
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
