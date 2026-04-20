"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminUser } from "../admin-layout-client";
import { hasPermission } from "@/lib/permissions";
import { FEES } from "@/lib/fees";

interface InvoiceItem {
  fee_type: string;
  amount: number;
  packages: { tracking_no: string; content: string } | null;
}

interface InvoiceRow {
  id: string;
  accept_fee: number;
  consolidation_fee: number;
  demurrage_fee: number;
  total: number;
  status: string;
  created_at: string;
  paid_at?: string | null;
  users: { name: string; chios_box_id: string; email: string };
  items: InvoiceItem[];
}

interface Customer {
  id: string;
  name: string;
  chios_box_id: string;
  email: string;
}

interface UninvoicedPackage {
  id: string;
  tracking_no: string;
  content: string;
  carrier: string;
  status: string;
  storage_days_used: number;
  arrived_at?: string | null;
  shelf_location?: string | null;
}

export default function AdminInvoicesPage() {
  const adminUser = useAdminUser();
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(null);

  const canEdit = hasPermission(adminUser.permissions, "invoices");

  const fetchInvoices = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));

    const res = await fetch(`/api/admin/invoices?${params}`);
    if (res.ok) {
      const data = await res.json();
      setInvoices(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, statusFilter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/admin/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      fetchInvoices();
      setSelectedInvoice(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-deep-sea-teal">Faturalar</h1>
            <p className="text-sm text-deep-sea-teal/50 mt-1">{total} fatura</p>
          </div>
          {canEdit && (
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 bg-chios-purple text-white text-sm font-semibold rounded-full hover:bg-chios-purple-dark transition-colors cursor-pointer"
            >
              + Yeni Fatura
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: "", label: "Tümü" },
            { key: "PENDING", label: "Beklemede" },
            { key: "PAID", label: "Ödendi" },
            { key: "CANCELLED", label: "İptal" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-chios-purple text-white shadow-sm"
                  : "bg-white text-deep-sea-teal/60 hover:bg-deep-sea-teal/5 border border-deep-sea-teal/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Invoice List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse h-20 bg-deep-sea-teal/5 rounded-2xl" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 text-deep-sea-teal/30">
            <p className="text-sm">Fatura bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map((inv) => {
              const stColor = inv.status === "PAID"
                ? "text-success-green bg-success-green/10"
                : inv.status === "CANCELLED"
                ? "text-danger-red bg-danger-red/10"
                : "text-accent-orange bg-accent-orange/10";
              const stLabel = inv.status === "PAID" ? "Ödendi" : inv.status === "CANCELLED" ? "İptal" : "Beklemede";
              const itemCount = inv.items?.length || 0;

              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedInvoice(inv)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-deep-sea-teal/5 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-deep-sea-teal text-sm">{inv.users.name}</span>
                        <span className="font-mono text-xs text-deep-sea-teal/40">{inv.users.chios_box_id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${stColor}`}>
                          {stLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-deep-sea-teal/40">
                        {Number(inv.accept_fee) > 0 && <span>Kabul: €{Number(inv.accept_fee).toFixed(2)}</span>}
                        {Number(inv.consolidation_fee) > 0 && <span>Birleştirme: €{Number(inv.consolidation_fee).toFixed(2)}</span>}
                        {Number(inv.demurrage_fee) > 0 && <span className="text-accent-orange">Gecikme: €{Number(inv.demurrage_fee).toFixed(2)}</span>}
                        <span>{new Date(inv.created_at).toLocaleDateString("tr-TR")}</span>
                        {itemCount > 0 && (
                          <span className="text-chios-purple font-medium">{itemCount} paket</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-lg font-display font-bold text-deep-sea-teal">
                        €{Number(inv.total).toFixed(2)}
                      </span>
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
              Önceki
            </button>
            <span className="text-sm text-deep-sea-teal/50">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-deep-sea-teal/10 text-sm text-deep-sea-teal disabled:opacity-30 cursor-pointer"
            >
              Sonraki
            </button>
          </div>
        )}

        {/* Create Invoice Modal */}
        <AnimatePresence>
          {showCreate && (
            <CreateInvoiceModal
              onClose={() => setShowCreate(false)}
              onCreated={() => { setShowCreate(false); fetchInvoices(); }}
            />
          )}
        </AnimatePresence>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedInvoice && (
            <InvoiceDetailModal
              invoice={selectedInvoice}
              canEdit={canEdit}
              onClose={() => setSelectedInvoice(null)}
              onStatusUpdate={handleStatusUpdate}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CreateInvoiceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [packages, setPackages] = useState<UninvoicedPackage[]>([]);
  const [selectedPkgIds, setSelectedPkgIds] = useState<Set<string>>(new Set());
  const [addConsolidation, setAddConsolidation] = useState(false);
  const [loadingPkgs, setLoadingPkgs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((data) => setCustomers(data.data || []))
      .catch(() => {});
  }, []);

  // Fetch uninvoiced packages when customer is selected
  useEffect(() => {
    if (!selectedUserId) {
      setPackages([]);
      setSelectedPkgIds(new Set());
      return;
    }
    setLoadingPkgs(true);
    fetch(`/api/admin/packages?user_id=${selectedUserId}&uninvoiced=true&limit=100`)
      .then((r) => r.json())
      .then((data) => {
        setPackages(data.data || []);
        // Auto-select all packages
        const allIds = new Set<string>((data.data || []).map((p: UninvoicedPackage) => p.id));
        setSelectedPkgIds(allIds);
      })
      .catch(() => setPackages([]))
      .finally(() => setLoadingPkgs(false));
  }, [selectedUserId]);

  const togglePkg = (id: string) => {
    setSelectedPkgIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Calculate totals
  const selectedPkgs = packages.filter((p) => selectedPkgIds.has(p.id));
  const totalAccept = selectedPkgs.length * FEES.ACCEPT;
  const totalDemurrage = selectedPkgs.reduce((sum, p) => {
    const overdueDays = Math.max(0, p.storage_days_used - FEES.FREE_STORAGE_DAYS);
    return sum + (overdueDays > 0 ? overdueDays * FEES.DAILY_DEMURRAGE : 0);
  }, 0);
  const consolidationTotal = addConsolidation ? FEES.CONSOLIDATION : 0;
  const grandTotal = totalAccept + totalDemurrage + consolidationTotal;

  const handleCreate = async () => {
    if (!selectedUserId) { setError("Müşteri seçin"); return; }
    if (selectedPkgIds.size === 0) { setError("En az bir paket seçin"); return; }
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: selectedUserId,
        package_ids: Array.from(selectedPkgIds),
        consolidation_fee: addConsolidation,
      }),
    });

    if (res.ok) {
      onCreated();
    } else {
      const data = await res.json();
      setError(data.error || "Fatura oluşturulamadı");
    }
    setSaving(false);
  };

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
        <div className="flex items-center justify-between p-5 pb-3 flex-shrink-0">
          <h2 className="font-display text-lg font-bold text-deep-sea-teal">Yeni Fatura</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-deep-sea-teal/5 flex items-center justify-center cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
          {error && (
            <div className="p-3 bg-danger-red/10 border border-danger-red/20 rounded-xl text-danger-red text-xs">
              {error}
            </div>
          )}

          {/* Customer select */}
          <div>
            <label className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider mb-2 block">
              Müşteri
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-white text-sm text-deep-sea-teal focus:outline-none focus:border-chios-purple/50 cursor-pointer"
            >
              <option value="">Müşteri seçin</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.chios_box_id}
                </option>
              ))}
            </select>
          </div>

          {/* Package list */}
          {selectedUserId && (
            <div>
              <label className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider mb-2 block">
                Faturalanacak Paketler
              </label>
              {loadingPkgs ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse h-14 bg-deep-sea-teal/5 rounded-xl" />
                  ))}
                </div>
              ) : packages.length === 0 ? (
                <div className="p-4 text-center text-sm text-deep-sea-teal/30 bg-deep-sea-teal/[0.02] rounded-xl">
                  Faturalanmamış paket bulunamadı
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {packages.map((pkg) => {
                    const isSelected = selectedPkgIds.has(pkg.id);
                    const overdueDays = Math.max(0, pkg.storage_days_used - FEES.FREE_STORAGE_DAYS);
                    return (
                      <button
                        key={pkg.id}
                        onClick={() => togglePkg(pkg.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? "border-chios-purple/30 bg-chios-purple/5"
                            : "border-deep-sea-teal/10 bg-white hover:bg-deep-sea-teal/[0.02]"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          isSelected ? "border-chios-purple bg-chios-purple" : "border-deep-sea-teal/20"
                        }`}>
                          {isSelected && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-deep-sea-teal truncate">{pkg.content}</div>
                          <div className="text-xs text-deep-sea-teal/40 font-mono">{pkg.tracking_no} · {pkg.carrier}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-deep-sea-teal/50">Kabul: €{FEES.ACCEPT.toFixed(2)}</div>
                          {overdueDays > 0 && (
                            <div className="text-xs text-accent-orange">
                              Gecikme: €{(overdueDays * FEES.DAILY_DEMURRAGE).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Consolidation toggle */}
              {packages.length > 0 && (
                <button
                  onClick={() => setAddConsolidation(!addConsolidation)}
                  className={`w-full flex items-center justify-between mt-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    addConsolidation
                      ? "border-chios-purple/30 bg-chios-purple/5"
                      : "border-deep-sea-teal/10 bg-white hover:bg-deep-sea-teal/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      addConsolidation ? "border-chios-purple bg-chios-purple" : "border-deep-sea-teal/20"
                    }`}>
                      {addConsolidation && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-deep-sea-teal">Birleştirme Ücreti</span>
                  </div>
                  <span className="text-sm font-medium text-deep-sea-teal">€{FEES.CONSOLIDATION.toFixed(2)}</span>
                </button>
              )}
            </div>
          )}

          {/* Fee breakdown */}
          {selectedPkgs.length > 0 && (
            <div className="p-4 bg-deep-sea-teal/[0.03] rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-deep-sea-teal/50">
                <span>Kabul Ücreti ({selectedPkgs.length} paket × €{FEES.ACCEPT.toFixed(2)})</span>
                <span>€{totalAccept.toFixed(2)}</span>
              </div>
              {totalDemurrage > 0 && (
                <div className="flex justify-between text-xs text-accent-orange">
                  <span>Gecikme Ücreti</span>
                  <span>€{totalDemurrage.toFixed(2)}</span>
                </div>
              )}
              {addConsolidation && (
                <div className="flex justify-between text-xs text-deep-sea-teal/50">
                  <span>Birleştirme Ücreti</span>
                  <span>€{FEES.CONSOLIDATION.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-deep-sea-teal/10 pt-2 flex justify-between">
                <span className="text-sm font-medium text-deep-sea-teal">Toplam</span>
                <span className="text-lg font-display font-bold text-deep-sea-teal">€{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={saving || !selectedUserId || selectedPkgIds.size === 0}
            className="w-full py-3.5 bg-chios-purple text-white font-display font-bold text-lg rounded-2xl hover:bg-chios-purple-dark disabled:opacity-30 transition-all cursor-pointer"
          >
            {saving ? "Oluşturuluyor..." : `Fatura Oluştur (€${grandTotal.toFixed(2)})`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InvoiceDetailModal({
  invoice,
  canEdit,
  onClose,
  onStatusUpdate,
}: {
  invoice: InvoiceRow;
  canEdit: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string) => void;
}) {
  const stColor = invoice.status === "PAID"
    ? "text-success-green bg-success-green/10"
    : invoice.status === "CANCELLED"
    ? "text-danger-red bg-danger-red/10"
    : "text-accent-orange bg-accent-orange/10";
  const stLabel = invoice.status === "PAID" ? "Ödendi" : invoice.status === "CANCELLED" ? "İptal" : "Beklemede";

  const feeTypeLabels: Record<string, string> = {
    accept: "Kabul Ücreti",
    demurrage: "Gecikme Ücreti",
    consolidation: "Birleştirme Ücreti",
  };

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
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-bold text-deep-sea-teal">
              €{Number(invoice.total).toFixed(2)}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${stColor}`}>
              {stLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-deep-sea-teal/5 flex items-center justify-center hover:bg-deep-sea-teal/10 transition-colors cursor-pointer"
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
            <InfoRow label="Müşteri" value={invoice.users.name} />
            <InfoRow label="ChiosBox ID" value={invoice.users.chios_box_id} mono />
            <InfoRow label="Tarih" value={new Date(invoice.created_at).toLocaleDateString("tr-TR")} />
            {invoice.paid_at && (
              <InfoRow label="Ödeme Tarihi" value={new Date(invoice.paid_at).toLocaleDateString("tr-TR")} />
            )}
          </div>

          {/* Fee breakdown */}
          <div className="mt-4 p-4 bg-deep-sea-teal/[0.03] rounded-xl space-y-2">
            {Number(invoice.accept_fee) > 0 && (
              <div className="flex justify-between text-xs text-deep-sea-teal/50">
                <span>Kabul Ücreti</span>
                <span>€{Number(invoice.accept_fee).toFixed(2)}</span>
              </div>
            )}
            {Number(invoice.consolidation_fee) > 0 && (
              <div className="flex justify-between text-xs text-deep-sea-teal/50">
                <span>Birleştirme Ücreti</span>
                <span>€{Number(invoice.consolidation_fee).toFixed(2)}</span>
              </div>
            )}
            {Number(invoice.demurrage_fee) > 0 && (
              <div className="flex justify-between text-xs text-accent-orange">
                <span>Gecikme Ücreti</span>
                <span>€{Number(invoice.demurrage_fee).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-deep-sea-teal/10 pt-2 flex justify-between">
              <span className="text-sm font-medium text-deep-sea-teal">Toplam</span>
              <span className="text-lg font-display font-bold text-deep-sea-teal">€{Number(invoice.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Linked packages */}
          {invoice.items && invoice.items.length > 0 && (
            <div className="mt-4">
              <label className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider mb-2 block">
                Paketler ({invoice.items.length})
              </label>
              <div className="space-y-2">
                {invoice.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-deep-sea-teal/5">
                    <div>
                      <div className="text-sm font-medium text-deep-sea-teal">
                        {item.packages?.content || "—"}
                      </div>
                      <div className="text-xs text-deep-sea-teal/40 font-mono">
                        {item.packages?.tracking_no || "—"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-deep-sea-teal/40">{feeTypeLabels[item.fee_type] || item.fee_type}</div>
                      <div className="text-sm font-medium text-deep-sea-teal">€{Number(item.amount).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {canEdit && invoice.status === "PENDING" && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => onStatusUpdate(invoice.id, "PAID")}
                className="flex-1 py-3 bg-success-green text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors cursor-pointer"
              >
                Ödendi İşaretle
              </button>
              <button
                onClick={() => onStatusUpdate(invoice.id, "CANCELLED")}
                className="flex-1 py-3 text-danger-red text-sm font-medium rounded-xl border border-danger-red/20 hover:bg-danger-red/5 transition-colors cursor-pointer"
              >
                İptal Et
              </button>
            </div>
          )}

          {canEdit && invoice.status === "CANCELLED" && (
            <div className="mt-4">
              <button
                onClick={() => onStatusUpdate(invoice.id, "PENDING")}
                className="w-full py-3 bg-chios-purple text-white text-sm font-semibold rounded-xl hover:bg-chios-purple-dark transition-colors cursor-pointer"
              >
                İptali Geri Al
              </button>
            </div>
          )}

          {canEdit && invoice.status === "PAID" && (
            <div className="mt-4">
              <button
                onClick={() => onStatusUpdate(invoice.id, "PENDING")}
                className="w-full py-3 text-deep-sea-teal text-sm font-medium rounded-xl border border-deep-sea-teal/20 hover:bg-deep-sea-teal/5 transition-colors cursor-pointer"
              >
                Ödemeyi Geri Al
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="text-xs text-deep-sea-teal/40">{label}</div>
      <div className={`text-sm font-medium text-deep-sea-teal ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}
