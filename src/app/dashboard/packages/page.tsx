"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePackageStore, type PackageStatus, type Package } from "@/stores/package-store";
import { PackageListSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { useTranslation } from "@/hooks/use-translation";
import Link from "next/link";

function StatusStepper({ status, t }: { status: PackageStatus; t: (key: string) => string }) {
  const isBirlestirildi = status === "birlestirildi";
  const steps = [
    { key: "bekleniyor", label: t("packages.stepper.reported") },
    { key: "depoda", label: t("packages.stepper.inWarehouse") },
    ...(isBirlestirildi ? [{ key: "birlestirildi", label: t("packages.stepper.consolidated") }] : []),
    { key: "teslim_edildi", label: t("packages.stepper.delivered") },
  ];
  const order: Record<string, number> = { bekleniyor: 0, yolda: 0, depoda: 1, birlestirildi: 2, teslim_edildi: 3 };
  const currentLevel = order[status] ?? 0;

  return (
    <div className="relative flex items-center px-2">
      {steps.map((step, i) => {
        const stepLevel = order[step.key] ?? 0;
        const done = stepLevel < currentLevel;
        const isCurrent = step.key === status || (status === "yolda" && step.key === "bekleniyor");
        return (
          <div key={step.key} className="relative flex-1 flex flex-col items-center">
            {i > 0 && (
              <div className={`absolute top-3 right-1/2 h-[2px] w-full ${stepLevel <= currentLevel ? "bg-success-green" : "bg-deep-sea-teal/10"}`} />
            )}
            {i < steps.length - 1 && (
              <div className={`absolute top-3 left-1/2 h-[2px] w-full ${stepLevel < currentLevel ? "bg-success-green" : "bg-deep-sea-teal/10"}`} />
            )}
            <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              isCurrent
                ? "bg-chios-purple text-white ring-4 ring-chios-purple/20"
                : done
                ? "bg-success-green text-white"
                : "bg-deep-sea-teal/5 text-deep-sea-teal/30"
            }`}>
              {done && !isCurrent ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className={`relative z-10 text-[9px] mt-1 whitespace-nowrap ${isCurrent ? "text-chios-purple font-semibold" : done ? "text-success-green" : "text-deep-sea-teal/30"}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PackageDetailModal({ pkg, onClose, t }: { pkg: Package; onClose: () => void; t: (key: string) => string }) {
  const sc = (() => {
    const configs: Record<PackageStatus, { bg: string; text: string; key: string }> = {
      depoda: { bg: "bg-chios-purple/10", text: "text-chios-purple", key: "packages.status.depoda" },
      yolda: { bg: "bg-accent-orange/10", text: "text-accent-orange", key: "packages.status.yolda" },
      bekleniyor: { bg: "bg-deep-sea-teal/5", text: "text-deep-sea-teal/50", key: "packages.status.bekleniyor" },
      hazir: { bg: "bg-success-green/10", text: "text-success-green", key: "packages.status.hazir" },
      birlestirildi: { bg: "bg-success-green/10", text: "text-success-green", key: "packages.status.birlestirildi" },
      teslim_edildi: { bg: "bg-success-green/10", text: "text-success-green", key: "packages.status.teslim_edildi" },
      iptal: { bg: "bg-danger-red/10", text: "text-danger-red", key: "packages.status.iptal" },
    };
    const c = configs[pkg.status];
    return { bg: c.bg, text: c.text, label: t(c.key) };
  })();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deletePackage = usePackageStore((s) => s.deletePackage);

  const loadMessages = async () => {
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/packages/${pkg.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch { /* ignore */ }
    setLoadingMsgs(false);
  };

  useEffect(() => {
    if (showChat) loadMessages();
  }, [showChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/packages/${pkg.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMsg }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data]);
        setNewMsg("");
      }
    } catch { /* ignore */ }
    setSending(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deletePackage(pkg.id);
    if (result.error) {
      setDeleting(false);
      setConfirmDelete(false);
      return;
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header with status stepper */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="font-medium text-deep-sea-teal truncate">{pkg.content}</div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${sc.bg} ${sc.text}`}>
                {sc.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-deep-sea-teal/5 flex items-center justify-center hover:bg-deep-sea-teal/10 transition-colors cursor-pointer flex-shrink-0 ml-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Stepper in header */}
          <div className="px-5 pb-4">
            <StatusStepper status={pkg.status} t={t} />
          </div>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {/* Show chat or details */}
          <AnimatePresence mode="wait">
            {!showChat ? (
              <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Warehouse photo */}
                {pkg.warehouse_photo_url && (
                  <div className="rounded-xl overflow-hidden mb-4">
                    <img src={pkg.warehouse_photo_url} alt={t("packages.detail.warehouse")} className="w-full h-36 object-cover" />
                  </div>
                )}

                {/* Info rows — clean list style, no grid boxes */}
                <div className="space-y-0 divide-y divide-deep-sea-teal/5">
                  <InfoRow label={t("packages.carrier")} value={pkg.carrier} />
                  <InfoRow label={t("packages.trackingNo")} value={pkg.tracking_no} mono />
                  {pkg.shelf_location && <InfoRow label="Raf" value={pkg.shelf_location} />}
                  {pkg.master_box_id && <InfoRow label={t("packages.detail.masterBox")} value={pkg.master_box_id} mono />}
                  {pkg.arrived_at && (
                    <InfoRow label={t("packages.detail.warehouseArrival")} value={new Date(pkg.arrived_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} />
                  )}
                  {pkg.created_at && (
                    <InfoRow label={t("packages.notification")} value={new Date(pkg.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} />
                  )}
                  {pkg.storage_days_used > 0 && (
                    <InfoRow label={t("packages.status.depoda")} value={t("packages.daysAgo").replace("{n}", String(pkg.storage_days_used))} />
                  )}
                  {pkg.status === "depoda" && (
                    <InfoRow
                      label={t("packages.detail.freeDaysLeft")}
                      value={t("packages.daysAgo").replace("{n}", String(pkg.free_days_left))}
                      highlight={pkg.free_days_left <= 5}
                    />
                  )}
                  {Number(pkg.demurrage_fee) > 0 && (
                    <InfoRow label={t("packages.demurrageFee")} value={`€${Number(pkg.demurrage_fee).toFixed(2)}`} highlight />
                  )}
                  {pkg.weight_kg != null && Number(pkg.weight_kg) > 0 && (
                    <InfoRow label={t("packages.weight")} value={`${Number(pkg.weight_kg)} kg`} />
                  )}
                  {pkg.dimensions && (
                    <InfoRow label={t("packages.dimensions")} value={pkg.dimensions} />
                  )}
                  {pkg.notes && (
                    <div className="py-3">
                      <div className="text-[10px] text-deep-sea-teal/40 uppercase tracking-wider mb-1">{t("packages.note")}</div>
                      <div className="text-sm text-deep-sea-teal">{pkg.notes}</div>
                    </div>
                  )}
                </div>

                {/* Chat toggle button */}
                <button
                  onClick={() => setShowChat(true)}
                  className="mt-4 w-full py-3 flex items-center justify-center gap-2 bg-chios-purple/5 text-chios-purple font-medium text-sm rounded-xl hover:bg-chios-purple/10 transition-colors cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  {t("packages.detail.chat")}
                </button>
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
                {/* Back button */}
                <button
                  onClick={() => setShowChat(false)}
                  className="mb-3 flex items-center gap-1 text-sm text-deep-sea-teal/40 hover:text-chios-purple transition-colors cursor-pointer self-start"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  {t("packages.previous")}
                </button>

                {loadingMsgs ? (
                  <div className="flex items-center justify-center py-12">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5D3FD3" strokeWidth="2" className="animate-spin">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-deep-sea-teal/30">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    <p className="text-sm">{t("packages.noMessagesYet")}</p>
                    <p className="text-xs mt-1">{t("packages.chatHint")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          msg.is_admin
                            ? "bg-deep-sea-teal/5 text-deep-sea-teal rounded-bl-sm"
                            : "bg-chios-purple text-white rounded-br-sm"
                        }`}>
                          {msg.is_admin && (
                            <div className="text-[10px] font-medium text-chios-purple mb-1">
                              {msg.users?.name || t("packages.detail.chat")}
                            </div>
                          )}
                          <div className="text-sm">{msg.message}</div>
                          <div className={`text-[10px] mt-1 ${msg.is_admin ? "text-deep-sea-teal/30" : "text-white/50"}`}>
                            {new Date(msg.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}

                {/* Chat input */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={t("packages.detail.messagePlaceholder")}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-deep-sea-teal/10 bg-deep-sea-teal/[0.02] text-sm text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/50 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMsg.trim() || sending}
                    className="px-4 py-2.5 bg-chios-purple text-white rounded-xl hover:bg-chios-purple-dark disabled:opacity-30 transition-all cursor-pointer flex-shrink-0"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!showChat && (
          <div className="p-4 border-t border-deep-sea-teal/5 flex-shrink-0 space-y-2">
            {pkg.status === "bekleniyor" && (
              <>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full py-3 text-danger-red font-medium text-sm rounded-xl border border-danger-red/20 hover:bg-danger-red/5 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    {t("packages.deletePackage")}
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2"
                  >
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-3 text-deep-sea-teal/50 text-sm font-medium rounded-xl border border-deep-sea-teal/10 hover:bg-deep-sea-teal/5 transition-colors cursor-pointer"
                    >
                      {t("packages.giveUp")}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 py-3 bg-danger-red text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {deleting ? t("packages.deleting") : t("packages.confirmDelete")}
                    </button>
                  </motion.div>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="w-full py-3 bg-deep-sea-teal/5 text-deep-sea-teal font-semibold rounded-xl hover:bg-deep-sea-teal/10 transition-colors cursor-pointer"
            >
              {t("packages.close")}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

interface Message {
  id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  users?: { name: string };
}

function InfoRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="text-xs text-deep-sea-teal/40">{label}</div>
      <div className={`text-sm font-medium ${mono ? "font-mono" : ""} ${highlight ? "text-accent-orange" : "text-deep-sea-teal"}`}>
        {value}
      </div>
    </div>
  );
}

export default function PackagesPage() {
  const { t } = useTranslation();
  const packages = usePackageStore((s) => s.packages);
  const fetchPackages = usePackageStore((s) => s.fetchPackages);
  const loading = usePackageStore((s) => s.loading);
  const [filter, setFilter] = useState<"all" | PackageStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  if (loading) return <PackageListSkeleton />;

  let filtered = filter === "all" ? packages : packages.filter((p) => p.status === filter);

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.tracking_no.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.carrier.toLowerCase().includes(q)
    );
  }

  const filterTabs = [
    { key: "all", label: t("packages.filter.all") },
    { key: "depoda", label: t("packages.filter.depoda") },
    { key: "yolda", label: t("packages.filter.yolda") },
    { key: "bekleniyor", label: t("packages.filter.bekleniyor") },
    { key: "birlestirildi", label: t("packages.filter.birlestirildi") },
    { key: "teslim_edildi", label: t("packages.filter.teslim_edildi") },
  ];

  const statusConfigMap: Record<PackageStatus, { bg: string; text: string; key: string }> = {
    depoda: { bg: "bg-chios-purple/10", text: "text-chios-purple", key: "packages.status.depoda" },
    yolda: { bg: "bg-accent-orange/10", text: "text-accent-orange", key: "packages.status.yolda" },
    bekleniyor: { bg: "bg-deep-sea-teal/5", text: "text-deep-sea-teal/50", key: "packages.status.bekleniyor" },
    hazir: { bg: "bg-success-green/10", text: "text-success-green", key: "packages.status.hazir" },
    birlestirildi: { bg: "bg-success-green/10", text: "text-success-green", key: "packages.status.birlestirildi" },
    teslim_edildi: { bg: "bg-success-green/10", text: "text-success-green", key: "packages.status.teslim_edildi" },
    iptal: { bg: "bg-danger-red/10", text: "text-danger-red", key: "packages.status.iptal" },
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-deep-sea-teal">
              {t("packages.title")}
            </h1>
            <p className="text-sm text-deep-sea-teal/50 mt-1">
              {t("packages.count").replace("{total}", String(packages.length))}
            </p>
          </div>

          <Link href="/dashboard/actions" className="inline-flex items-center gap-2 px-5 py-2.5 bg-chios-purple text-white text-sm font-semibold rounded-full hover:bg-chios-purple-dark transition-colors duration-200 shadow-md cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t("packages.notifyNew")}
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-sea-teal/30">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("packages.searchPlaceholder2")}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-white text-deep-sea-teal text-sm placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/50 focus:ring-2 focus:ring-chios-purple/10 transition-all"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                filter === tab.key
                  ? "bg-chios-purple text-white shadow-sm"
                  : "bg-white text-deep-sea-teal/60 hover:bg-deep-sea-teal/5 border border-deep-sea-teal/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Package list */}
        <motion.div layout className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-deep-sea-teal/30">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
              <p className="text-sm">
                {search.trim() ? t("packages.noSearchResults") : t("packages.noCategoryPackages")}
              </p>
              {!search.trim() && (
                <Link href="/dashboard/actions" className="inline-block mt-3 text-sm text-chios-purple font-medium hover:underline cursor-pointer">
                  {t("packages.notFound")}
                </Link>
              )}
            </div>
          )}
          <AnimatePresence mode="popLayout">
            {filtered.map((pkg) => {
              const cfg = statusConfigMap[pkg.status];
              return (
                <motion.div
                  key={pkg.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedPkg(pkg)}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-deep-sea-teal/5 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-chios-purple/10 flex items-center justify-center flex-shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-chios-purple">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-deep-sea-teal">{pkg.content}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.text}`}>
                          {t(cfg.key)}
                        </span>
                      </div>
                      <div className="text-xs text-deep-sea-teal/40 font-mono mb-2">
                        {pkg.carrier} · {pkg.tracking_no}
                      </div>

                      {/* Inline mini-tags for extra info */}
                      <div className="flex flex-wrap gap-2">
                        {pkg.shelf_location && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-deep-sea-teal/50 bg-deep-sea-teal/[0.03] px-2 py-0.5 rounded-md">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <line x1="3" y1="9" x2="21" y2="9" />
                            </svg>
                            {pkg.shelf_location}
                          </span>
                        )}
                        {pkg.weight_kg != null && Number(pkg.weight_kg) > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-deep-sea-teal/50 bg-deep-sea-teal/[0.03] px-2 py-0.5 rounded-md">
                            {Number(pkg.weight_kg)} kg
                          </span>
                        )}
                        {pkg.dimensions && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-deep-sea-teal/50 bg-deep-sea-teal/[0.03] px-2 py-0.5 rounded-md">
                            {pkg.dimensions}
                          </span>
                        )}
                        {pkg.status === "depoda" && (
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md ${
                            pkg.free_days_left <= 5
                              ? "text-accent-orange bg-sunset-gold/10"
                              : "text-deep-sea-teal/50 bg-deep-sea-teal/[0.03]"
                          }`}>
                            {t("packages.daysFree").replace("{n}", String(pkg.free_days_left))}
                          </span>
                        )}
                        {Number(pkg.demurrage_fee) > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-accent-orange bg-sunset-gold/10 px-2 py-0.5 rounded-md">
                            €{Number(pkg.demurrage_fee).toFixed(2)} {t("packages.demurrageShort")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Detail + Chat Modal */}
        <AnimatePresence>
          {selectedPkg && (
            <PackageDetailModal pkg={selectedPkg} onClose={() => setSelectedPkg(null)} t={t} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
