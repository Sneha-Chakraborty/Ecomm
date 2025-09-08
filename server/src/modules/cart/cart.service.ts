import { isValidObjectId, Types } from "mongoose";
import { Cart, type CartDocument } from "./cart.model";
import { Item } from "../items/item.model";

/** Normalize an id-like value (ObjectId or populated doc) to a string */
function idEq(a: unknown, b: string): boolean {
  const left =
    a && typeof a === "object" && (a as any)._id
      ? String((a as any)._id)
      : String(a);
  return left === String(b);
}

/** Utility: consistently populate cart items with item fields */
async function populateCart<T extends CartDocument | null>(cart: T): Promise<T> {
  if (!cart) return cart;
  await cart.populate({
    path: "items.item",
    select: "name price category brand imageUrl stock isActive createdAt updatedAt",
  });
  return cart as T;
}

export type CartKey = { userId?: string | null; cartId?: string | null };

/** Find a cart by key, or null if none. Does NOT create. */
export async function getCart(key: CartKey): Promise<CartDocument | null> {
  const { userId, cartId } = key;
  const query: Record<string, unknown> = {};
  if (userId) query.userId = new Types.ObjectId(userId);
  else if (cartId) query.cartId = cartId;
  else return null;

  const cart = await Cart.findOne(query);
  return populateCart(cart);
}

/** Ensure a cart exists for the key; creates an empty one if missing. */
export async function ensureCart(key: CartKey): Promise<CartDocument> {
  const { userId, cartId } = key;
  if (!userId && !cartId) {
    throw Object.assign(new Error("Cart key missing"), { status: 400 });
  }

  const query: Record<string, unknown> = userId
    ? { userId: new Types.ObjectId(userId) }
    : { cartId };

  let cart = await Cart.findOne(query);
  if (!cart) {
    cart = new Cart({
      userId: userId ? new Types.ObjectId(userId) : null,
      cartId: userId ? null : cartId ?? null,
      items: [],
    });
    await cart.save();
  }
  return populateCart(cart);
}

/** Add or increase an item in cart */
export async function addItem(args: {
  key: CartKey;
  itemId: string;
  quantity?: number;
}): Promise<CartDocument> {
  const { key } = args;
  const itemId = String(args.itemId);
  const quantity = Math.max(1, Number(args.quantity ?? 1));

  if (!isValidObjectId(itemId)) {
    throw Object.assign(new Error("Invalid itemId"), { status: 400 });
  }

  const item = await Item.findById(itemId).lean();
  if (!item || (item as any).isActive === false) {
    throw Object.assign(new Error("Item not found"), { status: 404 });
  }

  const cart = await ensureCart(key);

  const idx = cart.items.findIndex((line) => idEq(line.item, itemId));
  if (idx >= 0) {
    cart.items[idx].qty = Math.min(99, cart.items[idx].qty + quantity);
  } else {
    cart.items.push({ item: new Types.ObjectId(itemId), qty: Math.min(99, quantity) });
  }

  await cart.save();
  return populateCart(cart);
}

/** Update quantity (set). If quantity <= 0, removes the line. */
export async function updateQty(args: {
  key: CartKey;
  itemId: string;
  quantity: number;
}): Promise<CartDocument> {
  const { key } = args;
  const itemId = String(args.itemId);
  const quantity = Number(args.quantity);

  if (!isValidObjectId(itemId)) {
    throw Object.assign(new Error("Invalid itemId"), { status: 400 });
  }

  const cart = await ensureCart(key);

  const idx = cart.items.findIndex((line) => idEq(line.item, itemId));
  if (idx < 0) {
    throw Object.assign(new Error("Item not in cart"), { status: 404 });
  }

  if (quantity <= 0) {
    cart.items.splice(idx, 1);
  } else {
    cart.items[idx].qty = Math.min(99, Math.max(1, quantity));
  }

  await cart.save();
  return populateCart(cart);
}

/** Remove a line entirely */
export async function removeItem(args: {
  key: CartKey;
  itemId: string;
}): Promise<CartDocument> {
  const { key } = args;
  const itemId = String(args.itemId);

  if (!isValidObjectId(itemId)) {
    throw Object.assign(new Error("Invalid itemId"), { status: 400 });
  }

  const cart = await ensureCart(key);

  cart.items = cart.items.filter((line) => !idEq(line.item, itemId));

  await cart.save();
  return populateCart(cart);
}

/** Clear all lines */
export async function clearCart(args: { key: CartKey }): Promise<CartDocument> {
  const cart = await ensureCart(args.key);
  cart.items = [];
  await cart.save();
  return populateCart(cart);
}
