import { getSettingNumber } from "./system-settings";

/**
 * Async fee getters — read from system_settings table (cached).
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
