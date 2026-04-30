"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  language: string;
  sort_order: number;
  is_published: boolean;
}

const LANGS = [
  { code: "tr", name: "Türkçe" },
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
];

export default function AdminFaqPage() {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLang, setActiveLang] = useState("tr");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", category: "general", language: "tr", sort_order: 0 });
  const [saveMsg, setSaveMsg] = useState("");

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/faq?language=${activeLang}${activeCategory ? `&category=${activeCategory}` : ""}`);
    if (res.ok) {
      const data = await res.json();
      setFaqs(data.faqs || []);
    }
    setLoading(false);
  }, [activeLang, activeCategory]);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  const categories = [...new Set(faqs.map((f) => f.category))];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question || !form.answer) return;
    setSaveMsg("");
    const url = "/api/admin/faq";
    const method = editing ? "PATCH" : "POST";
    const body = editing ? { id: editing, ...form } : form;

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      setShowForm(false); setEditing(null);
      setForm({ question: "", answer: "", category: "general", language: "tr", sort_order: 0 });
      fetchFaqs();
      setSaveMsg(editing ? t("adminCommon.updated") : t("adminCommon.created"));
      setTimeout(() => setSaveMsg(""), 2000);
    }
  };

  const handleEdit = (faq: FaqItem) => {
    setEditing(faq.id);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category, language: faq.language, sort_order: faq.sort_order });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/faq?id=${id}`, { method: "DELETE" });
    fetchFaqs();
  };

  const handleTogglePublish = async (faq: FaqItem) => {
    await fetch("/api/admin/faq", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: faq.id, is_published: !faq.is_published }),
    });
    fetchFaqs();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-deep-sea-teal">{t("admin.faq")}</h1>
            <p className="text-sm text-deep-sea-teal/50 mt-1">{t("adminFaq.description")}</p>
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && <span className="text-sm text-success-green font-medium">{saveMsg}</span>}
            <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ question: "", answer: "", category: "general", language: "tr", sort_order: 0 }); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${showForm ? "bg-chios-purple text-white" : "bg-chios-purple/10 text-chios-purple hover:bg-chios-purple/20"}`}>
              + {t("adminCommon.add")}
            </button>
          </div>
        </div>

        {/* Language tabs */}
        <div className="flex gap-2 flex-wrap">
          {LANGS.map((l) => (
            <button key={l.code} onClick={() => setActiveLang(l.code)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeLang === l.code ? "bg-deep-sea-teal text-white" : "bg-deep-sea-teal/5 text-deep-sea-teal/60 hover:bg-deep-sea-teal/10"}`}>
              {l.name}
            </button>
          ))}
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="bg-white rounded-2xl border border-chios-purple/20 p-5 space-y-3">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50">
                  {LANGS.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder={t("adminCommon.category")} className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder={t("adminCommon.sortOrder")} className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
              </div>
              <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder={t("adminCommon.question")} className="w-full px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
              <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4}
                placeholder={t("adminCommon.answer")} className="w-full px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50 resize-none" />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                  className="px-4 py-2 text-sm text-deep-sea-teal/50 hover:text-deep-sea-teal transition-colors">{t("adminCommon.cancel")}</button>
                <button type="submit" className="px-5 py-2 bg-chios-purple text-white rounded-xl text-sm font-medium hover:bg-chios-purple-dark transition-colors">
                  {editing ? t("adminCommon.update") : t("adminCommon.save")}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Category tabs */}
        {categories.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${!activeCategory ? "bg-chios-purple text-white" : "bg-chios-purple/5 text-chios-purple/60"}`}>
              {t("adminCommon.allCategories")}
            </button>
            {categories.map((c) => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${activeCategory === c ? "bg-chios-purple text-white" : "bg-chios-purple/5 text-chios-purple/60"}`}>
                {c}
              </button>
            ))}
          </div>
        )}

        {/* FAQ list */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-deep-sea-teal border-t-transparent rounded-full" /></div>
        ) : (
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div key={faq.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className={`bg-white rounded-xl border p-4 ${faq.is_published ? "border-deep-sea-teal/10" : "border-deep-sea-teal/5 opacity-50"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-deep-sea-teal/30 bg-deep-sea-teal/5 px-1.5 py-0.5 rounded">{faq.category}</span>
                      <span className="text-[10px] font-mono text-chios-purple/50 bg-chios-purple/5 px-1.5 py-0.5 rounded uppercase">{faq.language}</span>
                    </div>
                    <p className="text-sm font-medium text-deep-sea-teal">{faq.question}</p>
                    <p className="text-xs text-deep-sea-teal/40 mt-1 line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleTogglePublish(faq)}
                      className={`text-xs px-2 py-1 rounded-lg transition-colors cursor-pointer ${faq.is_published ? "bg-success-green/10 text-success-green" : "bg-deep-sea-teal/5 text-deep-sea-teal/30"}`}>
                      {faq.is_published ? "✓" : "—"}
                    </button>
                    <button onClick={() => handleEdit(faq)}
                      className="p-1.5 text-deep-sea-teal/30 hover:text-chios-purple transition-colors cursor-pointer">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(faq.id)}
                      className="p-1.5 text-deep-sea-teal/20 hover:text-red-500 transition-colors cursor-pointer">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {faqs.length === 0 && <div className="text-center py-12 text-deep-sea-teal/40">{t("adminCommon.empty")}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
