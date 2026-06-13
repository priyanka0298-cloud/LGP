import { NextResponse } from "next/server";
import { getStripeClient, STRIPE_PRICES } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { priceId, planId } = await request.json();

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  let stripe;
  try {
    stripe = getStripeClient();
  } catch {
    return NextResponse.json({ error: "Payments aren't configured yet." }, { status: 503 });
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // Get or create customer
  let customerId = subscription?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("subscriptions")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId ?? STRIPE_PRICES[planId as keyof typeof STRIPE_PRICES],
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${appUrl}/settings?upgrade=success`,
    cancel_url: `${appUrl}/pricing?canceled=true`,
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 7,
      metadata: { supabase_user_id: user.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
