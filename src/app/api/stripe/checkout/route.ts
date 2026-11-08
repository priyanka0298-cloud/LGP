import { NextResponse } from "next/server";
import { getStripeClient, STRIPE_PRICES } from "@/lib/stripe/client";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TEMPLATE_CONFIGS } from "@/lib/template-configs";
import { isPremiumPlan } from "@/lib/utils";

type PlanId = keyof typeof STRIPE_PRICES;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const planId = body?.planId as string | undefined;
  const templateId = body?.templateId as string | undefined;

  if (!templateId && !(planId && planId in STRIPE_PRICES)) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  let stripe;
  try {
    stripe = getStripeClient();
  } catch {
    return NextResponse.json({ error: "Payments aren't configured yet." }, { status: 503 });
  }

  const admin = await createServiceClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("email, full_name").eq("id", user.id).single(),
    admin
      .from("subscriptions")
      .select("stripe_customer_id, stripe_subscription_id, plan")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  // Get or create the Stripe customer (subscriptions is read-only to users, so write with the service role)
  let customerId = subscription?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await admin.from("subscriptions").update({ stripe_customer_id: customerId }).eq("user_id", user.id);
  }

  // ── One-time template purchase ──
  if (templateId) {
    const { data: template } = await admin
      .from("planner_templates")
      .select("id, title, description, price_cents, is_published")
      .eq("id", templateId)
      .maybeSingle();

    if (!template || !template.is_published) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    if (template.price_cents <= 0) {
      return NextResponse.json({ error: "This template is free" }, { status: 400 });
    }
    if (!TEMPLATE_CONFIGS[template.title]) {
      return NextResponse.json({ error: "This template isn't available yet" }, { status: 400 });
    }
    if (isPremiumPlan(subscription?.plan)) {
      return NextResponse.json({ error: "Premium includes this template — just apply it" }, { status: 400 });
    }

    const { data: owned } = await admin
      .from("template_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("template_id", template.id)
      .maybeSingle();
    if (owned) {
      return NextResponse.json({ error: "You already own this template" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: template.price_cents,
            product_data: {
              name: template.title,
              description: template.description ?? undefined,
            },
          },
        },
      ],
      metadata: { supabase_user_id: user.id, template_id: template.id },
      payment_intent_data: { metadata: { supabase_user_id: user.id, template_id: template.id } },
      success_url: `${appUrl}/marketplace?purchase=success`,
      cancel_url: `${appUrl}/marketplace?purchase=canceled`,
    });

    return NextResponse.json({ url: session.url });
  }

  // ── Premium subscription ──
  if (isPremiumPlan(subscription?.plan) && subscription?.stripe_subscription_id) {
    return NextResponse.json(
      { error: "You're already on Premium — manage your plan from Settings." },
      { status: 400 }
    );
  }

  // Free trial only for customers who have never had a subscription
  const previous = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 1 });
  const firstTime = previous.data.length === 0;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: STRIPE_PRICES[planId as PlanId], quantity: 1 }],
    success_url: `${appUrl}/settings?upgrade=success`,
    cancel_url: `${appUrl}/pricing?canceled=true`,
    allow_promotion_codes: true,
    subscription_data: {
      ...(firstTime ? { trial_period_days: 7 } : {}),
      metadata: { supabase_user_id: user.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
