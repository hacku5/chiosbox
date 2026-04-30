"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import Link from "next/link";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function FaqPage() {
  const { t, lang } = useTranslation();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/faq?language=${lang}`)
      .then((r) => r.json())
      .then((data) => setFaqs(data.faqs || []))
      .finally(() => setLoading(false));
  }, [lang]);

  const categories = [...new Set(faqs.map((f) => f.category))];
  const filtered = faqs.filter((f) => {
    if (activeCategory && f.category !== activeCategory) return false;
    if (search && !f.question.toLowerCase().includes(search.toLowerCase()) && !f.answer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = categories.reduce((acc, cat) => {
    const items = filtered.filter((f) => f.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<string, FaqItem[]>);

  return (
    <div className="min-h-screen bg-mastic-white">
      <div className="pt-24 pb-16 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-deep-sea-teal">{t("faq.title")}</h1>
            <p className="mt-3 text-deep-sea-teal/60">{t("faq.description")}</p>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t("faq.searchPlaceholder")}
              className="w-full px-5 py-3.5 bg-white border border-deep-sea-teal/10 rounded-2xl text-sm focus:outline-none focus:border-chios-purple/50 pl-12" />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-sea-teal/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </div>

          {/* Category tabs */}
          {categories.length > 1 && (
            <div className="flex gap-2 flex-wrap mb-6">
              <button onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!activeCategory ? "bg-chios-purple text-white" : "bg-chios-purple/5 text-chios-purple/60 hover:bg-chios-purple/10"}`}>
                {t("faq.allCategories")}
              </button>
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === cat ? "bg-chios-purple text-white" : "bg-chios-purple/5 text-chios-purple/60 hover:bg-chios-purple/10"}`}>
                  {t(`faq.${cat}`) || cat}
                </button>
              ))}
            </div>
          )}

          {/* FAQ list */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-deep-sea-teal border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  {!activeCategory && <h2 className="font-display text-lg font-semibold text-deep-sea-teal mb-3">{t(`faq.${cat}`) || cat}</h2>}
                  <div className="space-y-2">
                    {items.map((faq) => (
                      <motion.div key={faq.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-deep-sea-teal/10 overflow-hidden">
                        <button onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                          className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-deep-sea-teal/[0.02] transition-colors">
                          <span className="text-sm font-medium text-deep-sea-teal pr-4">{faq.question}</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            className={`shrink-0 text-deep-sea-teal/40 transition-transform ${openId === faq.id ? "rotate-180" : ""}`}>
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        {openId === faq.id && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                            className="px-4 pb-4 overflow-hidden">
                            <p className="text-sm text-deep-sea-teal/60 leading-relaxed">{faq.answer}</p>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-deep-sea-teal/40">{t("faq.noResults")}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
