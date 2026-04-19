"use client";

export function AuthIllustration() {
  return (
    <svg
      viewBox="0 0 400 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-sm"
    >
      {/* Sky gradient background */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5D3FD3" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#004953" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5D3FD3" />
          <stop offset="100%" stopColor="#4A2FB5" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="400" height="360" rx="24" fill="url(#sky)" />

      {/* Ocean waves - deeper layer */}
      <g opacity="0.12">
        <path
          d="M0 280C50 265 100 290 160 275C220 260 280 285 340 270C370 263 400 275 400 275V360H0V280Z"
          fill="#004953"
        >
          <animate
            attributeName="d"
            dur="5s"
            repeatCount="indefinite"
            values="M0 280C50 265 100 290 160 275C220 260 280 285 340 270C370 263 400 275 400 275V360H0V280Z;M0 275C50 290 100 265 160 280C220 290 280 265 340 280C370 285 400 275 400 275V360H0V275Z;M0 280C50 265 100 290 160 275C220 260 280 285 340 270C370 263 400 275 400 275V360H0V280Z"
          />
        </path>
      </g>

      {/* Ocean waves - front layer */}
      <g opacity="0.08">
        <path
          d="M0 295C70 280 130 305 200 290C270 275 330 300 400 285V360H0V295Z"
          fill="#004953"
        >
          <animate
            attributeName="d"
            dur="3.5s"
            repeatCount="indefinite"
            values="M0 295C70 280 130 305 200 290C270 275 330 300 400 285V360H0V295Z;M0 290C70 305 130 280 200 295C270 305 330 280 400 295V360H0V290Z;M0 295C70 280 130 305 200 290C270 275 330 300 400 285V360H0V295Z"
          />
        </path>
      </g>

      {/* Turkey continent (left) */}
      <g opacity="0.6">
        <path
          d="M20 240C20 240 30 220 50 215C70 210 90 225 100 230C110 235 105 250 90 255C75 260 40 258 20 255Z"
          fill="#004953"
          opacity="0.15"
        />
        <rect x="35" y="218" width="20" height="16" rx="2" fill="#004953" opacity="0.1" />
        <rect x="60" y="222" width="14" height="12" rx="2" fill="#004953" opacity="0.08" />
      </g>

      {/* Chios island (right) */}
      <g>
        <ellipse cx="310" cy="270" rx="55" ry="14" fill="#004953" opacity="0.06" />
        {/* Main building */}
        <rect x="280" y="230" width="60" height="40" rx="4" fill="white" stroke="#004953" strokeWidth="1.2" opacity="0.95" />
        {/* Windows with pulse */}
        {[288, 304, 320].map((x, i) => (
          <g key={i}>
            <rect x={x} y="238" width="10" height="12" rx="2" fill="#5D3FD3" opacity="0.35" />
            <rect x={x} y="238" width="10" height="12" rx="2" fill="#5D3FD3" opacity="0.15">
              <animate attributeName="opacity" values="0.15;0.35;0.15" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
            </rect>
          </g>
        ))}
        {/* Door */}
        <rect x="302" y="256" width="16" height="14" rx="2" fill="#5D3FD3" opacity="0.45" />
        {/* "CHIOS" label */}
        <text x="310" y="288" textAnchor="middle" fontSize="8" fill="#004953" opacity="0.3" fontFamily="sans-serif" fontWeight="600">CHIOS</text>
      </g>

      {/* Dashed connection path */}
      <path
        d="M95 235C140 210 190 220 280 250"
        stroke="#5D3FD3"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        opacity="0.2"
      >
        <animate attributeName="strokeDashoffset" values="0;20" dur="1.5s" repeatCount="indefinite" />
      </path>

      {/* Package 1 - traveling along path */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 90,-25; 180,15"
          dur="4s"
          repeatCount="indefinite"
        />
        <rect x="80" y="215" width="32" height="26" rx="3" fill="#5D3FD3" opacity="0.85" />
        <path d="M80 228H112" stroke="white" strokeWidth="1.5" opacity="0.4" />
        <path d="M96 215V241" stroke="white" strokeWidth="1.5" opacity="0.4" />
        <rect x="85" y="219" width="8" height="6" rx="1" fill="white" opacity="0.25" />
      </g>

      {/* Package 2 - smaller, following */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 70,-18; 140,8"
          dur="4.5s"
          repeatCount="indefinite"
        />
        <rect x="110" y="235" width="24" height="20" rx="2" fill="#FFCF7E" opacity="0.8" />
        <path d="M110 245H134" stroke="#004953" strokeWidth="1" opacity="0.25" />
        <path d="M122 235V255" stroke="#004953" strokeWidth="1" opacity="0.25" />
      </g>

      {/* Shield / security icon near island */}
      <g>
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        <path
          d="M340 200L355 208V220C355 230 348 238 340 240C332 238 325 230 325 220V208L340 200Z"
          fill="url(#shield-grad)"
          opacity="0.7"
        />
        <path d="M335 218L338 222L346 214" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Floating particles */}
      {[
        { cx: 60, cy: 140, r: 3, dur: "2.5s" },
        { cx: 130, cy: 100, r: 2, dur: "3s" },
        { cx: 200, cy: 150, r: 2.5, dur: "2.8s" },
        { cx: 260, cy: 120, r: 2, dur: "3.2s" },
        { cx: 170, cy: 180, r: 1.5, dur: "2.6s" },
        { cx: 350, cy: 160, r: 2, dur: "2.9s" },
      ].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#5D3FD3" opacity="0.15">
          <animate attributeName="opacity" values="0.1;0.35;0.1" dur={p.dur} repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="translate" values="0,0; 0,-10; 0,0" dur={p.dur} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Stars / sparkles */}
      {[
        { cx: 50, cy: 80, dur: "2s" },
        { cx: 180, cy: 60, dur: "2.5s" },
        { cx: 300, cy: 90, dur: "1.8s" },
      ].map((s, i) => (
        <g key={`star-${i}`} opacity="0.3">
          <line x1={s.cx - 4} y1={s.cy} x2={s.cx + 4} y2={s.cy} stroke="#5D3FD3" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0;0.5;0" dur={s.dur} repeatCount="indefinite" />
          </line>
          <line x1={s.cx} y1={s.cy - 4} x2={s.cx} y2={s.cy + 4} stroke="#5D3FD3" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0;0.5;0" dur={s.dur} repeatCount="indefinite" />
          </line>
        </g>
      ))}
    </svg>
  );
}
