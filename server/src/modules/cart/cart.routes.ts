import { Router } from "express";
import { optionalAuth } from "../../middleware/auth";
import { validate } from "../../utils/validate";
import { addItemSchema, updateQtySchema } from "./cart.types";
import {
  getCartHandler,
  addItemHandler,
  updateQtyHandler,
  removeItemHandler,
  clearCartHandler,
} from "./cart.controller";

const router = Router();

// Anyone can have a cart: logged-in (userId) or guest (X-Cart-Id)
router.get("/", optionalAuth, getCartHandler);

router.post("/add", optionalAuth, validate(addItemSchema, "body"), addItemHandler);

router.patch(
  "/item/:itemId",
  optionalAuth,
  validate(updateQtySchema, "body"),
  updateQtyHandler
);

router.delete("/item/:itemId", optionalAuth, removeItemHandler);

router.post("/clear", optionalAuth, clearCartHandler);

export default router;
