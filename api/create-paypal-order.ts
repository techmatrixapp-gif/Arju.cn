// Vercel Serverless Function: /api/create-paypal-order
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  const { total, orderId } = req.body || {};

  if (!clientId || !clientSecret) {
    return res.status(200).json({
      configured: false,
      message: "PayPal credentials not set in environment.",
      orderId: orderId || "MOCK_PAYPAL_ORDER",
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

    const orderRes = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: orderId,
            amount: {
              currency_code: "CAD",
              value: Number(total).toFixed(2),
            },
          },
        ],
      }),
    });

    const paypalOrder = await orderRes.json();
    return res.status(200).json(paypalOrder);
  } catch (err: any) {
    console.error("PayPal order error:", err);
    return res.status(500).json({ error: err.message });
  }
}
