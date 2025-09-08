// server/src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { createUser, verifyUser } from "./auth.service";
import { AUTH_COOKIE, signJwt, jwtExpiryToMs } from "../../utils/jwt";
import { IS_PROD } from "../../config/env";
import { ApiError } from "../../middleware/error";

/** Shared cookie options for the auth cookie */
const cookieBaseOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: IS_PROD, // true in production; false in local dev
  path: "/",
};

/**
 * POST /auth/signup
 * Body validated via validate(signupSchema) in the route.
 * Returns: { user: { id, name, email } }
 */
export async function signupHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = (req as any).validated as { name: string; email: string; password: string };
    const user = await createUser(data);
    return res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/login
 * Body validated via validate(loginSchema) in the route.
 * - Verifies credentials
 * - Signs JWT and sets HttpOnly cookie
 * Returns: { user: { id, name, email } }
 */
export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = (req as any).validated as { email: string; password: string };
    const user = await verifyUser(data);

    const token = signJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    res.cookie(AUTH_COOKIE, token, {
      ...cookieBaseOptions,
      maxAge: jwtExpiryToMs(), // e.g., 14d → ms
    });

    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /auth/me
 * Requires requireAuth middleware to populate req.user.
 * Returns: { user: { id, email, name, iat?, exp? } }
 */
export async function meHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
    }
    // req.user is set by requireAuth middleware (id, email?, name?, iat?, exp?)
    return res.status(200).json({ user: req.user });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/logout
 * Clears the auth cookie.
 * Returns: 204 No Content
 */
export async function logoutHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    res.clearCookie(AUTH_COOKIE, {
      ...cookieBaseOptions,
      maxAge: 0,
    });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
