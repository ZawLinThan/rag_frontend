import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase/client";

interface AuthState {
  session: Session | null;
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  error: string | null;
  initializeAuth: () => () => void; // To be used on mount. Returns a cleanup function
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  setUser: (user) => set({ user }),
  isLoading: true,
  error: null,

  initializeAuth: () => {
    set({ isLoading: true });

    if (!supabase) {
      set({ isLoading: false, error: "Supabase is not configured." });
      return () => {};
    }

    // Fetch the initial session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({
          session: data.session,
          user: data.session?.user ?? null,
          isLoading: false,
        });
      }
    });

    // Set up the real-time auth change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
      });
    });

    // Return the cleanup function to unsubscribe if needed
    return () => {
      subscription.unsubscribe();
    };
  },
}));
