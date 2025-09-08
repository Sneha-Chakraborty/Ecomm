import mongoose from "mongoose";
import { ApiError } from "../../middleware/error";
import { Item, type ItemDocument } from "./item.model";
import type {
  CreateItemBody,
  UpdateItemBody,
  ListQuery,
  SortValue,
} from "./item.types";

/** What we return to clients */
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
  createdAt: Date;
  updatedAt: Date;
};

function toDTO(doc: ItemDocument | (ItemDTO & { _id?: unknown })): ItemDTO {
  return {
    id: (doc as any)._id ? String((doc as any)._id) : (doc as any).id,
    name: (doc as any).name,
    description: (doc as any).description,
    price: (doc as any).price,
    category: (doc as any).category,
    brand: (doc as any).brand,
    imageUrl: (doc as any).imageUrl,
    stock: (doc as any).stock,
    isActive: (doc as any).isActive,
    createdAt: (doc as any).createdAt,
    updatedAt: (doc as any).updatedAt,
  };
}

/** Create a new item */
export async function createItem(data: CreateItemBody): Promise<ItemDTO> {
  const item = await Item.create({
    name: data.name.trim(),
    description: data.description?.trim(),
    price: data.price,
    category: data.category.trim().toLowerCase(),
    brand: data.brand?.trim(),
    imageUrl: data.imageUrl.trim(),
    stock: data.stock ?? 0,
    isActive: data.isActive ?? true,
  });

  return toDTO(item);
}

/**
 * List items with filters, search, sort, pagination.
 * Returns { items, total, page, pageSize }
 */
export async function getItems(filters: ListQuery): Promise<{
  items: ItemDTO[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 12,
  } = filters;

  const match: Record<string, any> = { isActive: true };

  // Category filter (single or array)
  if (category) {
    const cats = Array.isArray(category) ? category : [category];
    match.category = { $in: cats.map((c) => c.toLowerCase()) };
  }

  // Price range
  if (minPrice != null || maxPrice != null) {
    match.price = {};
    if (minPrice != null) match.price.$gte = Number(minPrice);
    if (maxPrice != null) match.price.$lte = Number(maxPrice);
  }

  // Text search
  let useTextScore = false;
  if (q && q.trim()) {
    match.$text = { $search: q.trim() };
    useTextScore = true;
  }

  // Sorting
  const sortMap: Record<Exclude<SortValue, "relevance">, any> = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
  };

  let sortStage: any = undefined;
  if (useTextScore && (sort === "relevance" || !sort)) {
    sortStage = { score: { $meta: "textScore" } };
  } else {
    // default "newest" already ensured by schema default, but guard anyway
    sortStage = sortMap[(sort as keyof typeof sortMap) || "newest"];
  }

  // Projection (include score when using text search for sort)
  const projection = useTextScore ? { score: { $meta: "textScore" } } : undefined;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 12));
  const skip = (pageNum - 1) * limitNum;

  const [docs, total] = await Promise.all([
    Item.find(match, projection).sort(sortStage).skip(skip).limit(limitNum).lean(),
    Item.countDocuments(match),
  ]);

  const items = docs.map((d: any) => toDTO(d as any));

  return {
    items,
    total,
    page: pageNum,
    pageSize: limitNum,
  };
}

/** Get a single item by id */
export async function getItemById(id: string): Promise<ItemDTO> {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid item id", "INVALID_ID");
  }
  const doc = await Item.findById(id).lean();
  if (!doc) {
    throw new ApiError(404, "Item not found", "NOT_FOUND");
  }
  return toDTO(doc as any);
}

/** Update an item */
export async function updateItem(id: string, data: UpdateItemBody): Promise<ItemDTO> {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid item id", "INVALID_ID");
  }

  const updates: Record<string, any> = {};
  if (data.name != null) updates.name = data.name.trim();
  if (data.description !== undefined) updates.description = data.description?.trim();
  if (data.price != null) updates.price = data.price;
  if (data.category != null) updates.category = data.category.trim().toLowerCase();
  if (data.brand !== undefined) updates.brand = data.brand?.trim();
  if (data.imageUrl != null) updates.imageUrl = data.imageUrl.trim();
  if (data.stock != null) updates.stock = data.stock;
  if (data.isActive != null) updates.isActive = data.isActive;

  const doc = await Item.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).lean();

  if (!doc) {
    throw new ApiError(404, "Item not found", "NOT_FOUND");
  }
  return toDTO(doc as any);
}

/** Delete an item (hard delete) */
export async function deleteItem(id: string): Promise<{ id: string }> {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid item id", "INVALID_ID");
  }
  const doc = await Item.findByIdAndDelete(id).lean();
  if (!doc) {
    throw new ApiError(404, "Item not found", "NOT_FOUND");
  }
  return { id: String((doc as any)._id) };
}
