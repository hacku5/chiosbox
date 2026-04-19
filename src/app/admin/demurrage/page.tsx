"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface DemurragePackage {
  id: string;
  customer: string;
  customerId: string;
  content: string;
  arrivedAt: string;
  days: number;
  shelf: string;
}

const demoPackages: DemurragePackage[] = [
  { id: "pkg-101", customer: "Dany", customerId: "CBX-1045", content: "Nike Air Max 90", arrivedAt: "2026-03-20", days: 30, shelf: "A-3" },
  { id: "pkg-102", customer: "Ayşe K.", customerId: "CBX-1092", content: "Elektronik kulaklık", arrivedAt: "2026-03-25", days: 25, shelf: "B-1" },
  { id: "pkg-103", customer: "Mehmet B.", customerId: "CBX-1156", content: "Kitap seti", arrivedAt: "2026-03-28", days: 22, shelf: "A-5" },
  { id: "pkg-104", customer: "Elif S.", customerId: "CBX-1201", content: "Kozmetik ürünler", arrivedAt: "2026-04-01", days: 18, shelf: "C-2" },
  { id: "pkg-105", customer: "Can T.", customerId: "CBX-1234", content: "Giyim (mont)", arrivedAt: "2026-04-05", days: 14, shelf: "B-3" },
  { id: "pkg-106", customer: "Zeynep A.", customerId: "CBX-1310", content: "Saat", arrivedAt: "2026-04-08", days: 11, shelf: "A-1" },
  { id: "pkg-107", customer: "Burak K.", customerId: "CBX-1345", content: "Telefon kılıfı", arrivedAt: "2026-04-10", days: 9, shelf: "C-4" },
  { id: "pkg-108", customer: "Selin M.", customerId: "CBX-1389", content: "Parfüm seti", arrivedAt: "2026-04-12", days: 7, shelf: "B-2" },
];

function getZone(days: number): { bg: string; border: string; text: string; label: string } {
  if (days >= 30) return { bg: "bg-danger-red/10", border: "border-danger-red/30", text: "text-danger-red", label: "Terk Edildi" };
  if (days >= 15) return { bg: "bg-sunset-gold/20", border: "border-sunset-gold/30", text: "text-accent-orange", label: "Gecikme Ücreti" };
  return { bg: "", border: "border-deep-sea-teal/5", text: "text-deep-sea-teal", label: "" };
}

export default function DemurragePage() {
  const [packages, setPackages] = useState(demoPackages);

  const abandoned = packages.filter((p) => p.days >= 30);
  const warning = packages.filter((p) => p.days >= 15 && p.days < 30);
  const normal = packages.filter((p) => p.days < 15);

  const handleDiscard = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-deep-sea-teal">
            Gecikme Radarı
          </h1>
          <p className="text-sm text-deep-sea-teal/50 mt-1">
            Depolama süresini aşan paketleri takip edin
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-deep-sea-teal/5 text-center">
            <div className="text-2xl font-display font-bold text-deep-sea-teal">{normal.length}</div>
            <div className="text-xs text-deep-sea-teal/40">Normal (≤14 gün)</div>
          </div>
          <div className="bg-sunset-gold/10 rounded-2xl p-4 border border-sunset-gold/20 text-center">
            <div className="text-2xl font-display font-bold text-accent-orange">{warning.length}</div>
            <div className="text-xs text-accent-orange/60">Gecikme (15-29 gün)</div>
          </div>
          <div className="bg-danger-red/10 rounded-2xl p-4 border border-danger-red/20 text-center">
            <div className="text-2xl font-display font-bold text-danger-red">{abandoned.length}</div>
            <div className="text-xs text-danger-red/60">Terk Edildi (30+ gün)</div>
          </div>
        </div>

        {/* Package list */}
        <div className="space-y-3">
          {packages.map((pkg, i) => {
            const zone = getZone(pkg.days);
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl p-4 border transition-all ${zone.bg || "bg-white"} ${zone.border} shadow-sm`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-deep-sea-teal">
                        {pkg.customer}
                      </span>
                      <code className="text-xs font-mono text-deep-sea-teal/40">
                        {pkg.customerId}
                      </code>
                      {zone.label && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${zone.bg} ${zone.text}`}>
                          {zone.label}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-deep-sea-teal/50 mt-0.5">
                      {pkg.content} · Raf {pkg.shelf} · Geliş: {pkg.arrivedAt}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`font-display text-xl font-bold ${zone.text}`}>
                        {pkg.days} gün
                      </div>
                    </div>

                    {pkg.days >= 30 && (
                      <button
                        onClick={() => handleDiscard(pkg.id)}
                        className="px-4 py-2.5 bg-danger-red text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors cursor-pointer min-h-[48px]"
                      >
                        Tasfiye Et
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {packages.length === 0 && (
          <div className="text-center py-16 text-deep-sea-teal/30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p>Tüm paketler temizlendi</p>
          </div>
        )}
      </div>
    </div>
  );
}
