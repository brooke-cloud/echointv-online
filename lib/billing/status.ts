export function subscriptionProvidesAccess(
  subscription: { status: string; currentPeriodEnd?: Date | null },
  now = new Date(),
) {
  const status = subscription.status.toUpperCase();
  const periodIsCurrent = !subscription.currentPeriodEnd || subscription.currentPeriodEnd.getTime() > now.getTime();
  if (status === "ACTIVE" || status === "TRIALING") return periodIsCurrent;
  return ["PAST_DUE", "CANCELED", "CANCELLED"].includes(status) &&
    Boolean(subscription.currentPeriodEnd && subscription.currentPeriodEnd.getTime() > now.getTime());
}
export function grantProvidesAccess(
  grant: { startsAt: Date; expiresAt?: Date | null; revokedAt?: Date | null },
  now = new Date(),
) {
  const timestamp = now.getTime();
  return !grant.revokedAt && grant.startsAt.getTime() <= timestamp && (!grant.expiresAt || grant.expiresAt.getTime() > timestamp);
}
