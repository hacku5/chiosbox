"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InvoiceItem {
  fee_type: string;
  amount: number;
  packages: { tracking_no: string; content: string } | null;
}

interface Invoice {
  id: string;
  accept_fee: number;
  consolidation_fee: number;
  demurrage_fee: number;
  total: number;
  status: string;
  qr_code: string | null;
  created_at: string;
  items: InvoiceItem[];
}

export default function CheckoutPage() {
  const [step, setStep] = useState<"review" | "paying" | "success">("review");
  const [qrReady, setQrReady] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => {
        if (!res.ok) throw new Error("Fatura yüklenemedi");
        return res.json();
      })
      .then((data: Invoice[]) => {
        const pending = data.filter((inv) => inv.status === "PENDING");
        setInvoices(pending);
        setSelectedIds(pending.map((i) => i.id));
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
        setLoading(false);
      });
  }, []);

  const selectedInvoices = invoices.filter((i) => selectedIds.includes(i.id));
  const grandTotal = selectedInvoices.reduce((sum, i) => sum + Number(i.total), 0);

  const toggleInvoice = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePay = async () => {
    if (selectedInvoices.length === 0) return;
    setStep("paying");
    try {
      const results = await Promise.all(
        selectedInvoices.map((inv) =>
          fetch("/api/invoices", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: inv.id }),
          }).then((r) => r.json())
        )
      );
      setQrCode(results[results.length - 1].qr_code);
      setStep("success");
      setTimeout(() => setQrReady(true), 600);
    } catch {
      setStep("review");
    }
  };

  const getInvoiceItems = (inv: Invoice) => {
    // If we have detailed items from API, group by package
    if (inv.items && inv.items.length > 0) {
      return inv.items.map((item) => ({
        label: item.packages
          ? `${item.packages.content} — ${feeTypeLabel(item.fee_type)}`
          : feeTypeLabel(item.fee_type),
        amount: item.amount,
      }));
    }
    // Fallback to fee totals
    const items = [];
    if (inv.accept_fee > 0) items.push({ label: "Kabul Ücreti", amount: inv.accept_fee });
    if (inv.consolidation_fee > 0) items.push({ label: "Konsolidasyon Ücreti", amount: inv.consolidation_fee });
    if (inv.demurrage_fee > 0) items.push({ label: "Gecikme Ücreti", amount: inv.demurrage_fee });
    return items;
  };

  const feeTypeLabel = (type: string) => {
    switch (type) {
      case "accept": return "Kabul Ücreti";
      case "consolidation": return "Birleştirme";
      case "demurrage": return "Gecikme Ücreti";
      default: return type;
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[400px]"
            >
              <div className="w-10 h-10 border-4 border-chios-purple/20 border-t-chios-purple rounded-full animate-spin mb-4" />
              <p className="text-sm text-deep-sea-teal/50">Faturalar yükleniyor...</p>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[400px] text-center"
            >
              <div className="w-16 h-16 rounded-full bg-danger-red/10 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h2 className="font-display text-lg font-semibold text-deep-sea-teal mb-1">{error}</h2>
              <p className="text-sm text-deep-sea-teal/50">Lütfen daha sonra tekrar deneyin</p>
            </motion.div>
          )}

          {!loading && !error && invoices.length === 0 && step === "review" && (
            <motion.div
              key="no-invoice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[400px] text-center"
            >
              <div className="w-20 h-20 rounded-full bg-chios-purple/10 flex items-center justify-center mb-6">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-chios-purple">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-semibold text-deep-sea-teal mb-2">Bekleyen Fatura Yok</h2>
              <p className="text-sm text-deep-sea-teal/50 max-w-sm">
                Şu anda ödemeniz gereken fatura bulunmuyor. Paketleriniz depoya ulaştığında fatura oluşturulacaktır.
              </p>
            </motion.div>
          )}

          {!loading && !error && step === "review" && invoices.length > 0 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="font-display text-2xl font-bold text-deep-sea-teal mb-2">
                Ödeme Özeti
              </h1>
              <p className="text-sm text-deep-sea-teal/50 mb-6">
                {invoices.length} bekleyen fatura
              </p>

              <div className="space-y-4 mb-6">
                {invoices.map((inv, idx) => {
                  const items = getInvoiceItems(inv);
                  const isSelected = selectedIds.includes(inv.id);
                  return (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => toggleInvoice(inv.id)}
                      className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-chios-purple/40 ring-2 ring-chios-purple/10"
                          : "border-deep-sea-teal/5 hover:border-deep-sea-teal/15"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                            isSelected ? "bg-chios-purple border-chios-purple" : "border-deep-sea-teal/20"
                          }`}>
                            {isSelected && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <span className="text-xs text-deep-sea-teal/40 font-mono">
                            #{inv.id.slice(0, 8)}
                          </span>
                        </div>
                        <span className="font-display font-bold text-deep-sea-teal">
                          €{Number(inv.total).toFixed(2)}
                        </span>
                      </div>
                      <div className="space-y-1.5 pl-7">
                        {items.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-deep-sea-teal/50">{item.label}</span>
                            <span className="text-deep-sea-teal/70">€{Number(item.amount).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Grand total */}
              <div className="bg-deep-sea-teal/[0.03] rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-deep-sea-teal/60">
                    {selectedInvoices.length} fatura seçildi
                  </span>
                  <span className="font-display text-xl font-bold text-deep-sea-teal">
                    €{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={selectedInvoices.length === 0}
                className="w-full py-4 bg-chios-purple text-white font-display font-semibold text-lg rounded-xl hover:bg-chios-purple-dark transition-all duration-200 shadow-lg shadow-chios-purple/20 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {selectedInvoices.length === invoices.length
                  ? `Tümünü Öde — €${grandTotal.toFixed(2)}`
                  : `Seçilileri Öde — €${grandTotal.toFixed(2)}`}
              </button>

              <p className="mt-4 text-xs text-center text-deep-sea-teal/30">
                Stripe güvenli ödeme altyapısı ile korunmaktadır
              </p>
            </motion.div>
          )}

          {step === "paying" && (
            <motion.div
              key="paying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[400px]"
            >
              <div className="relative w-16 h-16 mb-6">
                <motion.div
                  className="absolute inset-0 border-4 border-chios-purple/20 rounded-full"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1.2 }}
                  transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                />
                <motion.div
                  className="absolute inset-0 border-4 border-chios-purple border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="font-display text-lg font-semibold text-deep-sea-teal">
                Ödeme İşleniyor...
              </p>
              <p className="text-sm text-deep-sea-teal/40 mt-1">
                Lütfen bekleyin
              </p>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center min-h-[500px] justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-success-green/10 flex items-center justify-center mb-6"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  />
                </svg>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-display text-2xl font-bold text-deep-sea-teal"
              >
                Ödeme Başarılı!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-sm text-deep-sea-teal/50 mt-2 mb-8"
              >
                Teslimat QR kodunuz oluşturuluyor
              </motion.p>

              <AnimatePresence>
                {qrReady && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="relative"
                  >
                    <div className="absolute -inset-3 rounded-3xl">
                      <svg className="w-full h-full" viewBox="0 0 180 180" fill="none">
                        <motion.rect
                          x="2" y="2" width="176" height="176" rx="24"
                          stroke="url(#qr-gradient)" strokeWidth="2"
                          strokeDasharray="12 8" fill="none"
                          animate={{ strokeDashoffset: [0, -40] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <defs>
                          <linearGradient id="qr-gradient" x1="0" y1="0" x2="180" y2="180">
                            <stop offset="0%" stopColor="#5D3FD3" />
                            <stop offset="100%" stopColor="#22C55E" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="relative bg-white rounded-2xl p-6 shadow-lg">
                      <div className="w-44 h-44 bg-deep-sea-teal/5 rounded-xl flex flex-col items-center justify-center">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-deep-sea-teal">
                          <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" />
                          <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" />
                          <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" />
                          <rect x="14" y="14" width="3" height="3" fill="currentColor" />
                          <rect x="18" y="14" width="3" height="3" fill="currentColor" />
                          <rect x="14" y="18" width="3" height="3" fill="currentColor" />
                          <rect x="18" y="18" width="3" height="3" fill="currentColor" />
                        </svg>
                        <span className="mt-2 text-xs font-mono text-deep-sea-teal/40">
                          {qrCode || "QR-CBX-..."}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {qrReady && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
                  <span className="text-sm font-medium text-success-green">Teslimata Hazır</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
