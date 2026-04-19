"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Alışveriş Yapın",
    description:
      "Türkiye'deki herhangi bir e-ticaret sitesinden alışveriş yapın. ChiosBox adresinizi teslimat adresi olarak kullanın.",
    gradient: "from-chios-purple/15 to-chios-purple/5",
    accentColor: "#5D3FD3",
    illustration: (
      <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
        <rect x="30" y="25" width="60" height="50" rx="6" fill="#5D3FD3" opacity="0.1" />
        <rect x="35" y="30" width="50" height="40" rx="4" stroke="#5D3FD3" strokeWidth="1.5" opacity="0.6" />
        <path d="M35 42H85" stroke="#5D3FD3" strokeWidth="1" opacity="0.3" />
        <path d="M55 30V70" stroke="#5D3FD3" strokeWidth="1" opacity="0.3" />
        {/* Shopping bag */}
        <path d="M52 52L48 68H72L68 52" stroke="#5D3FD3" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M54 52V48C54 44 58 42 60 42C62 42 66 44 66 48V52" stroke="#5D3FD3" strokeWidth="1.5" opacity="0.5" />
        {/* Sparkle */}
        <circle cx="78" cy="32" r="2" fill="#FFCF7E" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
  },
  {
    number: "02",
    title: "Depomuza Gelsin",
    description:
      "Paketleriniz Sakız Adası'ndaki güvenli depomuza ulaşır. Barkod okutulur ve sistemde kayda girer.",
    gradient: "from-deep-sea-teal/15 to-deep-sea-teal/5",
    accentColor: "#004953",
    illustration: (
      <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
        {/* Warehouse */}
        <rect x="25" y="40" width="70" height="40" rx="4" fill="#004953" opacity="0.08" />
        <path d="M20 44L60 25L100 44" stroke="#004953" strokeWidth="1.5" opacity="0.5" />
        <rect x="30" y="44" width="60" height="36" rx="2" stroke="#004953" strokeWidth="1.2" opacity="0.4" />
        {/* Door */}
        <rect x="48" y="58" width="24" height="22" rx="2" fill="#004953" opacity="0.15" />
        {/* Boxes inside */}
        <rect x="34" y="50" width="10" height="10" rx="1.5" fill="#5D3FD3" opacity="0.3" />
        <rect x="76" y="50" width="10" height="10" rx="1.5" fill="#FFCF7E" opacity="0.4" />
        {/* Arrow coming in */}
        <motion.g
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <path d="M60 18V28M56 24L60 28L64 24" stroke="#5D3FD3" strokeWidth="1.5" opacity="0.4" />
        </motion.g>
      </svg>
    ),
  },
  {
    number: "03",
    title: "Fotoğraf Onayı",
    description:
      "Depo görevlisi paketinizin fotoğrafını çeker. Panelinizden paketinizi görür, içeriğini doğrularsınız.",
    gradient: "from-sunset-gold/20 to-sunset-gold/5",
    accentColor: "#F97316",
    illustration: (
      <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
        {/* Camera body */}
        <rect x="30" y="35" width="50" height="38" rx="6" fill="#F97316" opacity="0.1" stroke="#F97316" strokeWidth="1.2" />
        {/* Lens */}
        <circle cx="55" cy="54" r="12" stroke="#F97316" strokeWidth="1.5" opacity="0.5" />
        <circle cx="55" cy="54" r="7" fill="#F97316" opacity="0.15" />
        <circle cx="55" cy="54" r="3" fill="#F97316" opacity="0.3" />
        {/* Flash */}
        <rect x="68" y="38" width="8" height="5" rx="1.5" fill="#FFCF7E" opacity="0.5">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
        </rect>
        {/* Viewfinder */}
        <rect x="38" y="38" width="10" height="6" rx="1" fill="#F97316" opacity="0.2" />
        {/* Flash lines */}
        {[0, 1, 2].map((i) => (
          <line key={i} x1={78 + i * 6} y1={42 - i * 2} x2={82 + i * 6} y2={46 - i * 2} stroke="#FFCF7E" strokeWidth="1" opacity="0">
            <animate attributeName="opacity" values="0;0.5;0" dur="3s" begin={`${i * 0.1}s`} repeatCount="indefinite" />
          </line>
        ))}
      </svg>
    ),
  },
  {
    number: "04",
    title: "Teslim Alın",
    description:
      "Paketlerinizi birleştirin, tasarruf edin. QR kodunuzu gösterin, adanızda teslim alın. Bu kadar basit!",
    gradient: "from-success-green/15 to-success-green/5",
    accentColor: "#22C55E",
    illustration: (
      <svg viewBox="0 0 120 100" fill="none" className="w-full h-full">
        {/* Hand */}
        <path d="M45 60C45 60 40 55 38 50C36 45 38 40 42 38" stroke="#22C55E" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
        {/* Package in hand */}
        <rect x="42" y="42" width="28" height="22" rx="3" fill="#22C55E" opacity="0.12" stroke="#22C55E" strokeWidth="1.2" />
        <path d="M42 53H70" stroke="#22C55E" strokeWidth="0.8" opacity="0.3" />
        <path d="M56 42V64" stroke="#22C55E" strokeWidth="0.8" opacity="0.3" />
        {/* Checkmark */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <circle cx="80" cy="38" r="10" fill="#22C55E" opacity="0.15" />
          <path d="M75 38L78 42L86 34" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </motion.g>
        {/* Sparkles */}
        <circle cx="88" cy="30" r="1.5" fill="#FFCF7E" opacity="0.5">
          <animate attributeName="opacity" values="0.2;0.7;0.2" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="74" cy="28" r="1" fill="#22C55E" opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.2s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
  },
];

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
      className="relative group"
    >
      {/* Connector line */}
      {index < steps.length - 1 && (
        <div className="absolute left-8 top-full w-[2px] h-12 bg-gradient-to-b from-deep-sea-teal/10 to-transparent" />
      )}

      <div className={`relative bg-white rounded-3xl p-6 shadow-sm border border-deep-sea-teal/5 hover:shadow-lg hover:border-deep-sea-teal/10 transition-all duration-300 overflow-hidden cursor-pointer`}>
        {/* Background gradient accent */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${step.gradient} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />

        <div className="relative flex items-start gap-5">
          {/* Illustration */}
          <div className="flex-shrink-0 w-24 h-20 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            {step.illustration}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-display font-bold text-white"
                style={{ backgroundColor: step.accentColor, opacity: 0.85 }}
              >
                {step.number}
              </span>
              <h3 className="font-display text-lg font-semibold text-deep-sea-teal">
                {step.title}
              </h3>
            </div>
            <p className="text-sm text-deep-sea-teal/55 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Arrow indicator */}
          <motion.div
            className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={step.accentColor} strokeWidth="2" opacity="0.4">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const sectionRef = useRef(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="nasil-calisir" className="py-24 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-chios-purple/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-deep-sea-teal/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div ref={sectionRef} className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-block px-4 py-2 bg-chios-purple/10 rounded-full text-sm font-medium text-chios-purple mb-4 border border-chios-purple/10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={sectionInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Kolay & Hızlı
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-deep-sea-teal">
            Nasıl Çalışır?
          </h2>
          <p className="mt-3 text-deep-sea-teal/60 max-w-lg mx-auto">
            Dört basit adımda Türkiye&apos;den Avrupa&apos;ya kargo teslimatınızı
            yönetin.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
