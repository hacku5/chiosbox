"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";

interface PolicyData {
  title: string;
  content: string;
  language: string;
  updated_at: string;
}

export function PolicyViewer({ slug }: { slug: string }) {
  const { lang } = useTranslation();
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    fetch(`/api/policies?slug=${slug}&lang=${lang}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data?.policy) {
          setPolicy(data.policy);
        } else if (data?.error) {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, lang]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mastic-white">
        <div className="animate-spin w-8 h-8 border-2 border-chios-purple border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound || !policy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mastic-white">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-deep-sea-teal mb-2">
            404
          </h1>
          <p className="text-deep-sea-teal/50">
            Bu sayfa henüz yayınlanmamıştır.
          </p>
          <p className="text-deep-sea-teal/50">
            This page has not been published yet.
          </p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(policy.updated_at).toLocaleDateString(
    lang === "tr" ? "tr-TR" : lang === "de" ? "de-DE" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const datePrefix =
    lang === "tr"
      ? "Son güncelleme"
      : lang === "de"
        ? "Letzte Aktualisierung"
        : "Last updated";

  return (
    <div className="min-h-screen bg-mastic-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-deep-sea-teal mb-2">
          {policy.title}
        </h1>
        <p className="text-sm text-deep-sea-teal/40 mb-10">
          {datePrefix}: {formattedDate}
        </p>
        <div
          className="policy-content prose prose-slate max-w-none
            prose-headings:font-display prose-headings:text-deep-sea-teal
            prose-p:text-deep-sea-teal/70 prose-p:leading-relaxed
            prose-a:text-chios-purple prose-a:no-underline hover:prose-a:underline
            prose-strong:text-deep-sea-teal
            prose-ul:text-deep-sea-teal/70
            prose-li:marker:text-chios-purple"
          dangerouslySetInnerHTML={{ __html: policy.content }}
        />
      </div>
    </div>
  );
}
