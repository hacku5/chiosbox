"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HeroAnimation } from "./hero-animation";

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{
        y: [0, -20, 0],
        scale: [1, 1.05, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function FloatingShape({ children, delay = 0, x = 0, y = 0 }: { children: React.ReactNode; delay?: number; x?: number; y?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [0, -15, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 5 + delay,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Rich gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-mastic-white via-white to-chios-purple/[0.05]" />
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-chios-purple/[0.06] via-sunset-gold/[0.04] to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-deep-sea-teal/[0.04] via-chios-purple/[0.03] to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-sunset-gold/[0.05] rounded-full blur-3xl" />
      </div>

      {/* Floating decorative shapes */}
      <FloatingShape x={5} y={15} delay={0}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-[0.12]">
          <rect width="48" height="48" rx="12" fill="#5D3FD3" />
          <rect x="10" y="10" width="28" height="28" rx="6" stroke="white" strokeWidth="2" />
        </svg>
      </FloatingShape>
      <FloatingShape x={85} y={20} delay={1.5}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="opacity-[0.1]">
          <circle cx="18" cy="18" r="18" fill="#FFCF7E" />
          <circle cx="18" cy="18" r="10" stroke="white" strokeWidth="1.5" />
        </svg>
      </FloatingShape>
      <FloatingShape x={90} y={70} delay={2}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="opacity-[0.08]">
          <path d="M16 0L32 16L16 32L0 16Z" fill="#004953" />
        </svg>
      </FloatingShape>
      <FloatingShape x={10} y={75} delay={0.8}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="opacity-[0.1]">
          <rect width="28" height="28" rx="8" fill="#5D3FD3" transform="rotate(15 14 14)" />
        </svg>
      </FloatingShape>

      {/* Floating orbs */}
      <FloatingOrb className="w-64 h-64 bg-chios-purple/[0.07] top-20 left-10" delay={0} />
      <FloatingOrb className="w-48 h-48 bg-sunset-gold/[0.06] bottom-20 right-20" delay={2} />
      <FloatingOrb className="w-32 h-32 bg-deep-sea-teal/[0.05] top-1/2 left-1/2" delay={4} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle, #004953 1px, transparent 1px)`,
        backgroundSize: '32px 32px'
      }} />

      <div className="relative mx-auto max-w-6xl px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text side */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-chios-purple/10 backdrop-blur-sm rounded-full mb-6 border border-chios-purple/10"
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-chios-purple"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-chios-purple">
              Türkiye → AB Kargo Kolaylığı
            </span>
          </motion.div>

          <motion.h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-deep-sea-teal leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Avrupa Teslimat
            <br />
            Adresiniz{" "}
            <span className="relative inline-block">
              <span className="text-chios-purple relative z-10">Hazır</span>
              <motion.svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                <motion.path
                  d="M2 8C30 3 60 10 100 6C140 2 170 9 198 4"
                  stroke="#5D3FD3"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                />
              </motion.svg>
              <motion.div
                className="absolute -inset-2 bg-chios-purple/[0.08] rounded-lg blur-xl"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg text-deep-sea-teal/60 leading-relaxed max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Türkiye&apos;den alışveriş yapın, paketleriniz Sakız
            Adası&apos;ndaki depomuza gelsin. Birleştirin, tasarruf edin,
            kapınıza teslim edelim.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center px-7 py-3.5 bg-chios-purple text-white font-display font-semibold rounded-full transition-all duration-300 shadow-lg shadow-chios-purple/25 hover:shadow-xl hover:shadow-chios-purple/30 cursor-pointer overflow-hidden"
              >
                <span className="relative z-10">Hemen Adresini Al</span>
                <motion.svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="ml-2 relative z-10"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </motion.svg>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-chios-purple-dark to-chios-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <a
                href="#nasil-calisir"
                className="inline-flex items-center justify-center px-7 py-3.5 border-2 border-deep-sea-teal/10 text-deep-sea-teal font-display font-semibold rounded-full hover:border-chios-purple/30 hover:text-chios-purple hover:bg-chios-purple/[0.03] transition-all duration-300 cursor-pointer backdrop-blur-sm"
              >
                Nasıl Çalışır?
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-6 text-sm text-deep-sea-teal/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            {[
              { icon: "M20 6L9 17l-5-5", text: "€9.99/ay'dan başlayan fiyatlarla" },
              { icon: "M20 6L9 17l-5-5", text: "Anında adres" },
              { icon: "M20 6L9 17l-5-5", text: "Kapıdan kapıya teslimat" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
              >
                <div className="w-5 h-5 rounded-full bg-success-green/10 flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3">
                    <path d={item.icon} />
                  </svg>
                </div>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Animation side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="relative flex justify-center lg:justify-end"
        >
          {/* Glow behind animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-80 h-80 bg-chios-purple/[0.08] rounded-full blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="relative z-10">
            <HeroAnimation />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
