"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminUser } from "../admin-layout-client";
import { hasPermission } from "@/lib/permissions";
import { useTranslation } from "@/hooks/use-translation";

interface PackageRow {
  id: string;
  tracking_no: string;
  carrier: string;
  content: string;
  status: string;
  shelf_location?: string | null;
  storage_days_used: number;
  free_days_left: number;
  demurrage_fee: number;
  weight_kg?: number | null;
  dimensions?: string | null;
  notes?: string | null;
  arrived_at?: string | null;
  created_at: string;
  users: { name: string; chios_box_id: string; email: string };
}

interface PaginatedResponse {
  data: PackageRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminPackagesPage() {
  const { t } = useTranslation();
  const adminUser = useAdminUser();
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPkg, setSelectedPkg] = useState<PackageRow | null>(null);
  const [updating, setUpdating] = useState(false);

  const canEdit = hasPermission(adminUser.permissions, "packages");

  const statusLabels: Record<string, { label: string; color: string }> = {
    BEKLENIYOR: { label: t("status.beklemede"), color: "text-deep-sea-teal/60 bg-deep-sea-teal/5" },
    YOLDA: { label: t("status.yolda"), color: "text-accent-orange bg-accent-orange/10" },
    DEPODA: { label: t("status.depoda"), color: "text-chios-purple bg-chios-purple/10" },
    BIRLESTIRILDI: { label: t("status.birlestirildi"), color: "text-success-green bg-success-green/10" },
    TESLIM_EDILDI: { label: t("status.teslimEdildi"), color: "text-success-green bg-success-green/10" },
  };

  const fetchPackages = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("tracking", search);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("limit", "20");

