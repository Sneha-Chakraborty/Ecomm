import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { me, type UserDTO } from "../api/auth";

type AuthState = {
  user: UserDTO | null;

  /** Set/replace the current user (e.g., after login/signup) */
  setUser: (user: UserDTO | null) => void;

  /** Clear user (e.g., after logout or 401) */
  clearUser: () => void;

  /**
   * Fetch the current user from the server.
   * Uses HttpOnly cookie session, sets store.user accordingly.
   * Returns the user or null.
   */
  fetchMe: () => Promise<UserDTO | null>;
};

/**
 * We persist only the `user` field to sessionStorage so a refresh keeps the header/UI consistent.
 * JWT stays in an HttpOnly cookie (not stored here).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),

      clearUser: () => set({ user: null }),

      fetchMe: async () => {
        try {
          const u = await me();
          set({ user: u });
          return u;
        } catch {
          // 401/403/etc → no session
          set({ user: null });
          return null;
        }
      },
    }),
    {
      name: "auth", // storage key
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user }),
      version: 1,
    }
  )
);
