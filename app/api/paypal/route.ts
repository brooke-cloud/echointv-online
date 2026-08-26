// app/api/paypal/route.ts
import { NextRequest, NextResponse } from 'next/server';

const clientId = process.env.PAYPAL_CLIENT_ID!;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
const paypalApi = process.env.PAYPAL_API || 'https://api-m.sandbox.paypal.com';

// 获取 PayPal Access Token
async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${paypalApi}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`获取 PayPal Token 失败: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// POST: 创建订单
export async function POST(request: NextRequest) {
  try {
    const { price, currency = 'USD' } = await request.json();

    // 验证价格
    if (!price || isNaN(parseFloat(price))) {
      return NextResponse.json(
        { error: '无效的价格参数' },
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();

    // 调用 PayPal API 创建订单
    const response = await fetch(`${paypalApi}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: parseFloat(price).toFixed(2), // 确保两位小数
            },
            description: 'EchoINTV Pro 会员 (月订阅)',
          },
        ],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/cancel`,
        },
      }),
    });

    const order = await response.json();

    if (!response.ok) {
      console.error('PayPal 创建订单错误:', order);
      return NextResponse.json(
        { error: order.message || 'PayPal 创建订单失败' },
        { status: response.status }
      );
    }

    // 返回订单 ID（前端用这个 ID 跳转）
    return NextResponse.json({ id: order.id });
  } catch (error: any) {
    console.error('创建订单异常:', error);
    return NextResponse.json(
      { error: error.message || '服务器内部错误' },
      { status: 500 }
    );
  }
}