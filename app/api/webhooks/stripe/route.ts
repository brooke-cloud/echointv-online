// import { NextResponse } from "next/server";
// import { headers } from "next/headers";
// import { stripe } from "@/lib/stripe";
// import { prisma } from "@/lib/prisma";

// export async function POST(req: Request) {
//   const body = await req.text();
//   const headerList = await headers();
//   const signature = headerList.get("stripe-signature");

//   let event: any;

//   try {
//     if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
//       event = stripe.webhooks.constructEvent(
//         body,
//         signature,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } else {
//       event = JSON.parse(body);
//     }
//   } catch (err: any) {
//     console.error(`Webhook signature verification failed:`, err.message);
//     return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
//   }

//   // 监听支付/订阅成功事件
//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;
//     const userId = session.client_reference_id || session.metadata?.userId;

//     if (userId) {
//       // 自动开通 Pro 会员
//       await prisma.user.update({
//         where: { id: userId },
//         data: { role: "PRO" },
//       });
//       console.log(`用户 ${userId} 已成功自动升级为 Pro 会员！`);
//     }
//   }

//   return NextResponse.json({ received: true });
// }