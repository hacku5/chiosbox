"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

export function StorageCountdown({ daysLeft }: { daysLeft: number }) {
  const { t } = useTranslation();
  const percentage = Math.max(0, Math.min(100, (daysLeft / 14) * 100));
  const isWarning = daysLeft <= 5;
  const circumference = 2 * Math.PI * 42;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-deep-sea-teal/5"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (percentage / 100) * circumference}
          className={`transition-all duration-500 ${
            isWarning ? "text-sunset-gold" : "text-chios-purple"
          }`}
          style={
            isWarning
              ? { filter: "drop-shadow(0 0 6px rgba(255, 207, 126, 0.4))" }
              : undefined
          }
        >
          {isWarning && (
            <animate
              attributeName="opacity"
              values="1;0.6;1"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-display text-2xl font-bold ${
            isWarning ? "text-sunset-gold" : "text-deep-sea-teal"
          }`}
        >
          {daysLeft}
        </span>
        <span className="text-[10px] text-deep-sea-teal/40 -mt-0.5">
          {t("common.days")}
        </span>
      </div>
    </div>
  );
}
