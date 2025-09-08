import { Request, Response, NextFunction } from "express";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} from "./item.service";
import type {
  CreateItemBody,
  UpdateItemBody,
  ListQuery,
} from "./item.types";

/** POST /api/items  (protected) */
export async function createItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // body was validated in the route with createItemSchema
    const data = (req as any).validated as CreateItemBody;
    const item = await createItem(data);
    return res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

/** GET /api/items  (public, filters via query) */
export async function listItemsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // query was validated in the route with listQuerySchema
    const filters = (req as any).validated as ListQuery;
    const result = await getItems(filters);
    return res.status(200).json(result); // { items, total, page, pageSize }
  } catch (err) {
    next(err);
  }
}

/** GET /api/items/:id  (public) */
export async function getItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params; // service will validate ObjectId
    const item = await getItemById(id);
    return res.status(200).json({ item });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/items/:id  (protected) */
export async function updateItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params; // service validates id
    // body was validated in the route with updateItemSchema
    const data = (req as any).validated as UpdateItemBody;
    const item = await updateItem(id, data);
    return res.status(200).json({ item });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/items/:id  (protected) */
export async function deleteItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await deleteItem(id);
    return res.status(200).json(result); // { id }
  } catch (err) {
    next(err);
  }
}
