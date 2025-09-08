// web/src/types/item.ts

/** Keep in sync with backend sort options */
export type SortValue = "relevance" | "price_asc" | "price_desc" | "newest" | "oldest";

/** Item DTO returned by the backend */
export type ItemDTO = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  brand?: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  // Backend sends ISO timestamps (strings)
  createdAt: string;
  updatedAt: string;
};

/** Response shape from GET /api/items */
export type ItemsListResponse = {
  items: ItemDTO[];
  total: number;
  page: number;
  pageSize: number;
};

/** Query params you can send to GET /api/items */
export type ListParams = {
  q?: string;
  category?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: SortValue;
  page?: number;
  limit?: number;
};
