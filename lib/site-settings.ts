import "server-only";

import { prisma } from "@/lib/prisma";

const PAYWALL_KEY = "paywall_enabled";

export async function isPaywallEnabled() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: PAYWALL_KEY },
      select: { value: true },
    });

    // Secure default: paid access remains enabled until an admin explicitly disables it.
    return setting?.value !== "false";
  } catch (error) {
    console.error("Unable to read paywall setting; using secure default.", error);
    return true;
  }
}

export async function setPaywallEnabled(enabled: boolean) {
  await prisma.siteSetting.upsert({
    where: { key: PAYWALL_KEY },
    create: { key: PAYWALL_KEY, value: String(enabled) },
    update: { value: String(enabled) },
  });
}
