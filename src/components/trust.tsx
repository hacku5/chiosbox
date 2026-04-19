"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const stats = [
  { value: 2400, suffix: "+", label: "Aktif Kullanıcı", icon: "users" },
  { value: 18000, suffix: "+", label: "Teslim Edilen Paket", icon: "package" },
  { value: 99.2, suffix: "%", label: "Memnuniyet Oranı", icon: "star" },
  { value: 5, suffix: " gün", label: "Ortalama Teslimat", icon: "clock" },
];

function AnimatedCounter({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [display, setDisplay] = useState(0);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (value >= 1000) return Math.round(v).toLocaleString("tr-TR");
    if (value % 1 !== 0) return v.toFixed(1);
    return Math.round(v).toString();
  });

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, { duration: 2, ease: "easeOut" });
      const unsub = rounded.on("change", (v) => setDisplay(parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0));
      return () => { controls.stop(); unsub(); };
    }
  }, [inView, value, count, rounded]);

  return (
    <span>
      {inView ? (value >= 1000 ? Math.round(display).toLocaleString("tr-TR") : (value % 1 !== 0 ? display.toFixed(1) : Math.round(display).toString())) : "0"}{suffix}
    </span>
  );
}

const badges = [
  {
    title: "Yunanistan IKE Tescilli",
    description: "Resmi olarak kayıtlı şirket",
    color: "#5D3FD3",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-chios-purple">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: "SSL 256-bit Şifreleme",
    description: "Verileriniz güvende",
    color: "#22C55E",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-success-green">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Stripe Ödeme Altyapısı",
    description: "Güvenli online ödeme",
    color: "#F97316",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-orange">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    title: "AB Uyumlu",
    description: "Avrupa Birliği düzenlemelerine uygun",
    color: "#004953",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-deep-sea-teal">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    name: "Ayşe K.",
    location: "İstanbul",
    text: "Artık Türkiye'den aldığım her şeyi ChiosBox üzerinden yönetiyorum. Birleştirme özelliği sayesinde kargo maliyetlerim yarı yarıya düştü.",
    rating: 5,
  },
  {
    name: "Mehmet B.",
    location: "Ankara",
    text: "Panel çok kolay kullanılıyor. Paketlerimin fotoğrafını görüyorum, ne zaman geleceğini biliyorum. Harika bir hizmet!",
    rating: 5,
  },
  {
    name: "Elif S.",
    location: "İzmir",
    text: "QR kod ile teslim almak çok pratik. Ofise gittim, kodu gösterdim, 2 dakikada paketimi aldım. Kesinlikle tavsiye ediyorum.",
    rating: 5,
  },
];

function StatCard({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      className="relative group text-center"
    >
      <motion.div
        className="font-display text-3xl sm:text-4xl font-bold text-chios-purple"
        initial={{ scale: 0.8 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ delay: index * 0.12 + 0.2, type: "spring", stiffness: 200 }}
      >
        <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={isInView} />
      </motion.div>
      <div className="mt-2 text-sm text-deep-sea-teal/50">{stat.label}</div>
    </motion.div>
  );
}

export function Trust() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="guven" className="py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-chios-purple/[0.02] to-transparent" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-success-green/[0.04] rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-sunset-gold/[0.05] rounded-full blur-3xl" />

      <div ref={ref} className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-block px-4 py-2 bg-success-green/10 rounded-full text-sm font-medium text-success-green mb-4 border border-success-green/10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Güvenilir & Şeffaf
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-deep-sea-teal">
            Bize Güvenin
          </h2>
          <p className="mt-3 text-deep-sea-teal/60 max-w-lg mx-auto">
            Binlerce kullanıcı ChiosBox ile Türkiye&apos;den Avrupa&apos;ya güvenle
            alışveriş yapıyor.
          </p>
        </motion.div>

        {/* Stats with animated counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        {/* Badges with hover glow */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative bg-white rounded-2xl p-5 border border-deep-sea-teal/5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-default overflow-hidden"
            >
              {/* Hover glow */}
              <div
                className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${badge.color}08, transparent 70%)`,
                }}
              />
              <div className="relative">
                <div className="mb-3 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${badge.color}10` }}>
                  {badge.icon}
                </div>
                <h4 className="font-display text-sm font-semibold text-deep-sea-teal">
                  {badge.title}
                </h4>
                <p className="text-xs text-deep-sea-teal/50 mt-1">
                  {badge.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} testimonial={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial: t, index }: { testimonial: (typeof testimonials)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-6 border border-deep-sea-teal/5 shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      {/* Quote icon */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-chios-purple/15 mb-3">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="currentColor" />
      </svg>

      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: t.rating }).map((_, si) => (
          <motion.svg
            key={si}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="#FFCF7E"
            stroke="#FFCF7E"
            strokeWidth="1"
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3 + index * 0.15 + si * 0.05, type: "spring" }}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </motion.svg>
        ))}
      </div>
      <p className="text-sm text-deep-sea-teal/70 leading-relaxed mb-4">
        &ldquo;{t.text}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-chios-purple/10 flex items-center justify-center">
          <span className="text-xs font-semibold text-chios-purple">
            {t.name[0]}
          </span>
        </div>
        <div>
          <div className="text-sm font-semibold text-deep-sea-teal">
            {t.name}
          </div>
          <div className="text-xs text-deep-sea-teal/40">
            {t.location}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
