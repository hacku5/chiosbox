"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminPackage } from "@/stores/admin-store";
import { useTranslation } from "@/hooks/use-translation";

export default function PickupPage() {
  const { t } = useTranslation();
  const [qrInput, setQrInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundPkg, setFoundPkg] = useState<AdminPackage | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  // Code verification states
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [delivering, setDelivering] = useState(false);
  const [codeError, setCodeError] = useState("");

  const handleScan = async () => {
    const trimmed = qrInput.trim();
    if (!trimmed) return;

    setSearching(true);
    setNotFound(false);
    setFoundPkg(null);
    setError("");

    try {
      const res = await fetch(`/api/admin/packages?tracking=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error(t("pickup.error.search"));
      const json = await res.json();
      const packages = json.data || json;

      if (Array.isArray(packages) && packages.length > 0) {
        setFoundPkg(packages[0]);
      } else {
        setNotFound(true);
      }
    } catch {
      setError(t("pickup.error.searchPaket"));
    } finally {
      setSearching(false);
    }
  };

  const handleSendCode = async () => {
    if (!foundPkg) return;
    setSendingCode(true);
    setError("");

    try {
      const res = await fetch("/api/admin/pickup/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: foundPkg.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("pickup.error.codeFailed"));
        return;
      }

      setVerificationCode(data.code);
      setCodeSent(true);
    } catch {
      setError(t("pickup.error.generic"));
    } finally {
      setSendingCode(false);
    }
  };

  const handleDeliver = async () => {
    if (!foundPkg || !enteredCode.trim()) return;
    setDelivering(true);
    setCodeError("");
    setError("");

    try {
      const res = await fetch("/api/admin/pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: foundPkg.id, code: enteredCode.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setCodeError(data.error || t("pickup.error.deliveryFailed"));
        return;
      }

      setCompleted(true);
    } catch {
      setCodeError(t("pickup.error.generic"));
    } finally {
      setDelivering(false);
    }
  };

  const handleReset = () => {
    setQrInput("");
    setFoundPkg(null);
    setNotFound(false);
    setCompleted(false);
    setError("");
    setSendingCode(false);
    setCodeSent(false);
    setVerificationCode("");
    setEnteredCode("");
    setCodeError("");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-deep-sea-teal">
            {t("pickup.title")}
          </h1>
          {foundPkg && (
            <button
              onClick={handleReset}
              className="text-sm text-deep-sea-teal/50 hover:text-chios-purple transition-colors cursor-pointer"
            >
              {t("pickup.newDelivery")}
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
          {/* Step 1: QR Scan */}
          {!foundPkg && !completed && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleScan()}
                      placeholder={t("pickup.inputPlaceholder")}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-deep-sea-teal/10 bg-white text-deep-sea-teal text-lg font-mono placeholder:text-deep-sea-teal/20 focus:outline-none focus:border-chios-purple/50 transition-all"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleScan}
                    disabled={!qrInput.trim() || searching}
                    className="h-[60px] w-[60px] bg-chios-purple text-white font-semibold rounded-2xl hover:bg-chios-purple-dark disabled:opacity-30 transition-all cursor-pointer flex items-center justify-center"
                  >
                    {searching ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <rect x="7" y="7" width="3" height="3" />
                        <rect x="14" y="7" width="3" height="3" />
                        <rect x="7" y="14" width="3" height="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Not found */}
                {notFound && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-danger-red text-center"
                  >
                    {t("pickup.notFound")}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Package info + Code verification */}
          {foundPkg && !completed && (
            <motion.div
              key="deliver"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Big customer display */}
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-deep-sea-teal rounded-3xl p-8 text-white text-center"
              >
                <div className="text-sm text-white/50 uppercase tracking-wider mb-2">
                  {t("pickup.toDeliver")}
                </div>
                <div className="font-display text-4xl font-bold mb-2">
                  {foundPkg.users?.name || "Bilinmeyen"}
                </div>
                <div className="font-display text-5xl font-bold text-chios-purple">
                  {foundPkg.shelf_location || "—"}
                </div>
                <div className="mt-3 text-sm text-white/50">
                  {foundPkg.content} · {foundPkg.users?.chios_box_id}
                </div>
              </motion.div>

              {/* Code verification */}
              {!codeSent ? (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-deep-sea-teal/5">
                  <h3 className="font-display text-lg font-semibold text-deep-sea-teal mb-3">
                    {t("pickup.verificationTitle")}
                  </h3>
                  <p className="text-sm text-deep-sea-teal/50 mb-4">
                    {t("pickup.verificationDesc")}
                  </p>
                  <button
                    onClick={handleSendCode}
                    disabled={sendingCode}
                    className="w-full py-4 bg-chios-purple text-white font-semibold rounded-xl hover:bg-chios-purple-dark transition-colors cursor-pointer disabled:opacity-50 min-h-[48px]"
                  >
                    {sendingCode ? t("pickup.sending") : t("pickup.sendCode")}
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-deep-sea-teal/5 space-y-4">
                  {/* Mock: show the code */}
                  <div className="p-4 bg-chios-purple/5 rounded-xl text-center">
                    <div className="text-xs text-deep-sea-teal/40 uppercase tracking-wider mb-1">
                      {t("pickup.mockCodeLabel")}
                    </div>
                    <div className="font-mono text-3xl font-bold text-chios-purple tracking-[0.3em]">
                      {verificationCode}
                    </div>
                    <div className="text-xs text-deep-sea-teal/30 mt-1">
                      {t("pickup.mockCodeNote")}
                    </div>
                  </div>

                  {/* Code input */}
                  <div>
                    <label className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider">
                      {t("pickup.customerCode")}
                    </label>
                    <input
                      type="text"
                      value={enteredCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setEnteredCode(val);
                        setCodeError("");
                      }}
                      maxLength={6}
                      placeholder={t("pickup.codePlaceholder")}
                      className="mt-1 w-full px-5 py-4 rounded-xl border-2 border-deep-sea-teal/10 bg-white text-deep-sea-teal text-2xl font-mono text-center tracking-[0.3em] placeholder:text-deep-sea-teal/15 focus:outline-none focus:border-chios-purple/50 transition-all"
                      autoFocus
                    />
                    {codeError && (
                      <p className="mt-2 text-sm text-danger-red text-center">{codeError}</p>
                    )}
                  </div>

                  <button
                    onClick={handleDeliver}
                    disabled={enteredCode.length !== 6 || delivering}
                    className="w-full py-4 bg-success-green text-white font-display font-bold text-lg rounded-xl hover:bg-green-600 active:scale-[0.98] transition-all cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
                  >
                    {delivering ? t("pickup.delivering") : t("pickup.deliver")}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Completed */}
          {completed && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              {/* Green flash background */}
              <motion.div
                initial={{ backgroundColor: "#22C55E", opacity: 0.15 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="fixed inset-0 pointer-events-none -z-10"
              />

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
                    transition={{ delay: 0.2, duration: 0.4 }}
                  />
                </svg>
              </motion.div>

              <h2 className="font-display text-2xl font-bold text-deep-sea-teal mb-1">
                {t("pickup.delivered")}
              </h2>
              <p className="text-deep-sea-teal/50 mb-4">
                {foundPkg?.users?.name} — {foundPkg?.content}
              </p>

              <button
                onClick={handleReset}
                className="px-8 py-3 bg-deep-sea-teal text-white font-semibold rounded-2xl hover:bg-deep-sea-teal/90 transition-colors cursor-pointer min-h-[48px]"
              >
                {t("pickup.newDelivery")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
