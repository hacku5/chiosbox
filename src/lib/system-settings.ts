import { getAdminClient } from "./supabase-admin";

/**
 * System settings with 5-minute in-memory cache.
 * Falls back to hardcoded defaults if DB is unreachable.
 */

/* ── Fallback defaults (match current production values) ── */
const DEFAULTS: Record<string, number | string> = {
  fee_accept: 4.0,
  fee_consolidation: 8.0,
  fee_daily_demurrage: 1.5,
  free_storage_days: 14,
  plan_price_temel: 9.99,
  plan_price_premium: 24.99,
  demurrage_warning_days: 15,
  demurrage_abandoned_days: 30,
  max_package_weight_kg: 1000,
  min_consolidation_packages: 2,
  max_invoice_amount: 5000,
  pickup_code_expiry_minutes: 5,
  rate_limit_register: 5,
  rate_limit_pickup_code: 30,
  rate_limit_message: 20,
  warehouse_address: "Sakız Adası Limanı No: 1, 82100 Sakız (Chios), Yunanistan",
  storage_warning_days: 5,
};

/* ── Cache ── */
interface CacheEntry {
  value: string | number;
  expires: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): string | number | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expires) return entry.value;
  if (entry) cache.delete(key);
  return null;
}

function setCache(key: string, value: string | number) {
  cache.set(key, { value, expires: Date.now() + CACHE_TTL });
}

/** Invalidate cache for a specific key or all keys. */
export function invalidateSettings(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/* ── Public API ── */

/**
 * Get a single setting value. Returns number if numeric, string otherwise.
 * Falls back to DEFAULTS if not found in DB.
 */
export async function getSetting(key: string): Promise<number | string> {
  const cached = getCached(key);
  if (cached !== null) return cached;

  try {
    const supabase = getAdminClient();
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (data?.value !== undefined) {
      const parsed = typeof data.value === "string"
        ? JSON.parse(data.value)
        : data.value;
      const val = typeof parsed === "number" ? parsed : String(parsed);
      setCache(key, val);
      return val;
    }
  } catch {
    // DB unreachable — fall through to default
  }

  const fallback = DEFAULTS[key] ?? 0;
  setCache(key, fallback);
  return fallback;
}

/**
 * Get a setting as a number (convenience).
 */
export async function getSettingNumber(key: string): Promise<number> {
  const val = await getSetting(key);
  return typeof val === "number" ? val : Number(val);
}

/**
 * Get all settings for a category.
 */
export async function getSettingsByCategory(
  category: string
): Promise<Record<string, string | number>> {
  try {
    const supabase = getAdminClient();
    const { data } = await supabase
      .from("system_settings")
      .select("key, value")
      .eq("category", category);

    if (data?.length) {
      const result: Record<string, string | number> = {};
      for (const row of data) {
        const parsed = typeof row.value === "string"
          ? JSON.parse(row.value)
          : row.value;
        result[row.key] = typeof parsed === "number" ? parsed : String(parsed);
        setCache(row.key, result[row.key]);
      }
      return result;
    }
  } catch {
    // fall through
  }

  // Fallback: return defaults matching this category's keys
  // (we don't have category metadata in DEFAULTS, so return all)
  return { ...DEFAULTS };
}

/**
 * Get multiple settings at once. Returns key→value map.
 */
export async function getSettings(
  keys: string[]
): Promise<Record<string, string | number>> {
  const result: Record<string, string | number> = {};
  await Promise.all(
    keys.map(async (key) => {
      result[key] = await getSetting(key);
    })
  );
  return result;
}
