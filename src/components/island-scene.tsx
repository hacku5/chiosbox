"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useRef } from "react";

/* ───── Low-poly SVG building ───── */
function Building({ x, y, w, h, color, delay = 0 }: { x: number; y: number; w: number; h: number; color: string; delay?: number }) {
  return (
    <g>
      {/* Main body */}
      <polygon
        points={`${x},${y} ${x + w},${y} ${x + w - 3},${y - h} ${x + 3},${y - h}`}
        fill={color}
        opacity="0.85"
      />
      {/* Roof */}
      <polygon
        points={`${x + 2},${y - h} ${x + w - 2},${y - h} ${x + w / 2},${y - h - 8}`}
        fill={color}
        opacity="0.6"
      />
      {/* Windows */}
      {[0, 1, 2].map((row) => (
        <rect
          key={row}
          x={x + w * 0.25}
          y={y - h + 8 + row * 12}
          width={w * 0.5}
          height={6}
          rx={1}
          fill="#FFCF7E"
          opacity="0.5"
        >
          <animate
            attributeName="opacity"
            values="0.3;0.7;0.3"
            dur={`${2 + row * 0.5}s`}
            begin={`${delay + row * 0.3}s`}
            repeatCount="indefinite"
          />
        </rect>
      ))}
    </g>
  );
}

/* ───── Low-poly character ───── */
function Character({ x, y, color, flip = false }: { x: number; y: number; color: string; flip?: boolean }) {
  const scaleX = flip ? -1 : 1;
  return (
    <g transform={`translate(${x},${y}) scale(${scaleX},1)`}>
      {/* Body */}
      <polygon points="0,0 -5,-15 5,-15" fill={color} opacity="0.8" />
      {/* Head */}
      <circle cx={0} cy={-20} r={5} fill={color} opacity="0.7" />
      {/* Arm waving */}
      <line x1={3} y1={-12} x2={10} y2={-18} stroke={color} strokeWidth={2} strokeLinecap="round" opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" values="0 3 -12;-20 3 -12;0 3 -12" dur="2s" repeatCount="indefinite" />
      </line>
    </g>
  );
}

/* ───── Cloud ───── */
function Cloud({ x, y, scale = 1, speed = 40 }: { x: number; y: number; scale?: number; speed?: number }) {
  return (
    <g>
      <animateTransform attributeName="transform" type="translate" values={`0,0;${speed},0;0,0`} dur="30s" repeatCount="indefinite" />
      <g transform={`translate(${x},${y}) scale(${scale})`}>
        <ellipse cx={0} cy={0} rx={25} ry={10} fill="white" opacity="0.5" />
        <ellipse cx={-15} cy={2} rx={15} ry={8} fill="white" opacity="0.4" />
        <ellipse cx={15} cy={3} rx={18} ry={7} fill="white" opacity="0.4" />
        <ellipse cx={5} cy={-5} rx={12} ry={8} fill="white" opacity="0.35" />
      </g>
    </g>
  );
}

/* ───── Bird ───── */
function Bird({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <animateTransform attributeName="transform" type="translate" values={`${x},${y};${x + 80},${y - 10};${x + 160},${y + 5}`} dur="12s" begin={`${delay}s`} repeatCount="indefinite" />
      <path d="M-6 0Q-3 -4 0 0Q3 -4 6 0" stroke="#004953" strokeWidth="1.2" fill="none" opacity="0.3">
        <animate attributeName="d" values="M-6 0Q-3 -4 0 0Q3 -4 6 0;M-6 0Q-3 -1 0 0Q3 -1 6 0;M-6 0Q-3 -4 0 0Q3 -4 6 0" dur="0.6s" repeatCount="indefinite" />
      </path>
    </g>
  );
}

