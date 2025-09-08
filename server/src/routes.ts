import { Router } from "express";
import authRouter from "./modules/auth/auth.routes";
import itemsRouter from "./modules/items/item.routes";
import cartRouter from "./modules/cart/cart.routes";

const router = Router();

// Health check
router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Auth
router.use("/auth", authRouter);

// Items
router.use("/items", itemsRouter);

//Cart
router.use("/cart", cartRouter);
export default router;
