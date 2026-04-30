"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  sort_order: number;
  is_active: boolean;
}

export default function AdminPlansPage() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", price: 0, features: "", sort_order: 0 });
  const [saveMsg, setSaveMsg] = useState("");

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/plans");
    if (res.ok) {
      const data = await res.json();
      setPlans((data.plans || []).map((p: Plan) => ({ ...p, features: typeof p.features === "string" ? JSON.parse(p.features as string) : p.features })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const features = form.features.split("\n").filter(Boolean);
    const body = editing ? { id: editing, name: form.name, price: form.price, features, sort_order: form.sort_order } : { ...form, features };

    const res = await fetch("/api/admin/plans", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false); setEditing(null); setForm({ name: "", price: 0, features: "", sort_order: 0 });
      fetchPlans();
      setSaveMsg(editing ? t("adminCommon.updated") : t("adminCommon.created"));
      setTimeout(() => setSaveMsg(""), 2000);
    }
  };

  const handleEdit = (p: Plan) => {
    setEditing(p.id);
    setForm({ name: p.name, price: p.price, features: (p.features || []).join("\n"), sort_order: p.sort_order });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/plans?id=${id}`, { method: "DELETE" });
    fetchPlans();
  };

  const handleToggleActive = async (p: Plan) => {
    await fetch("/api/admin/plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, is_active: !p.is_active }),
    });
    fetchPlans();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-deep-sea-teal">{t("admin.plans")}</h1>
            <p className="text-sm text-deep-sea-teal/50 mt-1">{t("adminPlans.description")}</p>
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && <span className="text-sm text-success-green font-medium">{saveMsg}</span>}
            <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", price: 0, features: "", sort_order: 0 }); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${showForm ? "bg-chios-purple text-white" : "bg-chios-purple/10 text-chios-purple hover:bg-chios-purple/20"}`}>
              + {t("adminCommon.add")}
            </button>
          </div>
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="bg-white rounded-2xl border border-chios-purple/20 p-5 space-y-3">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t("adminCommon.name")} className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  placeholder={t("adminCommon.price")} className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder={t("adminCommon.sortOrder")} className="px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
              </div>
              <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={5}
                placeholder={t("adminCommon.featuresHelp")} className="w-full px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50 resize-none" />
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

        {/* Plans cards */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-deep-sea-teal border-t-transparent rounded-full" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-2xl border p-6 ${p.is_active ? "border-deep-sea-teal/10" : "border-deep-sea-teal/5 opacity-50"}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-display font-bold text-deep-sea-teal">{p.name}</h3>
                    <p className="text-2xl font-bold text-chios-purple">€{Number(p.price).toFixed(2)}<span className="text-sm font-normal text-deep-sea-teal/40">/ay</span></p>
                  </div>
                  <button onClick={() => handleToggleActive(p)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${p.is_active ? "bg-success-green" : "bg-deep-sea-teal/15"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${p.is_active ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
                <ul className="space-y-2 mb-4">
                  {(p.features || []).map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-deep-sea-teal/60">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-success-green mt-0.5"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-1 pt-3 border-t border-deep-sea-teal/5">
                  <button onClick={() => handleEdit(p)} className="flex-1 py-2 text-xs font-medium text-deep-sea-teal/50 hover:text-chios-purple hover:bg-chios-purple/5 rounded-lg transition-colors cursor-pointer">{t("adminCommon.edit")}</button>
                  <button onClick={() => handleDelete(p.id)} className="flex-1 py-2 text-xs font-medium text-deep-sea-teal/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">{t("adminCommon.delete")}</button>
                </div>
              </motion.div>
            ))}
            {plans.length === 0 && <div className="col-span-full text-center py-12 text-deep-sea-teal/40">{t("adminCommon.empty")}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
