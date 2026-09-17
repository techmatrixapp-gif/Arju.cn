// Vercel Serverless Function: /api/create-stripe-session
import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { items, orderId, customer, successUrl, cancelUrl } = req.body || {};

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    // If Stripe key isn't configured yet in Vercel, return a helpful notice for testing
    return res.status(200).json({
      configured: false,
      message: "Stripe secret key not configured in environment variables.",
      mockUrl: `${req.headers.origin || "http://localhost:3000"}?payment_success=true&order_id=${orderId || "MOCK_ORDER"}`,
    });
  }

  try {
    // Lazy load Stripe to avoid crash if package not present in bundle
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16" as any,
    });

    const line_items = (items || []).map((item: any) => ({
      price_data: {
        currency: "cad",
        product_data: {
          name: `${item.name}${item.variant ? ` (${item.variant})` : ""}`,
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: item.qty || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_email: customer?.email,
      client_reference_id: orderId,
      metadata: {
        orderId: orderId || "",
        customerName: customer?.name || "",
        customerPhone: customer?.phone || "",
      },
      success_url:
        successUrl ||
        `${req.headers.origin}/?payment_success=true&order_id=${orderId}`,
      cancel_url:
        cancelUrl ||
        `${req.headers.origin}/?payment_cancelled=true&order_id=${orderId}`,
    });

    return res.status(200).json({ configured: true, sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe error:", error);
    return res.status(500).json({ error: error.message || "Stripe session creation failed" });
  }
}
