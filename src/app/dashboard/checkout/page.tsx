"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Invoice {
  id: string;
  accept_fee: number;
  consolidation_fee: number;
  demurrage_fee: number;
  total: number;
  status: string;
  qr_code: string | null;
}

export default function CheckoutPage() {
  const [step, setStep] = useState<"review" | "paying" | "success">("review");
  const [qrReady, setQrReady] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data: Invoice[]) => {
        const pending = data.find((inv) => inv.status === "PENDING");
        if (pending) setInvoice(pending);
      });
  }, []);

  const handlePay = async () => {
    if (!invoice) return;
    setStep("paying");
    try {
      const res = await fetch("/api/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invoice.id }),
      });
      const data = await res.json();
      setQrCode(data.qr_code);
      setStep("success");
      setTimeout(() => setQrReady(true), 600);
    } catch {
      setStep("review");
    }
  };

  const invoiceItems = [];
  if (invoice) {
    if (invoice.accept_fee > 0) invoiceItems.push({ label: "Kabul Ücreti", amount: invoice.accept_fee });
    if (invoice.consolidation_fee > 0) invoiceItems.push({ label: "Konsolidasyon Ücreti", amount: invoice.consolidation_fee });
    if (invoice.demurrage_fee > 0) invoiceItems.push({ label: "Gecikme Ücreti", amount: invoice.demurrage_fee });
  }
  const total = invoice?.total ?? 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {step === "review" && (
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
              <p className="text-sm text-deep-sea-teal/50 mb-8">
                Teslimata hazırlamak için bakiyenizi kapatın
              </p>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5 mb-6">
                <h3 className="font-display text-sm font-semibold text-deep-sea-teal mb-4">
                  Fatura Kalemleri
                </h3>
                <div className="space-y-3">
                  {invoiceItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-deep-sea-teal/60">
                        {item.label}
                      </span>
                      <span className="font-medium text-deep-sea-teal">
                        €{item.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-deep-sea-teal/5 pt-3 flex justify-between font-semibold text-deep-sea-teal">
                    <span>Toplam</span>
                    <span className="text-lg">€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePay}
                className="w-full py-4 bg-chios-purple text-white font-display font-semibold text-lg rounded-xl hover:bg-chios-purple-dark transition-all duration-200 shadow-lg shadow-chios-purple/20 cursor-pointer"
              >
                Kartla Öde — €{total.toFixed(2)}
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
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
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
              {/* Background transition */}
              <motion.div
                initial={{ backgroundColor: "#5D3FD3" }}
                animate={{ backgroundColor: "#F9F9F7" }}
                transition={{ duration: 1 }}
                className="fixed inset-0 -z-10"
              />

              {/* Success check */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-success-green/10 flex items-center justify-center mb-6"
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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

              {/* QR Code */}
              <AnimatePresence>
                {qrReady && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="relative"
                  >
                    {/* Rotating border */}
                    <div className="absolute -inset-3 rounded-3xl">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 180 180"
                        fill="none"
                      >
                        <motion.rect
                          x="2"
                          y="2"
                          width="176"
                          height="176"
                          rx="24"
                          stroke="url(#qr-gradient)"
                          strokeWidth="2"
                          strokeDasharray="12 8"
                          fill="none"
                          animate={{ strokeDashoffset: [0, -40] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <defs>
                          <linearGradient
                            id="qr-gradient"
                            x1="0"
                            y1="0"
                            x2="180"
                            y2="180"
                          >
                            <stop offset="0%" stopColor="#5D3FD3" />
                            <stop offset="100%" stopColor="#22C55E" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* QR placeholder */}
                    <div className="relative bg-white rounded-2xl p-6 shadow-lg">
                      <div className="w-44 h-44 bg-deep-sea-teal/5 rounded-xl flex flex-col items-center justify-center">
                        <svg
                          width="80"
                          height="80"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-deep-sea-teal"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="7"
                            height="7"
                            rx="1"
                            fill="currentColor"
                          />
                          <rect
                            x="14"
                            y="3"
                            width="7"
                            height="7"
                            rx="1"
                            fill="currentColor"
                          />
                          <rect
                            x="3"
                            y="14"
                            width="7"
                            height="7"
                            rx="1"
                            fill="currentColor"
                          />
                          <rect
                            x="14"
                            y="14"
                            width="3"
                            height="3"
                            fill="currentColor"
                          />
                          <rect
                            x="18"
                            y="14"
                            width="3"
                            height="3"
                            fill="currentColor"
                          />
                          <rect
                            x="14"
                            y="18"
                            width="3"
                            height="3"
                            fill="currentColor"
                          />
                          <rect
                            x="18"
                            y="18"
                            width="3"
                            height="3"
                            fill="currentColor"
                          />
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
                  <span className="text-sm font-medium text-success-green">
                    Teslimata Hazır
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
