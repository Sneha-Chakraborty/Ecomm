import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { addItemSchema, updateQtySchema } from "./cart.types";
import {
  getCart as svcGetCart,
  ensureCart as svcEnsureCart,
  addItem as svcAddItem,
  updateQty as svcUpdateQty,
  removeItem as svcRemoveItem,
  clearCart as svcClearCart,
  type CartKey,
} from "./cart.service";

/** Resolve cart key from req.user or X-Cart-Id header. May generate a new cartId. */
function resolveCartKey(req: Request, res: Response): { key: CartKey; cartIdGenerated?: string } {
  const userId = (req as any).user?.id as string | undefined;
  const headerKey = (req.get("x-cart-id") || req.get("X-Cart-Id") || "").trim();
  const cartId = headerKey || undefined;

  if (userId) {
    // Logged-in takes precedence; we ignore cartId header if present
    return { key: { userId } };
  }

  if (cartId) {
    return { key: { cartId } };
  }

  // Guest without cartId: create one and echo back
  const generated = crypto.randomUUID();
  res.setHeader("X-Cart-Id", generated);
  return { key: { cartId: generated }, cartIdGenerated: generated };
}

/** GET /api/cart  (guest or user) */
export async function getCartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { key } = resolveCartKey(req, res);
    // For GET we want a cart to always exist to simplify the UI
    const cart = await svcEnsureCart(key);
    return res.status(200).json({ cart });
  } catch (err) {
    next(err);
  }
}

/** POST /api/cart/add  Body: { itemId, quantity? } */
export async function addItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { key } = resolveCartKey(req, res);
    const body = (req as any).validated ?? addItemSchema.parse(req.body);
    const cart = await svcAddItem({
      key,
      itemId: body.itemId,
      quantity: body.quantity ?? 1,
    });
    return res.status(200).json({ cart });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/cart/item/:itemId  Body: { quantity } */
export async function updateQtyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { key } = resolveCartKey(req, res);
    const { itemId } = req.params;
    const body = (req as any).validated ?? updateQtySchema.parse(req.body);
    const cart = await svcUpdateQty({
      key,
      itemId,
      quantity: body.quantity,
    });
    return res.status(200).json({ cart });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/cart/item/:itemId */
export async function removeItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { key } = resolveCartKey(req, res);
    const { itemId } = req.params;
    const cart = await svcRemoveItem({ key, itemId });
    return res.status(200).json({ cart });
  } catch (err) {
    next(err);
  }
}

/** POST /api/cart/clear */
export async function clearCartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { key } = resolveCartKey(req, res);
    const cart = await svcClearCart({ key });
    return res.status(200).json({ cart });
  } catch (err) {
    next(err);
  }
}
