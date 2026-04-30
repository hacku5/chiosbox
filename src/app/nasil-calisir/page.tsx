"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import Link from "next/link";

const STEPS = [
  { key: "step1", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", title: "howItWorks.step1.title", desc: "howItWorks.step1.description" },
  { key: "step2", icon: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 13a3 3 0 100-6 3 3 0 000 6z", title: "howItWorks.step2.title", desc: "howItWorks.step2.description" },
  { key: "step3", icon: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z", title: "howItWorks.step3.title", desc: "howItWorks.step3.description" },
  { key: "step4", icon: "M5 12h14M12 5l7 7-7 7", title: "howItWorks.step4.title", desc: "howItWorks.step4.desc" },
];

export default function HowItWorksPage() {
  const { t } = useTranslation();

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } };
  const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } };

  return (
    <div className="min-h-screen bg-mastic-white">
      <div className="pt-24 pb-16 px-6 lg:px-8">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto">
          <motion.div variants={item} className="text-center mb-16">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-deep-sea-teal">{t("howItWorks.title")}</h1>
            <p className="mt-4 text-deep-sea-teal/60 max-w-lg mx-auto">{t("howItWorks.description")}</p>
          </motion.div>

          <div className="space-y-0">
            {STEPS.map((step, i) => (
              <motion.div key={step.key} variants={item}
                className="relative flex gap-6 pb-12 last:pb-0">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[27px] top-14 bottom-0 w-px bg-chios-purple/15" />
                )}
                {/* Icon */}
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-chios-purple text-white flex items-center justify-center shrink-0 shadow-lg shadow-chios-purple/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d={step.icon} />
                  </svg>
                </div>
                {/* Content */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-chios-purple/50 uppercase tracking-wider">{t("howItWorks.stepLabel", { step: i + 1 })}</span>
                  <h3 className="text-xl font-display font-bold text-deep-sea-teal mt-1">{t(step.title)}</h3>
                  <p className="text-deep-sea-teal/50 mt-2 leading-relaxed">{t(step.desc)}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={item} className="text-center mt-16 p-8 bg-chios-purple rounded-2xl text-white shadow-lg shadow-chios-purple/20">
            <h2 className="font-display text-2xl font-bold">{t("howItWorks.ctaTitle")}</h2>
            <p className="mt-2 text-white/70">{t("howItWorks.ctaText")}</p>
            <Link href="/register" className="inline-block mt-6 px-8 py-3 bg-white text-chios-purple rounded-xl font-semibold hover:bg-white/90 transition-colors cursor-pointer">
              {t("howItWorks.ctaButton")}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
