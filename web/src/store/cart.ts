import { create } from "zustand";

type CartState = {
  /** Guest cart id persisted in localStorage (X-Cart-Id header). */
  cartId: string | null;
  /** Ensure a cartId exists; create and persist if missing. Returns the id. */
  ensureCartId: () => string;
  /** Manually clear cartId (e.g., right after a successful login merge). */
  clearCartId: () => void;
  /** Manually set (rarely needed). */
  setCartId: (id: string) => void;
};

function readLocal(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("cartId");
  } catch {
    return null;
  }
}

function writeLocal(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) localStorage.setItem("cartId", id);
    else localStorage.removeItem("cartId");
  } catch {
    /* ignore */
  }
}

function genUUID(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback UUID-ish
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const useCartStore = create<CartState>()((set, get) => ({
  cartId: readLocal(),
  ensureCartId: () => {
    const current = get().cartId;
    if (current) return current;
    const id = genUUID();
    writeLocal(id);
    set({ cartId: id });
    return id;
  },
  clearCartId: () => {
    writeLocal(null);
    set({ cartId: null });
  },
  setCartId: (id) => {
    writeLocal(id);
    set({ cartId: id });
  },
}));
