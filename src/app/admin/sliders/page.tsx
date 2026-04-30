"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

interface SliderItem {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  language: string;
  sort_order: number;
  is_published: boolean;
}

const LANGS = [
  { code: "tr", name: "Türkçe" },
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
];

export default function AdminSlidersPage() {
  const { t } = useTranslation();
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLang, setActiveLang] = useState("tr");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", image_url: "", link_url: "", language: "tr", sort_order: 0 });
  const [saveMsg, setSaveMsg] = useState("");

  const fetchSliders = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/sliders?language=${activeLang}`);
    if (res.ok) {
      const data = await res.json();
      setSliders(data.sliders || []);
    }
    setLoading(false);
  }, [activeLang]);

  useEffect(() => { fetchSliders(); }, [fetchSliders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    setSaveMsg("");
    const url = "/api/admin/sliders";
    const method = editing ? "PATCH" : "POST";
    const body = editing ? { id: editing, ...form } : form;

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      setShowForm(false); setEditing(null);
      setForm({ title: "", subtitle: "", image_url: "", link_url: "", language: "tr", sort_order: 0 });
      fetchSliders();
      setSaveMsg(editing ? t("adminCommon.updated") : t("adminCommon.created"));
      setTimeout(() => setSaveMsg(""), 2000);
    }
  };

  const handleEdit = (s: SliderItem) => {
    setEditing(s.id);
    setForm({ title: s.title, subtitle: s.subtitle, image_url: s.image_url, link_url: s.link_url, language: s.language, sort_order: s.sort_order });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/sliders?id=${id}`, { method: "DELETE" });
    fetchSliders();
  };

  const handleTogglePublish = async (s: SliderItem) => {
    await fetch("/api/admin/sliders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s.id, is_published: !s.is_published }),
    });
    fetchSliders();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-deep-sea-teal">{t("admin.sliders")}</h1>
            <p className="text-sm text-deep-sea-teal/50 mt-1">{t("adminSliders.description")}</p>
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && <span className="text-sm text-success-green font-medium">{saveMsg}</span>}
            <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ title: "", subtitle: "", image_url: "", link_url: "", language: "tr", sort_order: 0 }); }}
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
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder={t("adminCommon.sortOrder")} className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
              </div>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t("adminCommon.title")} className="w-full px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
              <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder={t("adminCommon.subtitle")} className="w-full px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
              <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder={t("adminCommon.imageUrl")} className="w-full px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
              <input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                placeholder={t("adminCommon.linkUrl")} className="w-full px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
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

        {/* Sliders list */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-deep-sea-teal border-t-transparent rounded-full" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sliders.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`bg-white rounded-2xl border overflow-hidden ${s.is_published ? "border-deep-sea-teal/10" : "border-deep-sea-teal/5 opacity-50"}`}>
                {/* Preview */}
                <div className="h-32 bg-deep-sea-teal/[0.04] flex items-center justify-center overflow-hidden">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-deep-sea-teal/20">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-chios-purple/50 bg-chios-purple/5 px-1.5 py-0.5 rounded uppercase">{s.language}</span>
                    {s.link_url && <span className="text-[10px] text-deep-sea-teal/30">🔗</span>}
                  </div>
                  <p className="text-sm font-semibold text-deep-sea-teal truncate">{s.title || t("adminCommon.untitled")}</p>
                  {s.subtitle && <p className="text-xs text-deep-sea-teal/40 mt-0.5 truncate">{s.subtitle}</p>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-deep-sea-teal/5">
                    <button onClick={() => handleTogglePublish(s)}
                      className={`text-[10px] px-2 py-1 rounded-lg cursor-pointer ${s.is_published ? "bg-success-green/10 text-success-green" : "bg-deep-sea-teal/5 text-deep-sea-teal/30"}`}>
                      {s.is_published ? t("adminCommon.published") : t("adminCommon.draft")}
                    </button>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(s)} className="p-1 text-deep-sea-teal/30 hover:text-chios-purple transition-colors cursor-pointer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1 text-deep-sea-teal/20 hover:text-red-500 transition-colors cursor-pointer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {sliders.length === 0 && <div className="col-span-full text-center py-12 text-deep-sea-teal/40">{t("adminCommon.empty")}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
