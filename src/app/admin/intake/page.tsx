"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminStore, AdminPackage } from "@/stores/admin-store";
import { useTranslation } from "@/hooks/use-translation";

const shelfOptions = [
  "A-1", "A-2", "A-3", "A-4", "A-5",
  "B-1", "B-2", "B-3", "B-4", "B-5",
  "C-1", "C-2", "C-3", "C-4", "C-5",
];

export default function IntakePage() {
  const { t } = useTranslation();
  const [barcode, setBarcode] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundPkg, setFoundPkg] = useState<AdminPackage | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const fetchPackages = useAdminStore((s) => s.fetchPackages);

  const handleBarcodeSubmit = async () => {
    const trimmed = barcode.trim();
    if (!trimmed) return;

    setSearching(true);
    setNotFound(false);
    setFoundPkg(null);
    setError("");

    try {
      const res = await fetch(`/api/admin/packages?tracking=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error(t("intake.error.search"));
      const json = await res.json();
      const packages = json.data || json;

      if (Array.isArray(packages) && packages.length > 0) {
        setFoundPkg(packages[0]);
      } else {
        setNotFound(true);
      }
    } catch {
      setError(t("intake.error.searchPaket"));
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    if (!foundPkg || !selectedShelf) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNo: foundPkg.tracking_no,
          shelfLocation: selectedShelf,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("intake.error.saveFailed"));
        return;
      }

      const result = await res.json();
      if (result._warning) {
        setError(result._warning);
      }

      setSaved(true);
      fetchPackages();
    } catch {
      setError(t("intake.error.generic"));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setBarcode("");
    setFoundPkg(null);
    setNotFound(false);
    setSelectedShelf("");
    setSaved(false);
    setError("");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-deep-sea-teal">
            {t("intake.title")}
          </h1>
          {(foundPkg || notFound) && (
            <button
              onClick={handleReset}
              className="text-sm text-deep-sea-teal/50 hover:text-chios-purple transition-colors cursor-pointer"
            >
              {t("intake.newIntake")}
            </button>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-danger-red/10 border border-danger-red/20 rounded-xl text-danger-red text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Barcode */}
          {!foundPkg && !saved && (
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
                  {t("intake.barcodeInstruction")}
                </p>
              </div>

              {/* Manual barcode input */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-deep-sea-teal/5">
                <label className="block text-sm font-medium text-deep-sea-teal mb-3">
                  {t("intake.barcodeLabel")}
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBarcodeSubmit()}
                    placeholder={t("intake.barcodePlaceholder")}
                    className="flex-1 px-5 py-4 rounded-2xl border-2 border-deep-sea-teal/10 bg-white text-deep-sea-teal text-lg font-mono placeholder:text-deep-sea-teal/20 focus:outline-none focus:border-chios-purple/50 transition-all"
                    autoFocus
                  />
                  <button
                    onClick={handleBarcodeSubmit}
                    disabled={!barcode.trim() || searching}
                    className="px-6 bg-chios-purple text-white font-semibold rounded-2xl hover:bg-chios-purple-dark disabled:opacity-30 transition-all cursor-pointer min-w-[48px]"
                  >
                    {searching ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin mx-auto">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Not found message */}
                {notFound && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 text-sm text-danger-red text-center"
                  >
                    {t("intake.notFound")}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Package found + Shelf */}
          {foundPkg && !saved && (
            <motion.div
              key="process"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Package info */}
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-chios-purple rounded-2xl p-5 text-white"
              >
                <div className="text-sm text-white/60 mb-1">{t("intake.customer")}</div>
                <div className="font-display text-2xl font-bold">
                  {foundPkg.users?.name || t("intake.unknown")}
                </div>
                <div className="text-sm text-white/60 mt-1 font-mono">
                  {foundPkg.users?.chios_box_id}
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-sm text-white/60">{t("intake.content")}</div>
                  <div className="font-medium">{foundPkg.content}</div>
                  <div className="text-xs text-white/40 mt-1 font-mono">
                    {foundPkg.carrier} — {foundPkg.tracking_no}
                  </div>
                  {(foundPkg.weight_kg || foundPkg.dimensions) && (
                    <div className="flex gap-3 mt-2 text-xs text-white/50">
                      {foundPkg.weight_kg && <span>{foundPkg.weight_kg} kg</span>}
                      {foundPkg.dimensions && <span>{foundPkg.dimensions}</span>}
                    </div>
                  )}
                  {foundPkg.notes && (
                    <div className="mt-2 text-xs text-white/40 italic">
                      {t("intake.notes", { text: foundPkg.notes })}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Shelf assignment */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-deep-sea-teal/5"
              >
                <label className="block text-sm font-medium text-deep-sea-teal mb-3">
                  {t("intake.shelfAssignment")}
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
                    onClick={handleSave}
                    disabled={saving}
                    className="mt-4 w-full py-4 bg-success-green text-white font-display font-bold text-lg rounded-2xl hover:bg-green-600 active:scale-[0.98] transition-all cursor-pointer shadow-lg disabled:opacity-50 min-h-[48px]"
                  >
                    {saving ? t("intake.saving") : t("intake.save")}
                  </motion.button>
                )}
              </motion.div>
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
                {t("intake.saved")}
              </h2>
              <p className="text-deep-sea-teal/50 text-center mb-2">
                {foundPkg?.users?.name} — {foundPkg?.users?.chios_box_id}
              </p>
              <div className="font-display text-3xl font-bold text-chios-purple">
                {t("intake.shelfPrefix", { shelf: selectedShelf })}
              </div>

              <button
                onClick={handleReset}
                className="mt-8 px-8 py-3 bg-deep-sea-teal text-white font-semibold rounded-2xl hover:bg-deep-sea-teal/90 transition-colors cursor-pointer min-h-[48px]"
              >
                {t("intake.newIntake")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
