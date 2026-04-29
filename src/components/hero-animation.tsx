"use client";

import { useTranslation } from "@/hooks/use-translation";

/* CSS keyframe animations injected once */
const bentoStyles = `
/* 1. Package route dash animation */
.bento-path {
  stroke-dasharray: 6 6;
  animation: moveBentoDash 15s linear infinite;
}
@keyframes moveBentoDash {
  to { stroke-dashoffset: -100; }
}

/* Sliding package */
.bento-package {
  animation: slidePackage 6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes slidePackage {
  0%, 15%  { left: 10%; transform: scale(0); opacity: 0; }
  20%, 40% { left: 10%; transform: scale(1); opacity: 1; }
  50%, 80% { left: 85%; transform: scale(1); opacity: 1; }
  85%, 100%{ left: 85%; transform: scale(0); opacity: 0; }
}

/* Brand slider */
.brand-slider-container {
  height: 2.5rem; width: 2.5rem;
  overflow: hidden; position: relative;
}
.brand-slider {
  display: flex; flex-direction: column;
  animation: slideBrands 9s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
}
.brand-slide {
  height: 2.5rem; width: 2.5rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
@keyframes slideBrands {
  0%, 25%  { transform: translateY(0); }
  33%, 58% { transform: translateY(-2.5rem); }
  66%, 91% { transform: translateY(-5rem); }
  100%     { transform: translateY(0); }
}

/* 2. Progress ring */
.progress-ring {
  stroke-dasharray: 100;
  animation: fillRing 6s ease-in-out infinite;
}
@keyframes fillRing {
  0%, 10%  { stroke-dashoffset: 100; }
  50%, 90% { stroke-dashoffset: 0; }
  100%     { stroke-dashoffset: 100; }
}

/* 3. Ferry waves & boat */
.wave-layer-1 { animation: waveMove1 3s ease-in-out infinite alternate; }
.wave-layer-2 { animation: waveMove2 2s ease-in-out infinite alternate-reverse; }
.ferry-boat   { animation: boatRock 3s ease-in-out infinite alternate; }
@keyframes waveMove1 {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-15px); }
}
@keyframes waveMove2 {
  0%   { transform: translateX(0); }
  100% { transform: translateX(15px); }
}
@keyframes boatRock {
  0%   { transform: translateY(0) rotate(-2deg); }
  100% { transform: translateY(-4px) rotate(2deg); }
}
`;

export function HeroAnimation() {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-lg">
      <style>{bentoStyles}</style>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-[160px]">
        {/* BENTO BOX 1: Route (Full Width) */}
        <div className="sm:col-span-2 row-span-1 bg-white border border-zinc-200/60 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-center">
          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-6 relative z-10">
            {t("bento.route.title")}
          </h3>

          <div className="relative w-full h-16 flex items-center px-4">
            {/* Background line */}
            <div className="absolute left-10 right-10 h-0.5 bg-zinc-100 rounded-full" />

            {/* Animated dashed line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#818cf8" strokeWidth="2" className="bento-path" strokeLinecap="round" />
            </svg>

            {/* Start point (EU Store) */}
            <div className="absolute left-[10%] -translate-x-1/2 flex flex-col items-center gap-2 bg-white px-2">
              <div className="brand-slider-container rounded-full bg-white shadow-sm border border-zinc-200 z-10">
                <div className="brand-slider">
                  <div className="brand-slide">
                    <span className="font-bold text-[10px] tracking-tight text-zinc-900 mt-1">amazon</span>
                  </div>
                  <div className="brand-slide">
                    <span className="font-bold text-[12px] tracking-tighter">
                      <span className="text-[#e53238]">e</span>
                      <span className="text-[#0064d2]">b</span>
                      <span className="text-[#f5af02]">a</span>
                      <span className="text-[#86b817]">y</span>
                    </span>
                  </div>
                  <div className="brand-slide">
                    <span className="font-serif font-bold text-[9px] tracking-widest text-zinc-900 uppercase mt-0.5">ZARA</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-zinc-900">{t("bento.route.euStore")}</span>
            </div>

            {/* End point (Chios Warehouse) */}
            <div className="absolute left-[85%] -translate-x-1/2 flex flex-col items-center gap-2 bg-white px-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center z-10 border-2 border-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-zinc-900">{t("bento.route.warehouse")}</span>
            </div>

            {/* Sliding package */}
            <div className="bento-package absolute z-20 flex items-center justify-center -translate-x-1/2">
              <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg shadow-indigo-600/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* BENTO BOX 2: 14-Day Storage */}
        <div className="sm:col-span-1 row-span-1 bg-[#09090b] text-white border border-zinc-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
          <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase relative z-10">
            {t("bento.storage.title")}
          </h3>

          <div className="flex items-center gap-4 relative z-10">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#27272a" strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" className="progress-ring" pathLength={100} />
              </svg>
              <span className="text-2xl font-black text-emerald-400">14</span>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{t("bento.storage.days")}</p>
              <p className="text-xs text-zinc-400 font-medium">{t("bento.storage.subtitle")}</p>
            </div>
          </div>
        </div>

        {/* BENTO BOX 3: Ferry Delivery */}
        <div className="sm:col-span-1 row-span-1 bg-sky-50 border border-sky-100/50 rounded-[2rem] p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <h3 className="text-xs font-bold tracking-widest text-sky-600/70 uppercase relative z-10">
            {t("bento.delivery.title")}
          </h3>

          <div className="flex flex-col gap-1 relative z-10">
            <p className="text-lg font-bold text-sky-950">{t("bento.delivery.headline")}</p>
            <p className="text-xs text-sky-700/80 font-medium">{t("bento.delivery.subtitle")}</p>
          </div>

          {/* Ferry & wave animation */}
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none">
            {/* Wave 2 (back) */}
            <svg className="absolute bottom-2 w-[150%] wave-layer-2 text-sky-200" viewBox="0 0 200 40" preserveAspectRatio="none">
              <path d="M0,20 Q50,0 100,20 T200,20 L200,40 L0,40 Z" fill="currentColor" />
            </svg>

            {/* Ferry boat */}
            <div className="ferry-boat absolute bottom-6 right-8 text-sky-900 bg-white p-2.5 rounded-full shadow-lg shadow-sky-900/10 border border-sky-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path d="M2 12h20M4 12v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 12c0 2.2 1.8 4 4 4h12c2.2 0 4-1.8 4-4" />
              </svg>
            </div>

            {/* Wave 1 (front) */}
            <svg className="absolute bottom-0 w-[150%] wave-layer-1 text-sky-300/80" viewBox="0 0 200 30" preserveAspectRatio="none">
              <path d="M0,15 Q50,30 100,15 T200,15 L200,30 L0,30 Z" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
