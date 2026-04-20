"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";

interface CustomerDetail {
  user: {
    id: string;
    name: string;
    email: string;
    chios_box_id: string;
    phone?: string | null;
    address?: string | null;
    plan: string;
    plan_status: string;
    created_at: string;
    is_admin: boolean;
  };
  packages: Array<{
    id: string;
    tracking_no: string;
    carrier: string;
    content: string;
    status: string;
    created_at: string;
  }>;
  invoices: Array<{
    id: string;
    total: number;
    status: string;
    accept_fee: number;
    consolidation_fee: number;
    demurrage_fee: number;
    created_at: string;
    paid_at?: string | null;
  }>;
  totalSpent: number;
  pendingTotal: number;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  BEKLENIYOR: { label: "Beklemede", color: "text-deep-sea-teal/60 bg-deep-sea-teal/5" },
  YOLDA: { label: "Yolda", color: "text-accent-orange bg-accent-orange/10" },
  DEPODA: { label: "Depoda", color: "text-chios-purple bg-chios-purple/10" },
  BIRLESTIRILDI: { label: "Birleştirildi", color: "text-success-green bg-success-green/10" },
  TESLIM_EDILDI: { label: "Teslim Edildi", color: "text-success-green bg-success-green/10" },
};

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"packages" | "invoices">("packages");

  useEffect(() => {
    fetch(`/api/admin/customers/${params.id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-32 bg-deep-sea-teal/5 rounded-2xl" />
          <div className="h-64 bg-deep-sea-teal/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { user, packages, invoices, totalSpent, pendingTotal } = data;

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-sm text-deep-sea-teal/40 hover:text-chios-purple transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Müşterilere Dön
        </button>

        {/* Customer Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-chios-purple/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-chios-purple">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-xl font-bold text-deep-sea-teal">{user.name}</h1>
                {user.is_admin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-chios-purple bg-chios-purple/10">
                    Admin
                  </span>
                )}
              </div>
              <div className="space-y-1 text-sm text-deep-sea-teal/50">
                <div className="font-mono">{user.chios_box_id}</div>
                <div>{user.email}</div>
                {user.phone && <div>{user.phone}</div>}
                {user.address && <div className="text-xs">{user.address}</div>}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-deep-sea-teal/5">
            <div>
              <div className="text-xl font-display font-bold text-deep-sea-teal">{packages.length}</div>
              <div className="text-xs text-deep-sea-teal/40">Paket</div>
            </div>
            <div>
              <div className="text-xl font-display font-bold text-success-green">€{totalSpent.toFixed(2)}</div>
              <div className="text-xs text-deep-sea-teal/40">Toplam Harcama</div>
            </div>
            <div>
              <div className={`text-xl font-display font-bold ${pendingTotal > 0 ? "text-accent-orange" : "text-deep-sea-teal"}`}>
                €{pendingTotal.toFixed(2)}
              </div>
              <div className="text-xs text-deep-sea-teal/40">Bekleyen</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("packages")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              activeTab === "packages"
                ? "bg-chios-purple text-white"
                : "bg-white text-deep-sea-teal/60 border border-deep-sea-teal/5"
            }`}
          >
            Paketler ({packages.length})
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              activeTab === "invoices"
                ? "bg-chios-purple text-white"
                : "bg-white text-deep-sea-teal/60 border border-deep-sea-teal/5"
            }`}
          >
            Faturalar ({invoices.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "packages" ? (
          <div className="space-y-2">
            {packages.length === 0 ? (
              <div className="text-center py-12 text-deep-sea-teal/30 text-sm">Henüz paket yok</div>
            ) : (
              packages.map((pkg) => {
                const sc = statusLabels[pkg.status] || { label: pkg.status, color: "" };
                return (
                  <div key={pkg.id} className="bg-white rounded-xl p-4 shadow-sm border border-deep-sea-teal/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-deep-sea-teal text-sm">{pkg.content}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.color}`}>
                            {sc.label}
                          </span>
                        </div>
                        <div className="text-xs text-deep-sea-teal/40 font-mono">
                          {pkg.carrier} · {pkg.tracking_no}
                        </div>
                      </div>
                      <div className="text-xs text-deep-sea-teal/30">
                        {new Date(pkg.created_at).toLocaleDateString("tr-TR")}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.length === 0 ? (
              <div className="text-center py-12 text-deep-sea-teal/30 text-sm">Henüz fatura yok</div>
            ) : (
              invoices.map((inv) => {
                const stColor = inv.status === "PAID"
                  ? "text-success-green bg-success-green/10"
                  : inv.status === "CANCELLED"
                  ? "text-danger-red bg-danger-red/10"
                  : "text-accent-orange bg-accent-orange/10";
                const stLabel = inv.status === "PAID" ? "Ödendi" : inv.status === "CANCELLED" ? "İptal" : "Beklemede";
                return (
                  <div key={inv.id} className="bg-white rounded-xl p-4 shadow-sm border border-deep-sea-teal/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${stColor}`}>
                            {stLabel}
                          </span>
                          <span className="text-xs text-deep-sea-teal/40">
                            {new Date(inv.created_at).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-deep-sea-teal/40">
                          {Number(inv.accept_fee) > 0 && <span>K:€{Number(inv.accept_fee).toFixed(0)}</span>}
                          {Number(inv.consolidation_fee) > 0 && <span>B:€{Number(inv.consolidation_fee).toFixed(0)}</span>}
                          {Number(inv.demurrage_fee) > 0 && <span className="text-accent-orange">G:€{Number(inv.demurrage_fee).toFixed(0)}</span>}
                        </div>
                      </div>
                      <div className="text-lg font-display font-bold text-deep-sea-teal">
                        €{Number(inv.total).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
