"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

interface Language {
  code: string;
  name: string;
  flag: string;
  is_default: boolean;
  is_enabled: boolean;
}

export default function AdminLanguagesPage() {
  const { t } = useTranslation();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newFlag, setNewFlag] = useState("🌐");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchLanguages = async () => {
    const res = await fetch("/api/admin/languages");
    if (res.ok) {
      const data = await res.json();
      setLanguages(data.languages);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleAdd = async () => {
    if (!newCode || !newName) return;
    setSaving(true);
    const res = await fetch("/api/admin/languages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: newCode.toLowerCase().trim(), name: newName.trim(), flag: newFlag }),
    });
    if (res.ok) {
      setNewCode("");
      setNewName("");
      setNewFlag("🌐");
      setShowAddForm(false);
      fetchLanguages();
    }
    setSaving(false);
  };

  const handleToggleEnabled = async (code: string, current: boolean) => {
    await fetch("/api/admin/languages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, is_enabled: !current }),
    });
    fetchLanguages();
  };

  const handleSetDefault = async (code: string) => {
    await fetch("/api/admin/languages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, is_default: true }),
    });
    fetchLanguages();
  };

  const handleDelete = async (code: string) => {
    await fetch(`/api/admin/languages?code=${code}`, { method: "DELETE" });
    setDeleteConfirm(null);
    fetchLanguages();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-deep-sea-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-deep-sea-teal">{t("adminLanguages.title")}</h1>
          <p className="text-sm text-deep-sea-teal/50 mt-1">
            {t("adminLanguages.description")}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-deep-sea-teal text-white rounded-xl text-sm font-medium hover:bg-deep-sea-teal/90 transition-colors"
        >
          + {t("adminLanguages.addLanguage")}
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white rounded-2xl border border-deep-sea-teal/10 p-5 space-y-4"
        >
          <h3 className="font-semibold text-deep-sea-teal">{t("adminLanguages.addNewLanguage")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-deep-sea-teal/60 mb-1 block">{t("adminLanguages.code")}</label>
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="en"
                maxLength={5}
                className="w-full px-3 py-2 border border-deep-sea-teal/20 rounded-xl text-sm focus:outline-none focus:border-deep-sea-teal/50"
              />
            </div>
            <div>
              <label className="text-xs text-deep-sea-teal/60 mb-1 block">{t("adminLanguages.name")}</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="English"
                className="w-full px-3 py-2 border border-deep-sea-teal/20 rounded-xl text-sm focus:outline-none focus:border-deep-sea-teal/50"
              />
            </div>
            <div>
              <label className="text-xs text-deep-sea-teal/60 mb-1 block">{t("adminLanguages.flag")}</label>
              <input
                value={newFlag}
                onChange={(e) => setNewFlag(e.target.value)}
                placeholder="🇬🇧"
                className="w-full px-3 py-2 border border-deep-sea-teal/20 rounded-xl text-sm focus:outline-none focus:border-deep-sea-teal/50"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={saving || !newCode || !newName}
              className="px-4 py-2 bg-deep-sea-teal text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {saving ? t("adminLanguages.adding") : t("adminLanguages.add")}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-deep-sea-teal/60 text-sm hover:text-deep-sea-teal transition-colors"
            >
              {t("adminLanguages.cancel")}
            </button>
          </div>
        </motion.div>
      )}

      {/* Language list */}
      <div className="space-y-3">
        {languages.map((lang) => (
          <motion.div
            key={lang.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-deep-sea-teal/10 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{lang.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-deep-sea-teal">{lang.name}</span>
                  <span className="text-xs text-deep-sea-teal/40 bg-deep-sea-teal/5 px-2 py-0.5 rounded-full">
                    {lang.code}
                  </span>
                  {lang.is_default && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                      {t("adminLanguages.default")}
                    </span>
                  )}
                </div>
                <span className="text-xs text-deep-sea-teal/40">
                  {lang.is_enabled ? t("adminLanguages.active") : t("adminLanguages.inactive")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle enabled */}
              <button
                onClick={() => handleToggleEnabled(lang.code, lang.is_enabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  lang.is_enabled ? "bg-deep-sea-teal" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    lang.is_enabled ? "translate-x-5" : ""
                  }`}
                />
              </button>

              {/* Set as default */}
              {!lang.is_default && (
                <button
                  onClick={() => handleSetDefault(lang.code)}
                  className="text-xs text-deep-sea-teal/50 hover:text-deep-sea-teal px-2 py-1 rounded-lg hover:bg-deep-sea-teal/5 transition-colors"
                >
                  {t("adminLanguages.setDefault")}
                </button>
              )}

              {/* Delete */}
              {!lang.is_default && (
                deleteConfirm === lang.code ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(lang.code)}
                      className="text-xs text-red-600 px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      {t("adminLanguages.delete")}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="text-xs text-deep-sea-teal/50 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {t("adminLanguages.cancel")}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(lang.code)}
                    className="text-xs text-deep-sea-teal/30 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    {t("adminLanguages.remove")}
                  </button>
                )
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {languages.length === 0 && (
        <div className="text-center py-12 text-deep-sea-teal/40">
          {t("adminLanguages.noLanguagesYet")}
        </div>
      )}
      </div>
    </div>
  );
}
