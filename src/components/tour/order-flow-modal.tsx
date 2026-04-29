"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTourStore, ORDER_FLOW_STEPS } from "@/stores/tour-store";
import { useTranslation } from "@/hooks/use-translation";

const STEP_SVGS = [
  // Step 1: Browse website
  (
    <svg key="s1" width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="15" y="20" width="90" height="70" rx="8" stroke="#5D3FD3" strokeWidth="2" fill="#5D3FD3/5" />
      <rect x="15" y="20" width="90" height="16" rx="8" fill="#5D3FD3/10" />
      <circle cx="28" cy="28" r="3" fill="#EF4444" />
      <circle cx="38" cy="28" r="3" fill="#F59E0B" />
      <circle cx="48" cy="28" r="3" fill="#22C55E" />
      <rect x="25" y="44" width="30" height="20" rx="4" fill="#5D3FD3/10" stroke="#5D3FD3" strokeWidth="1" />
      <rect x="60" y="44" width="35" height="8" rx="2" fill="#5D3FD3/15" />
      <rect x="60" y="56" width="25" height="6" rx="2" fill="#5D3FD3/10" />
      <rect x="30" y="80" width="60" height="4" rx="2" fill="#5D3FD3/10" />
      <path d="M50 100 L60 90 L70 100" stroke="#5D3FD3" strokeWidth="2" fill="none" />
    </svg>
  ),
  // Step 2: Select & purchase (shopping cart)
  (
    <svg key="s2" width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="25" y="25" width="45" height="35" rx="6" fill="#5D3FD3/10" stroke="#5D3FD3" strokeWidth="1.5" />
      <path d="M30 35 L55 35" stroke="#5D3FD3" strokeWidth="1" opacity="0.5" />
      <path d="M30 42 L50 42" stroke="#5D3FD3" strokeWidth="1" opacity="0.5" />
      <rect x="60" y="50" width="35" height="25" rx="4" fill="#22C55E/10" stroke="#22C55E" strokeWidth="1.5" />
      <polyline points="68,62 73,67 83,57" stroke="#22C55E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M35 70 C35 70 40 80 60 80 L85 80" stroke="#5D3FD3" strokeWidth="1.5" strokeDasharray="4 3" />
      <circle cx="85" cy="80" r="4" fill="#5D3FD3/20" />
    </svg>
  ),
  // Step 3: Seller ships (truck)
  (
    <svg key="s3" width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="20" y="40" width="50" height="35" rx="4" fill="#5D3FD3/10" stroke="#5D3FD3" strokeWidth="1.5" />
      <rect x="70" y="50" width="25" height="25" rx="4" fill="#5D3FD3/15" stroke="#5D3FD3" strokeWidth="1.5" />
      <path d="M70 55 L80 40 L95 40 L95 55" stroke="#5D3FD3" strokeWidth="1.5" fill="none" />
      <circle cx="35" cy="80" r="7" fill="#5D3FD3/10" stroke="#5D3FD3" strokeWidth="2" />
      <circle cx="35" cy="80" r="3" fill="#5D3FD3/20" />
      <circle cx="82" cy="80" r="7" fill="#5D3FD3/10" stroke="#5D3FD3" strokeWidth="2" />
      <circle cx="82" cy="80" r="3" fill="#5D3FD3/20" />
      <rect x="30" y="48" width="15" height="12" rx="2" fill="#F59E0B/20" stroke="#F59E0B" strokeWidth="1" />
      <path d="M33 54 L37 58 L42 51" stroke="#F59E0B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  ),
  // Step 4: Tracking number (barcode + number)
  (
    <svg key="s4" width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="20" y="30" width="80" height="50" rx="8" fill="white" stroke="#5D3FD3" strokeWidth="1.5" />
      <rect x="30" y="40" width="3" height="25" fill="#5D3FD3" />
      <rect x="36" y="40" width="2" height="25" fill="#5D3FD3" />
      <rect x="41" y="40" width="4" height="25" fill="#5D3FD3" />
      <rect x="48" y="40" width="2" height="25" fill="#5D3FD3" />
      <rect x="53" y="40" width="3" height="25" fill="#5D3FD3" />
      <rect x="59" y="40" width="2" height="25" fill="#5D3FD3" />
      <rect x="64" y="40" width="4" height="25" fill="#5D3FD3" />
      <rect x="71" y="40" width="2" height="25" fill="#5D3FD3" />
      <rect x="76" y="40" width="3" height="25" fill="#5D3FD3" />
      <rect x="82" y="40" width="2" height="25" fill="#5D3FD3" />
      <rect x="87" y="40" width="3" height="25" fill="#5D3FD3" />
      <text x="60" y="78" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#5D3FD3">TR-2026-0042</text>
      <circle cx="90" cy="35" r="10" fill="#22C55E/10" stroke="#22C55E" strokeWidth="1.5" />
      <polyline points="86,35 89,38 95,32" stroke="#22C55E" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),
  // Step 5: Ready to report (package + arrow)
  (
    <svg key="s5" width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="25" y="35" width="45" height="40" rx="4" fill="#5D3FD3/10" stroke="#5D3FD3" strokeWidth="1.5" />
      <path d="M25 45 L47.5 55 L70 45" stroke="#5D3FD3" strokeWidth="1.5" fill="none" />
      <line x1="47.5" y1="55" x2="47.5" y2="75" stroke="#5D3FD3" strokeWidth="1.5" />
      <path d="M75 55 L90 55" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M85 50 L90 55 L85 60" stroke="#22C55E" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="90" cy="75" r="15" fill="#22C55E/10" stroke="#22C55E" strokeWidth="2" />
      <polyline points="83,75 88,80 97,71" stroke="#22C55E" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
];

export function OrderFlowModal() {
  const { t } = useTranslation();
  const { showOrderFlow, orderFlowStep, nextOrderFlowStep, closeOrderFlow } = useTourStore();

  if (!showOrderFlow) return null;

  const isLast = orderFlowStep === ORDER_FLOW_STEPS - 1;
  const stepNum = orderFlowStep + 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-deep-sea-teal/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={closeOrderFlow}
      >
        <motion.div
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-deep-sea-teal">
                {t("tour.orderFlow.title")}
              </h2>
              <button
                onClick={closeOrderFlow}
                className="w-8 h-8 rounded-full bg-deep-sea-teal/5 flex items-center justify-center hover:bg-deep-sea-teal/10 transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-deep-sea-teal/40">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Step dots */}
            <div className="flex items-center gap-2">
              {Array.from({ length: ORDER_FLOW_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                    i <= orderFlowStep ? "bg-chios-purple" : "bg-deep-sea-teal/10"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={orderFlowStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="px-6 pb-2"
            >
              <div className="flex flex-col items-center text-center">
                {/* SVG illustration */}
                <div className="mb-5">
                  {STEP_SVGS[orderFlowStep]}
                </div>

                {/* Step number */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-chios-purple/10 rounded-full mb-3">
                  <span className="text-xs font-bold text-chios-purple">{stepNum}/{ORDER_FLOW_STEPS}</span>
                </div>

                {/* Title */}
                <h3 className="font-display text-xl font-bold text-deep-sea-teal mb-2">
                  {t(`tour.orderFlow.step${stepNum}.title`)}
                </h3>

                {/* Description */}
                <p className="text-sm text-deep-sea-teal/60 leading-relaxed max-w-sm">
                  {t(`tour.orderFlow.step${stepNum}.content`)}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="px-6 py-5 flex items-center justify-between">
            <button
              onClick={closeOrderFlow}
              className="text-sm text-deep-sea-teal/40 hover:text-deep-sea-teal transition-colors cursor-pointer"
            >
              {t("tour.skip")}
            </button>
            <button
              onClick={nextOrderFlowStep}
              className="px-6 py-2.5 bg-chios-purple text-white text-sm font-semibold rounded-xl hover:bg-chios-purple-dark transition-colors cursor-pointer"
            >
              {isLast ? t("tour.orderFlow.finish") : t("tour.orderFlow.next")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
