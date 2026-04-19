import { create } from "zustand";
import { createClient } from "@/lib/supabase-browser";

interface User {
  id: string;
  name: string;
  email: string;
  chios_box_id: string;
  address: string | null;
  plan: string;
  plan_status: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string, plan: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const supabase = createClient();

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  fetchUser: async () => {
    set({ loading: true });
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        set({ user: null, isAuthenticated: false, loading: false });
        return;
      }

      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        set({ user: data, isAuthenticated: true, loading: false });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    // Fetch user data after successful login
    const res = await fetch("/api/user");
    if (res.ok) {
      const data = await res.json();
      set({ user: data, isAuthenticated: true });
    }
    return {};
  },

  register: async (name, email, password, plan) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: "Kayıt başarısız" };

    // Create user row in database
    const res = await fetch("/api/auth/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supabaseUserId: data.user.id,
        name,
        email,
        plan,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Kullanıcı oluşturulamadı" };
    }

    const userData = await res.json();
    set({ user: userData, isAuthenticated: true });
    return {};
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
