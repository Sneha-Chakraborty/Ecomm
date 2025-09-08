import { api } from "./client";
import type { ItemDTO, ItemsListResponse, ListParams } from "../types/item";

/** Serialize params so arrays become repeated keys: ?category=a&category=b */
function serializeParams(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) {
      for (const el of v) {
        if (el !== undefined && el !== null && el !== "") qs.append(k, String(el));
      }
    } else {
      qs.append(k, String(v));
    }
  }
  return qs.toString();
}

/** ---------- Public: list items with filters ---------- */
export async function listItems(params: ListParams): Promise<ItemsListResponse> {
  const res = await api.get("/items", {
    params,
    paramsSerializer: (p) => serializeParams(p as Record<string, unknown>),
  });
  return res.data as ItemsListResponse;
}

/** ---------- Public: get single item ---------- */
export async function getItem(id: string): Promise<ItemDTO> {
  const res = await api.get(`/items/${id}`);
  return res.data.item as ItemDTO;
}

/** ---------- Admin/test: create/update/delete ---------- */
export async function createItem(data: Partial<ItemDTO> & { name: string; price: number; category: string; imageUrl: string }): Promise<ItemDTO> {
  const res = await api.post("/items", data);
  return res.data.item as ItemDTO;
}

export async function updateItem(id: string, data: Partial<ItemDTO>): Promise<ItemDTO> {
  const res = await api.patch(`/items/${id}`, data);
  return res.data.item as ItemDTO;
}

export async function deleteItem(id: string): Promise<{ id: string }> {
  const res = await api.delete(`/items/${id}`);
  return res.data as { id: string };
}
