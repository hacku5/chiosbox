"use client";

import { motion } from "framer-motion";

export function HeroAnimation() {
  return (
    <svg
      viewBox="0 0 440 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-lg"
    >
      <defs>
        <linearGradient id="wave-grad-1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#004953" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#004953" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="wave-grad-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#004953" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#004953" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="box-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5D3FD3" />
          <stop offset="100%" stopColor="#7B6AE0" />
        </linearGradient>
        <linearGradient id="box-grad-2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFCF7E" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5D3FD3" />
          <stop offset="100%" stopColor="#4A2FB5" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sky gradient */}
      <rect width="440" height="380" rx="24" fill="#F9F9F7" />

      {/* Subtle gradient background shapes */}
      <circle cx="100" cy="100" r="120" fill="#5D3FD3" opacity="0.03" />
      <circle cx="350" cy="120" r="80" fill="#FFCF7E" opacity="0.04" />

      {/* Ocean waves - deep layer */}
      <path
        d="M0 290C50 275 100 300 170 285C240 270 310 295 380 280C410 273 440 285 440 285V380H0V290Z"
        fill="url(#wave-grad-1)"
      >
        <animate
          attributeName="d"
          dur="5s"
          repeatCount="indefinite"
          values="M0 290C50 275 100 300 170 285C240 270 310 295 380 280C410 273 440 285 440 285V380H0V290Z;M0 285C50 300 100 275 170 290C240 300 310 275 380 290C410 295 440 285 440 285V380H0V285Z;M0 290C50 275 100 300 170 285C240 270 310 295 380 280C410 273 440 285 440 285V380H0V290Z"
        />
      </path>

      {/* Ocean waves - front layer */}
      <path
        d="M0 310C60 295 120 320 200 305C280 290 340 315 440 300V380H0V310Z"
        fill="url(#wave-grad-2)"
      >
        <animate
          attributeName="d"
          dur="3.5s"
          repeatCount="indefinite"
          values="M0 310C60 295 120 320 200 305C280 290 340 315 440 300V380H0V310Z;M0 305C60 320 120 295 200 310C280 320 340 295 440 310V380H0V305Z;M0 310C60 295 120 320 200 305C280 290 340 315 440 300V380H0V310Z"
        />
      </path>

      {/* Foam / wave highlights */}
      <path
        d="M0 308C40 302 80 314 130 306C180 298 230 312 290 304C350 296 400 310 440 302"
        stroke="#004953"
        strokeWidth="1"
        opacity="0.06"
        fill="none"
      >
        <animate
          attributeName="d"
          dur="4s"
          repeatCount="indefinite"
          values="M0 308C40 302 80 314 130 306C180 298 230 312 290 304C350 296 400 310 440 302;M0 304C40 312 80 300 130 308C180 316 230 302 290 310C350 318 400 304 440 312;M0 308C40 302 80 314 130 306C180 298 230 312 290 304C350 296 400 310 440 302"
        />
      </path>

      {/* Turkey landmass (left) */}
      <g opacity="0.5">
        <path
          d="M10 280C10 280 25 255 50 248C75 241 100 258 115 265C130 272 120 285 100 290C80 295 30 292 10 288Z"
          fill="#004953"
          opacity="0.1"
        />
        {/* Buildings */}
        <rect x="30" y="255" width="18" height="20" rx="2" fill="#004953" opacity="0.08" />
        <rect x="55" y="260" width="14" height="15" rx="2" fill="#004953" opacity="0.06" />
        <rect x="75" y="258" width="12" height="17" rx="2" fill="#004953" opacity="0.07" />
        <text x="55" y="292" textAnchor="middle" fontSize="7" fill="#004953" opacity="0.25" fontFamily="sans-serif" fontWeight="600">TÜRKİYE</text>
      </g>

      {/* Chios island (right) */}
      <g>
        {/* Island shadow */}
        <ellipse cx="340" cy="295" rx="65" ry="16" fill="#004953" opacity="0.05" />

        {/* Main building */}
        <rect x="305" y="248" width="70" height="48" rx="6" fill="white" stroke="#004953" strokeWidth="1" opacity="0.95" />

        {/* Roof accent */}
        <path d="M305 254C305 251 307 248 310 248H370C373 248 375 251 375 254" stroke="#5D3FD3" strokeWidth="1.5" opacity="0.3" />

        {/* Windows - animated */}
        {[
          { x: 314, delay: 0 },
          { x: 333, delay: 0.7 },
          { x: 352, delay: 1.4 },
        ].map((w, i) => (
          <g key={i}>
            <rect x={w.x} y="256" width="13" height="15" rx="2.5" fill="#5D3FD3" opacity="0.25" />
            <rect x={w.x} y="256" width="13" height="15" rx="2.5" fill="#5D3FD3" opacity="0.12">
              <animate attributeName="opacity" values="0.12;0.35;0.12" dur="3s" begin={`${w.delay}s`} repeatCount="indefinite" />
            </rect>
            {/* Window cross */}
            <line x1={w.x + 6.5} y1={256} x2={w.x + 6.5} y2={256 + 15} stroke="white" strokeWidth="0.8" opacity="0.4" />
          </g>
        ))}

        {/* Door */}
        <rect x="332" y="280" width="16" height="16" rx="3" fill="#5D3FD3" opacity="0.4" />
        <circle cx="344" cy="289" r="1.2" fill="white" opacity="0.6" />

        {/* Chios label */}
        <text x="340" y="310" textAnchor="middle" fontSize="8" fill="#004953" opacity="0.3" fontFamily="sans-serif" fontWeight="700" letterSpacing="2">CHIOS</text>

        {/* Shield icon - pulsing */}
        <g filter="url(#glow)">
          <motion.g
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <path
              d="M385 230L403 240V256C403 268 395 278 385 281C375 278 367 268 367 256V240L385 230Z"
              fill="url(#shield-grad)"
              opacity="0.75"
            />
            <path d="M378 255L382 260L393 249" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
        </g>
      </g>

      {/* Dashed connection path */}
      <path
        d="M110 265C160 240 220 255 305 270"
        stroke="#5D3FD3"
        strokeWidth="1.5"
        strokeDasharray="8 5"
        opacity="0.15"
      >
        <animate attributeName="strokeDashoffset" values="0;26" dur="2s" repeatCount="indefinite" />
      </path>

      {/* Package 1 - main, flying across */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 100,-30; 195,10"
          dur="4.5s"
          repeatCount="indefinite"
        />
        {/* Shadow */}
        <ellipse cx="105" cy="280" rx="18" ry="4" fill="#004953" opacity="0.05">
          <animate attributeName="rx" values="18;12;18" dur="4.5s" repeatCount="indefinite" />
        </ellipse>
        {/* Box */}
        <rect x="85" y="240" width="36" height="30" rx="4" fill="url(#box-grad)" />
        <path d="M85 255H121" stroke="white" strokeWidth="1.5" opacity="0.4" />
        <path d="M103 240V270" stroke="white" strokeWidth="1.5" opacity="0.4" />
        <rect x="90" y="245" width="10" height="8" rx="1.5" fill="white" opacity="0.2" />
        {/* Tape */}
        <rect x="99" y="240" width="6" height="30" fill="white" opacity="0.08" />
      </g>

      {/* Package 2 - smaller, following */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 80,-22; 160,5"
          dur="5s"
          repeatCount="indefinite"
        />
        <rect x="130" y="262" width="26" height="22" rx="3" fill="url(#box-grad-2)" />
        <path d="M130 273H156" stroke="#004953" strokeWidth="1" opacity="0.2" />
        <path d="M143 262V284" stroke="#004953" strokeWidth="1" opacity="0.2" />
      </g>

      {/* Small plane */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; -100,-40; -180,-15"
          dur="4s"
          repeatCount="indefinite"
        />
        <path
          d="M380 90L400 100H388L380 112L372 100H360L380 90Z"
          fill="#5D3FD3"
          opacity="0.55"
        />
        <line x1="370" y1="102" x2="340" y2="106" stroke="#5D3FD3" strokeWidth="1" opacity="0.2" strokeDasharray="4 3">
          <animate attributeName="strokeDashoffset" values="0;14" dur="0.5s" repeatCount="indefinite" />
        </line>
      </g>

      {/* Speed lines */}
      {[
        { x1: 140, y1: 250, x2: 165, y2: 250, delay: "0s" },
        { x1: 160, y1: 260, x2: 190, y2: 260, delay: "0.3s" },
        { x1: 150, y1: 245, x2: 175, y2: 245, delay: "0.6s" },
      ].map((line, i) => (
        <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#5D3FD3" strokeWidth="1" strokeLinecap="round" opacity="0">
          <animate attributeName="opacity" values="0;0.2;0" dur="2s" begin={line.delay} repeatCount="indefinite" />
        </line>
      ))}

      {/* Floating particles */}
      {[
        { cx: 70, cy: 120, r: 3, dur: "2.5s", color: "#5D3FD3" },
        { cx: 150, cy: 90, r: 2, dur: "3s", color: "#5D3FD3" },
        { cx: 260, cy: 140, r: 2.5, dur: "2.8s", color: "#5D3FD3" },
        { cx: 380, cy: 110, r: 2, dur: "3.2s", color: "#FFCF7E" },
        { cx: 100, cy: 180, r: 1.5, dur: "2.6s", color: "#5D3FD3" },
        { cx: 200, cy: 160, r: 1.8, dur: "3.1s", color: "#004953" },
        { cx: 310, cy: 130, r: 2.2, dur: "2.9s", color: "#FFCF7E" },
      ].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.color} opacity="0.12">
          <animate attributeName="opacity" values="0.06;0.25;0.06" dur={p.dur} repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="translate" values="0,0; 0,-12; 0,0" dur={p.dur} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Sparkle / star effects */}
      {[
        { cx: 50, cy: 80, dur: "2s" },
        { cx: 200, cy: 60, dur: "2.5s" },
        { cx: 330, cy: 85, dur: "1.8s" },
        { cx: 130, cy: 50, dur: "2.2s" },
      ].map((s, i) => (
        <g key={`star-${i}`} opacity="0.25">
          <line x1={s.cx - 5} y1={s.cy} x2={s.cx + 5} y2={s.cy} stroke="#5D3FD3" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0;0.6;0" dur={s.dur} repeatCount="indefinite" />
          </line>
          <line x1={s.cx} y1={s.cy - 5} x2={s.cx} y2={s.cy + 5} stroke="#5D3FD3" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0;0.6;0" dur={s.dur} repeatCount="indefinite" />
          </line>
        </g>
      ))}

      {/* Route label bubble */}
      <g>
        <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
        <rect x="175" y="195" width="70" height="24" rx="12" fill="white" stroke="#5D3FD3" strokeWidth="0.8" opacity="0.8" />
        <text x="210" y="211" textAnchor="middle" fontSize="8" fill="#5D3FD3" fontFamily="sans-serif" fontWeight="600">TR → GR</text>
      </g>
    </svg>
  );
}
