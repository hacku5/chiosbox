"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePackageStore, type PackageStatus } from "@/stores/package-store";

const statusConfig: Record<PackageStatus, { bg: string; text: string; label: string }> = {
  depoda: { bg: "bg-chios-purple/10", text: "text-chios-purple", label: "Depoda" },
  yolda: { bg: "bg-accent-orange/10", text: "text-accent-orange", label: "Yolda" },
  bekleniyor: { bg: "bg-deep-sea-teal/5", text: "text-deep-sea-teal/50", label: "Bekleniyor" },
  birlestirildi: { bg: "bg-success-green/10", text: "text-success-green", label: "Birleştirildi" },
  teslim_edildi: { bg: "bg-success-green/10", text: "text-success-green", label: "Teslim Edildi" },
};

export default function PackagesPage() {
  const packages = usePackageStore((s) => s.packages);
  const fetchPackages = usePackageStore((s) => s.fetchPackages);
  const [filter, setFilter] = useState<"all" | PackageStatus>("all");

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const filtered = filter === "all" ? packages : packages.filter((p) => p.status === filter);

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-deep-sea-teal">
              Paketlerim
            </h1>
            <p className="text-sm text-deep-sea-teal/50 mt-1">
              Tüm paketlerinizi buradan takip edin
            </p>
          </div>

          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-chios-purple text-white text-sm font-semibold rounded-full hover:bg-chios-purple-dark transition-colors duration-200 shadow-md cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Yeni Bildir
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: "all", label: "Tümü" },
            { key: "depoda", label: "Depoda" },
            { key: "yolda", label: "Yolda" },
            { key: "bekleniyor", label: "Bekleniyor" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                filter === tab.key
                  ? "bg-chios-purple text-white shadow-sm"
                  : "bg-white text-deep-sea-teal/60 hover:bg-deep-sea-teal/5 border border-deep-sea-teal/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Package list */}
        <motion.div layout className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((pkg) => {
              const sc = statusConfig[pkg.status];
              return (
                <motion.div
                  key={pkg.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-deep-sea-teal/5 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-chios-purple/10 flex items-center justify-center flex-shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-chios-purple">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-deep-sea-teal">{pkg.content}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          {sc.label}
                        </span>
                      </div>
                      <div className="text-xs text-deep-sea-teal/40 mt-1">
                        {pkg.carrier} · {pkg.tracking_no}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      {pkg.shelf_location && (
                        <div className="text-center">
                          <div className="font-display font-semibold text-deep-sea-teal">
                            {pkg.shelf_location}
                          </div>
                          <div className="text-[10px] text-deep-sea-teal/40">Raf</div>
                        </div>
                      )}
                      {pkg.status === "depoda" && (
                        <div className="text-center">
                          <div className={`font-display font-semibold ${pkg.free_days_left <= 5 ? "text-sunset-gold" : "text-deep-sea-teal"}`}>
                            {pkg.free_days_left} gün
                          </div>
                          <div className="text-[10px] text-deep-sea-teal/40">Ücretsiz</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
