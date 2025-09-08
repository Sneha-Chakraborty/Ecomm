import { z } from "zod";

/** ---------- Create / Update Schemas ---------- */
export const createItemSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  description: z
    .string()
    .trim()
    .max(2000, "Description too long")
    .optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  category: z.string().trim().toLowerCase().min(2).max(60),
  brand: z.string().trim().max(60).optional(),
  imageUrl: z.string().trim().url("imageUrl must be a valid URL").max(2048),
  stock: z.coerce.number().int().min(0).default(0).optional(),
  isActive: z.coerce.boolean().default(true).optional(),
});

export type CreateItemBody = z.infer<typeof createItemSchema>;

// All fields optional for updates
export const updateItemSchema = createItemSchema.partial();
export type UpdateItemBody = z.infer<typeof updateItemSchema>;

/** ---------- Listing / Filters Schema ---------- */
export const sortValues = [
  "relevance",   // used only when q is present
  "price_asc",
  "price_desc",
  "newest",
  "oldest",
] as const;
export type SortValue = (typeof sortValues)[number];

export const listQuerySchema = z
  .object({
    q: z.string().trim().min(1).max(120).optional(),
    // allow either a single category or multiple (array)
    category: z
      .union([z.string().trim().toLowerCase(), z.array(z.string().trim().toLowerCase())])
      .optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    sort: z.enum(sortValues).default("newest"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
  })
  .refine(
    (v) => !(v.minPrice != null && v.maxPrice != null) || v.minPrice <= v.maxPrice,
    { message: "minPrice cannot be greater than maxPrice", path: ["minPrice"] }
  );

export type ListQuery = z.infer<typeof listQuerySchema>;
