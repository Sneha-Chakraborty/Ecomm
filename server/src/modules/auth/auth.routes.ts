// server/src/modules/auth/auth.routes.ts
import { Router } from "express";
import { validate } from "../../utils/validate";
import { signupSchema, loginSchema } from "./auth.types";
import {
  signupHandler,
  loginHandler,
  meHandler,
  logoutHandler,
} from "./auth.controller";
import { requireAuth } from "../../middleware/auth";

const router = Router();

// Public
router.post("/signup", validate(signupSchema), signupHandler);
router.post("/login", validate(loginSchema), loginHandler);

// Protected
router.get("/me", requireAuth, meHandler);
router.post("/logout", requireAuth, logoutHandler);

export default router;
