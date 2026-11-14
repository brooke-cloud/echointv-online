export type ContentAccessInput = {
  isAuthenticated: boolean;
  paywallEnabled: boolean;
  isFree: boolean;
  isAdmin: boolean;
  hasProAccess: boolean;
};

export type ContentAccessDecision = {
  allowed: boolean;
  reason: "anonymous" | "paywall-disabled" | "free" | "admin" | "pro" | "subscription-required";
};

/**
 * Canonical access policy for problem and interview content.
 * Anonymous visitors must sign in first, even while the paywall is disabled.
 */
export function decideContentAccess(input: ContentAccessInput): ContentAccessDecision {
  if (!input.isAuthenticated) return { allowed: false, reason: "anonymous" };
  if (!input.paywallEnabled) return { allowed: true, reason: "paywall-disabled" };
  if (input.isFree) return { allowed: true, reason: "free" };
  if (input.isAdmin) return { allowed: true, reason: "admin" };
  if (input.hasProAccess) return { allowed: true, reason: "pro" };
  return { allowed: false, reason: "subscription-required" };
}
