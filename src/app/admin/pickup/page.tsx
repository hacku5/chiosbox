"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const demoQRCodes: Record<string, { name: string; id: string; shelf: string; pkg: string }> = {
  "QR-CBX-1045": { name: "Dany", id: "CBX-1045", shelf: "A-3", pkg: "Nike Air Max 90" },
  "QR-CBX-1092": { name: "Ayşe K.", id: "CBX-1092", shelf: "B-1", pkg: "Elektronik kulaklık" },
  "QR-CBX-1156": { name: "Mehmet B.", id: "CBX-1156", shelf: "A-5", pkg: "Kitap seti (3 adet)" },
};

function SignatureCanvas({ onSave }: { onSave: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = "#004953";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) onSave(canvas.toDataURL());
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
        className="w-full h-40 bg-white rounded-2xl border-2 border-deep-sea-teal/10 touch-none cursor-crosshair"
      />
      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="flex-1 py-3 border-2 border-deep-sea-teal/10 text-deep-sea-teal/60 font-semibold rounded-xl hover:bg-deep-sea-teal/5 transition-colors cursor-pointer min-h-[48px]"
        >
          Temizle
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 bg-success-green text-white font-semibold rounded-xl hover:bg-green-600 transition-colors cursor-pointer min-h-[48px]"
        >
          İmzayı Onayla
        </button>
      </div>
    </div>
  );
}

export default function PickupPage() {
  const [qrInput, setQrInput] = useState("");
  const [customer, setCustomer] = useState<(typeof demoQRCodes)["QR-CBX-1045"] | null>(null);
  const [signed, setSigned] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleScan = () => {
    const found = demoQRCodes[qrInput.trim()];
    if (found) {
      setCustomer(found);
      setSigned(false);
      setCompleted(false);
    }
  };

  const handleReset = () => {
    setQrInput("");
    setCustomer(null);
    setSigned(false);
    setCompleted(false);
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-deep-sea-teal">
            Teslimat
          </h1>
          {customer && (
            <button
              onClick={handleReset}
              className="text-sm text-deep-sea-teal/50 hover:text-chios-purple transition-colors cursor-pointer"
            >
              Yeni Teslimat
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: QR Scan */}
          {!customer && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleScan()}
                      placeholder="QR kodu okutun (Örn: QR-CBX-1045)"
                      className="w-full px-5 py-4 rounded-2xl border-2 border-deep-sea-teal/10 bg-white text-deep-sea-teal text-lg font-mono placeholder:text-deep-sea-teal/20 focus:outline-none focus:border-chios-purple/50 transition-all"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleScan}
                    disabled={!qrInput.trim()}
                    className="h-[60px] w-[60px] bg-chios-purple text-white font-semibold rounded-2xl hover:bg-chios-purple-dark disabled:opacity-30 transition-all cursor-pointer flex items-center justify-center"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <rect x="7" y="7" width="3" height="3" />
                      <rect x="14" y="7" width="3" height="3" />
                      <rect x="7" y="14" width="3" height="3" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-deep-sea-teal/30 text-center">
                  Demo: QR-CBX-1045, QR-CBX-1092, QR-CBX-1156
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Customer info + Signature */}
          {customer && !completed && (
            <motion.div
              key="deliver"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Big customer display */}
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-deep-sea-teal rounded-3xl p-8 text-white text-center"
              >
                <div className="text-sm text-white/50 uppercase tracking-wider mb-2">
                  Teslim Edilecek
                </div>
                <div className="font-display text-4xl font-bold mb-2">
                  {customer.name}
                </div>
                <div className="font-display text-5xl font-bold text-chios-purple">
                  {customer.shelf}
                </div>
                <div className="mt-3 text-sm text-white/50">
                  {customer.pkg} · {customer.id}
                </div>
              </motion.div>

              {/* Signature */}
              {!signed ? (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-deep-sea-teal/5">
                  <h3 className="font-display text-lg font-semibold text-deep-sea-teal mb-3">
                    Müşteri İmzası
                  </h3>
                  <SignatureCanvas onSave={() => setSigned(true)} />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-deep-sea-teal/5 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-success-green/10 flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="font-semibold text-success-green mb-4">İmza alındı</p>
                  <button
                    onClick={() => setCompleted(true)}
                    className="w-full py-4 bg-success-green text-white font-display font-bold text-lg rounded-2xl hover:bg-green-600 active:scale-[0.98] transition-all cursor-pointer shadow-lg min-h-[48px]"
                  >
                    TESLİM ET
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Completed */}
          {completed && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              {/* Green flash background */}
              <motion.div
                initial={{ backgroundColor: "#22C55E", opacity: 0.15 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="fixed inset-0 pointer-events-none -z-10"
              />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-24 h-24 rounded-full bg-success-green/10 flex items-center justify-center mb-6"
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  />
                </svg>
              </motion.div>

              <h2 className="font-display text-2xl font-bold text-deep-sea-teal mb-1">
                Teslim Edildi!
              </h2>
              <p className="text-deep-sea-teal/50 mb-4">
                {customer?.name} — {customer?.pkg}
              </p>

              <button
                onClick={handleReset}
                className="px-8 py-3 bg-deep-sea-teal text-white font-semibold rounded-2xl hover:bg-deep-sea-teal/90 transition-colors cursor-pointer min-h-[48px]"
              >
                Yeni Teslimat
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
