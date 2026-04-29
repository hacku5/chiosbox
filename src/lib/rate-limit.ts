type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 5 * 60 * 1000);

export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  entry.count++;
  if (entry.count > limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return Response.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    }
  );
}

// ── Preset tiers ──

export const RL_TIERS = {
  /** Auth/register: 5 req/hr per IP */
  STRICT: { limit: 5, windowMs: 60 * 60 * 1000 },
  /** Default API: 30 req/min per IP */
  DEFAULT: { limit: 30, windowMs: 60 * 1000 },
  /** Admin: 60 req/min per IP */
  ADMIN: { limit: 60, windowMs: 60 * 1000 },
} as const;

export function checkRateLimit(
  request: Request,
  tier: keyof typeof RL_TIERS = "DEFAULT",
  key?: string
) {
  const ip = getClientIp(request);
  const identifier = key ? `${key}:${ip}` : `${request.method}:${ip}`;
  const cfg = RL_TIERS[tier];
  return rateLimit(identifier, cfg.limit, cfg.windowMs);
}
