"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { useAdminUser } from "./admin-layout-client";
import { hasPermission, isSuperAdmin } from "@/lib/permissions";

interface Stats {
  totalPackages: number;
  statusCounts: Record<string, number>;
  demurrageCount: number;
  totalDemurrage: number;
  newPackages: number;
  weekRevenue: number;
  pendingInvoiceCount: number;
  pendingInvoiceTotal: number;
  shelfUsage: Record<string, number>;
  depodaCount: number;
  recentPackages: Array<{
    id: string;
    tracking_no: string;
    content: string;
    status: string;
    created_at: string;
    users: { name: string };
  }>;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const adminUser = useAdminUser();

  const statusLabels: Record<string, { label: string; color: string }> = {
    BEKLENIYOR: { label: t("status.beklemede"), color: "text-deep-sea-teal/60 bg-deep-sea-teal/5" },
    YOLDA: { label: t("status.yolda"), color: "text-accent-orange bg-accent-orange/10" },
    DEPODA: { label: t("status.depoda"), color: "text-chios-purple bg-chios-purple/10" },
    BIRLESTIRILDI: { label: t("status.birlestirildi"), color: "text-success-green bg-success-green/10" },
    TESLIM_EDILDI: { label: t("status.teslimEdildi"), color: "text-success-green bg-success-green/10" },
  };
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const quickActions = [
    { label: t("action.intake"), href: "/admin/intake", permission: "intake" as const, color: "bg-chios-purple" },
    { label: t("actions.delivery"), href: "/admin/pickup", permission: "pickup" as const, color: "bg-deep-sea-teal" },
    { label: t("action.delay"), href: "/admin/demurrage", permission: "demurrage" as const, color: "bg-accent-orange" },
    { label: t("action.packages"), href: "/admin/packages", permission: "packages" as const, color: "bg-success-green" },
    { label: t("action.invoices"), href: "/admin/invoices", permission: "invoices" as const, color: "bg-chios-purple-light" },
    { label: t("action.customers"), href: "/admin/customers", permission: "customers" as const, color: "bg-deep-sea-teal" },
  ].filter((a) =>
    isSuperAdmin(adminUser.permissions) || hasPermission(adminUser.permissions, a.permission)
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-deep-sea-teal/5 rounded-xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-deep-sea-teal/5 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-deep-sea-teal/5 rounded-2xl md:col-span-2" />
              <div className="h-64 bg-deep-sea-teal/5 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-deep-sea-teal">
            {t("dashboard.title")}
          </h1>
          <p className="text-sm text-deep-sea-teal/50 mt-1">
            {t("dashboard.welcome", { name: adminUser.name })}
          </p>
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {/* Stats Cards */}
          <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t("dashboard.totalPackages")}
              value={stats.totalPackages}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                </svg>
              }
              color="bg-chios-purple/10 text-chios-purple"
            />
            <StatCard
              label={t("dashboard.inWarehouse")}
              value={stats.depodaCount}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              }
              color="bg-deep-sea-teal/10 text-deep-sea-teal"
            />
            <StatCard
              label={t("dashboard.last7Days")}
              value={stats.newPackages}
              sub={t("dashboard.newPackages")}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              }
              color="bg-success-green/10 text-success-green"
            />
            <StatCard
              label={t("dashboard.weeklyRevenue")}
              value={`€${stats.weekRevenue.toFixed(0)}`}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              }
              color="bg-sunset-gold/20 text-accent-orange"
            />
          </motion.div>

          {/* Second row */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5">
              <h2 className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider mb-4">
                {t("dashboard.statusDistribution")}
              </h2>
              <div className="space-y-3">
                {Object.entries(stats.statusCounts).map(([status, count]) => {
                  const sc = statusLabels[status] || { label: status, color: "text-deep-sea-teal bg-deep-sea-teal/5" };
                  const pct = stats.totalPackages > 0 ? (count / stats.totalPackages) * 100 : 0;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.color}`}>
                          {sc.label}
                        </span>
                        <span className="text-sm font-bold text-deep-sea-teal">{count}</span>
                      </div>
                      <div className="h-1.5 bg-deep-sea-teal/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          className="h-full bg-chios-purple rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5 md:col-span-2">
              <h2 className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider mb-4">
                {t("dashboard.recentActivity")}
              </h2>
              <div className="space-y-0 divide-y divide-deep-sea-teal/5">
                {stats.recentPackages.slice(0, 8).map((pkg) => {
                  const sc = statusLabels[pkg.status] || { label: pkg.status, color: "" };
                  return (
                    <div key={pkg.id} className="flex items-center justify-between py-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-deep-sea-teal truncate">
                          {(pkg.users as unknown as { name: string })?.name || t("dashboard.unknown")}
                        </div>
                        <div className="text-xs text-deep-sea-teal/40 font-mono">
                          {pkg.tracking_no}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sc.color}`}>
                          {sc.label}
                        </span>
                        <span className="text-[10px] text-deep-sea-teal/30">
                          {new Date(pkg.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Alerts + Quick Actions */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Alerts */}
            <div className="space-y-4">
              {stats.demurrageCount > 0 && (
                <div className="bg-accent-orange/5 border border-accent-orange/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span className="text-sm font-semibold text-accent-orange">{t("dashboard.demurrageAlert")}</span>
                  </div>
                  <p className="text-xs text-deep-sea-teal/60">
                    {t("dashboard.demurrageDesc", { count: stats.demurrageCount })}
                  </p>
                  <p className="text-lg font-bold text-accent-orange mt-1">
                    €{stats.totalDemurrage.toFixed(2)}
                  </p>
                </div>
              )}

              {stats.pendingInvoiceCount > 0 && (
                <div className="bg-chios-purple/5 border border-chios-purple/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5D3FD3" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="text-sm font-semibold text-chios-purple">{t("dashboard.pendingInvoices")}</span>
                  </div>
                  <p className="text-xs text-deep-sea-teal/60">
                    {t("dashboard.pendingInvoiceDesc", { count: stats.pendingInvoiceCount })}
                  </p>
                  <p className="text-lg font-bold text-chios-purple mt-1">
                    €{stats.pendingInvoiceTotal.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Shelf Usage */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-deep-sea-teal/5">
                <h3 className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider mb-3">
                  {t("dashboard.shelfUsage")}
                </h3>
                <div className="space-y-2">
                  {["A", "B", "C"].map((shelf) => {
                    const count = stats.shelfUsage[shelf] || 0;
                    const max = 5;
                    return (
                      <div key={shelf} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-deep-sea-teal w-6">{shelf}</span>
                        <div className="flex-1 h-2 bg-deep-sea-teal/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / max) * 100}%` }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className={`h-full rounded-full ${count >= max ? "bg-danger-red" : count >= 3 ? "bg-accent-orange" : "bg-success-green"}`}
                          />
                        </div>
                        <span className="text-xs text-deep-sea-teal/50 w-8 text-right">
                          {count}/{max}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5 md:col-span-2">
              <h2 className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider mb-4">
                {t("dashboard.quickActions")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`${action.color} text-white rounded-2xl p-5 flex flex-col items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer shadow-sm`}
                  >
                    <span className="font-display font-bold text-lg">{action.label}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, sub }: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-deep-sea-teal/5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <div className="text-2xl font-display font-bold text-deep-sea-teal">
        {value}
      </div>
      <div className="text-xs text-deep-sea-teal/40 mt-0.5">
        {label} {sub && <span className="text-deep-sea-teal/30">({sub})</span>}
      </div>
    </div>
  );
}
