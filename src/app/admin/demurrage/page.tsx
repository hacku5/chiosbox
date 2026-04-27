"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminStore, AdminPackage } from "@/stores/admin-store";
import { useTranslation } from "@/hooks/use-translation";

function getZone(days: number, t: (key: string) => string): { bg: string; border: string; text: string; label: string } {
  if (days >= 30) return { bg: "bg-danger-red/10", border: "border-danger-red/30", text: "text-danger-red", label: t("demurrage.abandoned") };
  if (days >= 15) return { bg: "bg-sunset-gold/20", border: "border-sunset-gold/30", text: "text-accent-orange", label: t("demurrage.demurrageFee") };
  return { bg: "", border: "border-deep-sea-teal/5", text: "text-deep-sea-teal", label: "" };
}

export default function DemurragePage() {
  const { t } = useTranslation();
  const { packages, loading, error, fetchPackages, discardPackage } = useAdminStore();
  const [discarding, setDiscarding] = useState<string | null>(null);
  const [charging, setCharging] = useState<string | null>(null);
  const [chargeSuccess, setChargeSuccess] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState<string | null>(null);
  const [confirmCharge, setConfirmCharge] = useState<string | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<AdminPackage | null>(null);

  useEffect(() => {
    fetchPackages({ demurrage: true });
  }, [fetchPackages]);

  const abandoned = packages.filter((p) => p.storage_days_used >= 30);
  const warning = packages.filter((p) => p.storage_days_used >= 15 && p.storage_days_used < 30);
  const normal = packages.filter((p) => p.storage_days_used > 0 && p.storage_days_used < 15);

  const handleDiscard = async (id: string) => {
    setDiscarding(id);
    await discardPackage(id);
    setDiscarding(null);
    setSelectedPkg(null);
  };

  const handleChargeDemurrage = async (id: string) => {
    setCharging(id);
    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apply_demurrage: true }),
      });
      if (res.ok) {
        setChargeSuccess(id);
        setTimeout(() => {
          setChargeSuccess(null);
          fetchPackages({ demurrage: true });
        }, 2000);
      } else {
        const data = await res.json();
        alert(data.error || t("demurrage.error.applyFailed"));
      }
    } catch { /* ignore */ }
    setCharging(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-deep-sea-teal">
            {t("demurrage.title")}
          </h1>
          <p className="text-sm text-deep-sea-teal/50 mt-1">
            {t("demurrage.subtitle")}
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-deep-sea-teal/5 text-center">
            <div className="text-2xl font-display font-bold text-deep-sea-teal">{normal.length}</div>
            <div className="text-xs text-deep-sea-teal/40">{t("demurrage.normal")}</div>
          </div>
          <div className="bg-sunset-gold/10 rounded-2xl p-4 border border-sunset-gold/20 text-center">
            <div className="text-2xl font-display font-bold text-accent-orange">{warning.length}</div>
            <div className="text-xs text-accent-orange/60">{t("demurrage.delay")}</div>
          </div>
          <div className="bg-danger-red/10 rounded-2xl p-4 border border-danger-red/20 text-center">
            <div className="text-2xl font-display font-bold text-danger-red">{abandoned.length}</div>
            <div className="text-xs text-danger-red/60">{t("demurrage.abandonedZone")}</div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5D3FD3" strokeWidth="2" className="animate-spin">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-danger-red/10 border border-danger-red/20 rounded-xl text-danger-red text-sm font-medium mb-4">
            {error}
          </div>
        )}

        {/* Package list */}
        {!loading && (
          <div className="space-y-3">
            {packages.map((pkg, i) => {
              const days = pkg.storage_days_used;
              const zone = getZone(days, t);
              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`rounded-2xl p-4 border transition-all cursor-pointer hover:shadow-md ${zone.bg || "bg-white"} ${zone.border} shadow-sm`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-deep-sea-teal">
                          {pkg.users?.name || t("demurrage.unknown")}
                        </span>
                        <code className="text-xs font-mono text-deep-sea-teal/40">
                          {pkg.users?.chios_box_id}
                        </code>
                        {zone.label && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${zone.bg} ${zone.text}`}>
                            {zone.label}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-deep-sea-teal/50 mt-0.5">
                        {pkg.content} · {t("demurrage.shelfPrefix").replace("{shelf}", String(pkg.shelf_location || "—"))} · {t("demurrage.arrival").replace("{date}", pkg.arrived_at ? new Date(pkg.arrived_at).toLocaleDateString("tr-TR") : "—")}
                      </div>
                    </div>

                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <div className="text-right">
                        <div className={`font-display text-xl font-bold ${zone.text}`}>
                          {t("demurrage.daysLabel").replace("{n}", String(days))}
                        </div>
                      </div>

                      {days >= 15 && days < 30 && (
                        <>
                          {confirmCharge === pkg.id ? (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setConfirmCharge(null)}
                                className="px-3 py-2 text-xs text-deep-sea-teal/50 rounded-lg border border-deep-sea-teal/10 cursor-pointer"
                              >
                                {t("demurrage.cancel")}
                              </button>
                              <button
                                onClick={() => { setConfirmCharge(null); handleChargeDemurrage(pkg.id); }}
                                className="px-3 py-2 bg-accent-orange text-white text-xs font-semibold rounded-lg cursor-pointer"
                              >
                                {t("demurrage.applyAmount").replace("{amount}", ((days - 14) * 1.5).toFixed(2))}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmCharge(pkg.id)}
                              disabled={charging === pkg.id}
                              className="px-4 py-2.5 bg-accent-orange text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-50 min-h-[48px]"
                            >
                              {charging === pkg.id
                                ? "..."
                                : chargeSuccess === pkg.id
                                ? t("demurrage.invoiceCreated")
                                : t("demurrage.applyFeeButton").replace("{amount}", ((days - 14) * 1.5).toFixed(2))}
                            </button>
                          )}
                        </>
                      )}

                      {days >= 30 && (
                        <>
                          {confirmDiscard === pkg.id ? (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setConfirmDiscard(null)}
                                className="px-3 py-2 text-xs text-deep-sea-teal/50 rounded-lg border border-deep-sea-teal/10 cursor-pointer"
                              >
                                {t("demurrage.cancel")}
                              </button>
                              <button
                                onClick={() => { setConfirmDiscard(null); handleDiscard(pkg.id); }}
                                disabled={discarding === pkg.id}
                                className="px-3 py-2 bg-danger-red text-white text-xs font-semibold rounded-lg cursor-pointer disabled:opacity-50"
                              >
                                {discarding === pkg.id ? "..." : t("demurrage.confirmDelete")}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDiscard(pkg.id)}
                              className="px-4 py-2.5 bg-danger-red text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors cursor-pointer min-h-[48px]"
                            >
                              {t("demurrage.discard")}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && packages.length === 0 && (
          <div className="text-center py-16 text-deep-sea-teal/30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p>{t("demurrage.allClear")}</p>
          </div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedPkg && (
            <DemurrageDetailModal
              pkg={selectedPkg}
              onClose={() => setSelectedPkg(null)}
              onChargeDemurrage={handleChargeDemurrage}
              onDiscard={handleDiscard}
              charging={charging}
              chargeSuccess={chargeSuccess}
              discarding={discarding}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DemurrageDetailModal({
  pkg,
  onClose,
  onChargeDemurrage,
  onDiscard,
  charging,
  chargeSuccess,
  discarding,
}: {
  pkg: AdminPackage;
  onClose: () => void;
  onChargeDemurrage: (id: string) => void;
  onDiscard: (id: string) => void;
  charging: string | null;
  chargeSuccess: string | null;
  discarding: string | null;
}) {
  const { t } = useTranslation();
  const days = pkg.storage_days_used;
  const zone = getZone(days, t);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="font-medium text-deep-sea-teal truncate">{pkg.content}</div>
            {zone.label && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${zone.bg} ${zone.text}`}>
                {zone.label}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-deep-sea-teal/5 flex items-center justify-center hover:bg-deep-sea-teal/10 transition-colors cursor-pointer flex-shrink-0 ml-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="space-y-0 divide-y divide-deep-sea-teal/5">
            <InfoRow label={t("demurrage.detail.customer")} value={pkg.users?.name || "—"} />
            <InfoRow label="ChiosBox ID" value={pkg.users?.chios_box_id || "—"} mono />
            <InfoRow label={t("demurrage.detail.content")} value={pkg.content} />
            <InfoRow label={t("demurrage.detail.shelf")} value={pkg.shelf_location || "—"} />
            {pkg.arrived_at && (
              <InfoRow label={t("demurrage.detail.arrivalDate")} value={new Date(pkg.arrived_at).toLocaleDateString("tr-TR")} />
            )}
            <InfoRow label={t("demurrage.detail.inWarehouse")} value={t("demurrage.daysLabel").replace("{n}", String(days))} />
            <InfoRow label={t("demurrage.detail.freeDaysLeft")} value={t("demurrage.daysLabel").replace("{n}", String(Math.max(0, 14 - days)))} />
            {days > 14 && (
              <InfoRow
                label={t("demurrage.detail.demurrageFee")}
                value={`€${((days - 14) * 1.5).toFixed(2)}`}
                highlight
              />
            )}
            {Number(pkg.demurrage_fee) > 0 && (
              <InfoRow
                label={t("demurrage.detail.appliedFee")}
                value={`€${Number(pkg.demurrage_fee).toFixed(2)}`}
                highlight
              />
            )}
            {pkg.weight_kg != null && Number(pkg.weight_kg) > 0 && (
              <InfoRow label={t("demurrage.detail.weight")} value={`${Number(pkg.weight_kg)} kg`} />
            )}
            {pkg.dimensions && <InfoRow label={t("demurrage.detail.dimensions")} value={pkg.dimensions} />}
            {pkg.notes && (
              <div className="py-3">
                <div className="text-[10px] text-deep-sea-teal/40 uppercase tracking-wider mb-1">{t("demurrage.detail.notes")}</div>
                <div className="text-sm text-deep-sea-teal">{pkg.notes}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 space-y-2">
            {days >= 15 && days < 30 && (
              <>
                {confirmAction === "charge" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="flex-1 py-2.5 text-deep-sea-teal/50 text-xs font-medium rounded-xl border border-deep-sea-teal/10 cursor-pointer"
                    >
                      {t("demurrage.cancel")}
                    </button>
                    <button
                      onClick={() => { setConfirmAction(null); onChargeDemurrage(pkg.id); }}
                      className="flex-1 py-2.5 bg-accent-orange text-white text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      {t("demurrage.applyAmount").replace("{amount}", ((days - 14) * 1.5).toFixed(2))}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmAction("charge")}
                    disabled={charging === pkg.id}
                    className="w-full py-3 bg-accent-orange text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {charging === pkg.id
                      ? "..."
                      : chargeSuccess === pkg.id
                      ? t("demurrage.invoiceCreated")
                      : t("demurrage.applyFeeButton").replace("{amount}", ((days - 14) * 1.5).toFixed(2))}
                  </button>
                )}
              </>
            )}

            {days >= 30 && (
              <>
                {confirmAction === "discard" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="flex-1 py-2.5 text-deep-sea-teal/50 text-xs font-medium rounded-xl border border-deep-sea-teal/10 cursor-pointer"
                    >
                      {t("demurrage.cancel")}
                    </button>
                    <button
                      onClick={() => { setConfirmAction(null); onDiscard(pkg.id); }}
                      disabled={discarding === pkg.id}
                      className="flex-1 py-2.5 bg-danger-red text-white text-xs font-semibold rounded-xl cursor-pointer disabled:opacity-50"
                    >
                      {discarding === pkg.id ? "..." : t("demurrage.confirmDelete")}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmAction("discard")}
                    className="w-full py-3 bg-danger-red text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    {t("demurrage.discard")}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="text-xs text-deep-sea-teal/40">{label}</div>
      <div className={`text-sm font-medium ${mono ? "font-mono" : ""} ${highlight ? "text-accent-orange" : "text-deep-sea-teal"}`}>
        {value}
      </div>
    </div>
  );
}