    const res = await fetch(`/api/admin/packages?${params}`);
    if (res.ok) {
      const data: PaginatedResponse = await res.json();
      setPackages(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, [page, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchPackages();
  };

  const handleStatusUpdate = async (pkgId: string, newStatus: string) => {
    if (!canEdit) return;
    setUpdating(true);
    const res = await fetch(`/api/admin/packages/${pkgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      fetchPackages();
      setSelectedPkg(null);
    }
    setUpdating(false);
  };

  const handleDelete = async (pkgId: string) => {
    if (!canEdit) return;
    if (!confirm(t("packages.deleteConfirm"))) return;
    setUpdating(true);
    const res = await fetch(`/api/admin/packages/${pkgId}`, { method: "DELETE" });
    if (res.ok) {
      fetchPackages();
      setSelectedPkg(null);
    }
    setUpdating(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-deep-sea-teal">{t("packages.title")}</h1>
            <p className="text-sm text-deep-sea-teal/50 mt-1">{t("packages.count", { total })}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-sea-teal/30">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={t("packages.searchPlaceholder")}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-white text-sm text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-white text-sm text-deep-sea-teal focus:outline-none focus:border-chios-purple/50 cursor-pointer"
          >
            <option value="">{t("packages.allStatuses")}</option>
            <option value="BEKLENIYOR">{t("status.beklemede")}</option>
            <option value="YOLDA">{t("status.yolda")}</option>
            <option value="DEPODA">{t("status.depoda")}</option>
            <option value="BIRLESTIRILDI">{t("status.birlestirildi")}</option>
            <option value="TESLIM_EDILDI">{t("status.teslimEdildi")}</option>
          </select>
        </div>

        {/* Package List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse h-20 bg-deep-sea-teal/5 rounded-2xl" />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-16 text-deep-sea-teal/30">
            <p className="text-sm">{t("packages.notFound")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {packages.map((pkg) => {
              const sc = statusLabels[pkg.status] || { label: pkg.status, color: "" };
              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedPkg(pkg)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-deep-sea-teal/5 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-deep-sea-teal text-sm">{pkg.content}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.color}`}>
                          {sc.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-deep-sea-teal/40">
                        <span className="font-mono">{pkg.tracking_no}</span>
                        <span>{pkg.carrier}</span>
                        <span className="font-medium text-chios-purple">{pkg.users.name}</span>
                        <span className="font-mono">{pkg.users.chios_box_id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {pkg.shelf_location && (
                        <span className="text-xs text-deep-sea-teal/50 bg-deep-sea-teal/[0.03] px-2 py-0.5 rounded-md">
                          {pkg.shelf_location}
                        </span>
                      )}
                      {pkg.storage_days_used > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-md ${
                          pkg.storage_days_used > 14
                            ? "text-accent-orange bg-accent-orange/10"
                            : "text-deep-sea-teal/50 bg-deep-sea-teal/[0.03]"
                        }`}>
                          {t("packages.daysAgo", { n: pkg.storage_days_used })}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-deep-sea-teal/10 text-sm text-deep-sea-teal disabled:opacity-30 cursor-pointer"
            >
              {t("packages.previous")}
            </button>
            <span className="text-sm text-deep-sea-teal/50">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-deep-sea-teal/10 text-sm text-deep-sea-teal disabled:opacity-30 cursor-pointer"
            >
              {t("packages.next")}
            </button>
          </div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedPkg && (
            <PackageDetailModal
              pkg={selectedPkg}
              canEdit={canEdit}
              onClose={() => setSelectedPkg(null)}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDelete}
              updating={updating}
              statusLabels={statusLabels}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PackageDetailModal({
  pkg,
  canEdit,
  onClose,
  onStatusUpdate,
  onDelete,
  updating,
  statusLabels,
}: {
  pkg: PackageRow;
  canEdit: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  updating: boolean;
  statusLabels: Record<string, { label: string; color: string }>;
}) {
  const { t } = useTranslation();
  const sc = statusLabels[pkg.status] || { label: pkg.status, color: "" };
  const [confirmDelete, setConfirmDelete] = useState(false);

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
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${sc.color}`}>
              {sc.label}
            </span>
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
            <InfoRow label={t("packages.detail.customer")} value={pkg.users.name} />
            <InfoRow label="ChiosBox ID" value={pkg.users.chios_box_id} mono />
            <InfoRow label="Email" value={pkg.users.email} />
            <InfoRow label={t("packages.detail.carrier")} value={pkg.carrier} />
            <InfoRow label={t("packages.detail.trackingNo")} value={pkg.tracking_no} mono />
            {pkg.shelf_location && <InfoRow label={t("packages.detail.shelf")} value={pkg.shelf_location} />}
            {pkg.arrived_at && (
              <InfoRow label={t("packages.detail.arrival")} value={new Date(pkg.arrived_at).toLocaleDateString("tr-TR")} />
            )}
            <InfoRow label={t("packages.detail.notification")} value={new Date(pkg.created_at).toLocaleDateString("tr-TR")} />
            {pkg.storage_days_used > 0 && (
              <InfoRow label={t("packages.detail.inWarehouse")} value={t("packages.daysAgo", { n: pkg.storage_days_used })} />
            )}
            {pkg.weight_kg != null && Number(pkg.weight_kg) > 0 && (
              <InfoRow label={t("packages.detail.weight")} value={`${Number(pkg.weight_kg)} kg`} />
            )}
            {pkg.dimensions && <InfoRow label={t("packages.detail.dimensions")} value={pkg.dimensions} />}
            {Number(pkg.demurrage_fee) > 0 && (
              <InfoRow label={t("packages.detail.demurrageFee")} value={`€${Number(pkg.demurrage_fee).toFixed(2)}`} highlight />
            )}
            {pkg.notes && (
              <div className="py-3">
                <div className="text-[10px] text-deep-sea-teal/40 uppercase tracking-wider mb-1">{t("packages.detail.notes")}</div>
                <div className="text-sm text-deep-sea-teal">{pkg.notes}</div>
              </div>
            )}
          </div>

          {/* Admin Actions */}
          {canEdit && (
            <div className="mt-4 space-y-3">
              <label className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider">
                {t("packages.detail.updateStatus")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(statusLabels).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => onStatusUpdate(pkg.id, key)}
                    disabled={pkg.status === key || updating}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                      pkg.status === key
                        ? "bg-chios-purple text-white"
                        : "bg-deep-sea-teal/5 text-deep-sea-teal/60 hover:bg-deep-sea-teal/10"
                    }`}
                  >
                    {val.label}
                  </button>
                ))}
              </div>

              {/* Delete */}
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2.5 text-danger-red text-xs font-medium rounded-xl border border-danger-red/20 hover:bg-danger-red/5 transition-colors cursor-pointer"
                >
                  {t("packages.detail.delete")}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2.5 text-deep-sea-teal/50 text-xs font-medium rounded-xl border border-deep-sea-teal/10 cursor-pointer"
                  >
                    {t("packages.detail.cancel")}
                  </button>
                  <button
                    onClick={() => onDelete(pkg.id)}
                    disabled={updating}
                    className="flex-1 py-2.5 bg-danger-red text-white text-xs font-semibold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {updating ? t("packages.detail.deleting") : t("packages.detail.confirmDelete")}
                  </button>
                </div>
              )}
            </div>
          )}
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
