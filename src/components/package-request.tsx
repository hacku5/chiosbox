"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center gap-2">
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-bold transition-colors duration-300 ${
              step <= currentStep
                ? "bg-chios-purple text-white"
                : "bg-deep-sea-teal/5 text-deep-sea-teal/30"
            }`}
            animate={step === currentStep ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {step < currentStep ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              step
            )}
          </motion.div>
          {step < 3 && (
            <div className={`w-8 h-0.5 rounded transition-colors duration-300 ${step < currentStep ? "bg-chios-purple/40" : "bg-deep-sea-teal/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function PackageRequest() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useTranslation();
  const carriers = [
    t("pkgReq.carrier.yurtici"),
    t("pkgReq.carrier.aras"),
    t("pkgReq.carrier.mng"),
    t("pkgReq.carrier.ptt"),
    t("pkgReq.carrier.surat"),
    "UPS",
    "DHL",
    t("pkgReq.carrier.diger"),
  ];
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    carrier: "",
    trackingNo: "",
    content: "",
    estimatedValue: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canNext = () => {
    if (step === 1) return formData.name && formData.email;
    if (step === 2) return formData.carrier && formData.trackingNo && formData.content;
    return true;
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <section id="paket-istegi" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-mastic-white via-white to-chios-purple/[0.02]" />
      <div className="absolute top-20 right-0 w-80 h-80 bg-chios-purple/[0.03] rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-sunset-gold/[0.04] rounded-full blur-3xl" />

      <div ref={ref} className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.span
            className="inline-block px-4 py-2 bg-sunset-gold/10 rounded-full text-sm font-medium text-accent-orange mb-4 border border-sunset-gold/20"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {t("pkgReq.tag")}
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-deep-sea-teal">
            {t("pkgReq.title")}
          </h2>
          <p className="mt-3 text-deep-sea-teal/60 max-w-lg mx-auto">
            {t("pkgReq.description")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Illustration side */}
          <motion.div
            className="lg:col-span-2 hidden lg:flex flex-col items-center"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <svg viewBox="0 0 280 320" fill="none" className="w-full max-w-xs">
              <defs>
                <linearGradient id="form-grad-1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#5D3FD3" />
                  <stop offset="100%" stopColor="#7B6AE0" />
                </linearGradient>
                <linearGradient id="form-grad-2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#004953" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#004953" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Background shape */}
              <rect width="280" height="320" rx="20" fill="#F9F9F7" />

              {/* Wave */}
              <path d="M0 260C40 250 80 270 140 258C200 246 240 262 280 255V320H0V260Z" fill="url(#form-grad-2)">
                <animate attributeName="d" dur="4s" repeatCount="indefinite"
                  values="M0 260C40 250 80 270 140 258C200 246 240 262 280 255V320H0V260Z;M0 255C40 265 80 250 140 262C200 270 240 252 280 260V320H0V255Z;M0 260C40 250 80 270 140 258C200 246 240 262 280 255V320H0V260Z" />
              </path>

              {/* Clipboard */}
              <rect x="80" y="50" width="120" height="160" rx="10" fill="white" stroke="#5D3FD3" strokeWidth="1.5" opacity="0.9" />
              <rect x="115" y="42" width="50" height="16" rx="8" fill="#5D3FD3" opacity="0.3" />
              <circle cx="140" cy="50" r="4" fill="#5D3FD3" opacity="0.5" />

              {/* Form lines */}
              {[
                { y: 80, w: 80 },
                { y: 100, w: 60 },
                { y: 120, w: 70 },
                { y: 140, w: 50 },
                { y: 160, w: 65 },
              ].map((line, i) => (
                <motion.rect
                  key={i}
                  x="95"
                  y={line.y}
                  width={line.w}
                  height="6"
                  rx="3"
                  fill="#5D3FD3"
                  opacity="0.08"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                />
              ))}

              {/* Submit button on form */}
              <motion.rect
                x="95"
                y="180"
                width="90"
                height="18"
                rx="9"
                fill="url(#form-grad-1)"
                opacity="0.6"
                initial={{ scaleX: 0, originX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ delay: 1, duration: 0.4 }}
              />

              {/* Flying package */}
              <g>
                <animateTransform attributeName="transform" type="translate"
                  values="0,0; -20,-40; -35,-15" dur="5s" repeatCount="indefinite" />
                <rect x="200" y="200" width="30" height="24" rx="3" fill="url(#form-grad-1)" />
                <path d="M200 212H230" stroke="white" strokeWidth="1" opacity="0.4" />
                <path d="M215 200V224" stroke="white" strokeWidth="1" opacity="0.4" />
              </g>

              {/* Arrow pointing down to form */}
              <motion.g
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <path d="M140 230V245M135 240L140 245L145 240" stroke="#5D3FD3" strokeWidth="1.5" opacity="0.3" />
              </motion.g>

              {/* Sparkles */}
              {[
                { cx: 60, cy: 80, dur: "2s" },
                { cx: 230, cy: 120, dur: "2.5s" },
                { cx: 50, cy: 200, dur: "1.8s" },
              ].map((s, i) => (
                <circle key={i} cx={s.cx} cy={s.cy} r="2" fill="#FFCF7E" opacity="0.4">
                  <animate attributeName="opacity" values="0.1;0.6;0.1" dur={s.dur} repeatCount="indefinite" />
                </circle>
              ))}
            </svg>

            <div className="mt-6 text-center">
              <h3 className="font-display text-lg font-semibold text-deep-sea-teal">
                {t("pkgReq.ready")}
              </h3>
              <p className="text-sm text-deep-sea-teal/50 mt-1">
                {t("pkgReq.readyDesc")}
              </p>
            </div>
          </motion.div>

          {/* Form side */}
          <motion.div
            className="lg:col-span-3 w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-10 border border-deep-sea-teal/5 shadow-sm text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="mx-auto w-16 h-16 rounded-full bg-success-green/10 flex items-center justify-center mb-6"
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                      <motion.path
                        d="M20 6L9 17l-5-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </svg>
                  </motion.div>
                  <h3 className="font-display text-xl font-bold text-deep-sea-teal mb-2">
                    {t("pkgReq.success.title")}
                  </h3>
                  <p className="text-deep-sea-teal/60 mb-6">
                    {t("pkgReq.success.desc")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => { setSubmitted(false); setStep(1); setFormData({ name: "", email: "", phone: "", carrier: "", trackingNo: "", content: "", estimatedValue: "", notes: "" }); }}
                      className="px-6 py-2.5 border-2 border-deep-sea-teal/10 text-deep-sea-teal font-display font-semibold rounded-full hover:border-chios-purple/30 hover:text-chios-purple transition-all duration-300 cursor-pointer text-sm"
                    >
                      {t("pkgReq.newRequest")}
                    </button>
                    <Link
                      href="/register"
                      className="px-6 py-2.5 bg-chios-purple text-white font-display font-semibold rounded-full hover:bg-chios-purple-dark transition-all duration-300 cursor-pointer text-sm"
                    >
                      {t("pkgReq.registerTrack")}
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-3xl p-8 border border-deep-sea-teal/5 shadow-sm"
                >
                  <StepIndicator currentStep={step} />

                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="s1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <h3 className="font-display text-lg font-semibold text-deep-sea-teal mb-4">
                          {t("pkgReq.step1.title")}
                        </h3>
                        <div>
                          <label className="block text-sm font-medium text-deep-sea-teal/70 mb-1.5">{t("pkgReq.fullName")}</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            placeholder={t("pkgReq.fullNamePlaceholder")}
                            className="w-full px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-mastic-white/50 text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/40 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-deep-sea-teal/70 mb-1.5">{t("pkgReq.email")}</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            placeholder="ornek@email.com"
                            className="w-full px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-mastic-white/50 text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/40 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-deep-sea-teal/70 mb-1.5">{t("pkgReq.phone")}</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => updateField("phone", e.target.value)}
                            placeholder="+90 5XX XXX XX XX"
                            className="w-full px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-mastic-white/50 text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/40 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200"
                          />
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="s2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <h3 className="font-display text-lg font-semibold text-deep-sea-teal mb-4">
                          {t("pkgReq.step2.title")}
                        </h3>
                        <div>
                          <label className="block text-sm font-medium text-deep-sea-teal/70 mb-1.5">{t("pkgReq.carrier")}</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {carriers.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => updateField("carrier", c)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer ${
                                  formData.carrier === c
                                    ? "border-chios-purple/40 bg-chios-purple/5 text-chios-purple"
                                    : "border-deep-sea-teal/10 text-deep-sea-teal/50 hover:border-deep-sea-teal/20"
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-deep-sea-teal/70 mb-1.5">{t("pkgReq.trackingNo")}</label>
                          <input
                            type="text"
                            value={formData.trackingNo}
                            onChange={(e) => updateField("trackingNo", e.target.value)}
                            placeholder={t("pkgReq.trackingPlaceholder")}
                            className="w-full px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-mastic-white/50 text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/40 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-deep-sea-teal/70 mb-1.5">{t("pkgReq.content")}</label>
                          <textarea
                            value={formData.content}
                            onChange={(e) => updateField("content", e.target.value)}
                            placeholder={t("pkgReq.contentPlaceholder")}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-mastic-white/50 text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/40 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-deep-sea-teal/70 mb-1.5">{t("pkgReq.estimatedValue")}</label>
                          <input
                            type="text"
                            value={formData.estimatedValue}
                            onChange={(e) => updateField("estimatedValue", e.target.value)}
                            placeholder="0.00"
                            className="w-full px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-mastic-white/50 text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/40 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200"
                          />
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="s3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <h3 className="font-display text-lg font-semibold text-deep-sea-teal mb-4">
                          {t("pkgReq.step3.title")}
                        </h3>

                        {/* Summary */}
                        <div className="bg-mastic-white/80 rounded-2xl p-5 space-y-3 border border-deep-sea-teal/5">
                          <div className="flex justify-between text-sm">
                            <span className="text-deep-sea-teal/50">{t("pkgReq.summaryName")}</span>
                            <span className="font-medium text-deep-sea-teal">{formData.name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-deep-sea-teal/50">{t("pkgReq.summaryEmail")}</span>
                            <span className="font-medium text-deep-sea-teal">{formData.email}</span>
                          </div>
                          {formData.phone && (
                            <div className="flex justify-between text-sm">
                              <span className="text-deep-sea-teal/50">{t("pkgReq.summaryPhone")}</span>
                              <span className="font-medium text-deep-sea-teal">{formData.phone}</span>
                            </div>
                          )}
                          <div className="border-t border-deep-sea-teal/5 pt-3 flex justify-between text-sm">
                            <span className="text-deep-sea-teal/50">{t("pkgReq.summaryCarrier")}</span>
                            <span className="font-medium text-deep-sea-teal">{formData.carrier}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-deep-sea-teal/50">{t("pkgReq.summaryTracking")}</span>
                            <span className="font-medium text-deep-sea-teal font-mono text-xs">{formData.trackingNo}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-deep-sea-teal/50">{t("pkgReq.summaryContent")}</span>
                            <span className="font-medium text-deep-sea-teal max-w-[200px] text-right">{formData.content}</span>
                          </div>
                          {formData.estimatedValue && (
                            <div className="flex justify-between text-sm">
                              <span className="text-deep-sea-teal/50">{t("pkgReq.summaryValue")}</span>
                              <span className="font-medium text-deep-sea-teal">€{formData.estimatedValue}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-deep-sea-teal/70 mb-1.5">{t("pkgReq.notes")}</label>
                          <textarea
                            value={formData.notes}
                            onChange={(e) => updateField("notes", e.target.value)}
                            placeholder={t("pkgReq.notesPlaceholder")}
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-mastic-white/50 text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/40 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200 resize-none"
                          />
                        </div>

                        <div className="bg-chios-purple/5 rounded-xl p-4 border border-chios-purple/10">
                          <div className="flex items-start gap-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5D3FD3" strokeWidth="1.5" className="flex-shrink-0 mt-0.5">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <p className="text-xs text-chios-purple/70 leading-relaxed">
                              {t("pkgReq.info")}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-deep-sea-teal/5">
                    {step > 1 ? (
                      <button
                        onClick={() => setStep(step - 1)}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-deep-sea-teal/60 hover:text-deep-sea-teal transition-colors duration-200 cursor-pointer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        {t("pkgReq.back")}
                      </button>
                    ) : (
                      <div />
                    )}

                    {step < 3 ? (
                      <motion.button
                        onClick={() => canNext() && setStep(step + 1)}
                        disabled={!canNext()}
                        whileHover={canNext() ? { scale: 1.02 } : {}}
                        whileTap={canNext() ? { scale: 0.98 } : {}}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-display font-semibold rounded-full transition-all duration-300 cursor-pointer ${
                          canNext()
                            ? "bg-chios-purple text-white shadow-lg shadow-chios-purple/20 hover:shadow-xl"
                            : "bg-deep-sea-teal/5 text-deep-sea-teal/30 cursor-not-allowed"
                        }`}
                      >
                        {t("pkgReq.continue")}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={handleSubmit}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-display font-semibold rounded-full bg-success-green text-white shadow-lg shadow-success-green/20 hover:shadow-xl transition-all duration-300 cursor-pointer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {t("pkgReq.submit")}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