/* ───── Package with trail ───── */
function FlyingPackage({ startX, startY, endX, endY, delay = 0, color = "#5D3FD3" }: { startX: number; startY: number; endX: number; endY: number; delay?: number; color?: string }) {
  return (
    <g>
      <animateTransform attributeName="transform" type="translate" values={`${startX},${startY};${(startX + endX) / 2},${Math.min(startY, endY) - 30};${endX},${endY}`} dur="8s" begin={`${delay}s`} repeatCount="indefinite" />
      {/* Package */}
      <rect x={-8} y={-6} width={16} height={12} rx={2} fill={color} opacity="0.7" />
      <line x1={-8} y1={0} x2={8} y2={0} stroke="white" strokeWidth={0.8} opacity="0.4" />
      <line x1={0} y1={-6} x2={0} y2={6} stroke="white" strokeWidth={0.8} opacity="0.4" />
      {/* Dotted trail */}
      <line x1={0} y1={0} x2={-20} y2={10} stroke={color} strokeWidth={0.5} strokeDasharray="3 3" opacity="0.15">
        <animate attributeName="strokeDashoffset" values="0;12" dur="1s" repeatCount="indefinite" />
      </line>
    </g>
  );
}

/* ───── Boat on sea ───── */
function Boat({ x, y, hasPackage = false }: { x: number; y: number; hasPackage?: boolean }) {
  return (
    <g>
      <animateTransform attributeName="transform" type="translate" values={`0,0;5,-2;0,0`} dur="3s" repeatCount="indefinite" />
      <g transform={`translate(${x},${y})`}>
        {/* Hull */}
        <polygon points="-15,0 15,0 12,6 -12,6" fill="#004953" opacity="0.5" />
        {/* Sail */}
        <line x1={0} y1={0} x2={0} y2={-18} stroke="#004953" strokeWidth={1.5} opacity="0.4" />
        <polygon points="0,-18 12,-8 0,-5" fill="white" opacity="0.35" />
        {/* Package on boat */}
        {hasPackage && (
          <rect x={-4} y={-8} width={8} height={6} rx={1} fill="#FFCF7E" opacity="0.6">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
          </rect>
        )}
      </g>
    </g>
  );
}

/* ───── Sea waves (background layer) ───── */
function SeaWaves({ yOffset = 0, opacity = 0.06 }: { yOffset?: number; opacity?: number }) {
  return (
    <g>
      <path
        d={`M0 ${280 + yOffset}C60 ${270 + yOffset} 120 ${290 + yOffset} 200 ${278 + yOffset}C280 ${266 + yOffset} 340 ${288 + yOffset} 440 ${275 + yOffset}V380H0V${280 + yOffset}Z`}
        fill="#004953"
        opacity={opacity}
      >
        <animate
          attributeName="d"
          dur={`${4 + yOffset * 0.01}s`}
          repeatCount="indefinite"
          values={`M0 ${280 + yOffset}C60 ${270 + yOffset} 120 ${290 + yOffset} 200 ${278 + yOffset}C280 ${266 + yOffset} 340 ${288 + yOffset} 440 ${275 + yOffset}V380H0V${280 + yOffset}Z;M0 ${275 + yOffset}C60 ${288 + yOffset} 120 ${270 + yOffset} 200 ${282 + yOffset}C280 ${290 + yOffset} 340 ${272 + yOffset} 440 ${280 + yOffset}V380H0V${275 + yOffset}Z;M0 ${280 + yOffset}C60 ${270 + yOffset} 120 ${290 + yOffset} 200 ${278 + yOffset}C280 ${266 + yOffset} 340 ${288 + yOffset} 440 ${275 + yOffset}V380H0V${280 + yOffset}Z`}
        />
      </path>
    </g>
  );
}

