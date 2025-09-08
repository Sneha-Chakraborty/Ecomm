import { z } from "zod";

/** Helper: basic 24-char hex ObjectId check */
const objectIdRegex = /^[a-f\d]{24}$/i;

/** Add item to cart: { itemId, quantity? } */
export const addItemSchema = z.object({
  itemId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Invalid itemId (must be a Mongo ObjectId)"),
  quantity: z
    .coerce.number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity too large")
    .optional(), // default to 1 in service if not provided
});
export type AddItemBody = z.infer<typeof addItemSchema>;

/** Update quantity for an item already in cart */
export const updateQtySchema = z.object({
  quantity: z
    .coerce.number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity too large"),
});
export type UpdateQtyBody = z.infer<typeof updateQtySchema>;

/**
 * Optional: validate a client-provided cart key (for guests).
 * You can use either of these depending on whether you validate the header object
 * or just a plain cartId value. Express lower-cases header names.
 */
export const cartKeySchema = z.object({
  cartId: z.string().uuid("cartId must be a valid UUID"),
});
export type CartKey = z.infer<typeof cartKeySchema>;

export const cartKeyHeaderSchema = z.object({
  "x-cart-id": z.string().uuid("X-Cart-Id must be a valid UUID"),
});
export type CartKeyHeader = z.infer<typeof cartKeyHeaderSchema>;
