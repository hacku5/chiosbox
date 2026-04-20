"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePackageStore } from "@/stores/package-store";
import Link from "next/link";

function detectCarrier(trackingNo: string): string {
  if (/^1Z/i.test(trackingNo)) return "UPS";
  if (/^TBA/i.test(trackingNo)) return "Amazon";
  if (/^\d{10}$/.test(trackingNo)) return "DHL";
  if (/^94\d{18}$/.test(trackingNo)) return "USPS";
  return "";
}

const CARRIERS = ["DHL", "UPS", "FedEx", "USPS", "Amazon", "Hermes", "DPD", "GLS", "Diğer"];

const WEIGHT_PRESETS = [
  { label: "Hafif", sub: "< 0.5 kg", value: 0.3, color: "bg-success-green" },
  { label: "Orta", sub: "0.5 – 2 kg", value: 1, color: "bg-chios-purple" },
  { label: "Ağır", sub: "2 – 5 kg", value: 3, color: "bg-accent-orange" },
  { label: "Çok Ağır", sub: "5+ kg", value: 7, color: "bg-danger-red" },
];

const DIMENSION_PRESETS = [
  { label: "Küçük", sub: "Küçük kutu", value: "20x15x10 cm", icon: "S" },
  { label: "Orta", sub: "Standart kutu", value: "40x30x20 cm", icon: "M" },
  { label: "Büyük", sub: "Büyük kutu", value: "60x40x30 cm", icon: "L" },
];

