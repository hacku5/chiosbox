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
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-bold transition-colors duration-300 ${step <= currentStep
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

  const svgCss = `

        /* SVG İçin Özel Animasyon Stilleri */
        .package-request-svg {
            width: 100%;
            max-width: 400px;
            height: auto;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            background-color: #ffffff;
        }

        /* Çizgilerin (Yazı) sırayla belirmesi */
        .f-line {
            stroke-dasharray: 1;
            stroke-dashoffset: 1;
        }

        .l1 {
            animation: drawLine1 8s infinite;
        }

        .l2 {
            animation: drawLine2 8s infinite;
        }

        .l3 {
            animation: drawLine3 8s infinite;
        }

        .l4 {
            animation: drawLine4 8s infinite;
        }

        .l5 {
            animation: drawLine5 8s infinite;
        }

        /* Form içeriklerinin (Çizgiler ve Buton) kaybolması */
        .form-content {
            animation: fadeForm 8s infinite;
        }

        /* Buton tıklama efekti */
        .form-btn {
            transform-origin: 195px 245px;
            animation: btnClick 8s infinite;
        }

        /* Fare imleci hareketi */
        .cursor {
            animation: cursorMove 8s infinite;
        }

        /* Başarı ikonu animasyonu */
        .success-group {
            transform-origin: 200px 170px;
            animation: successPop 8s infinite;
        }

        /* Başarı onay işareti çizimi */
        .s-check {
            stroke-dasharray: 1;
            stroke-dashoffset: 1;
            animation: drawCheck 8s infinite;
        }

        /* Dış çerçevenin yeşile dönmesi */
        .doc-frame {
            animation: frameColor 8s infinite;
        }

        /* Deniz dalgası animasyonları */
        .wave-bg {
            animation: moveWave 5s linear infinite;
        }

        .wave-fg {
            animation: moveWaveReverse 3.5s linear infinite;
        }

        /* Bot animasyonu */
        .boat {
            animation: boatBob 3s ease-in-out infinite;
            transform-origin: 200px 335px;
        }

        /* Keyframes - Animasyon Senaryosu (Toplam 8 Saniye) */

        @keyframes drawLine1 {

            0%,
            5% {
                stroke-dashoffset: 1;
            }

            10%,
            70% {
                stroke-dashoffset: 0;
            }

            75%,
            100% {
                stroke-dashoffset: 1;
            }
        }

        @keyframes drawLine2 {

            0%,
            10% {
                stroke-dashoffset: 1;
            }

            15%,
            70% {
                stroke-dashoffset: 0;
            }

            75%,
            100% {
                stroke-dashoffset: 1;
            }
        }

        @keyframes drawLine3 {

            0%,
            15% {
                stroke-dashoffset: 1;
            }

            20%,
            70% {
                stroke-dashoffset: 0;
            }

            75%,
            100% {
                stroke-dashoffset: 1;
            }
        }

        @keyframes drawLine4 {

            0%,
            20% {
                stroke-dashoffset: 1;
            }

            25%,
            70% {
                stroke-dashoffset: 0;
            }

            75%,
            100% {
                stroke-dashoffset: 1;
            }
        }

        @keyframes drawLine5 {

            0%,
            25% {
                stroke-dashoffset: 1;
            }

            30%,
            70% {
                stroke-dashoffset: 0;
            }

            75%,
            100% {
                stroke-dashoffset: 1;
            }
        }

        @keyframes fadeForm {

            0%,
            50% {
                opacity: 1;
            }

            55%,
            85% {
                opacity: 0;
            }

            90%,
            100% {
                opacity: 1;
            }
        }

        @keyframes btnClick {

            0%,
            42% {
                transform: scale(1);
                fill: #c4b5fd;
            }

            45% {
                transform: scale(0.92);
                fill: #8b5cf6;
            }

            /* Tıklanma anı */
            48%,
            100% {
                transform: scale(1);
                fill: #c4b5fd;
            }
        }

        @keyframes cursorMove {

            0%,
            30% {
                transform: translate(280px, 320px);
                opacity: 0;
            }

            33% {
                opacity: 1;
            }

            42% {
                transform: translate(195px, 245px);
                opacity: 1;
            }

            /* Butona varış */
            45% {
                transform: translate(195px, 245px) scale(0.85);
                opacity: 1;
            }

            /* Tıklama */
            48% {
                transform: translate(195px, 245px) scale(1);
                opacity: 1;
            }

            /* Bırakma */
            52% {
                transform: translate(195px, 245px);
                opacity: 0;
            }

            /* Kaybolma */
            100% {
                transform: translate(280px, 320px);
                opacity: 0;
            }
        }

        @keyframes successPop {

            0%,
            52% {
                transform: scale(0);
                opacity: 0;
            }

            57% {
                transform: scale(1.1);
                opacity: 1;
            }

            60%,
            85% {
                transform: scale(1);
                opacity: 1;
            }

            90%,
            100% {
                transform: scale(0);
                opacity: 0;
            }
        }

        @keyframes drawCheck {

            0%,
            58% {
                stroke-dashoffset: 1;
            }

            63%,
            85% {
                stroke-dashoffset: 0;
            }

            90%,
            100% {
                stroke-dashoffset: 1;
            }
        }

        @keyframes frameColor {

            0%,
            52% {
                stroke: #8b5cf6;
            }

            /* Mor */
            55%,
            85% {
                stroke: #10b981;
            }

            /* Yeşil */
            90%,
            100% {
                stroke: #8b5cf6;
            }

            /* Tekrar Mor */
        }

        @keyframes moveWave {
            0% {
                transform: translateX(0);
            }

            100% {
                transform: translateX(-100px);
            }
        }

        @keyframes moveWaveReverse {
            0% {
                transform: translateX(0);
            }

            100% {
                transform: translateX(100px);
            }
        }

        @keyframes boatBob {

            0%,
            100% {
                transform: translate(200px, 335px) rotate(-3deg);
            }

            50% {
                transform: translate(200px, 327px) rotate(4deg);
            }
        }  
    `;

  return (
    <section id="paket-istegi" className="py-24 relative overflow-hidden">
      <style>{svgCss}</style>
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
            <svg className="package-request-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
              <circle cx="90" cy="120" r="2.5" fill="#fde047" opacity="0.7" />
              <circle cx="310" cy="160" r="3" fill="#fde047" opacity="0.6" />
              <circle cx="100" cy="240" r="2" fill="#fde047" opacity="0.8" />

              <rect className="doc-frame" x="120" y="80" width="160" height="210" rx="16" fill="#ffffff" strokeWidth="3" />


              <rect x="175" y="72" width="50" height="16" rx="8" fill="#c4b5fd" />

              <g className="form-content">
                <line className="f-line l1" x1="145" y1="120" x2="220" y2="120" stroke="#e5e7eb" strokeWidth="6"
                  strokeLinecap="round" pathLength="1" />
                <line className="f-line l2" x1="145" y1="145" x2="255" y2="145" stroke="#e5e7eb" strokeWidth="6"
                  strokeLinecap="round" pathLength="1" />
                <line className="f-line l3" x1="145" y1="170" x2="230" y2="170" stroke="#e5e7eb" strokeWidth="6"
                  strokeLinecap="round" pathLength="1" />
                <line className="f-line l4" x1="145" y1="195" x2="200" y2="195" stroke="#e5e7eb" strokeWidth="6"
                  strokeLinecap="round" pathLength="1" />
                <line className="f-line l5" x1="145" y1="220" x2="245" y2="220" stroke="#e5e7eb" strokeWidth="6"
                  strokeLinecap="round" pathLength="1" />


                <rect className="form-btn" x="145" y="245" width="80" height="24" rx="12" />


                <rect x="235" y="243" width="28" height="28" rx="6" fill="#8b5cf6" />
                <line x1="249" y1="249" x2="249" y2="265" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <line x1="241" y1="257" x2="257" y2="257" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              </g>

              <g className="success-group">
                <circle cx="200" cy="170" r="45" fill="#10b981" />
                <path className="s-check" d="M180 170 L195 185 L225 150" stroke="#ffffff" strokeWidth="7" fill="none"
                  strokeLinecap="round" strokeLinejoin="round" pathLength="1" />

                <line x1="165" y1="235" x2="235" y2="235" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
              </g>


              <g className="cursor">
                <path d="M0 0 L16 6 L10 11 L15 21 L11 23 L6 13 L0 19 Z" fill="#1f2937" stroke="#ffffff" strokeWidth="2"
                  strokeLinejoin="round" />
              </g>

              <g className="wave-bg-group">
                <path className="wave-bg"
                  d="M 0 340 Q 25 325, 50 340 T 100 340 T 150 340 T 200 340 T 250 340 T 300 340 T 350 340 T 400 340 T 450 340 T 500 340 V 400 H 0 Z"
                  fill="#e0f2fe" opacity="0.8" />
              </g>

              <g className="boat">
                <polygon points="0,-25 15,0 0,0" fill="#a78bfa" />

                <polygon points="0,-32 -20,0 0,0" fill="#c4b5fd" />

                <polygon points="-30,0 30,0 15,10 -20,10" fill="#ffffff" />

                <polygon points="-20,0 0,10 20,0" fill="#ede9fe" />
              </g>


              <g className="wave-fg-group">
                <path className="wave-fg"
                  d="M -200 350 Q -175 335, -150 350 T -100 350 T -50 350 T 0 350 T 50 350 T 100 350 T 150 350 T 200 350 T 250 350 T 300 350 T 350 350 T 400 350 T 450 350 T 500 350 V 400 H -200 Z"
                  fill="#bae6fd" opacity="0.9" />
              </g>
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
                                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer ${formData.carrier === c
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
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-display font-semibold rounded-full transition-all duration-300 cursor-pointer ${canNext()
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
