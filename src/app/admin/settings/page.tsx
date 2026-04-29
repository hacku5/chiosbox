"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

interface SettingRow {
  key: string;
  value: string;
  category: string;
  label: string;
  description: string;
  unit: string;
}

const CATEGORY_META: Record<string, { labelKey: string; icon: string }> = {
  fees: { labelKey: "adminSettings.catFees", icon: "€" },
  plans: { labelKey: "adminSettings.catPlans", icon: "★" },
  limits: { labelKey: "adminSettings.catLimits", icon: "⊘" },
  business: { labelKey: "adminSettings.catBusiness", icon: "⚙" },
  rate_limits: { labelKey: "adminSettings.catRateLimits", icon: "⏱" },
};

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [saveMsg, setSaveMsg] = useState("");
  const [activeCategory, setActiveCategory] = useState("fees");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      const data = await res.json();
      setSettings(data.settings || []);
    }
    setLoading(false);
    setEdited({});
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (key: string, rawValue: string) => {
    setEdited((prev) => ({ ...prev, [key]: rawValue }));
  };

  const handleSave = async () => {
    const entries = Object.entries(edited).filter(([, v]) => v.trim() !== "");
    if (!entries.length) return;

    setSaving(true);
    setSaveMsg("");

    const updates = entries.map(([key, rawValue]) => {
      // Parse to number if the original value was a number
      const original = settings.find((s) => s.key === key);
      const isNumeric = original && !isNaN(Number(JSON.parse(original.value)));
      return {
        key,
        value: isNumeric ? Number(rawValue) : rawValue,
      };
    });

    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });

    if (res.ok) {
      setSaveMsg(t("adminSettings.saved").replace("{count}", String(updates.length)));
      setEdited({});
      fetchSettings();
    } else {
      setSaveMsg(t("adminSettings.saveFailed"));
    }

    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const categories = Object.keys(CATEGORY_META);
  const filteredSettings = settings.filter((s) => s.category === activeCategory);
  const editedCount = Object.keys(edited).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-deep-sea-teal">
              {t("adminSettings.title")}
            </h1>
            <p className="text-sm text-deep-sea-teal/50 mt-1">
              {t("adminSettings.description")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {editedCount > 0 && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-deep-sea-teal text-white rounded-xl text-sm font-medium hover:bg-deep-sea-teal/90 disabled:opacity-50 transition-colors"
              >
                {saving
                  ? t("adminSettings.saving")
                  : t("adminSettings.saveChanges").replace("{count}", String(editedCount))}
              </button>
            )}
            {saveMsg && <span className="text-sm text-green-600 font-medium">{saveMsg}</span>}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat];
            const count = settings.filter((s) => s.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeCategory === cat
                    ? "bg-deep-sea-teal text-white"
                    : "bg-deep-sea-teal/5 text-deep-sea-teal/60 hover:bg-deep-sea-teal/10 hover:text-deep-sea-teal"
                }`}
              >
                <span>{meta.icon}</span>
                <span>{t(meta.labelKey)}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat
                      ? "bg-white/20 text-white"
                      : "bg-deep-sea-teal/10 text-deep-sea-teal/40"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Settings list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-deep-sea-teal border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSettings.map((setting, i) => {
              const displayValue =
                setting.key in edited
                  ? edited[setting.key]
                  : String(JSON.parse(setting.value));
              const isEdited = setting.key in edited;
              const isNumeric = !isNaN(Number(JSON.parse(setting.value)));

              return (
                <motion.div
                  key={setting.key}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`bg-white rounded-2xl border p-5 transition-colors ${
                    isEdited
                      ? "border-deep-sea-teal/30 bg-deep-sea-teal/[0.02]"
                      : "border-deep-sea-teal/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-deep-sea-teal">
                          {setting.label}
                        </span>
                        <span className="text-[10px] font-mono text-deep-sea-teal/30 bg-deep-sea-teal/5 px-1.5 py-0.5 rounded">
                          {setting.key}
                        </span>
                      </div>
                      {setting.description && (
                        <p className="text-xs text-deep-sea-teal/40 mt-0.5">
                          {setting.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type={isNumeric ? "number" : "text"}
                        value={displayValue}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        step={isNumeric ? "any" : undefined}
                        className={`w-32 px-3 py-2 border rounded-xl text-sm text-right focus:outline-none transition-colors ${
                          isEdited
                            ? "border-deep-sea-teal/40 bg-deep-sea-teal/[0.03]"
                            : "border-deep-sea-teal/10"
                        } focus:border-deep-sea-teal/40`}
                      />
                      {setting.unit && (
                        <span className="text-xs text-deep-sea-teal/40 w-10">
                          {setting.unit}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {filteredSettings.length === 0 && (
              <div className="text-center py-12 text-deep-sea-teal/40">
                {t("adminSettings.empty")}
              </div>
            )}
          </div>
        )}

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 9v2m0 4h.01M10.29 3.86l-8.6 14.86A2 2 0 003.41 22h17.18a2 2 0 001.72-3.28l-8.6-14.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">
              {t("adminSettings.warningTitle")}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {t("adminSettings.warningText")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
