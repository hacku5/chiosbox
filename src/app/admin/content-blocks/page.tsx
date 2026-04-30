"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

interface ContentBlock {
  id?: string;
  section_key: string;
  title: string;
  subtitle: string;
  body: string;
  image_url: string;
  link_url: string;
  is_published: boolean;
}

const SECTIONS = [
  { key: "hero", label: "Hero" },
  { key: "how_it_works", label: "Nasıl Çalışır" },
  { key: "pricing", label: "Fiyatlandırma" },
  { key: "trust", label: "Güven" },
  { key: "final_cta", label: "Son CTA" },
  { key: "about_hero", label: "Hakkımızda Hero" },
  { key: "about_mission", label: "Hakkımızda Misyon" },
  { key: "about_story", label: "Hakkımızda Hikaye" },
  { key: "about_team", label: "Hakkımızda Ekip" },
  { key: "contact_map", label: "İletişim Harita" },
];

export default function AdminContentBlocksPage() {
  const { t } = useTranslation();
  const [blocks, setBlocks] = useState<Record<string, ContentBlock>>({});
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("hero");
  const [form, setForm] = useState({ title: "", subtitle: "", body: "", image_url: "", link_url: "" });
  const [dirty, setDirty] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/content-blocks");
    if (res.ok) {
      const data = await res.json();
      const map: Record<string, ContentBlock> = {};
      (data.blocks || []).forEach((b: ContentBlock) => { map[b.section_key] = b; });
      setBlocks(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  useEffect(() => {
    const b = blocks[activeSection];
    setForm({
      title: b?.title || "",
      subtitle: b?.subtitle || "",
      body: b?.body || "",
      image_url: b?.image_url || "",
      link_url: b?.link_url || "",
    });
    setDirty(false);
  }, [activeSection, blocks]);

  const handleSave = async () => {
    setSaveMsg("");
    const res = await fetch("/api/admin/content-blocks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_key: activeSection, ...form }),
    });
    if (res.ok) {
      fetchBlocks();
      setDirty(false);
      setSaveMsg(t("adminCommon.saved"));
      setTimeout(() => setSaveMsg(""), 2000);
    }
  };

  const handleTogglePublish = async () => {
    const b = blocks[activeSection];
    if (!b) return;
    await fetch("/api/admin/content-blocks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_key: activeSection, is_published: !b.is_published }),
    });
    fetchBlocks();
  };

  const activeBlock = blocks[activeSection];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-deep-sea-teal">{t("admin.contentBlocks")}</h1>
            <p className="text-sm text-deep-sea-teal/50 mt-1">{t("adminContentBlocks.description")}</p>
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && <span className="text-sm text-success-green font-medium">{saveMsg}</span>}
            {dirty && <span className="text-xs text-amber-500 font-medium">{t("adminCommon.unsaved")}</span>}
            <button onClick={handleSave}
              className="px-4 py-2 bg-chios-purple text-white rounded-xl text-sm font-medium hover:bg-chios-purple-dark transition-colors">
              {t("adminCommon.save")}
            </button>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 flex-wrap">
          {SECTIONS.map((s) => (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeSection === s.key
                  ? "bg-deep-sea-teal text-white"
                  : "bg-deep-sea-teal/5 text-deep-sea-teal/60 hover:bg-deep-sea-teal/10"
              }`}>
              {s.label}
              {blocks[s.key]?.is_published && (
                <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-success-green" />
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-deep-sea-teal border-t-transparent rounded-full" />
          </div>
        ) : (
          <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-deep-sea-teal/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-deep-sea-teal">{SECTIONS.find(s => s.key === activeSection)?.label}</h2>
              <button onClick={handleTogglePublish}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeBlock?.is_published
                    ? "bg-success-green/10 text-success-green"
                    : "bg-deep-sea-teal/5 text-deep-sea-teal/30"
                }`}>
                {activeBlock?.is_published ? t("adminCommon.published") : t("adminCommon.draft")}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); setDirty(true); }}
                placeholder={t("adminCommon.title")}
                className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
              <input value={form.subtitle} onChange={(e) => { setForm({ ...form, subtitle: e.target.value }); setDirty(true); }}
                placeholder={t("adminCommon.subtitle")}
                className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
            </div>

            <textarea value={form.body} onChange={(e) => { setForm({ ...form, body: e.target.value }); setDirty(true); }} rows={6}
              placeholder={t("adminCommon.body")}
              className="w-full px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50 resize-none" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={form.image_url} onChange={(e) => { setForm({ ...form, image_url: e.target.value }); setDirty(true); }}
                placeholder={t("adminCommon.imageUrl")}
                className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
              <input value={form.link_url} onChange={(e) => { setForm({ ...form, link_url: e.target.value }); setDirty(true); }}
                placeholder={t("adminCommon.linkUrl")}
                className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
            </div>

            {form.image_url && (
              <div className="h-40 bg-deep-sea-teal/[0.04] rounded-xl flex items-center justify-center overflow-hidden">
                <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
