"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { RichTextEditor } from "@/components/rich-text-editor";

interface Policy {
  id: string;
  slug: string;
  language: string;
  title: string;
  content: string;
  is_published: boolean;
  updated_at: string;
}

const SLUGS = ["terms", "privacy", "kvkk"] as const;

const SLUG_LABELS: Record<string, { tr: string; en: string; de: string }> = {
  terms: { tr: "Kullanıcı Sözleşmesi", en: "Terms of Service", de: "Nutzungsbedingungen" },
  privacy: { tr: "Gizlilik Politikası", en: "Privacy Policy", de: "Datenschutzerklärung" },
  kvkk: { tr: "KVKK Aydınlatma Metni", en: "KVKK Disclosure", de: "KVKK Belehrung" },
};

const LANGS = [
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
];

export default function AdminPoliciesPage() {
  const { t } = useTranslation();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>("terms");
  const [activeLang, setActiveLang] = useState<string>("tr");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/policies");
    if (res.ok) {
      const data = await res.json();
      setPolicies(data.policies || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const current = policies.find(
    (p) => p.slug === activeSlug && p.language === activeLang
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (current) {
      setTitle(current.title);
      setContent(current.content);
    } else {
      setTitle(SLUG_LABELS[activeSlug]?.[activeLang as keyof typeof SLUG_LABELS[string]] || "");
      setContent("");
    }
  }, [current, activeSlug, activeLang]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");

    const res = await fetch("/api/admin/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: activeSlug,
        language: activeLang,
        title,
        content,
      }),
    });

    if (res.ok) {
      setSaveMessage(t("adminPolicies.saved"));
      fetchPolicies();
    } else {
      setSaveMessage(t("adminPolicies.saveFailed"));
    }

    setSaving(false);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleTogglePublish = async (policy: Policy) => {
    await fetch("/api/admin/policies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: policy.id,
        is_published: !policy.is_published,
      }),
    });
    fetchPolicies();
  };

  const getPublishStatus = (slug: string) => {
    const slugPolicies = policies.filter((p) => p.slug === slug);
    const published = slugPolicies.filter((p) => p.is_published).length;
    const total = slugPolicies.length;
    return { published, total };
  };

  const hasChanges =
    current
      ? current.title !== title || current.content !== content
      : title.trim() !== "" || content.trim() !== "";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-deep-sea-teal">
            {t("adminPolicies.title")}
          </h1>
          <p className="text-sm text-deep-sea-teal/50 mt-1">
            {t("adminPolicies.description")}
          </p>
        </div>

        {/* Slug tabs */}
        <div className="flex gap-2 flex-wrap">
          {SLUGS.map((slug) => {
            const status = getPublishStatus(slug);
            return (
              <button
                key={slug}
                onClick={() => setActiveSlug(slug)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeSlug === slug
                    ? "bg-deep-sea-teal text-white"
                    : "bg-deep-sea-teal/5 text-deep-sea-teal/60 hover:bg-deep-sea-teal/10 hover:text-deep-sea-teal"
                }`}
              >
                <span>{SLUG_LABELS[slug]?.tr || slug}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeSlug === slug
                      ? "bg-white/20 text-white"
                      : status.published === status.total && status.total > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-deep-sea-teal/10 text-deep-sea-teal/40"
                  }`}
                >
                  {status.published}/{status.total}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-deep-sea-teal border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Language tabs + publish toggle */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2">
                {LANGS.map((lang) => {
                  const langPolicy = policies.find(
                    (p) => p.slug === activeSlug && p.language === lang.code
                  );
                  return (
                    <button
                      key={lang.code}
                      onClick={() => setActiveLang(lang.code)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                        activeLang === lang.code
                          ? "bg-chios-purple text-white"
                          : "bg-chios-purple/5 text-chios-purple/60 hover:bg-chios-purple/10"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                      {langPolicy?.is_published && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                {current && (
                  <button
                    onClick={() => handleTogglePublish(current)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      current.is_published
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {current.is_published
                      ? t("adminPolicies.published")
                      : t("adminPolicies.draft")}
                  </button>
                )}
                {hasChanges && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-deep-sea-teal text-white rounded-xl text-sm font-medium hover:bg-deep-sea-teal/90 disabled:opacity-50 transition-colors"
                  >
                    {saving ? t("adminPolicies.saving") : t("adminPolicies.save")}
                  </button>
                )}
                {saveMessage && (
                  <span className="text-sm text-green-600 font-medium">
                    {saveMessage}
                  </span>
                )}
              </div>
            </div>

            {/* Editor */}
            <motion.div
              key={`${activeSlug}-${activeLang}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-deep-sea-teal/50 mb-1.5">
                  {t("adminPolicies.titleLabel")}
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-deep-sea-teal/10 rounded-2xl text-sm text-deep-sea-teal focus:outline-none focus:border-deep-sea-teal/30"
                  placeholder={t("adminPolicies.titlePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-deep-sea-teal/50 mb-1.5">
                  {t("adminPolicies.contentLabel")}
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder={t("adminPolicies.contentPlaceholder")}
                />
                <p className="text-xs text-deep-sea-teal/30 mt-1">
                  {t("adminPolicies.contentHint")}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
