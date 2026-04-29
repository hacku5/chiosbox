"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

export function StorageCountdown({ daysLeft, packageCount = 0 }: { daysLeft: number; packageCount?: number }) {
  const { t } = useTranslation();
  const circumference = 2 * Math.PI * 42;

  // No packages — green checkmark
  if (packageCount === 0) {
    return (
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-success-green/10" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={0} className="text-success-green" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-success-green">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
    );
  }

  const percentage = Math.max(0, Math.min(100, (daysLeft / 14) * 100));
  const isWarning = daysLeft <= 5;
  const isOverdue = daysLeft <= 0;

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
          className={isOverdue ? "text-danger-red/10" : "text-deep-sea-teal/5"}
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
            isOverdue ? "text-danger-red" : isWarning ? "text-sunset-gold" : "text-chios-purple"
          }`}
          style={
            isOverdue
              ? { filter: "drop-shadow(0 0 6px rgba(239, 68, 68, 0.4))" }
              : isWarning
              ? { filter: "drop-shadow(0 0 6px rgba(255, 207, 126, 0.4))" }
              : undefined
          }
        >
          {(isWarning || isOverdue) && (
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
            isOverdue ? "text-danger-red" : isWarning ? "text-sunset-gold" : "text-deep-sea-teal"
          }`}
        >
          {isOverdue ? "!" : daysLeft}
        </span>
        <span className="text-[10px] text-deep-sea-teal/40 -mt-0.5">
          {isOverdue ? t("dashboard.overdue") : t("common.days")}
        </span>
      </div>
    </div>
  );
}
