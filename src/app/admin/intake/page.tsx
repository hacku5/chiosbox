"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const demoCustomers: Record<string, { name: string; id: string }> = {
  "1Z999AA10123456784": { name: "Dany", id: "CBX-1045" },
  "7489274892": { name: "Ayşe K.", id: "CBX-1092" },
  "TBA300000012345": { name: "Mehmet B.", id: "CBX-1156" },
};

const shelfOptions = [
  "A-1", "A-2", "A-3", "A-4", "A-5",
  "B-1", "B-2", "B-3", "B-4", "B-5",
  "C-1", "C-2", "C-3", "C-4", "C-5",
];

export default function IntakePage() {
  const [barcode, setBarcode] = useState("");
  const [customer, setCustomer] = useState<{ name: string; id: string } | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState("");
  const [saved, setSaved] = useState(false);

  const handleBarcodeSubmit = () => {
    const found = demoCustomers[barcode.trim()];
    if (found) {
      setCustomer(found);
      setPhotoTaken(false);
      setSelectedShelf("");
      setSaved(false);
    }
  };

  const handleReset = () => {
    setBarcode("");
    setCustomer(null);
    setPhotoTaken(false);
    setSelectedShelf("");
    setSaved(false);
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-deep-sea-teal">
            Paket Kabul
          </h1>
          {customer && (
            <button
              onClick={handleReset}
              className="text-sm text-deep-sea-teal/50 hover:text-chios-purple transition-colors cursor-pointer"
              >
              Yeni Kabul
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Barcode */}
          {!customer && (
            <motion.div
              key="barcode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Camera placeholder */}
              <div className="bg-deep-sea-teal rounded-3xl aspect-[4/3] flex flex-col items-center justify-center mb-6 relative overflow-hidden">
                <div className="absolute inset-4 border-2 border-dashed border-white/20 rounded-2xl" />
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" className="opacity-40 mb-4">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                <p className="text-white/40 text-sm">
                  Barkodu kameraya gösterin veya manuel girin
                </p>
              </div>

              {/* Manual barcode input */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-deep-sea-teal/5">
                <label className="block text-sm font-medium text-deep-sea-teal mb-3">
                  Barkod / Takip No
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBarcodeSubmit()}
                    placeholder="Barkodu okutun veya yazın"
                    className="flex-1 px-5 py-4 rounded-2xl border-2 border-deep-sea-teal/10 bg-white text-deep-sea-teal text-lg font-mono placeholder:text-deep-sea-teal/20 focus:outline-none focus:border-chios-purple/50 transition-all"
                    autoFocus
                  />
                  <button
                    onClick={handleBarcodeSubmit}
                    disabled={!barcode.trim()}
                    className="px-6 bg-chios-purple text-white font-semibold rounded-2xl hover:bg-chios-purple-dark disabled:opacity-30 transition-all cursor-pointer min-w-[48px]"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Customer found + Photo */}
          {customer && !saved && (
            <motion.div
              key="process"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Customer info */}
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-chios-purple rounded-2xl p-5 text-white"
              >
                <div className="text-sm text-white/60 mb-1">Müşteri</div>
                <div className="font-display text-2xl font-bold">{customer.name}</div>
                <div className="text-sm text-white/60 mt-1 font-mono">{customer.id}</div>
              </motion.div>

              {/* Photo button */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5 flex flex-col items-center">
                {!photoTaken ? (
                  <button
                    onClick={() => setPhotoTaken(true)}
                    className="w-full py-8 bg-chios-purple text-white font-display text-2xl font-bold rounded-2xl hover:bg-chios-purple-dark active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-chios-purple/30 min-h-[64px]"
                  >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    FOTOĞRAF ÇEK
                  </button>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-success-green/10 flex items-center justify-center mx-auto mb-3">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="font-semibold text-success-green">Fotoğraf çekildi</p>
                  </motion.div>
                )}
              </div>

              {/* Shelf assignment */}
              {photoTaken && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-deep-sea-teal/5"
                >
                  <label className="block text-sm font-medium text-deep-sea-teal mb-3">
                    Raf Atama
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {shelfOptions.map((shelf) => (
                      <button
                        key={shelf}
                        onClick={() => setSelectedShelf(shelf)}
                        className={`py-3 rounded-xl text-sm font-bold transition-all cursor-pointer min-h-[48px] ${
                          selectedShelf === shelf
                            ? "bg-chios-purple text-white shadow-md"
                            : "bg-deep-sea-teal/5 text-deep-sea-teal/60 hover:bg-deep-sea-teal/10"
                        }`}
                      >
                        {shelf}
                      </button>
                    ))}
                  </div>

                  {selectedShelf && (
                    <motion.button
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSaved(true)}
                      className="mt-4 w-full py-4 bg-success-green text-white font-display font-bold text-lg rounded-2xl hover:bg-green-600 active:scale-[0.98] transition-all cursor-pointer shadow-lg min-h-[48px]"
                    >
                      KAYDET
                    </motion.button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Saved success */}
          {saved && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-24 h-24 rounded-full bg-success-green/10 flex items-center justify-center mb-6"
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  />
                </svg>
              </motion.div>

              <h2 className="font-display text-2xl font-bold text-deep-sea-teal mb-2">
                Kaydedildi!
              </h2>
              <p className="text-deep-sea-teal/50 text-center mb-2">
                {customer?.name} — {customer?.id}
              </p>
              <div className="font-display text-3xl font-bold text-chios-purple">
                Raf: {selectedShelf}
              </div>

              <button
                onClick={handleReset}
                className="mt-8 px-8 py-3 bg-deep-sea-teal text-white font-semibold rounded-2xl hover:bg-deep-sea-teal/90 transition-colors cursor-pointer min-h-[48px]"
              >
                Yeni Kabul
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
