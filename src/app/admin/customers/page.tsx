"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  chios_box_id: string;
  phone?: string | null;
  plan: string;
  created_at: string;
  is_admin: boolean;
  packageCount: number;
  pendingInvoiceTotal: number;
}

export default function AdminCustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCustomers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));

    const res = await fetch(`/api/admin/customers?${params}`);
    if (res.ok) {
      const data = await res.json();
      setCustomers(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchCustomers();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-deep-sea-teal">{t("customers.title")}</h1>
          <p className="text-sm text-deep-sea-teal/50 mt-1">{t("customers.count", { total })}</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-sea-teal/30">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={t("customers.searchPlaceholder")}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-white text-sm text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/50"
          />
        </div>

        {/* Customer List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse h-20 bg-deep-sea-teal/5 rounded-2xl" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 text-deep-sea-teal/30">
            <p className="text-sm">{t("customers.notFound")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {customers.map((customer) => (
              <Link key={customer.id} href={`/admin/customers/${customer.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-deep-sea-teal/5 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-chios-purple/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-chios-purple">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-deep-sea-teal text-sm">{customer.name}</span>
                        {customer.is_admin && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-chios-purple bg-chios-purple/10">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-deep-sea-teal/40">
                        <span className="font-mono">{customer.chios_box_id}</span>
                        <span>{customer.email}</span>
                        <span>{t("customers.packageCount", { n: customer.packageCount })}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {customer.pendingInvoiceTotal > 0 ? (
                        <div>
                          <div className="text-sm font-bold text-accent-orange">
                            €{customer.pendingInvoiceTotal.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-deep-sea-teal/30">{t("customers.pending")}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-deep-sea-teal/30">
                          {new Date(customer.created_at).toLocaleDateString("tr-TR")}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
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
              {t("customers.previous")}
            </button>
            <span className="text-sm text-deep-sea-teal/50">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-deep-sea-teal/10 text-sm text-deep-sea-teal disabled:opacity-30 cursor-pointer"
            >
              {t("customers.next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
