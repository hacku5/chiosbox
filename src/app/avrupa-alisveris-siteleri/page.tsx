"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

interface Site {
  id: string;
  name: string;
  url: string;
  country: string;
  category: string;
  logo_url: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
  DE: "🇩🇪", NL: "🇳🇱", FR: "🇫🇷", IT: "🇮🇹", ES: "🇪🇸", UK: "🇬🇧", AT: "🇦🇹", BE: "🇧🇪", PL: "🇵🇱", SE: "🇸🇪",
};

const COUNTRY_NAMES: Record<string, string> = {
  DE: "Almanya", NL: "Hollanda", FR: "Fransa", IT: "İtalya", ES: "İspanya", UK: "İngiltere", AT: "Avusturya", BE: "Belçika", PL: "Polonya", SE: "İsveç",
};

export default function ShoppingSitesPage() {
  const { t } = useTranslation();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/shopping-sites")
      .then((r) => r.json())
      .then((data) => setSites(data.sites || []))
      .finally(() => setLoading(false));
  }, []);

  const countries = [...new Set(sites.map((s) => s.country))];

  const filtered = sites.filter((s) => {
    if (country && s.country !== country) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const groupedByCountry = countries.reduce((acc, c) => {
    const items = filtered.filter((s) => s.country === c);
    if (items.length) acc[c] = items;
    return acc;
  }, {} as Record<string, Site[]>);

  return (
    <div className="min-h-screen bg-mastic-white">
      <div className="pt-24 pb-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-deep-sea-teal">{t("shoppingSites.title")}</h1>
            <p className="mt-3 text-deep-sea-teal/60 max-w-lg mx-auto">{t("shoppingSites.description")}</p>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={t("shoppingSites.searchPlaceholder")}
                className="w-full px-4 py-3 bg-white border border-deep-sea-teal/10 rounded-2xl text-sm focus:outline-none focus:border-chios-purple/50 pl-11" />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-deep-sea-teal/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <select value={country || ""} onChange={(e) => setCountry(e.target.value || null)}
              className="px-4 py-3 bg-white border border-deep-sea-teal/10 rounded-2xl text-sm focus:outline-none focus:border-chios-purple/50">
              <option value="">{t("shoppingSites.allCountries")}</option>
              {countries.map((c) => (
                <option key={c} value={c}>{COUNTRY_FLAGS[c] || ""} {COUNTRY_NAMES[c] || c}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-deep-sea-teal border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedByCountry).map(([c, items]) => (
                <div key={c}>
                  <h2 className="font-display text-xl font-bold text-deep-sea-teal mb-4 flex items-center gap-2">
                    <span>{COUNTRY_FLAGS[c] || ""}</span>
                    <span>{COUNTRY_NAMES[c] || c}</span>
                    <span className="text-xs text-deep-sea-teal/30 font-normal">({items.length})</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {items.map((site, i) => (
                      <motion.a key={site.id} href={site.url} target="_blank" rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="bg-white rounded-xl border border-deep-sea-teal/10 p-4 flex flex-col items-center gap-2 hover:border-chios-purple/30 hover:shadow-sm transition-all cursor-pointer group">
                        <div className="w-12 h-12 rounded-xl bg-deep-sea-teal/[0.04] flex items-center justify-center text-lg font-bold text-deep-sea-teal/30 group-hover:text-chios-purple/50 transition-colors">
                          {site.logo_url ? (
                            <img src={site.logo_url} alt={site.name} className="w-8 h-8 object-contain" />
                          ) : (
                            site.name[0]
                          )}
                        </div>
                        <span className="text-xs font-medium text-deep-sea-teal/70 text-center leading-tight">{site.name}</span>
                        {site.category && (
                          <span className="text-[10px] text-deep-sea-teal/30 bg-deep-sea-teal/[0.04] px-1.5 py-0.5 rounded-full">{site.category}</span>
                        )}
                      </motion.a>
                    ))}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-deep-sea-teal/40">{t("shoppingSites.noResults")}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
