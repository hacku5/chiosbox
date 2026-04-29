"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePackageStore } from "@/stores/package-store";
import { useTourStore } from "@/stores/tour-store";
import { useTranslation } from "@/hooks/use-translation";
import { useSettings } from "@/hooks/use-settings";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function ConsolidatePage() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const router = useRouter();
  const { loading: authLoading } = useAuthGuard();
  const realPackages = usePackageStore((s) => s.packages);
  const fetchPackages = usePackageStore((s) => s.fetchPackages);
  const tourRunning = useTourStore((s) => s.isRunning);
  const mockPackages = useTourStore((s) => s.mockPackages);
  const packages = tourRunning ? mockPackages : realPackages;
  const eligible = packages.filter((p) => p.status === "depoda");

  useEffect(() => {
    if (!tourRunning) fetchPackages();
  }, [fetchPackages, tourRunning]);

  const [masterBox, setMasterBox] = useState<typeof eligible>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const available = eligible.filter(
    (p) => !masterBox.find((m) => m.id === p.id)
  );

  const totalAcceptFee = masterBox.length * settings.fee_accept;
  const totalWithConsolidation = totalAcceptFee + settings.fee_consolidation;
  const separateTotal = masterBox.length * (settings.fee_accept + 2);
  const savings =
    masterBox.length > 1 ? separateTotal - totalWithConsolidation : 0;

  const addToBox = (pkg: (typeof eligible)[0]) => {
    setMasterBox((prev) => [...prev, pkg]);
  };

  const removeFromBox = (id: string) => {
    setMasterBox((prev) => prev.filter((p) => p.id !== id));
  };

  const handleConsolidate = async () => {
    if (masterBox.length < 2) return;
    setSubmitting(true);
    setError("");

    // Tour mode: mock consolidation
    if (tourRunning) {
      await new Promise((r) => setTimeout(r, 1000));
      setSubmitting(false);
      router.push("/user/checkout");
      return;
    }

    try {
      const res = await fetch("/api/consolidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package_ids: masterBox.map((p) => p.id) }),
      });

      if (res.ok) {
        const data = await res.json();
        // Refresh packages and redirect to checkout
        await fetchPackages();
        router.push("/user/checkout");
      } else {
        const data = await res.json();
        setError(data.error || t("consolidate.error.consolidationFailed"));
      }
    } catch {
      setError(t("consolidate.error.generic"));
    }
    setSubmitting(false);
  };

  if (authLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-chios-purple/20 border-t-chios-purple rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto" data-tour="consolidate">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-deep-sea-teal">
            {t("consolidate.title")}
          </h1>
          <p className="text-sm text-deep-sea-teal/50 mt-1">
            {t("consolidate.description")}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger-red/10 border border-danger-red/20 rounded-xl text-danger-red text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Available packages */}
          <div className="lg:col-span-3" data-tour="consolidate-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-deep-sea-teal">
                {t("consolidate.availablePackages")}
              </h2>
              <span className="text-sm text-deep-sea-teal/40">
                {t("consolidate.packageCount", { count: available.length })}
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {available.map((pkg) => (
                  <motion.button
                    key={pkg.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => addToBox(pkg)}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm border border-deep-sea-teal/5 hover:border-chios-purple/30 hover:shadow-md transition-all duration-200 cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-chios-purple/10 flex items-center justify-center flex-shrink-0 group-hover:bg-chios-purple/20 transition-colors">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-chios-purple"
                        >
                          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-deep-sea-teal">
                          {pkg.content}
                        </div>
                        <div className="text-xs text-deep-sea-teal/40">
                          {pkg.carrier} · Raf {pkg.shelf_location}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-chios-purple opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span className="text-xs font-medium">{t("consolidate.add")}</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>

              {available.length === 0 && (
                <div className="text-center py-12 text-deep-sea-teal/30">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="mx-auto mb-3"
                  >
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  </svg>
                  <p className="text-sm">
                    {t("consolidate.noAvailable")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Master Box */}
          <div className="lg:col-span-2" data-tour="consolidate-right">
            <h2 className="font-display text-lg font-semibold text-deep-sea-teal mb-4">
              {t("consolidate.masterBox")}
            </h2>

            <div
              className={`rounded-2xl border-2 border-dashed min-h-[300px] p-4 transition-all duration-300 ${
                masterBox.length > 0
                  ? "border-chios-purple/30 bg-chios-purple/[0.03]"
                  : "border-deep-sea-teal/10 bg-deep-sea-teal/[0.01]"
              }`}
            >
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {masterBox.map((pkg) => (
                    <motion.div
                      key={pkg.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-xl p-3 shadow-sm border border-deep-sea-teal/5 flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-chios-purple/10 flex items-center justify-center flex-shrink-0">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-chios-purple"
                        >
                          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        </svg>
                      </div>
                      <span className="text-sm text-deep-sea-teal flex-1 truncate">
                        {pkg.content}
                      </span>
                      <button
                        onClick={() => removeFromBox(pkg.id)}
                        className="sm:opacity-0 sm:group-hover:opacity-100 opacity-100 p-1 text-danger-red hover:bg-danger-red/10 rounded-lg transition-all cursor-pointer"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {masterBox.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-48 text-deep-sea-teal/20">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="mb-2"
                    >
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                    <p className="text-sm">{t("consolidate.addFromLeft")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cost summary */}
            {masterBox.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-white rounded-2xl p-5 shadow-sm border border-deep-sea-teal/5"
              >
                <h3 className="font-display text-sm font-semibold text-deep-sea-teal mb-3">
                  {t("consolidate.costSummary")}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-deep-sea-teal/50">
                      {t("consolidate.acceptFeeLine", { count: masterBox.length, fee: settings.fee_accept.toFixed(2) })}
                    </span>
                    <span className="font-medium">
                      €{totalAcceptFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-deep-sea-teal/50">
                      {t("consolidate.consolidationFee")}
                    </span>
                    <span className="font-medium">
                      €{settings.fee_consolidation.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-deep-sea-teal/5 pt-2 flex justify-between font-semibold">
                    <span>{t("consolidate.total")}</span>
                    <span>€{totalWithConsolidation.toFixed(2)}</span>
                  </div>
                </div>

                {savings > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 p-2.5 bg-success-green/10 rounded-xl flex items-center gap-2"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-success-green flex-shrink-0"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                    <span className="text-xs font-medium text-success-green">
                      {t("consolidate.savings", { amount: Math.abs(savings).toFixed(0) })}
                    </span>
                  </motion.div>
                )}

                <button
                  disabled={masterBox.length < 2 || submitting}
                  onClick={handleConsolidate}
                  data-tour="consolidate-confirm"
                  className="mt-4 w-full py-3 bg-chios-purple text-white font-semibold rounded-xl hover:bg-chios-purple-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  {submitting ? t("consolidate.submitting") : t("consolidate.submit")}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
