"use client";

export function AuthIllustration() {
  const style = `    /* Işık Hüzmesi Animasyonları */
        @keyframes sweep {
            0% { transform: rotate(40deg); }
            50% { transform: rotate(120deg); }
            100% { transform: rotate(40deg); }
        }

        #light-beam {
            transform-origin: 250px 220px; /* Deniz fenerinin tepe noktası */
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
            animation: sweep 8s infinite ease-in-out;
            mix-blend-mode: overlay;
        }

        /* JavaScript ile eklenecek sınıflar */
        #light-beam.looking-right {
            animation: none !important;
            transform: rotate(90deg) !important; /* Forma doğru bakar */
            opacity: 0.8;
        }

        #light-beam.looking-left {
            animation: none !important;
            transform: rotate(-30deg) !important; /* Sola/Yukarı bakar (Şifre gizliliği) */
            opacity: 0.5;
        }

        /* Arka plan yıldız animasyonu */
        @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.8; }
        }
        .star { animation: twinkle 3s infinite ease-in-out; }
        .star:nth-child(even) { animation-delay: 1.5s; }
        
        /* Özel Checkbox Rengi */
        .accent-chios { accent-color: #5B54E6; }`
  return (
    <div className="w-full max-w-[320px] aspect-square bg-[#F0F2F6] rounded-3xl relative overflow-hidden flex items-center justify-center mb-8 shadow-inner">

      <style>{style}</style>
      <svg viewBox="0 0 500 500" className="w-full h-full absolute inset-0">
        <rect width="500" height="500" fill="#F0F2F6" />

        <circle cx="100" cy="100" r="2" fill="#9CA3AF" className="star" />
        <circle cx="200" cy="60" r="1.5" fill="#9CA3AF" className="star" />
        <circle cx="350" cy="120" r="2" fill="#9CA3AF" className="star" />
        <circle cx="420" cy="80" r="1" fill="#9CA3AF" className="star" />
        <circle cx="80" cy="200" r="1.5" fill="#9CA3AF" className="star" />
        <circle cx="300" cy="180" r="1" fill="#9CA3AF" className="star" />

        <path d="M 50 150 Q 80 130 110 150 Q 140 140 160 160 Z" fill="#E5E7EB" opacity="0.6" />
        <path d="M 350 100 Q 380 80 420 100 Q 450 110 440 130 Z" fill="#E5E7EB" opacity="0.6" />

        <defs>
          <linearGradient id="beam-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FCD34D" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon id="light-beam" points="250,220 50,-100 450,-100" fill="url(#beam-grad)" />

        <path d="M 0 380 Q 125 360 250 380 T 500 380 L 500 500 L 0 500 Z" fill="#CBD5E1" />
        <path d="M 0 420 Q 125 400 250 420 T 500 420 L 500 500 L 0 500 Z" fill="#94A3B8" opacity="0.3" />

        <path d="M 120 400 Q 250 320 380 400 Z" fill="#64748B" />
        <path d="M 140 400 Q 250 340 360 400 Z" fill="#475569" />

        <polygon points="210,400 290,400 270,220 230,220" fill="#F8FAFC" />

        <polygon points="225,350 275,350 270,300 230,300" fill="#5B54E6" />
        <polygon points="215,400 285,400 280,380 220,380" fill="#5B54E6" />
        <polygon points="232,250 268,250 265,220 235,220" fill="#5B54E6" />


        <rect x="220" y="210" width="60" height="10" rx="3" fill="#334155" />
        <rect x="235" y="180" width="30" height="30" fill="#FDE047" />

        <circle cx="250" cy="195" r="8" fill="#FFFFFF" />

        <polygon points="225,180 275,180 250,140" fill="#334155" />
        <circle cx="250" cy="135" r="4" fill="#5B54E6" />

        <g transform="translate(140, 360) rotate(-15)">
          <rect x="0" y="0" width="30" height="30" rx="4" fill="#818CF8" />
          <rect x="10" y="10" width="10" height="10" fill="#C7D2FE" opacity="0.5" />
        </g>
        <g transform="translate(320, 375) rotate(10)">
          <rect x="0" y="0" width="24" height="24" rx="3" fill="#FCD34D" />
          <line x1="12" y1="0" x2="12" y2="24" stroke="#F59E0B" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}
