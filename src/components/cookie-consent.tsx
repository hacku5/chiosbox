"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";

export function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("cookie-consent")) setVisible(true);
    } catch {}
  }, []);

  function accept(all: boolean) {
    try {
      localStorage.setItem("cookie-consent", all ? "all" : "essential");
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-deep-sea-teal/10 p-6 pointer-events-auto"
      >
        <h4 className="font-display font-semibold text-deep-sea-teal mb-2">
          {t("cookie.title")}
        </h4>
        <p className="text-sm text-deep-sea-teal/60 mb-4 leading-relaxed">
          {t("cookie.text")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => accept(false)}
            className="px-5 py-2.5 border border-deep-sea-teal/20 text-deep-sea-teal rounded-xl text-sm font-medium hover:bg-deep-sea-teal/5 transition-colors cursor-pointer"
          >
            {t("cookie.essentialOnly")}
          </button>
          <button
            onClick={() => accept(true)}
            className="px-5 py-2.5 bg-chios-purple text-white rounded-xl text-sm font-semibold hover:bg-chios-purple/90 transition-colors cursor-pointer"
          >
            {t("cookie.acceptAll")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
