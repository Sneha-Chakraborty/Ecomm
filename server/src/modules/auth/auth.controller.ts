// server/src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { createUser, verifyUser } from "./auth.service";
import { AUTH_COOKIE, signJwt, jwtExpiryToMs } from "../../utils/jwt";
import { IS_PROD } from "../../config/env";
import { ApiError } from "../../middleware/error";

/**
 * Base cookie settings shared by login/logout; `sameSite` is dynamic:
 * - dev (localhost): lax
 * - prod (different domains for SPA/API): none (requires secure)
 */
const cookieBaseOptions = {
  httpOnly: true,
  secure: IS_PROD, // true on Render/HTTPS, false on localhost
  sameSite: (IS_PROD ? "none" : "lax") as "none" | "lax",
  path: "/",
};

/**
 * POST /auth/signup
 * Body validated via validate(signupSchema) in the route.
 * Returns: { user: { id, name, email } }
 */
export async function signupHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = (req as any).validated as {
      name: string;
      email: string;
      password: string;
    };
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
export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
      // 14d default (or whatever you set in env); jwtExpiryToMs() already handles ENV.JWT_EXPIRES_IN
      maxAge: jwtExpiryToMs(),
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
export async function meHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!(req as any).user) {
      return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
    }
    // req.user is set by requireAuth middleware (id, email?, name?, iat?, exp?)
    return res.status(200).json({ user: (req as any).user });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/logout
 * Clears the auth cookie.
 * Returns: 204 No Content
 */
export async function logoutHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
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
