"use client";

import { useEffect, useRef } from "react";
import { fetchJson } from "@/lib/fetch-json";

type PayPalWindow = Window & { paypal?: any };

function loadPayPal(clientId: string) {
  return new Promise<any>((resolve, reject) => {
    const src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&components=buttons&vault=true&intent=subscription&currency=USD`;
    const existing = document.querySelector(`script[data-echointv-paypal-subscriptions="true"]`) as HTMLScriptElement | null;
    if ((window as PayPalWindow).paypal?.Buttons) return resolve((window as PayPalWindow).paypal);
    const script = existing || document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.echointvPaypalSubscriptions = "true";
    script.onload = () => resolve((window as PayPalWindow).paypal);
    script.onerror = () => reject(new Error("Unable to load PayPal secure checkout."));
    if (!existing) document.head.appendChild(script);
  });
}

export default function PayPalSubscriptionButtons({ onError }: { onError: (message: string) => void }) {
  const paypalContainer = useRef<HTMLDivElement>(null);
  const cardContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const rendered: Array<{ close?: () => void }> = [];
    (async () => {
      const config = await fetchJson<{ clientId: string; planId: string; userId: string; environment: string }>("/api/billing/paypal/config");
      const paypal = await loadPayPal(config.clientId);
      if (cancelled) return;

      const createSubscription = async (_data: unknown, actions: any) => {
        onError("");
        return actions.subscription.create({ plan_id: config.planId, custom_id: config.userId, quantity: "1" });
      };
      const onApprove = async (data: { subscriptionID?: string }) => {
        if (!data.subscriptionID) throw new Error("PayPal did not return a subscription ID.");
        await fetchJson("/api/billing/paypal/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionId: data.subscriptionID }),
        });
        window.location.assign("/profile?payment=success");
      };
      const onErrorHandler = (error: unknown) => onError(error instanceof Error ? error.message : "PayPal checkout could not be completed.");

      const paypalButtons = paypal.Buttons({
        fundingSource: paypal.FUNDING.PAYPAL,
        style: { layout: "vertical", shape: "rect", height: 48, label: "subscribe" },
        createSubscription,
        onApprove,
        onCancel: () => onError("Checkout was cancelled. No charge was made."),
        onError: onErrorHandler,
      });
      if (paypalButtons.isEligible() && paypalContainer.current) {
        await paypalButtons.render(paypalContainer.current);
        rendered.push(paypalButtons);
      }

      const cardButtons = paypal.Buttons({
        fundingSource: paypal.FUNDING.CARD,
        style: { layout: "vertical", shape: "rect", height: 48, label: "subscribe" },
        createSubscription,
        onApprove,
        onCancel: () => onError("Checkout was cancelled. No charge was made."),
        onError: onErrorHandler,
      });
      if (cardContainer.current) {
        await cardButtons.render(cardContainer.current);
        rendered.push(cardButtons);
      }
    })().catch((error) => onError(error instanceof Error ? error.message : "PayPal checkout is temporarily unavailable."));
    return () => { cancelled = true; rendered.forEach((button) => button.close?.()); };
  }, [onError]);

  return <div className="space-y-4">
    <div><p className="mb-2 text-sm font-semibold text-gray-800">PayPal</p><div ref={paypalContainer} /></div>
    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-gray-400"><span className="h-px flex-1 bg-gray-200" />or pay by card<span className="h-px flex-1 bg-gray-200" /></div>
    <div><p className="mb-2 text-sm font-semibold text-gray-800">Credit or debit card</p><div ref={cardContainer} /></div>
  </div>;
}
