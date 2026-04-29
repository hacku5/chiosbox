"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

interface Translation {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

export default function AdminTranslationsPage() {
  const { t } = useTranslation();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLang, setSelectedLang] = useState("");
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [saveMessage, setSaveMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [addToAll, setAddToAll] = useState(false);
  const [category, setCategory] = useState<"all" | "admin" | "frontend">("all");

  useEffect(() => {
    fetch("/api/admin/languages")
      .then((r) => r.json())
      .then((data) => {
        if (data.languages) {
          setLanguages(data.languages);
          if (data.languages.length > 0) {
            setSelectedLang(data.languages[0].code);
          }
        }
      });
  }, []);

  const fetchTranslations = useCallback(async () => {
    if (!selectedLang) return;
    setLoading(true);
    const params = new URLSearchParams({ lang: selectedLang });
    if (search) params.set("search", search);

    const res = await fetch(`/api/admin/translations?${params}`);
    if (res.ok) {
      const data = await res.json();
      setTranslations(data.translations || []);
    }
    setLoading(false);
    setEditedValues({});
  }, [selectedLang, search]);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  const handleEdit = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const entries = Object.entries(editedValues)
      .filter(([, value]) => value.trim() !== "")
      .map(([key, value]) => ({ key, value }));

    if (entries.length === 0) return;

    setSaving(true);
    setSaveMessage("");

    const res = await fetch("/api/admin/translations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: selectedLang, entries }),
    });

    if (res.ok) {
      const data = await res.json();
      setSaveMessage(t("adminTranslations.saved").replace("{count}", String(data.saved)));
      setEditedValues({});
      fetchTranslations();
    } else {
      setSaveMessage(t("adminTranslations.saveFailed"));
    }

    setSaving(false);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleDelete = async (key: string) => {
    await fetch(`/api/admin/translations?lang=${selectedLang}&key=${encodeURIComponent(key)}`, {
      method: "DELETE",
    });
    fetchTranslations();
  };

