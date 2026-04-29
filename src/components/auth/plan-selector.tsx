"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

interface PlanOption {
  id: string;
  name: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
}

interface PlanSelectorProps {
  selected: string;
  onSelect: (plan: string) => void;
}

export function PlanSelector({ selected, onSelect }: PlanSelectorProps) {
  const { t } = useTranslation();
  const [planPrices, setPlanPrices] = useState({ temel: 9.99, premium: 24.99 });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setPlanPrices({
            temel: Number(data.settings.plan_price_temel) || 9.99,
            premium: Number(data.settings.plan_price_premium) || 24.99,
          });
        }
      })
      .catch(() => {/* use defaults */});
  }, []);

  const plans: PlanOption[] = [
    {
      id: "TEMEL",
      name: t("planSelector.temel.name"),
      price: `€${planPrices.temel.toFixed(2)}`,
      period: t("planSelector.period"),
      features: [
        t("planSelector.temel.f1"),
        t("planSelector.temel.f2"),
        t("planSelector.temel.f3"),
        t("planSelector.temel.f4"),
      ],
    },
    {
      id: "PREMIUM",
      name: t("planSelector.premium.name"),
      price: `€${planPrices.premium.toFixed(2)}`,
      period: t("planSelector.period"),
      badge: t("planSelector.premium.badge"),
      features: [
        t("planSelector.premium.f1"),
        t("planSelector.premium.f2"),
        t("planSelector.premium.f3"),
        t("planSelector.premium.f4"),
        t("planSelector.premium.f5"),
      ],
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {plans.map((plan) => (
        <motion.button
          key={plan.id}
          type="button"
          onClick={() => onSelect(plan.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer border-2 ${
            selected === plan.id
              ? "border-chios-purple bg-chios-purple/[0.04] shadow-md shadow-chios-purple/10"
              : "border-deep-sea-teal/10 bg-white hover:border-deep-sea-teal/20"
          }`}
        >
          {plan.badge && (
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-sunset-gold text-deep-sea-teal text-[10px] font-bold rounded-full whitespace-nowrap">
              {plan.badge}
            </span>
          )}

          <div className="font-display font-semibold text-deep-sea-teal text-sm">
            {plan.name}
          </div>
          <div className="mt-1 flex items-baseline gap-0.5">
            <span className="text-lg font-display font-bold text-chios-purple">
              {plan.price}
            </span>
            <span className="text-xs text-deep-sea-teal/40">{plan.period}</span>
          </div>

          <ul className="mt-3 space-y-1.5">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-deep-sea-teal/60">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-success-green flex-shrink-0 mt-0.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          {selected === plan.id && (
            <motion.div
              layoutId="plan-check"
              className="absolute top-3 right-3 w-5 h-5 rounded-full bg-chios-purple flex items-center justify-center"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}