/* ───── Live data counter (packages waiting) ───── */
function LiveDataCounter({ x, y, label, count }: { x: number; y: number; label: string; count: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-30} y={-16} width={60} height={32} rx={8} fill="white" opacity="0.7" />
      <text x={0} y={-2} textAnchor="middle" fontSize="10" fill="#5D3FD3" fontFamily="sans-serif" fontWeight="700">{count}</text>
      <text x={0} y={10} textAnchor="middle" fontSize="5" fill="#004953" fontFamily="sans-serif" opacity="0.5">{label}</text>
      <circle cx={24} cy={-10} r={3} fill="#22C55E" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

/* ───── Main scene SVG ───── */
function IslandSVG() {
  return (
    <svg viewBox="0 0 440 380" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8E4F0" />
          <stop offset="40%" stopColor="#F9F9F7" />
          <stop offset="100%" stopColor="#F9F9F7" />
        </linearGradient>
        <linearGradient id="sea-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#004953" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#004953" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="island-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#004953" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#004953" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="440" height="380" rx="24" fill="url(#sky-grad)" />

      {/* Sun */}
      <circle cx="360" cy="60" r="25" fill="#FFCF7E" opacity="0.2">
        <animate attributeName="r" values="25;28;25" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="360" cy="60" r="15" fill="#FFCF7E" opacity="0.3" />

      {/* Clouds (back layer) */}
      <Cloud x={60} y={50} scale={0.8} speed={30} />
      <Cloud x={250} y={35} scale={1} speed={-20} />
      <Cloud x={380} y={70} scale={0.6} speed={25} />

      {/* Birds */}
      <Bird x={80} y={80} delay={0} />
      <Bird x={120} y={65} delay={1} />
      <Bird x={300} y={90} delay={2} />
      <Bird x={160} y={55} delay={3} />

      {/* Clouds (front layer) */}
      <Cloud x={150} y={95} scale={1.2} speed={15} />
      <Cloud x={320} y={110} scale={0.7} speed={-30} />

      {/* Turkey landmass (left) */}
      <g>
        <polygon points="0,280 10,255 30,245 60,240 90,248 110,258 120,270 115,280" fill="url(#island-grad)" />
        {/* Coast details */}
        <polygon points="0,280 20,265 40,260 60,258 80,262 100,268 115,275 120,280" fill="#004953" opacity="0.08" />

        {/* Buildings */}
        <Building x={25} y={248} w={16} h={35} color="#004953" delay={0} />
        <Building x={48} y={252} w={12} h={25} color="#004953" delay={0.5} />
        <Building x={65} y={250} w={14} h={30} color="#004953" delay={1} />
        <Building x={82} y={255} w={10} h={20} color="#004953" delay={0.3} />

        {/* Label */}
        <text x={55} y={278} textAnchor="middle" fontSize="7" fill="#004953" opacity="0.2" fontFamily="sans-serif" fontWeight="600" letterSpacing="1">TÜRKİYE</text>

        {/* Character waving */}
        <Character x={35} y={248} color="#5D3FD3" />
      </g>

      {/* Sea layers */}
      <rect x="115" y="260" width="210" height="120" fill="url(#sea-grad)" />
      <SeaWaves yOffset={0} opacity={0.08} />
      <SeaWaves yOffset={8} opacity={0.05} />
      <SeaWaves yOffset={16} opacity={0.03} />

      {/* Boats */}
      <Boat x={160} y={285} hasPackage={true} />
      <Boat x={230} y={295} hasPackage={false} />
      <Boat x={270} y={280} hasPackage={true} />

      {/* Flying packages (Turkey → Chios) */}
      <FlyingPackage startX={100} startY={240} endX={310} endY={220} delay={0} color="#5D3FD3" />
      <FlyingPackage startX={80} startY={250} endX={330} endY={230} delay={2} color="#FFCF7E" />
      <FloatingPackage startX={60} startY={235} endX={350} endY={215} delay={4} color="#F97316" />

      {/* Chios island (right) */}
      <g>
        {/* Island base */}
        <polygon points="310,280 320,260 340,250 370,248 400,255 420,265 440,275 440,280" fill="url(#island-grad)" />
        <polygon points="315,280 325,265 345,258 370,255 395,260 415,268 435,278 440,280" fill="#004953" opacity="0.08" />

        {/* Warehouse */}
        <rect x={330} y={230} width={60} height={30} rx={4} fill="white" opacity="0.85" stroke="#004953" strokeWidth="0.5" strokeOpacity="0.15" />
        {/* Warehouse roof */}
        <polygon points="328,232 360,220 392,232" fill="#5D3FD3" opacity="0.25" />
        {/* Door */}
        <rect x={352} y={248} width={16} height={12} rx={2} fill="#5D3FD3" opacity="0.3" />
        {/* Windows with glow */}
        {[336, 354, 372].map((wx, i) => (
          <rect key={i} x={wx} y={236} width={8} height={10} rx={1.5} fill="#FFCF7E" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite" />
          </rect>
        ))}

        {/* Shield */}
        <g transform="translate(400,210)">
          <path d="M0 -12L10 -6V4C10 12 5 16 0 18C-5 16 -10 12 -10 4V-6Z" fill="#5D3FD3" opacity="0.6" />
          <path d="M-3 2L0 6L6 -4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
        </g>

        {/* Label */}
        <text x={370} y={278} textAnchor="middle" fontSize="8" fill="#004953" opacity="0.2" fontFamily="sans-serif" fontWeight="700" letterSpacing="2">CHIOS</text>

        {/* Characters */}
        <Character x={345} y={260} color="#22C55E" />
        <Character x={380} y={258} color="#5D3FD3" flip />

        {/* Live data badges */}
        <LiveDataCounter x={340} y={205} label="bekliyor" count={12} />
        <LiveDataCounter x={400} y={200} label="yolda" count={5} />
      </g>

      {/* Route path */}
      <path d="M110 255C160 235 220 245 310 240" stroke="#5D3FD3" strokeWidth="1" strokeDasharray="6 4" opacity="0.1">
        <animate attributeName="strokeDashoffset" values="0;20" dur="2s" repeatCount="indefinite" />
      </path>

      {/* TR → GR label */}
      <g>
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        <rect x={185} y={218} width={60} height={20} rx={10} fill="white" opacity="0.7" />
        <text x={215} y={232} textAnchor="middle" fontSize="7" fill="#5D3FD3" fontFamily="sans-serif" fontWeight="600">TR → GR</text>
      </g>

      {/* Sparkles */}
      {[
        { cx: 50, cy: 150, dur: "2s" },
        { cx: 190, cy: 130, dur: "2.5s" },
        { cx: 340, cy: 140, dur: "1.8s" },
        { cx: 410, cy: 170, dur: "2.2s" },
        { cx: 130, cy: 170, dur: "2.8s" },
      ].map((s, i) => (
        <g key={i} opacity="0.2">
          <line x1={s.cx - 4} y1={s.cy} x2={s.cx + 4} y2={s.cy} stroke="#5D3FD3" strokeWidth="1.2" strokeLinecap="round">
            <animate attributeName="opacity" values="0;0.5;0" dur={s.dur} repeatCount="indefinite" />
          </line>
          <line x1={s.cx} y1={s.cy - 4} x2={s.cx} y2={s.cy + 4} stroke="#5D3FD3" strokeWidth="1.2" strokeLinecap="round">
            <animate attributeName="opacity" values="0;0.5;0" dur={s.dur} repeatCount="indefinite" />
          </line>
        </g>
      ))}
    </svg>
  );
}

/* ───── Duplicate FloatingPackage with SVG animateMotion ───── */
function FloatingPackage({ startX, startY, endX, endY, delay = 0, color = "#5D3FD3" }: { startX: number; startY: number; endX: number; endY: number; delay?: number; color?: string }) {
  return (
    <g>
      <animateTransform attributeName="transform" type="translate" values={`${startX},${startY};${(startX + endX) / 2},${Math.min(startY, endY) - 25};${endX},${endY}`} dur="9s" begin={`${delay}s`} repeatCount="indefinite" />
      <rect x={-7} y={-5} width={14} height={10} rx={2} fill={color} opacity="0.6" />
      <line x1={-7} y1={0} x2={7} y2={0} stroke="white" strokeWidth={0.7} opacity="0.3" />
      <line x1={0} y1={-5} x2={0} y2={5} stroke="white" strokeWidth={0.7} opacity="0.3" />
    </g>
  );
}

/* ───── Scroll-linked wrapper ───── */
export function IslandScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });

  // Parallax transforms
  const skyY = useTransform(smoothProgress, [0, 1], [0, -60]);
  const cloudsBackY = useTransform(smoothProgress, [0, 1], [0, -40]);
  const cloudsFrontY = useTransform(smoothProgress, [0, 1], [0, -20]);
  const sceneScale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.05, 1.1]);

  // Text overlays
  const text1Opacity = useTransform(smoothProgress, [0, 0.1, 0.3, 0.4], [0, 1, 1, 0]);
  const text2Opacity = useTransform(smoothProgress, [0.4, 0.5, 0.7, 0.8], [0, 1, 1, 0]);
  const text3Opacity = useTransform(smoothProgress, [0.8, 0.9, 1, 1], [0, 1, 1, 1]);

  const text1Y = useTransform(smoothProgress, [0, 0.1], [20, 0]);
  const text2Y = useTransform(smoothProgress, [0.4, 0.5], [20, 0]);
  const text3Y = useTransform(smoothProgress, [0.8, 0.9], [20, 0]);

  // Progress bar
  const progressWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="h-[250vh] relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-mastic-white via-white to-mastic-white" />

        {/* Main scene */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ scale: sceneScale }}
        >
          <div className="w-full max-w-5xl px-4">
            <IslandSVG />
          </div>
        </motion.div>

        {/* Text overlays */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full max-w-xl px-6 text-center">
            <motion.div style={{ opacity: text1Opacity, y: text1Y }} className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="inline-block px-4 py-2 bg-chios-purple/10 backdrop-blur-sm rounded-full text-sm font-medium text-chios-purple mb-3 border border-chios-purple/10">
                Türkiye&apos;den Yola Çıktı
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-deep-sea-teal">
                Paketleriniz Yolda
              </h2>
              <p className="mt-2 text-sm text-deep-sea-teal/60 max-w-sm">
                Türkiye&apos;deki satıcılardan alınan paketler, Sakız Adası&apos;na doğru yola çıkıyor.
              </p>
            </motion.div>

            <motion.div style={{ opacity: text2Opacity, y: text2Y }} className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="inline-block px-4 py-2 bg-deep-sea-teal/10 backdrop-blur-sm rounded-full text-sm font-medium text-deep-sea-teal mb-3 border border-deep-sea-teal/10">
                Ege&apos;yi Aşıyor
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-deep-sea-teal">
                Güvenle Taşınıyor
              </h2>
              <p className="mt-2 text-sm text-deep-sea-teal/60 max-w-sm">
                Tekneler ve kargo yollarıyla, her paket sigortalı ve takip edilebilir.
              </p>
            </motion.div>

            <motion.div style={{ opacity: text3Opacity, y: text3Y }} className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="inline-block px-4 py-2 bg-success-green/10 backdrop-blur-sm rounded-full text-sm font-medium text-success-green mb-3 border border-success-green/10">
                Hedefe Ulaştı
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-deep-sea-teal">
                Sakız Adası Depomuzda
              </h2>
              <p className="mt-2 text-sm text-deep-sea-teal/60 max-w-sm">
                Konsolide edin, tasarruf edin, kapınıza teslim edelim.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-1 bg-deep-sea-teal/5 rounded-full overflow-hidden">
          <motion.div className="h-full bg-chios-purple/50 rounded-full" style={{ width: progressWidth }} />
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#004953" strokeWidth="1.5" opacity="0.3">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </motion.div>
          <span className="text-[10px] text-deep-sea-teal/30 font-medium">Scroll</span>
        </motion.div>
      </div>
    </div>
  );
}
