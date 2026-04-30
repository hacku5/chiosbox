"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { useSettings, AppSettings } from "@/hooks/use-settings";

function calculateCost(
  packages: number,
  storageDays: number,
  fees: AppSettings
) {
  const acceptFee = packages * fees.fee_accept;
  const demurrageDays = Math.max(0, storageDays - fees.free_storage_days);
  const demurrageFee = demurrageDays * fees.fee_daily_demurrage;
  const withoutConsolidation = acceptFee + demurrageFee;
  const withConsolidation = acceptFee + fees.fee_consolidation + demurrageFee;
  const savings = packages > 1 ? packages * fees.fee_accept - withConsolidation : 0;

  return {
    acceptFee,
    demurrageFee,
    consolidationFee: fees.fee_consolidation,
    totalWithoutConsolidation: withoutConsolidation,
    totalWithConsolidation: withConsolidation,
    savings: Math.max(0, savings),
  };
}

function OdometerDigit({ value }: { value: string }) {
  return (
    <div className="relative w-8 h-12 overflow-hidden bg-deep-sea-teal/[0.05] rounded-lg flex items-center justify-center">
      <motion.span
        key={value}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="font-display text-2xl font-bold text-deep-sea-teal absolute"
      >
        {value}
      </motion.span>
    </div>
  );
}

function Odometer({ value }: { value: number }) {
  const str = value.toFixed(2);
  const digits = str.split("");

  return (
    <div className="flex items-center gap-0.5">
      <span className="font-display text-2xl font-bold text-deep-sea-teal mr-0.5">
        €
      </span>
      {digits.map((d, i) => (
        <OdometerDigit key={`${i}-${d}`} value={d} />
      ))}
    </div>
  );
}

