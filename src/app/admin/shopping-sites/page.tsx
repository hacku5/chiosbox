"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

interface Site {
  id: string;
  name: string;
  url: string;
  country: string;
  category: string;
  logo_url: string;
  sort_order: number;
}

const COUNTRIES = ["DE", "NL", "FR", "IT", "ES", "UK", "AT", "BE", "PL", "SE"];

export default function AdminShoppingSitesPage() {
  const { t } = useTranslation();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", url: "", country: "DE", category: "general", logo_url: "", sort_order: 0 });
  const [saveMsg, setSaveMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchSites = useCallback(async () => {
    setLoading(true);
    const params = activeCountry ? `?country=${activeCountry}` : "";
    const res = await fetch(`/api/admin/shopping-sites${params}`);
    if (res.ok) {
      const data = await res.json();
      setSites(data.sites || []);
    }
    setLoading(false);
  }, [activeCountry]);

  useEffect(() => { fetchSites(); }, [fetchSites]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.url) return;
    const url = "/api/admin/shopping-sites";
    const method = editing ? "PATCH" : "POST";
    const body = editing ? { id: editing, ...form } : form;

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      setShowForm(false); setEditing(null);
      setForm({ name: "", url: "", country: "DE", category: "general", logo_url: "", sort_order: 0 });
      fetchSites();
      setSaveMsg(editing ? t("adminCommon.updated") : t("adminCommon.created"));
      setTimeout(() => setSaveMsg(""), 2000);
    }
  };

  const handleEdit = (s: Site) => {
    setEditing(s.id);
    setForm({ name: s.name, url: s.url, country: s.country, category: s.category, logo_url: s.logo_url, sort_order: s.sort_order });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/shopping-sites?id=${id}`, { method: "DELETE" });
    fetchSites();
  };

  const handleExportCSV = () => {
    const header = "name,url,country,category,logo_url";
    const rows = sites.map((s) => `"${s.name}","${s.url}","${s.country}","${s.category}","${s.logo_url}"`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "shopping-sites.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      if (lines.length < 2) return;
      const header = lines[0].split(",");
      const rows = lines.slice(1).map((line) => {
        const vals = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const obj: Record<string, string> = {};
        header.forEach((h, i) => { obj[h.trim()] = (vals[i] || "").replace(/^"|"$/g, ""); });
        return obj;
      });
      const res = await fetch("/api/admin/shopping-sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      });
      if (res.ok) {
        const data = await res.json();
        setSaveMsg(t("adminCommon.imported").replace("{count}", String(data.imported)));
        setTimeout(() => setSaveMsg(""), 3000);
        fetchSites();
      }
    };
    reader.readAsText(file);
  };

  const countries = [...new Set(sites.map((s) => s.country))];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-deep-sea-teal">{t("admin.shoppingSites")}</h1>
            <p className="text-sm text-deep-sea-teal/50 mt-1">{t("adminShoppingSites.description")}</p>
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && <span className="text-sm text-success-green font-medium">{saveMsg}</span>}
            <button onClick={handleExportCSV} className="px-3 py-2 bg-deep-sea-teal/5 text-deep-sea-teal/60 rounded-xl text-xs font-medium hover:bg-deep-sea-teal/10 transition-colors cursor-pointer">
              ↓ CSV
            </button>
            <label className="px-3 py-2 bg-chios-purple/5 text-chios-purple/60 rounded-xl text-xs font-medium hover:bg-chios-purple/10 transition-colors cursor-pointer">
              ↑ CSV
              <input ref={fileRef} type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
            </label>
            <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", url: "", country: "DE", category: "general", logo_url: "", sort_order: 0 }); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${showForm ? "bg-chios-purple text-white" : "bg-chios-purple/10 text-chios-purple hover:bg-chios-purple/20"}`}>
              + {t("adminCommon.add")}
            </button>
          </div>
        </div>

        {/* Country tabs */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveCountry(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!activeCountry ? "bg-deep-sea-teal text-white" : "bg-deep-sea-teal/5 text-deep-sea-teal/60 hover:bg-deep-sea-teal/10"}`}>
            {t("adminCommon.allCountries")}
          </button>
          {COUNTRIES.filter((c) => countries.includes(c) || !activeCountry).map((c) => (
            <button key={c} onClick={() => setActiveCountry(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeCountry === c ? "bg-deep-sea-teal text-white" : "bg-deep-sea-teal/5 text-deep-sea-teal/60 hover:bg-deep-sea-teal/10"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="bg-white rounded-2xl border border-chios-purple/20 p-5 space-y-3">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t("adminCommon.name")} className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
                <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder={t("adminCommon.url")} className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
                <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50">
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder={t("adminCommon.category")} className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
                <input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  placeholder={t("adminCommon.logoUrl")} className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
              </div>
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

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-deep-sea-teal border-t-transparent rounded-full" /></div>
        ) : (
          <div className="space-y-1">
            {sites.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.01 }}
                className="flex items-center gap-4 p-3 bg-white rounded-xl border border-deep-sea-teal/5 hover:border-deep-sea-teal/10 transition-colors">
                <span className="w-8 text-xs font-mono text-deep-sea-teal/20 text-right">{i + 1}</span>
                <span className="w-8 text-center">{s.logo_url ? <img src={s.logo_url} alt="" className="w-5 h-5 inline object-contain" /> : s.name[0]}</span>
                <div className="flex-1 min-w-0">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-deep-sea-teal hover:text-chios-purple transition-colors">{s.name}</a>
                  <span className="text-[10px] text-deep-sea-teal/30 ml-2">{s.url}</span>
                </div>
                <span className="text-[10px] font-mono text-deep-sea-teal/30 bg-deep-sea-teal/5 px-1.5 py-0.5 rounded">{s.country}</span>
                <span className="text-[10px] text-deep-sea-teal/30 bg-deep-sea-teal/5 px-1.5 py-0.5 rounded hidden sm:inline">{s.category}</span>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(s)} className="p-1 text-deep-sea-teal/30 hover:text-chios-purple transition-colors cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1 text-deep-sea-teal/20 hover:text-red-500 transition-colors cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                  </button>
                </div>
              </motion.div>
            ))}
            {sites.length === 0 && <div className="text-center py-12 text-deep-sea-teal/40">{t("adminCommon.empty")}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
