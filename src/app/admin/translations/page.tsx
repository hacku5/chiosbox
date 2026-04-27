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

  const editedCount = Object.keys(editedValues).length;

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

      {/* Language tabs */}
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

      {/* Search */}
      <div className="relative">
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

      {/* Translations table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-deep-sea-teal border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-2">
          {translations.map((tr, i) => {
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
                <button
                  onClick={() => handleDelete(tr.key)}
                  className="shrink-0 text-deep-sea-teal/20 hover:text-red-500 transition-colors p-1"
                  title={t("adminTranslations.delete")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </motion.div>
            );
          })}

          {translations.length === 0 && (
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
