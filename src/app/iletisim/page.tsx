"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { useSettings } from "@/hooks/use-settings";

export default function ContactPage() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [mapUrl, setMapUrl] = useState(
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12445.81887816245!2d26.1384!3d38.3689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14bb87f3c8b5a5b7%3A0x1a1a1a1a1a1a1a1a!2sChios!5e0!3m2!1sen!2str!4v1"
  );

  useEffect(() => {
    fetch("/api/content-blocks?section_key=contact_map")
      .then((r) => r.json())
      .then((data) => {
        if (data.blocks?.[0]?.body) setMapUrl(data.blocks[0].body);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } else {
      setError(t("contact.sendError"));
    }
    setSending(false);
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-mastic-white">
      <div className="pt-24 pb-16 px-6 lg:px-8">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="max-w-5xl mx-auto">
          <motion.div variants={item} className="text-center mb-12">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-deep-sea-teal">{t("contact.title")}</h1>
            <p className="mt-3 text-deep-sea-teal/60 max-w-xl mx-auto">{t("contact.description")}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <motion.div variants={item} className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-success-green/10 flex items-center justify-center mx-auto mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success-green">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-deep-sea-teal">{t("contact.sentTitle")}</h3>
                  <p className="text-sm text-deep-sea-teal/50 mt-1">{t("contact.sentText")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-deep-sea-teal/70 mb-1">{t("contact.name")}</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required className="w-full px-4 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-deep-sea-teal/70 mb-1">{t("contact.email")}</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required className="w-full px-4 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-deep-sea-teal/70 mb-1">{t("contact.subject")}</label>
                    <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-deep-sea-teal/70 mb-1">{t("contact.message")}</label>
                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required rows={5} className="w-full px-4 py-2.5 border border-deep-sea-teal/10 rounded-xl text-sm focus:outline-none focus:border-chios-purple/50 resize-none" />
                  </div>
                  {error && <p className="text-sm text-danger-red">{error}</p>}
                  <button type="submit" disabled={sending}
                    className="w-full py-3 bg-chios-purple text-white rounded-xl font-semibold hover:bg-chios-purple-dark disabled:opacity-50 transition-colors cursor-pointer">
                    {sending ? t("contact.sending") : t("contact.send")}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Map + Address */}
            <motion.div variants={item} className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5">
                <h3 className="font-semibold text-deep-sea-teal mb-3">{t("contact.address")}</h3>
                <div className="p-4 bg-deep-sea-teal/[0.03] rounded-xl font-mono text-sm text-deep-sea-teal/80 whitespace-pre-line leading-relaxed">
                  {settings.warehouse_address}
                </div>
              </div>
              <div className="bg-deep-sea-teal/5 rounded-2xl overflow-hidden h-64">
                <iframe
                  src={mapUrl}
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  title="Chios Warehouse Location"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
