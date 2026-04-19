"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { PlanSelector } from "./plan-selector";
import { useSearchParams, useRouter } from "next/navigation";

export function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedPlan = searchParams.get("plan")?.toUpperCase() || "TEMEL";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [plan, setPlan] = useState(preselectedPlan);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const register = useAuthStore((s) => s.register);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    if (!tosAccepted) {
      setError("Kullanım koşullarını kabul etmelisiniz");
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, plan);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 1500);
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
    <AnimatePresence mode="wait">
      {success ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-success-green/10 flex items-center justify-center mb-4"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round">
              <motion.path
                d="M20 6L9 17l-5-5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
            </svg>
          </motion.div>
          <h3 className="font-display text-lg font-semibold text-deep-sea-teal">
            Kayıt Başarılı!
          </h3>
          <p className="text-sm text-deep-sea-teal/50 mt-1">
            Yönlendiriliyorsunuz...
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
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

          {/* Name */}
          <motion.div variants={item}>
            <label className="block text-sm font-medium text-deep-sea-teal mb-1.5">
              Ad Soyad
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Adınız Soyadınız"
              className="w-full px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-white text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/50 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200"
            />
          </motion.div>

          {/* Email */}
          <motion.div variants={item}>
            <label className="block text-sm font-medium text-deep-sea-teal mb-1.5">
              E-posta
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
              Şifre
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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

          {/* Password Confirm */}
          <motion.div variants={item}>
            <label className="block text-sm font-medium text-deep-sea-teal mb-1.5">
              Şifre Tekrar
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-white text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/50 focus:ring-2 focus:ring-chios-purple/10 transition-all duration-200"
            />
          </motion.div>

          {/* Plan Selection */}
          <motion.div variants={item}>
            <label className="block text-sm font-medium text-deep-sea-teal mb-2">
              Plan Seçin
            </label>
            <PlanSelector selected={plan} onSelect={setPlan} />
          </motion.div>

          {/* ToS Checkbox */}
          <motion.div variants={item} className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="tos"
              checked={tosAccepted}
              onChange={(e) => setTosAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-deep-sea-teal/20 text-chios-purple focus:ring-chios-purple/20 cursor-pointer"
            />
            <label htmlFor="tos" className="text-xs text-deep-sea-teal/50 leading-relaxed cursor-pointer">
              Kullanım koşullarını ve gizlilik politikasını okudum, kabul ediyorum.
            </label>
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
                  Kayıt Yapılıyor...
                </span>
              ) : (
                "Kayıt Ol"
              )}
            </motion.button>
          </motion.div>

          {/* Login link */}
          <motion.p variants={item} className="text-center text-sm text-deep-sea-teal/40">
            Zaten hesabınız var mı?{" "}
            <a href="/login" className="text-chios-purple font-medium hover:text-chios-purple-dark transition-colors cursor-pointer">
              Giriş Yapın
            </a>
          </motion.p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
