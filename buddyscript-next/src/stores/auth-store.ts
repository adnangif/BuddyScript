import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { AuthUser } from "@/types/auth";

type AuthState = {
  user: AuthUser | null;
  hasHydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
  setHasHydrated: (hydrated: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: "auth-store",
      storage:
        typeof window === "undefined"
          ? undefined
          : createJSONStorage<AuthState>(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

