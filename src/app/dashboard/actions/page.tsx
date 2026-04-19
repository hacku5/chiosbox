"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePackageStore } from "@/stores/package-store";

// Simplified carrier detection
function detectCarrier(trackingNo: string): string {
  if (/^1Z/i.test(trackingNo)) return "UPS";
  if (/^TBA/i.test(trackingNo)) return "Amazon";
  if (/^\d{10}$/.test(trackingNo)) return "DHL";
  if (/^94\d{18}$/.test(trackingNo)) return "USPS";
  return "";
}

export default function ActionsPage() {
  const [trackingNo, setTrackingNo] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fetchPackages = usePackageStore((s) => s.fetchPackages);
  const carrier = detectCarrier(trackingNo);

  const handleSubmit = async () => {
    if (!trackingNo || !content) return;
    setSubmitting(true);
    try {
      await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNo, carrier: carrier || "Diğer", content }),
      });
      setSuccess(true);
      setTrackingNo("");
      setContent("");
      fetchPackages();
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-deep-sea-teal mb-2">
          Yeni Paket Bildir
        </h1>
        <p className="text-sm text-deep-sea-teal/50 mb-8">
          Alışveriş yaptığınız paketin bilgilerini girin
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5"
        >
          <div className="space-y-5">
            {/* Tracking number */}
            <div>
              <label className="block text-sm font-medium text-deep-sea-teal mb-2">
                Takip Numarası
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={trackingNo}
                  onChange={(e) => setTrackingNo(e.target.value)}
                  placeholder="Örn: 1Z999AA10123456784"
                  className="w-full px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-deep-sea-teal/[0.02] text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/50 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200"
                />
                {carrier && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-deep-sea-teal/5 rounded-lg"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-chios-purple">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                    <span className="text-xs font-medium text-deep-sea-teal/60">
                      {carrier}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-deep-sea-teal mb-2">
                Paket İçeriği
              </label>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Örn: Nike Air Max 90"
                className="w-full px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-deep-sea-teal/[0.02] text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/50 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!trackingNo || !content || submitting}
              className="w-full py-3.5 bg-chios-purple text-white font-display font-semibold rounded-xl hover:bg-chios-purple-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              {submitting ? "Gönderiliyor..." : success ? "Bildirildi!" : "Bildir"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
