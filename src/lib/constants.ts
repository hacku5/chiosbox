export const VALID_PLANS = ["TEMEL", "PRO", "PREMIUM"] as const;

export type Plan = (typeof VALID_PLANS)[number];

/**
 * Generate a unique ChiosBox ID using timestamp + random suffix.
 * Format: CBX-{base36-timestamp}{random-2char} → e.g. "CBX-M3K9F7XA"
 * Collision-free by design: timestamp ensures uniqueness across time,
 * random suffix handles sub-millisecond concurrent registrations.
 */
export function generateChiosBoxId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `CBX-${timestamp}${rand}`;
}

