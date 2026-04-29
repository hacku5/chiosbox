"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/user";
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push(redirectedFrom);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.form
      variants={container}
      initial="hidden"
      animate="show"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-danger-red/10 px-4 py-3 text-sm text-danger-red"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email */}
      <motion.div variants={item}>
        <label className="block text-sm font-medium text-deep-sea-teal mb-1.5">
          {t("login.email")}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="ornek@email.com"
          className="w-full px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-white text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/50 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200"
        />
      </motion.div>

      {/* Password */}
      <motion.div variants={item}>
        <label className="block text-sm font-medium text-deep-sea-teal mb-1.5">
          {t("login.password")}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-white text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/50 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-deep-sea-teal/30 hover:text-deep-sea-teal/60 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </motion.div>

      {/* Remember me + Forgot */}
      <motion.div variants={item} className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-deep-sea-teal/20 text-chios-purple focus:ring-chios-purple/20 cursor-pointer"
          />
          <span className="text-xs text-deep-sea-teal/50">{t("login.rememberMe")}</span>
        </label>
        <a href="#" className="text-xs text-chios-purple hover:text-chios-purple-dark transition-colors cursor-pointer">
          {t("login.forgotPassword")}
        </a>
      </motion.div>

      {/* Submit */}
      <motion.div variants={item}>
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 bg-chios-purple text-white font-display font-semibold rounded-xl hover:bg-chios-purple-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shadow-lg shadow-chios-purple/20"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 019.95 9" strokeLinecap="round" />
              </svg>
              {t("login.submitting")}
            </span>
          ) : (
            t("login.submit")
          )}
        </motion.button>
      </motion.div>

      {/* Register link */}
      <motion.p variants={item} className="text-center text-sm text-deep-sea-teal/40">
        {t("login.noAccount")}{" "}
        <a href="/register" className="text-chios-purple font-medium hover:text-chios-purple-dark transition-colors cursor-pointer">
          {t("login.registerLink")}
        </a>
      </motion.p>
    </motion.form>
  );
}
