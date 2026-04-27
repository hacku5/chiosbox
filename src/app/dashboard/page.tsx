"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { usePackageStore } from "@/stores/package-store";
import { StorageCountdown } from "@/components/dashboard/storage-scountdown";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { useTranslation } from "@/hooks/use-translation";
import Link from "next/link";

function AnimatedCounter({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 80, damping: 20 });
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (v) => {
      const rounded = Math.round(v);
      if (rounded !== prevValue.current) {
        prevValue.current = rounded;
        setDisplay(rounded);
      }
    });
    return unsubscribe;
  }, [springValue]);

  return <>{display}</>;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const packages = usePackageStore((s) => s.packages);
  const fetchPackages = usePackageStore((s) => s.fetchPackages);
  const loading = usePackageStore((s) => s.loading);
  const [copied, setCopied] = useState(false);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchUser();
    fetchPackages();
  }, [fetchUser, fetchPackages]);

  useEffect(() => {
    fetch("/api/invoices")
      .then((r) => r.ok ? r.json() : [])
      .then((invoices: { status: string; total: number }[]) => {
        const pending = invoices.filter((i) => i.status === "PENDING");
        setPendingCount(pending.length);
        setPendingTotal(pending.reduce((sum, i) => sum + Number(i.total), 0));
      })
      .catch(() => {});
  }, []);

  const depodaCount = packages.filter((p) => p.status === "depoda").length;
  const yoldaCount = packages.filter((p) => p.status === "yolda").length;
  const depodaPackages = packages.filter((p) => p.status === "depoda");
  const minFreeDays = depodaPackages.length > 0
    ? Math.min(...depodaPackages.map((p) => p.free_days_left))
    : 0;

  const copyAddress = async () => {
    if (!user?.address) return;
    await navigator.clipboard.writeText(user.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto"
      >
        {/* Welcome Card */}
        <motion.div
          variants={item}
          className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-deep-sea-teal">
                {t("dashboard.greeting", { name: user?.name || "" })}
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-deep-sea-teal/50">
                  {t("dashboard.chiosBoxId")}
                </span>
                <code className="font-mono text-sm font-semibold text-chios-purple bg-chios-purple/10 px-2 py-0.5 rounded">
                  {user?.chios_box_id}
                </code>
              </div>
              <div className="mt-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success-green/10 text-success-green text-xs font-semibold rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-green" />
                  {user?.plan || t("dashboard.defaultPlan")} — {t("dashboard.planActive")}
                </span>
              </div>
            </div>
            <button
              onClick={copyAddress}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-chios-purple/10 text-chios-purple text-sm font-medium rounded-xl hover:bg-chios-purple/20 transition-colors duration-200 cursor-pointer"
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-success-green">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t("dashboard.addressCopied")}
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  {t("dashboard.copyAddress")}
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Pending Invoice Banner */}
        {pendingCount > 0 && (
          <motion.div
            variants={item}
            className="bg-gradient-to-r from-chios-purple to-chios-purple-dark rounded-2xl p-5 shadow-lg shadow-chios-purple/20 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {t("dashboard.pendingInvoiceCount", { count: pendingCount })}
                  </div>
                  <div className="text-white/60 text-sm">
                    {t("dashboard.pendingTotal", { amount: pendingTotal.toFixed(2) })}
                  </div>
                </div>
              </div>
              <Link
                href="/dashboard/checkout"
                className="px-4 py-2 bg-white text-chios-purple text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors cursor-pointer"
              >
                {t("dashboard.payInvoice")}
              </Link>
            </div>
          </motion.div>
        )}

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Packages Card */}
          <motion.div
            variants={item}
            className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-deep-sea-teal">
                {t("dashboard.activePackages")}
              </h2>
              <Link
                href="/dashboard/packages"
                className="text-sm text-chios-purple hover:text-chios-purple-dark transition-colors cursor-pointer"
              >
                {t("dashboard.viewAll")}
              </Link>
            </div>

            <div className="space-y-3">
              {packages.length === 0 ? (
                <div className="text-center py-8 text-deep-sea-teal/30">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  </svg>
                  <p className="text-sm">{t("dashboard.noPackagesYet")}</p>
                  <Link href="/dashboard/actions" className="inline-block mt-3 text-sm text-chios-purple font-medium hover:underline cursor-pointer">
                    {t("dashboard.reportFirstPackage")}
                  </Link>
                </div>
              ) : (
                packages.slice(0, 4).map((pkg) => (
                  <Link
                    key={pkg.id}
                    href="/dashboard/packages"
                    className="flex items-center gap-4 p-3 rounded-xl bg-deep-sea-teal/[0.02] hover:bg-deep-sea-teal/[0.04] transition-colors duration-200 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-chios-purple/10 flex items-center justify-center flex-shrink-0">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-chios-purple"
                      >
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-deep-sea-teal truncate">
                        {pkg.content}
                      </div>
                      <div className="text-xs text-deep-sea-teal/40">
                        {pkg.carrier} · {pkg.tracking_no.slice(0, 12)}...
                      </div>
                    </div>
                    <StatusBadge status={pkg.status} />
                  </Link>
                ))
              )}
            </div>
          </motion.div>

          {/* Storage Countdown Card */}
          <motion.div
            variants={item}
            className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5 flex flex-col items-center justify-center text-center"
          >
            <h2 className="font-display text-lg font-semibold text-deep-sea-teal mb-4">
              {t("dashboard.storagePeriod")}
            </h2>
            <StorageCountdown daysLeft={minFreeDays || 0} />
            <p className="mt-3 text-sm text-deep-sea-teal/50">
              {t("dashboard.freeStorage")}
            </p>
            {minFreeDays <= 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 px-3 py-1.5 bg-sunset-gold/15 rounded-full"
              >
                <span className="text-xs font-medium text-accent-orange">
                  {t("dashboard.storageExpiring")}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={item}
            className="bg-chios-purple rounded-2xl p-6 text-white shadow-lg shadow-chios-purple/20"
          >
            <div className="text-3xl font-display font-bold"><AnimatedCounter value={depodaCount} /></div>
            <div className="text-sm text-white/70 mt-1">{t("dashboard.inWarehouseDesc")}</div>
            <div className="mt-4 text-3xl font-display font-bold"><AnimatedCounter value={yoldaCount} /></div>
            <div className="text-sm text-white/70 mt-1">{t("dashboard.inTransit")}</div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={item}
            className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5"
          >
            <h2 className="font-display text-lg font-semibold text-deep-sea-teal mb-4">
              {t("dashboard.quickActions")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/dashboard/packages"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-deep-sea-teal/[0.03] hover:bg-chios-purple/10 transition-colors duration-200 cursor-pointer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-chios-purple">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                </svg>
                <span className="text-xs font-medium text-deep-sea-teal">{t("dashboard.reportPackage")}</span>
              </Link>
              <Link
                href="/dashboard/actions"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-deep-sea-teal/[0.03] hover:bg-chios-purple/10 transition-colors duration-200 cursor-pointer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-chios-purple">
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
                <span className="text-xs font-medium text-deep-sea-teal">{t("dashboard.consolidateAction")}</span>
              </Link>
              <Link
                href="/dashboard/checkout"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-deep-sea-teal/[0.03] hover:bg-chios-purple/10 transition-colors duration-200 cursor-pointer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-chios-purple">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <span className="text-xs font-medium text-deep-sea-teal">{t("dashboard.payInvoice")}</span>
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-deep-sea-teal/[0.03] hover:bg-chios-purple/10 transition-colors duration-200 cursor-pointer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-chios-purple">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                <span className="text-xs font-medium text-deep-sea-teal">{t("dashboard.settings")}</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const config: Record<string, { bg: string; text: string; label: string }> = {
    depoda: { bg: "bg-chios-purple/10", text: "text-chios-purple", label: t("dashboard.status.depoda") },
    yolda: { bg: "bg-accent-orange/10", text: "text-accent-orange", label: t("dashboard.status.yolda") },
    bekleniyor: { bg: "bg-deep-sea-teal/5", text: "text-deep-sea-teal/50", label: t("dashboard.status.bekleniyor") },
    teslim_edildi: { bg: "bg-success-green/10", text: "text-success-green", label: t("dashboard.status.teslim_edildi") },
  };
  const c = config[status] || config.bekleniyor;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
