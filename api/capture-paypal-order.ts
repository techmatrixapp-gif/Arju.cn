// Vercel Serverless Function: /api/capture-paypal-order
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const { paypalOrderId, internalOrderId } = req.body || {};

  if (!clientId || !clientSecret) {
    return res.status(200).json({
      configured: false,
      status: "COMPLETED",
      id: paypalOrderId,
    });
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const captureRes = await fetch(
      `https://api-m.paypal.com/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const captureData = await captureRes.json();

    if (captureData.status === "COMPLETED" && internalOrderId && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        const admin = (await import("firebase-admin")).default;
        if (!admin.apps.length) {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        }
        const db = admin.firestore();
        await db.collection("orders").doc(internalOrderId).update({
          paymentStatus: "paid",
          paymentRef: paypalOrderId,
          orderStatus: "confirmed",
        });
      } catch (dbErr) {
        console.error("Firebase admin capture update error:", dbErr);
      }
    }

    return res.status(200).json(captureData);
  } catch (err: any) {
    console.error("PayPal capture error:", err);
    return res.status(500).json({ error: err.message });
  }
}
