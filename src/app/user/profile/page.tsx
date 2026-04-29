"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { useSettings } from "@/hooks/use-settings";
import { useTourStore } from "@/stores/tour-store";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const authLoading = useAuthStore((s) => s.loading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const startTour = useTourStore((s) => s.startTour);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notifStatus, setNotifStatus] = useState<"default" | "granted" | "denied">("default");
  const [notifLoading, setNotifLoading] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    fetchUser();
    if ("Notification" in window) {
      setNotifStatus(Notification.permission as "default" | "granted" | "denied");
    }
  }, [fetchUser]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const copyAddress = async () => {
    await navigator.clipboard.writeText(settings.warehouse_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEditing = () => {
    setEditName(user?.name || "");
    setEditPhone(user?.phone || "");
    setEditAddress(user?.address || "");
    setSaveError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setSaveError("");
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      setSaveError(t("profile.nameRequired"));
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          address: editAddress,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error || t("profile.saveFailed"));
        return;
      }

      await fetchUser();
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      setSaveError(t("profile.genericError"));
    } finally {
      setSaving(false);
    }
  };

  const enableNotifications = async () => {
    setNotifLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setNotifStatus(permission);
      if (permission !== "granted") return;

      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) return;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))),
          },
        }),
      });
    } catch {
      // Silently fail
    } finally {
      setNotifLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwError("");
    setPwSuccess(false);

    if (!pwCurrent || !pwNew || !pwConfirm) {
      setPwError(t("profile.passwordRequired"));
      return;
    }
    if (pwNew.length < 6) {
      setPwError(t("profile.passwordMinLength"));
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError(t("profile.passwordMismatch"));
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwNew }),
      });

      if (!res.ok) {
        const data = await res.json();
        setPwError(data.error || t("profile.passwordChangeFailed"));
        return;
      }

      setPwSuccess(true);
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch {
      setPwError(t("profile.genericError"));
    } finally {
      setPwSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-chios-purple/20 border-t-chios-purple rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-deep-sea-teal mb-2">
          {t("profile.title")}
        </h1>
        <p className="text-sm text-deep-sea-teal/50 mb-8">
          {t("profile.description")}
        </p>

        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-success-green/10 border border-success-green/20 rounded-xl text-success-green text-sm font-medium flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t("profile.saved")}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* User info card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5" data-tour="profile-info">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-chios-purple/10 flex items-center justify-center">
                  <span className="font-display text-2xl font-bold text-chios-purple">
                    {(user?.name || "?")[0]}
                  </span>
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-deep-sea-teal">
                    {user?.name}
                  </h2>
                  <p className="text-sm text-deep-sea-teal/40">{user?.email}</p>
                </div>
              </div>
              {!editing && (
                <button
                  onClick={startEditing}
                  className="px-4 py-2 text-sm font-medium text-chios-purple bg-chios-purple/10 rounded-xl hover:bg-chios-purple/20 transition-colors cursor-pointer"
                >
                  {t("profile.edit")}
                </button>
              )}
            </div>

            {saveError && (
              <div className="mb-4 p-3 bg-danger-red/10 border border-danger-red/20 rounded-xl text-danger-red text-sm">
                {saveError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider">
                  {t("profile.nameLabel")}
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-chios-purple/30 bg-white text-sm text-deep-sea-teal focus:outline-none focus:border-chios-purple transition-colors"
                  />
                ) : (
                  <div className="mt-1 px-4 py-3 bg-deep-sea-teal/[0.02] rounded-xl text-sm text-deep-sea-teal">
                    {user?.name}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider">
                  {t("profile.emailLabel")}
                </label>
                <div className="mt-1 px-4 py-3 bg-deep-sea-teal/[0.02] rounded-xl text-sm text-deep-sea-teal">
                  {user?.email}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider">
                  {t("profile.phoneLabel")}
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+30 xxx xxx xxxx"
                    className="mt-1 w-full px-4 py-3 rounded-xl border-2 border-chios-purple/30 bg-white text-sm text-deep-sea-teal placeholder:text-deep-sea-teal/20 focus:outline-none focus:border-chios-purple transition-colors"
                  />
                ) : (
                  <div className="mt-1 px-4 py-3 bg-deep-sea-teal/[0.02] rounded-xl text-sm text-deep-sea-teal">
                    {user?.phone || "—"}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider">
                  {t("profile.chiosBoxId")}
                </label>
                <div className="mt-1 px-4 py-3 bg-chios-purple/5 rounded-xl text-sm font-mono font-semibold text-chios-purple">
                  {user?.chios_box_id}
                </div>
              </div>
            </div>

            {editing && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={cancelEditing}
                  className="flex-1 py-3 border-2 border-deep-sea-teal/10 text-deep-sea-teal/60 font-semibold rounded-xl hover:bg-deep-sea-teal/5 transition-colors cursor-pointer"
                >
                  {t("profile.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-chios-purple text-white font-semibold rounded-xl hover:bg-chios-purple-dark transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? t("profile.saving") : t("profile.save")}
                </button>
              </div>
            )}
          </div>

          {/* Address card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5" data-tour="profile-address">
            <h3 className="font-display text-lg font-semibold text-deep-sea-teal mb-4">
              {t("profile.addressTitle")}
            </h3>
            {editing ? (
              <textarea
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder={t("profile.addressPlaceholder")}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-chios-purple/30 bg-white text-sm text-deep-sea-teal placeholder:text-deep-sea-teal/20 focus:outline-none focus:border-chios-purple transition-colors resize-none font-mono"
              />
            ) : (
              <div className="p-4 bg-deep-sea-teal/[0.03] rounded-xl font-mono text-sm text-deep-sea-teal/80 whitespace-pre-line leading-relaxed">
                {user?.address || "—"}
              </div>
            )}
            {!editing && (
              <button
                onClick={copyAddress}
                className="mt-4 w-full py-3 inline-flex items-center justify-center gap-2 bg-chios-purple text-white font-semibold rounded-xl hover:bg-chios-purple-dark transition-colors duration-200 cursor-pointer"
              >
                {copied ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {t("profile.addressCopied")}
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    {t("profile.copyAddress")}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Password change */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5" data-tour="profile-password">
            <h3 className="font-display text-lg font-semibold text-deep-sea-teal mb-2">
              {t("profile.changePassword")}
            </h3>
            <p className="text-sm text-deep-sea-teal/50 mb-4">
              {t("profile.changePasswordDescription")}
            </p>

            {pwSuccess && (
              <div className="mb-4 p-3 bg-success-green/10 border border-success-green/20 rounded-xl text-success-green text-sm font-medium flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t("profile.passwordChanged")}
              </div>
            )}

            {pwError && (
              <div className="mb-4 p-3 bg-danger-red/10 border border-danger-red/20 rounded-xl text-danger-red text-sm">
                {pwError}
              </div>
            )}

            <div className="space-y-3">
              <input
                type="password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                placeholder={t("profile.currentPassword")}
                className="w-full px-4 py-3 rounded-xl border-2 border-deep-sea-teal/10 bg-white text-sm text-deep-sea-teal placeholder:text-deep-sea-teal/20 focus:outline-none focus:border-chios-purple transition-colors"
              />
              <input
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                placeholder={t("profile.newPassword")}
                className="w-full px-4 py-3 rounded-xl border-2 border-deep-sea-teal/10 bg-white text-sm text-deep-sea-teal placeholder:text-deep-sea-teal/20 focus:outline-none focus:border-chios-purple transition-colors"
              />
              <input
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                placeholder={t("profile.confirmPassword")}
                className="w-full px-4 py-3 rounded-xl border-2 border-deep-sea-teal/10 bg-white text-sm text-deep-sea-teal placeholder:text-deep-sea-teal/20 focus:outline-none focus:border-chios-purple transition-colors"
              />
              <button
                onClick={handlePasswordChange}
                disabled={pwSaving}
                className="w-full py-3 bg-chios-purple text-white font-semibold rounded-xl hover:bg-chios-purple-dark transition-colors cursor-pointer disabled:opacity-50"
              >
                {pwSaving ? t("profile.saving") : t("profile.changePassword")}
              </button>
            </div>
          </div>

          {/* Plan bilgisi */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5" data-tour="profile-subscription">
            <h3 className="font-display text-lg font-semibold text-deep-sea-teal mb-4">
              {t("profile.subscriptionTitle")}
            </h3>
            <div className="flex items-center justify-between p-4 bg-chios-purple/5 rounded-xl">
              <div>
                <div className="text-sm font-semibold text-deep-sea-teal">
                  {user?.plan || t("profile.defaultPlan")}
                </div>
                <div className="text-xs text-deep-sea-teal/40 mt-0.5">
                  {user?.plan_status === "active" ? t("profile.statusActive") : t("profile.statusInactive")}
                </div>
              </div>
              <span className="px-3 py-1 bg-success-green/10 text-success-green text-xs font-semibold rounded-full">
                {t("profile.statusActive")}
              </span>
            </div>
          </div>

          {/* Tour Guide + Bildirimler */}
          <div data-tour="profile-extras" className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5">
              <h3 className="font-display text-lg font-semibold text-deep-sea-teal mb-2">
                {t("tour.helpTooltip")}
              </h3>
              <p className="text-sm text-deep-sea-teal/50 mb-4">
                {t("tour.step1.content")}
              </p>
              <button
                onClick={startTour}
                className="w-full py-3 inline-flex items-center justify-center gap-2 bg-chios-purple text-white font-semibold rounded-xl hover:bg-chios-purple-dark transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                {t("tour.start")}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5">
              <h3 className="font-display text-lg font-semibold text-deep-sea-teal mb-4">
                {t("profile.notificationsTitle")}
              </h3>
              <p className="text-sm text-deep-sea-teal/50 mb-4">
                {t("profile.notificationsDescription")}
              </p>
              {notifStatus === "granted" ? (
                <div className="flex items-center gap-2 p-3 bg-success-green/10 rounded-xl text-success-green text-sm font-medium">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t("profile.notificationsActive")}
                </div>
              ) : notifStatus === "denied" ? (
                <div className="p-3 bg-amber-50 rounded-xl text-amber-700 text-sm font-medium">
                  {t("profile.notificationsDenied")}
                </div>
              ) : (
                <button
                  onClick={enableNotifications}
                  disabled={notifLoading}
                  className="w-full py-3 inline-flex items-center justify-center gap-2 bg-chios-purple text-white font-semibold rounded-xl hover:bg-chios-purple-dark transition-colors cursor-pointer disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                  {notifLoading ? t("profile.notificationsEnabling") : t("profile.notificationsEnable")}
                </button>
              )}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-3 inline-flex items-center justify-center gap-2 bg-white text-danger-red font-semibold rounded-xl border border-danger-red/10 hover:bg-danger-red/5 transition-colors duration-200 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {t("profile.logout")}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
