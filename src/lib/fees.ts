import { getSettingNumber } from "./system-settings";

/**
 * Async fee getters — read from system_settings table.
 * Falls back to hardcoded defaults if DB is unreachable.
 */

export async function getAcceptFee(): Promise<number> {
  return getSettingNumber("fee_accept");
}

export async function getConsolidationFee(): Promise<number> {
  return getSettingNumber("fee_consolidation");
}

export async function getDailyDemurrage(): Promise<number> {
  return getSettingNumber("fee_daily_demurrage");
}

export async function getFreeStorageDays(): Promise<number> {
  return getSettingNumber("free_storage_days");
}

/** Convenience: calculate demurrage for a given storage day count. */
export async function calculateDemurrage(storageDays: number): Promise<number> {
  const freeDays = await getFreeStorageDays();
  const dailyRate = await getDailyDemurrage();
  const billableDays = Math.max(0, storageDays - freeDays);
  return Math.round(billableDays * dailyRate * 100) / 100;
}

/**
 * Sync fallback object — for places that truly need sync access
 * (e.g. client components that can't await). These are the DEFAULT
 * values; live values come from system_settings.
 */
export const FEES = {
  ACCEPT: 4.0,
  CONSOLIDATION: 8.0,
  DAILY_DEMURRAGE: 1.5,
  FREE_STORAGE_DAYS: 14,
};
