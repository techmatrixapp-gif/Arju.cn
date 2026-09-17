// Vercel Serverless Function: /api/stripe-webhook
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!webhookSecret || !stripeKey) {
    return res.status(400).json({ error: "Stripe webhook credentials missing" });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" as any });

    const sig = req.headers["stripe-signature"];
    let event: any;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.client_reference_id || session.metadata?.orderId;

      if (orderId && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
          const admin = (await import("firebase-admin")).default;
          if (!admin.apps.length) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
            });
          }
          const db = admin.firestore();
          await db.collection("orders").doc(orderId).update({
            paymentStatus: "paid",
            paymentRef: session.payment_intent || session.id,
            orderStatus: "confirmed",
          });
        } catch (dbErr) {
          console.error("Firebase Admin update error in webhook:", dbErr);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ error: error.message });
  }
}
