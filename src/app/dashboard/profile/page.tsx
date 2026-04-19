"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const copyAddress = async () => {
    if (!user?.address) return;
    await navigator.clipboard.writeText(user.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-deep-sea-teal mb-2">
          Profil
        </h1>
        <p className="text-sm text-deep-sea-teal/50 mb-8">
          Hesap bilgilerinizi ve teslimat adresinizi yönetin
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* User info card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-chios-purple/10 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-chios-purple">
                  {user?.name[0]}
                </span>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-deep-sea-teal">
                  {user?.name}
                </h2>
                <p className="text-sm text-deep-sea-teal/40">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider">
                  Ad Soyad
                </label>
                <div className="mt-1 px-4 py-3 bg-deep-sea-teal/[0.02] rounded-xl text-sm text-deep-sea-teal">
                  {user?.name}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider">
                  E-posta
                </label>
                <div className="mt-1 px-4 py-3 bg-deep-sea-teal/[0.02] rounded-xl text-sm text-deep-sea-teal">
                  {user?.email}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider">
                  ChiosBox ID
                </label>
                <div className="mt-1 px-4 py-3 bg-chios-purple/5 rounded-xl text-sm font-mono font-semibold text-chios-purple">
                  {user?.chios_box_id}
                </div>
              </div>
            </div>
          </div>

          {/* Address card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5">
            <h3 className="font-display text-lg font-semibold text-deep-sea-teal mb-4">
              Teslimat Adresiniz
            </h3>
            <div className="p-4 bg-deep-sea-teal/[0.03] rounded-xl font-mono text-sm text-deep-sea-teal/80 whitespace-pre-line leading-relaxed">
              {user?.address}
            </div>
            <button
              onClick={copyAddress}
              className="mt-4 w-full py-3 inline-flex items-center justify-center gap-2 bg-chios-purple text-white font-semibold rounded-xl hover:bg-chios-purple-dark transition-colors duration-200 cursor-pointer"
            >
              {copied ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Kopyalandı!
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Adresi Kopyala
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
