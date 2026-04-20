"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_PERMISSIONS, type Permission } from "@/lib/permissions";

interface UserRow {
  id: string;
  name: string;
  email: string;
  chios_box_id: string;
  is_admin: boolean;
  permissions: string[];
  plan: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    const res = await fetch(`/api/admin/users?${params}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = () => fetchUsers();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-deep-sea-teal">Kullanıcı Yönetimi</h1>
          <p className="text-sm text-deep-sea-teal/50 mt-1">Rol ve izin atamaları</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-sea-teal/30">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="İsim, email veya ChiosBox ID ile ara..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-deep-sea-teal/10 bg-white text-sm text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none focus:border-chios-purple/50"
          />
        </div>

        {/* User List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 bg-deep-sea-teal/5 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((u) => {
              const userPerms = Array.isArray(u.permissions) ? u.permissions as string[] : [];
              const isSuper = userPerms.includes("*");
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedUser(u)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-deep-sea-teal/5 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-chios-purple/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-chios-purple">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-deep-sea-teal text-sm">{u.name}</span>
                        {isSuper && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-chios-purple">
                            SUPER
                          </span>
                        )}
                        {u.is_admin && !isSuper && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-deep-sea-teal bg-deep-sea-teal/10">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-deep-sea-teal/40">
                        <span className="font-mono">{u.chios_box_id}</span>
                        <span>{u.email}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {u.is_admin && !isSuper && (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {userPerms.map((p) => (
                            <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-deep-sea-teal/5 text-deep-sea-teal/50">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Edit Modal */}
        <AnimatePresence>
          {selectedUser && (
            <EditUserModal
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onUpdated={() => { setSelectedUser(null); fetchUsers(); }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const permissionLabels: Record<Permission, string> = {
  intake: "Kabul (Paket Kabul)",
  pickup: "Teslimat",
  demurrage: "Gecikme Yönetimi",
  packages: "Paket Listesi",
  invoices: "Fatura Yönetimi",
  customers: "Müşteri Yönetimi",
};

function EditUserModal({ user, onClose, onUpdated }: {
  user: UserRow;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [isAdmin, setIsAdmin] = useState(user.is_admin);
  const [permissions, setPermissions] = useState<string[]>(
    Array.isArray(user.permissions) ? user.permissions as string[] : []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isSuper = permissions.includes("*");

  const togglePermission = (perm: Permission) => {
    if (isSuper) return; // Can't edit super admin permissions
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_admin: isAdmin, permissions }),
    });

    if (res.ok) {
      onUpdated();
    } else {
      const data = await res.json();
      setError(data.error || "Güncelleme başarısız");
    }
    setSaving(false);
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
        className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="font-display text-lg font-bold text-deep-sea-teal">Kullanıcı Düzenle</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-deep-sea-teal/5 flex items-center justify-center cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {error && (
            <div className="p-3 bg-danger-red/10 border border-danger-red/20 rounded-xl text-danger-red text-xs">
              {error}
            </div>
          )}

          {/* User info */}
          <div className="p-3 bg-deep-sea-teal/[0.03] rounded-xl">
            <div className="font-medium text-deep-sea-teal text-sm">{user.name}</div>
            <div className="text-xs text-deep-sea-teal/40 font-mono">{user.chios_box_id} · {user.email}</div>
          </div>

          {/* Admin toggle */}
          <div className="flex items-center justify-between p-3 bg-white border border-deep-sea-teal/10 rounded-xl">
            <div>
              <div className="text-sm font-medium text-deep-sea-teal">Admin Yetkisi</div>
              <div className="text-xs text-deep-sea-teal/40">Admin paneline erişim</div>
            </div>
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              disabled={isSuper}
              className={`w-12 h-7 rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
                isAdmin ? "bg-chios-purple" : "bg-deep-sea-teal/10"
              }`}
            >
              <motion.div
                animate={{ x: isAdmin ? 22 : 2 }}
                className="w-5 h-5 rounded-full bg-white shadow-sm"
              />
            </button>
          </div>

          {/* Permissions */}
          {isAdmin && !isSuper && (
            <div>
              <label className="text-xs font-medium text-deep-sea-teal/40 uppercase tracking-wider mb-2 block">
                İzinler
              </label>
              <div className="space-y-2">
                {ALL_PERMISSIONS.map((perm) => (
                  <button
                    key={perm}
                    onClick={() => togglePermission(perm)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      permissions.includes(perm)
                        ? "border-chios-purple/30 bg-chios-purple/5"
                        : "border-deep-sea-teal/10 bg-white hover:bg-deep-sea-teal/[0.02]"
                    }`}
                  >
                    <span className="text-sm text-deep-sea-teal">{permissionLabels[perm]}</span>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      permissions.includes(perm)
                        ? "border-chios-purple bg-chios-purple"
                        : "border-deep-sea-teal/20"
                    }`}>
                      {permissions.includes(perm) && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isSuper && (
            <div className="p-3 bg-chios-purple/5 border border-chios-purple/10 rounded-xl text-xs text-chios-purple">
              Super admin — tüm yetkilere sahip, düzenlenemez.
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-chios-purple text-white font-display font-bold rounded-2xl hover:bg-chios-purple-dark disabled:opacity-30 transition-all cursor-pointer"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
