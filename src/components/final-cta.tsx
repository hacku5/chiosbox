"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

function FloatingPackage({ delay, x, y, size = 20 }: { delay: number; x: string; y: string; size?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.15, 0.15, 0],
        y: [0, -40, -80, -120],
        rotate: [0, 15, -10, 5],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    </motion.div>
  );
}

function RouteLine() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 1 }}
    >
      <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none" fill="none">
        {/* Dashed route line */}
        <motion.path
          d="M100 350C200 300 300 200 400 180C500 160 600 200 700 150"
          stroke="white"
          strokeWidth="1"
          strokeDasharray="8 12"
          opacity="0.08"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 0.8 }}
        />
        {/* Glowing dot traveling along the route */}
        <motion.circle
          r="3"
          fill="#FFCF7E"
          opacity="0.3"
          initial={{ cx: 100, cy: 350 }}
          animate={{ cx: [100, 400, 700], cy: [350, 180, 150] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
}

export function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-chios-purple via-chios-purple-dark to-deep-sea-teal" />

      {/* Mesh gradient overlays */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.04] rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-sunset-gold/[0.08] rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-deep-sea-teal/[0.06] rounded-full blur-3xl" />

      {/* Animated route line */}
      <RouteLine />

      {/* Floating packages */}
      <FloatingPackage delay={0} x="10%" y="70%" size={24} />
      <FloatingPackage delay={2} x="85%" y="60%" size={18} />
      <FloatingPackage delay={4} x="50%" y="80%" size={20} />
      <FloatingPackage delay={1} x="25%" y="50%" size={16} />
      <FloatingPackage delay={3} x="75%" y="40%" size={22} />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating sparkles */}
      {[
        { cx: "15%", cy: "20%", dur: "2.5s" },
        { cx: "80%", cy: "30%", dur: "3s" },
        { cx: "45%", cy: "15%", dur: "2s" },
        { cx: "65%", cy: "75%", dur: "2.8s" },
      ].map((s, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-sunset-gold rounded-full"
          style={{ left: s.cx, top: s.cy }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: parseFloat(s.dur),
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}

      <div ref={ref} className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          {/* Animated icon */}
          <motion.div
            className="mx-auto mb-8 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center"
            initial={{ scale: 0, rotate: -20 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <motion.svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </motion.svg>
          </motion.div>

          <motion.span
            className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/80 mb-6 border border-white/10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {t("finalCta.title")}
          </motion.span>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            {t("finalCta.description")}
            <br />
            <span className="relative inline-block">
              <span className="text-sunset-gold relative z-10">{t("finalCta.cta")}</span>
              <motion.div
                className="absolute -inset-3 bg-sunset-gold/[0.15] rounded-lg blur-xl"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </span>
          </h2>

          <p className="mt-6 text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
            {t("finalCta.cta2")}
          </p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-chios-purple font-display font-bold text-lg rounded-full transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-2xl cursor-pointer overflow-hidden"
              >
                <span className="relative z-10">{t("finalCta.cta")}</span>
                <motion.svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="ml-2 relative z-10"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </motion.svg>
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
                  animate={{ x: ["0%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-sunset-gold to-sunset-gold/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {[
              { icon: "M20 6L9 17l-5-5", text: t("finalCta.trust1") },
              { icon: "M20 6L9 17l-5-5", text: t("finalCta.trust2") },
              { icon: "M20 6L9 17l-5-5", text: t("finalCta.trust3") },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
              >
                <div className="w-5 h-5 rounded-full bg-success-green/20 flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3">
                    <path d={item.icon} />
                  </svg>
                </div>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
