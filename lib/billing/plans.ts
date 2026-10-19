import "server-only";
export const PRO_MONTHLY_PLAN = { code: "pro-monthly", name: "EchoINTV Pro Monthly", amount: 690, displayAmount: "$6.90", currency: "USD", interval: "month" } as const;
export type BillingProvider = "PADDLE" | "PAYPAL";
export function getPaddlePriceId() { const value = process.env.PADDLE_PRICE_ID_MONTHLY || process.env.NEXT_PUBLIC_PADDLE_PRICE_ID; if (!value) throw new Error("Paddle monthly price ID is not configured."); return value; }
export function getPayPalPlanId() { const value = process.env.PAYPAL_PLAN_ID_MONTHLY; if (!value) throw new Error("PayPal monthly plan ID is not configured."); return value; }
