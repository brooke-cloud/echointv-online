// lib/paypal.ts

const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// 1. 获取 PayPal 授权 Token
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal 密钥未配置");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

// 2. 创建 $9.90 美元订单
export async function createPayPalOrder(userId: string): Promise<string> {
  const token = await getPayPalAccessToken();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "9.90",
          },
          description: "EchoINTV Pro 会员（月度订阅）",
          custom_id: userId, // 携带当前用户 ID
        },
      ],
      application_context: {
        brand_name: "EchoINTV",
        user_action: "PAY_NOW",
        return_url: `${siteUrl}/checkout/success`,
        cancel_url: `${siteUrl}/pricing`,
      },
    }),
  });

  const data = await res.json();
  const approveLink = data.links?.find((l: any) => l.rel === "approve")?.href;

  if (!approveLink) {
    throw new Error(data.message || "生成 PayPal 收银台链接失败");
  }

  return approveLink;
}

// 3. 捕获扣款并验证订单真实性
export async function capturePayPalOrder(orderId: string) {
  const token = await getPayPalAccessToken();

  const res = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return await res.json();
}