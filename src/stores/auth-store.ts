import { create } from "zustand";
import { createClient } from "@/lib/supabase-browser";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
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

    const res = await fetch("/api/user");
    if (res.ok) {
      const data = await res.json();
      set({ user: data, isAuthenticated: true });
    }
    return {};
  },

  register: async (name, email, password, plan) => {
    // Everything goes through our API route — server handles signUp + user insert
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, plan }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Registration failed" };
      }

      // Now sign in on the client side to get the session
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) return { error: signInError.message };

      set({ user: data.user, isAuthenticated: true });
      return {};
    } catch {
      return { error: "An error occurred" };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
