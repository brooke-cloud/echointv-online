"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function PaymentStatus() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscription_id");
  const [state, setState] = useState<"waiting" | "active" | "timeout">("waiting");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const check = async () => {
      attempts++;
      try {
        if (subscriptionId && attempts === 1) {
          await fetch("/api/billing/paypal/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscriptionId }) });
        }
        const response = await fetch("/api/billing/status", { cache: "no-store" });
        const data = await response.json();
        if (!cancelled && data.active) { setState("active"); return; }
      } catch {}
      if (cancelled) return;
      if (attempts >= 12) { setState("timeout"); return; }
      timer = setTimeout(check, 2500);
    };
    check();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [subscriptionId]);

  return <main className="flex min-h-[75vh] items-center justify-center bg-gray-50 px-4"><section className="w-full max-w-lg rounded-3xl border bg-white p-9 text-center shadow-xl">
    {state === "active" ? <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" /> : state === "waiting" ? <Loader2 className="mx-auto h-14 w-14 animate-spin text-blue-600" /> : <AlertCircle className="mx-auto h-14 w-14 text-amber-500" />}
    <h1 className="mt-5 text-2xl font-bold">{state === "active" ? "Your Pro membership is active" : state === "waiting" ? "Confirming your subscription" : "Payment confirmation is taking longer than usual"}</h1>
    <p className="mt-3 text-sm leading-6 text-gray-600">{state === "active" ? "Thank you. All Pro content is now unlocked." : state === "waiting" ? "Please keep this page open while PayPal sends secure confirmation." : "Do not pay again. Check your profile shortly, or contact support with your PayPal receipt."}</p>
    <div className="mt-7 grid gap-3"><Link href="/problem" className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white">Explore interview questions</Link><Link href="/profile" className="rounded-xl border px-4 py-3 font-semibold text-gray-700">View profile</Link></div>
  </section></main>;
}