  const handleDeleteAll = async (key: string) => {
    if (!confirm(t("adminTranslations.deleteAllConfirm").replace("{key}", key))) return;
    const promises = languages.map((lang) =>
      fetch(`/api/admin/translations?lang=${lang.code}&key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      })
    );
    await Promise.all(promises);
    fetchTranslations();
  };

  const handleAdd = async () => {
    if (!newKey.trim() || !newValue.trim()) return;
    setSaving(true);
    setSaveMessage("");

    if (addToAll) {
      // Add to all languages with the same value
      const entries = [{ key: newKey.trim(), value: newValue.trim() }];
      const promises = languages.map((lang) =>
        fetch("/api/admin/translations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang: lang.code, entries }),
        })
      );
      await Promise.all(promises);
      setSaveMessage(t("adminTranslations.addedToAll").replace("{key}", newKey.trim()));
    } else {
      // Add to current language only
      const res = await fetch("/api/admin/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: selectedLang, entries: [{ key: newKey.trim(), value: newValue.trim() }] }),
      });
      if (res.ok) {
        setSaveMessage(t("adminTranslations.addedSingle").replace("{key}", newKey.trim()));
      } else {
        setSaveMessage(t("adminTranslations.addFailed"));
      }
    }

    setNewKey("");
    setNewValue("");
    setShowAddForm(false);
    setSaving(false);
    fetchTranslations();
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const editedCount = Object.keys(editedValues).length;

  // Category filtering
  const adminPrefixes = ["admin", "adminTranslations", "adminPolicies", "adminPackages", "adminCustomers", "adminInvoices", "adminIntake", "adminPickup", "adminUsers", "adminDashboard", "adminSettings", "adminStats"];
  const filteredTranslations = category === "all"
    ? translations
    : category === "admin"
      ? translations.filter((tr) => adminPrefixes.some((p) => tr.key.startsWith(p) || tr.key.startsWith(p.charAt(0).toLowerCase() + p.slice(1))))
      : translations.filter((tr) => !adminPrefixes.some((p) => tr.key.startsWith(p) || tr.key.startsWith(p.charAt(0).toLowerCase() + p.slice(1))));

  const adminCount = translations.filter((tr) => adminPrefixes.some((p) => tr.key.startsWith(p) || tr.key.startsWith(p.charAt(0).toLowerCase() + p.slice(1)))).length;
  const frontendCount = translations.length - adminCount;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-deep-sea-teal">{t("adminTranslations.title")}</h1>
          <p className="text-sm text-deep-sea-teal/50 mt-1">
            {t("adminTranslations.description")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {editedCount > 0 && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-deep-sea-teal text-white rounded-xl text-sm font-medium hover:bg-deep-sea-teal/90 disabled:opacity-50 transition-colors"
            >
              {saving ? t("adminTranslations.saving") : t("adminTranslations.saveChanges").replace("{count}", String(editedCount))}
            </button>
          )}
          {saveMessage && (
            <span className="text-sm text-green-600 font-medium">{saveMessage}</span>
          )}
        </div>
      </div>

      {/* Language tabs + Category tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedLang === lang.code
                  ? "bg-deep-sea-teal text-white"
                  : "bg-deep-sea-teal/5 text-deep-sea-teal/60 hover:bg-deep-sea-teal/10 hover:text-deep-sea-teal"
              }`}
            >
              {lang.flag} {lang.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap sm:ml-auto">
          {[
            { key: "all", label: `${t("adminTranslations.categoryAll")} (${translations.length})` },
            { key: "admin", label: `${t("adminTranslations.categoryAdmin")} (${adminCount})` },
            { key: "frontend", label: `${t("adminTranslations.categoryFrontend")} (${frontendCount})` },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key as typeof category)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                category === cat.key
                  ? "bg-chios-purple text-white"
                  : "bg-chios-purple/5 text-chios-purple/60 hover:bg-chios-purple/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Add */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("adminTranslations.searchPlaceholder")}
            className="w-full px-4 py-3 bg-white border border-deep-sea-teal/10 rounded-2xl text-sm focus:outline-none focus:border-deep-sea-teal/30"
          />
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-deep-sea-teal/30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-4 py-3 rounded-2xl text-sm font-medium transition-colors flex items-center gap-2 ${
            showAddForm
              ? "bg-chios-purple text-white"
              : "bg-chios-purple/10 text-chios-purple hover:bg-chios-purple/20"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t("adminTranslations.addKey")}
        </button>
      </div>

      {/* Add key form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl border border-chios-purple/20 p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold text-deep-sea-teal">{t("adminTranslations.addKeyTitle")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-deep-sea-teal/50 mb-1">{t("adminTranslations.keyLabel")}</label>
              <input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="category.keyName"
                className="w-full px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-deep-sea-teal/50 mb-1">{t("adminTranslations.valueLabel")} ({selectedLang.toUpperCase()})</label>
              <input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={t("adminTranslations.valuePlaceholder")}
                className="w-full px-3 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addToAll}
                onChange={(e) => setAddToAll(e.target.checked)}
                className="w-4 h-4 rounded border-deep-sea-teal/20 text-chios-purple focus:ring-chios-purple/20"
              />
              <span className="text-xs text-deep-sea-teal/60">{t("adminTranslations.addToAll")}</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAddForm(false); setNewKey(""); setNewValue(""); }}
                className="px-4 py-2 text-sm text-deep-sea-teal/50 hover:text-deep-sea-teal transition-colors"
              >
                {t("adminTranslations.cancel")}
              </button>
              <button
                onClick={handleAdd}
                disabled={!newKey.trim() || !newValue.trim() || saving}
                className="px-5 py-2 bg-chios-purple text-white rounded-xl text-sm font-medium hover:bg-chios-purple-dark disabled:opacity-40 transition-colors"
              >
                {saving ? t("adminTranslations.adding") : t("adminTranslations.addBtn")}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Translations table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-deep-sea-teal border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTranslations.map((tr, i) => {
            const isEdited = tr.key in editedValues;
            const currentValue = editedValues[tr.key] ?? tr.value;

            return (
              <motion.div
                key={tr.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`bg-white rounded-xl border p-3 flex items-start gap-3 ${
                  isEdited ? "border-deep-sea-teal/30 bg-deep-sea-teal/[0.02]" : "border-deep-sea-teal/10"
                }`}
              >
                <div className="w-48 shrink-0">
                  <span className="text-xs font-mono text-deep-sea-teal/40 break-all">{tr.key}</span>
                </div>
                <textarea
                  value={currentValue}
                  onChange={(e) => handleEdit(tr.key, e.target.value)}
                  rows={1}
                  className="flex-1 text-sm text-deep-sea-teal bg-transparent resize-none focus:outline-none min-h-[28px]"
                />
                <div className="shrink-0 flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(tr.key)}
                    className="text-deep-sea-teal/20 hover:text-red-500 transition-colors p-1"
                    title={t("adminTranslations.deleteFromLang")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteAll(tr.key)}
                    className="text-deep-sea-teal/20 hover:text-red-500 transition-colors p-1 text-[10px] font-bold"
                    title={t("adminTranslations.deleteFromAll")}
                  >
                    ×ALL
                  </button>
                </div>
              </motion.div>
            );
          })}

          {filteredTranslations.length === 0 && (
            <div className="text-center py-12 text-deep-sea-teal/40">
              {search ? t("adminTranslations.noResults") : t("adminTranslations.empty")}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
