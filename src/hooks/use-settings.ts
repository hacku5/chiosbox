"use client";

import { useState, useEffect } from "react";

export interface AppSettings {
  fee_accept: number;
  fee_consolidation: number;
  fee_daily_demurrage: number;
  free_storage_days: number;
  plan_price_temel: number;
  plan_price_premium: number;
  demurrage_warning_days: number;
  demurrage_abandoned_days: number;
  max_package_weight_kg: number;
  min_consolidation_packages: number;
  max_invoice_amount: number;
  pickup_code_expiry_minutes: number;
  storage_warning_days: number;
  warehouse_address: string;
}

const DEFAULTS: AppSettings = {
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
  storage_warning_days: 5,
  warehouse_address: "Sakız Adası Limanı No: 1, 82100 Sakız (Chios), Yunanistan",
};

let cached: AppSettings | null = null;
let fetchPromise: Promise<AppSettings> | null = null;

function fetchSettings(): Promise<AppSettings> {
  if (cached) return Promise.resolve(cached);
  if (fetchPromise) return fetchPromise!;

  fetchPromise = fetch("/api/settings")
    .then((r) => (r.ok ? r.json() : null))
    .then((data): AppSettings => {
      const raw = data?.settings;
      if (!raw || typeof raw !== "object") {
        return (cached = DEFAULTS);
      }
      return (cached = { ...DEFAULTS, ...raw });
    })
    .catch((): AppSettings => {
      return (cached = DEFAULTS);
    });

  return fetchPromise!;
}

export function useSettings(): { settings: AppSettings; loading: boolean } {
  const [settings, setSettings] = useState<AppSettings>(cached ?? DEFAULTS);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) {
      setSettings(cached);
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchSettings().then((s) => {
      if (!cancelled) {
        setSettings(s);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return { settings, loading };
}
