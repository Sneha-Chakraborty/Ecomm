import { api } from "./client";
import { useCartStore } from "../store/cart";
import type { ItemDTO } from "../types/item";

/* ---------------- Types ---------------- */

export type CartLine = {
  item: ItemDTO;
  qty: number;
};

export type CartDTO = {
  id: string;
  items: CartLine[];
  createdAt?: string;
  updatedAt?: string;
};

export type CartResponse = { cart: CartDTO };

/* ------------- Internal helpers ------------- */

/** Always attach X-Cart-Id for guests; harmless when logged-in */
function cartHeaders() {
  const id = useCartStore.getState().ensureCartId();
  return { "X-Cart-Id": id };
}

/* ---------------- API calls ---------------- */

export async function getCart(): Promise<CartDTO> {
  const res = await api.get<CartResponse>("/cart", { headers: cartHeaders() });
  return res.data.cart;
}

export async function addToCart(payload: {
  itemId: string;
  quantity?: number;
}): Promise<CartDTO> {
  const res = await api.post<CartResponse>("/cart/add", payload, {
    headers: cartHeaders(),
  });
  return res.data.cart;
}

export async function updateCartItem(
  itemId: string,
  quantity: number
): Promise<CartDTO> {
  const res = await api.patch<CartResponse>(
    `/cart/item/${itemId}`,
    { quantity },
    { headers: cartHeaders() }
  );
  return res.data.cart;
}

export async function removeFromCart(itemId: string): Promise<CartDTO> {
  const res = await api.delete<CartResponse>(`/cart/item/${itemId}`, {
    headers: cartHeaders(),
  });
  return res.data.cart;
}

export async function clearCart(): Promise<CartDTO> {
  const res = await api.post<CartResponse>(
    "/cart/clear",
    {},
    { headers: cartHeaders() }
  );
  return res.data.cart;
}