export function PricingCalculator() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [packages, setPackages] = useState(3);
  const [storageDays, setStorageDays] = useState(10);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const cost = calculateCost(packages, storageDays, settings);

  return (
    <section id="fiyat" className="py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sunset-gold/[0.06] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-chios-purple/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div ref={ref} className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1.5 bg-sunset-gold/20 rounded-full text-sm font-medium text-accent-orange mb-4">
            {t("pricing.tag")}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-deep-sea-teal">
            {t("pricing.title")}
          </h2>
          <p className="mt-3 text-deep-sea-teal/60 max-w-lg mx-auto">
            {t("pricing.description")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {/* Left: Sliders */}
          <div className="bg-white rounded-3xl p-8 shadow-lg shadow-deep-sea-teal/[0.05] border border-deep-sea-teal/5">
            <h3 className="font-display text-lg font-semibold text-deep-sea-teal mb-8">
              {t("pricing.parameters")}
            </h3>

            {/* Package count slider */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-deep-sea-teal/70">
                  {t("pricing.packageCount")}
                </label>
                <span className="font-display text-2xl font-bold text-chios-purple">
                  {packages}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={packages}
                onChange={(e) => setPackages(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer slider-chios"
              />
              <div className="flex justify-between text-xs text-deep-sea-teal/40 mt-1">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            {/* Storage days slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-deep-sea-teal/70">
                  {t("pricing.storageDays")}
                </label>
                <span className="font-display text-2xl font-bold text-chios-purple">
                  {storageDays}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={storageDays}
                onChange={(e) => setStorageDays(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer slider-chios"
              />
              <div className="flex justify-between text-xs text-deep-sea-teal/40 mt-1">
                <span>{t("pricing.storage1")}</span>
                <span>{t("pricing.storage30")}</span>
              </div>
            </div>

            {/* Info badges */}
            <div className="mt-8 space-y-2">
              <div className="flex items-center gap-2 text-xs text-deep-sea-teal/50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success-green">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {t("pricing.fee.storage14", { days: settings.free_storage_days })}
              </div>
              <div className="flex items-center gap-2 text-xs text-deep-sea-teal/50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success-green">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {t("pricing.fee.acceptInfo", { fee: settings.fee_accept })}
              </div>
            </div>
          </div>

          {/* Right: Result */}
          <div className="bg-deep-sea-teal rounded-3xl p-8 text-white shadow-xl shadow-deep-sea-teal/20 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-white/90 mb-6">
                {t("pricing.monthlyCost")}
              </h3>

              <div className="mb-8">
                <Odometer value={cost.totalWithConsolidation} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">
                    {t("pricing.fee.accept")} ({packages} {t("pricing.fee.acceptUnit", { fee: String(settings.fee_accept) })})
                  </span>
                  <span className="font-medium">€{cost.acceptFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">{t("pricing.consolidationFee")}</span>
                  <span className="font-medium">€{cost.consolidationFee.toFixed(2)}</span>
                </div>
                {cost.demurrageFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">
                      {t("pricing.demurrageFeeLabel", { days: String(storageDays - settings.free_storage_days), fee: String(settings.fee_daily_demurrage) })}
                    </span>
                    <span className="font-medium text-sunset-gold">
                      €{cost.demurrageFee.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-3 flex justify-between text-sm font-semibold">
                  <span>{t("pricing.total")}</span>
                  <span>€{cost.totalWithConsolidation.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {cost.savings > 0 && packages > 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-3 bg-success-green/20 rounded-xl flex items-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success-green flex-shrink-0">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
                <span className="text-sm font-medium text-success-green">
                  {t("pricing.savings", { amount: cost.savings.toFixed(0) })}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .slider-chios {
          background: linear-gradient(to right, #5D3FD3 0%, #5D3FD3 50%, #E5E7EB 50%, #E5E7EB 100%);
        }
        .slider-chios::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #5D3FD3;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(93, 63, 211, 0.3);
          transition: transform 0.15s ease;
        }
        .slider-chios::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .slider-chios::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #5D3FD3;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(93, 63, 211, 0.3);
        }
      `}</style>

      {/* Plan Cards */}
      <div className="relative mx-auto max-w-5xl px-6 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-deep-sea-teal">
            {t("pricing.planTitle")}
          </h2>
          <p className="mt-3 text-deep-sea-teal/60 max-w-lg mx-auto">
            {t("pricing.planDesc")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Temel Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-white rounded-3xl p-8 shadow-lg shadow-deep-sea-teal/[0.05] border border-deep-sea-teal/5 hover:border-chios-purple/20 transition-all duration-300"
          >
            <div className="font-display text-lg font-semibold text-deep-sea-teal">
              {t("pricing.basic.name")}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-display font-bold text-chios-purple">€{settings.plan_price_temel.toFixed(2)}</span>
              <span className="text-sm text-deep-sea-teal/40">{t("pricing.month")}</span>
            </div>
            <p className="mt-2 text-sm text-deep-sea-teal/50">
              {t("pricing.basic.subtitle")}
            </p>
            <ul className="mt-6 space-y-3">
              {[
                t("pricing.basic.f1"),
                t("pricing.basic.f2"),
                t("pricing.basic.f3"),
                t("pricing.basic.f4"),
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-deep-sea-teal/70">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-success-green flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register?plan=temel"
              className="mt-8 w-full inline-flex items-center justify-center py-3.5 border-2 border-chios-purple text-chios-purple font-display font-semibold rounded-xl hover:bg-chios-purple hover:text-white transition-all duration-200 cursor-pointer"
            >
              {t("pricing.basic.cta")}
            </Link>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative bg-chios-purple rounded-3xl p-8 shadow-xl shadow-chios-purple/20 overflow-hidden"
          >
            {/* Badge */}
            <div className="absolute top-0 right-0">
              <div className="bg-sunset-gold text-deep-sea-teal text-xs font-bold px-4 py-1.5 rounded-bl-2xl">
                {t("pricing.mostPopular")}
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.04] rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />

            <div className="relative">
              <div className="font-display text-lg font-semibold text-white">
                {t("pricing.premium.name")}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold text-white">€{settings.plan_price_premium.toFixed(2)}</span>
                <span className="text-sm text-white/50">{t("pricing.month")}</span>
              </div>
              <p className="mt-2 text-sm text-white/60">
                {t("pricing.premium.subtitle")}
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  t("pricing.premium.f1"),
                  t("pricing.premium.f2"),
                  t("pricing.premium.f3"),
                  t("pricing.premium.f4"),
                  t("pricing.premium.f5"),
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-white/80">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-sunset-gold flex-shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?plan=premium"
                className="mt-8 w-full inline-flex items-center justify-center py-3.5 bg-white text-chios-purple font-display font-semibold rounded-xl hover:bg-mastic-white transition-all duration-200 cursor-pointer shadow-lg"
              >
                {t("pricing.premium.cta")}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
