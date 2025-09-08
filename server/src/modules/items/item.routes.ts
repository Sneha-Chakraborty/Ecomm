import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../utils/validate";
import {
  createItemSchema,
  updateItemSchema,
  listQuerySchema,
} from "./item.types";
import {
  createItemHandler,
  listItemsHandler,
  getItemHandler,
  updateItemHandler,
  deleteItemHandler,
} from "./item.controller";

const router = Router();

/**
 * POST   /api/items          (create)    [protected]
 * GET    /api/items          (list)      [public]    query filters
 * GET    /api/items/:id      (detail)    [public]
 * PATCH  /api/items/:id      (update)    [protected]
 * DELETE /api/items/:id      (delete)    [protected]
 */

router.post("/", requireAuth, validate(createItemSchema, "body"), createItemHandler);

router.get("/", validate(listQuerySchema, "query"), listItemsHandler);

router.get("/:id", getItemHandler);

router.patch("/:id", requireAuth, validate(updateItemSchema, "body"), updateItemHandler);

router.delete("/:id", requireAuth, deleteItemHandler);

export default router;