export default function ActionsPage() {
  const [trackingNo, setTrackingNo] = useState("");
  const [content, setContent] = useState("");
  const [carrier, setCarrier] = useState("");
  const [customCarrier, setCustomCarrier] = useState("");
  const [weightPreset, setWeightPreset] = useState<number | null>(null);
  const [customWeight, setCustomWeight] = useState("");
  const [dimPreset, setDimPreset] = useState("");
  const [customDim, setCustomDim] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fetchPackages = usePackageStore((s) => s.fetchPackages);
  const detectedCarrier = detectCarrier(trackingNo);

  const resolvedCarrier = carrier === "Diğer"
    ? (customCarrier.trim() || "Diğer")
    : (carrier || detectedCarrier || "");

  const resolvedWeight = customWeight ? parseFloat(customWeight) : weightPreset;
  const resolvedDim = customDim.trim() || dimPreset;

  const handleSubmit = async () => {
    if (!trackingNo || !content) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNo,
          carrier: resolvedCarrier || "Diğer",
          content,
          weightKg: resolvedWeight || null,
          dimensions: resolvedDim || null,
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Bildirim başarısız");
        return;
      }

      setSubmitted(true);
      fetchPackages();
    } catch {
      setError("Bağlantı hatası — lütfen tekrar deneyin");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setTrackingNo("");
    setContent("");
    setCarrier("");
    setCustomCarrier("");
    setWeightPreset(null);
    setCustomWeight("");
    setDimPreset("");
    setCustomDim("");
    setNotes("");
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-success-green/10 flex items-center justify-center mb-6"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  />
                </svg>
              </motion.div>

              <h2 className="font-display text-2xl font-bold text-deep-sea-teal mb-2">
                Paket Bildirildi!
              </h2>
              <p className="text-sm text-deep-sea-teal/50 mb-2">{content}</p>
              <p className="text-xs text-deep-sea-teal/40 font-mono mb-8">
                {resolvedCarrier || "Kargo"} — {trackingNo}
              </p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-sm bg-chios-purple/5 rounded-2xl p-5 mb-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-chios-purple/10 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-chios-purple">
                      <rect x="1" y="4" width="22" height="16" rx="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-deep-sea-teal">Kabul Ücreti</div>
                    <div className="text-xs text-deep-sea-teal/50">Paket depoya ulaştığında ödenecek</div>
                  </div>
                </div>
                <div className="text-left text-xs text-deep-sea-teal/40">
                  Paketiniz ChiosBox deposuna ulaştığında fatura oluşturulacak ve ödeme yapmanız istenecektir.
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full max-w-sm space-y-3"
              >
                <Link
                  href="/dashboard/checkout"
                  className="w-full py-3.5 inline-flex items-center justify-center gap-2 bg-chios-purple text-white font-display font-semibold rounded-xl hover:bg-chios-purple-dark transition-all duration-200 shadow-lg shadow-chios-purple/20 cursor-pointer"
                >
                  Ödemeye Git
                </Link>
                <Link
                  href="/dashboard/packages"
                  className="w-full py-3.5 inline-flex items-center justify-center gap-2 bg-white text-deep-sea-teal font-semibold rounded-xl border border-deep-sea-teal/10 hover:bg-deep-sea-teal/5 transition-all duration-200 cursor-pointer"
                >
                  Paketlerimi Gör
                </Link>
                <button
                  onClick={resetForm}
                  className="w-full py-3 text-sm text-deep-sea-teal/40 hover:text-chios-purple transition-colors cursor-pointer"
                >
                  Yeni Paket Bildir
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="font-display text-2xl font-bold text-deep-sea-teal mb-2">
                Yeni Paket Bildir
              </h1>
              <p className="text-sm text-deep-sea-teal/50 mb-8">
                Alışveriş yaptığınız paketin bilgilerini girin
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-danger-red/10 border border-danger-red/20 rounded-xl text-danger-red text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5">
                <div className="space-y-6">
                  {/* 1. Takip Numarası */}
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
                      {detectedCarrier && !carrier && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-chios-purple/10 rounded-lg"
                        >
                          <span className="text-xs font-medium text-chios-purple">{detectedCarrier}</span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* 2. Kargo Firması */}
                  <div>
                    <label className="block text-sm font-medium text-deep-sea-teal mb-2">
                      Kargo Firması
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CARRIERS.map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setCarrier(c === carrier ? "" : c);
                            if (c !== "Diğer") setCustomCarrier("");
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                            (carrier === c || (!carrier && detectedCarrier === c))
                              ? "bg-chios-purple text-white shadow-sm"
                              : "bg-deep-sea-teal/[0.03] text-deep-sea-teal/60 hover:bg-deep-sea-teal/10"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {carrier === "Diğer" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <input
                            type="text"
                            value={customCarrier}
                            onChange={(e) => setCustomCarrier(e.target.value)}
                            placeholder="Kargo firması adı yazın"
                            className="w-full px-4 py-3 rounded-xl border border-chios-purple/30 bg-chios-purple/[0.02] text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/50 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200"
                            autoFocus
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 3. Paket İçeriği */}
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

                  {/* 4. Ağırlık — interactive presets */}
                  <div>
                    <label className="block text-sm font-medium text-deep-sea-teal mb-2">
                      Ağırlık <span className="text-deep-sea-teal/30 font-normal">(opsiyonel)</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {WEIGHT_PRESETS.map((wp) => (
                        <button
                          key={wp.label}
                          onClick={() => {
                            setWeightPreset(weightPreset === wp.value ? null : wp.value);
                            setCustomWeight("");
                          }}
                          className={`relative py-3 px-2 rounded-xl text-center transition-all cursor-pointer ${
                            weightPreset === wp.value
                              ? "bg-chios-purple text-white shadow-md scale-[1.02]"
                              : "bg-deep-sea-teal/[0.03] hover:bg-deep-sea-teal/[0.06]"
                          }`}
                        >
                          <div className={`text-lg font-bold ${weightPreset === wp.value ? "text-white" : "text-deep-sea-teal"}`}>
                            {wp.value}
                          </div>
                          <div className={`text-[10px] mt-0.5 ${weightPreset === wp.value ? "text-white/70" : "text-deep-sea-teal/40"}`}>
                            {wp.label}
                          </div>
                          <div className={`text-[9px] ${weightPreset === wp.value ? "text-white/50" : "text-deep-sea-teal/25"}`}>
                            {wp.sub}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={customWeight}
                        onChange={(e) => {
                          setCustomWeight(e.target.value);
                          setWeightPreset(null);
                        }}
                        placeholder="veya manuel girin"
                        className="w-full px-4 py-2.5 pr-10 rounded-xl border border-deep-sea-teal/10 bg-deep-sea-teal/[0.02] text-sm text-deep-sea-teal placeholder:text-deep-sea-teal/25 focus:outline-none focus:border-chios-purple/50 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-deep-sea-teal/30">kg</span>
                    </div>
                    {/* Visual bar */}
                    <div className="mt-2 h-1.5 rounded-full bg-deep-sea-teal/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-success-green via-chios-purple to-accent-orange"
                        initial={{ width: "0%" }}
                        animate={{ width: `${Math.min(100, ((resolvedWeight || 0) / 10) * 100)}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      />
                    </div>
                  </div>

                  {/* 5. Boyut — interactive presets */}
                  <div>
                    <label className="block text-sm font-medium text-deep-sea-teal mb-2">
                      Boyut <span className="text-deep-sea-teal/30 font-normal">(opsiyonel)</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {DIMENSION_PRESETS.map((dp) => (
                        <button
                          key={dp.label}
                          onClick={() => {
                            setDimPreset(dimPreset === dp.value ? "" : dp.value);
                            setCustomDim("");
                          }}
                          className={`py-3 px-3 rounded-xl text-center transition-all cursor-pointer ${
                            dimPreset === dp.value
                              ? "bg-chios-purple text-white shadow-md scale-[1.02]"
                              : "bg-deep-sea-teal/[0.03] hover:bg-deep-sea-teal/[0.06]"
                          }`}
                        >
                          <div className={`text-sm font-bold ${dimPreset === dp.value ? "text-white" : "text-deep-sea-teal"}`}>
                            {dp.icon}
                          </div>
                          <div className={`text-[10px] mt-0.5 ${dimPreset === dp.value ? "text-white/70" : "text-deep-sea-teal/40"}`}>
                            {dp.label}
                          </div>
                          <div className={`text-[9px] ${dimPreset === dp.value ? "text-white/50" : "text-deep-sea-teal/25"}`}>
                            {dp.value}
                          </div>
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={customDim}
                      onChange={(e) => {
                        setCustomDim(e.target.value);
                        setDimPreset("");
                      }}
                      placeholder="veya manuel: 30x20x15 cm"
                      className="w-full px-4 py-2.5 rounded-xl border border-deep-sea-teal/10 bg-deep-sea-teal/[0.02] text-sm text-deep-sea-teal placeholder:text-deep-sea-teal/25 focus:outline-none focus:border-chios-purple/50 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200"
                    />
                  </div>

                  {/* 6. Not */}
                  <div>
                    <label className="block text-sm font-medium text-deep-sea-teal mb-2">
                      Not <span className="text-deep-sea-teal/30 font-normal">(opsiyonel)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Kırılabilir, hediye paketi vb."
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-deep-sea-teal/[0.02] text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/50 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={!trackingNo || !content || submitting}
                    className="w-full py-3.5 bg-chios-purple text-white font-display font-semibold rounded-xl hover:bg-chios-purple-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                  >
                    {submitting ? "Gönderiliyor..." : "Bildir"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
