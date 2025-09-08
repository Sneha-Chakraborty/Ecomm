import type { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";

/** Attach req.user if a valid JWT is present (cookie or Authorization header) */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice("Bearer ".length)
        : undefined);

    if (token) {
      const payload = verifyJwt(token);
      if (payload && typeof payload === "object") {
        (req as any).user = {
          id: (payload as any).id,
          email: (payload as any).email,
          name: (payload as any).name,
        };
      }
    }
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

/** Require a valid JWT; otherwise 401 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice("Bearer ".length)
        : undefined);

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const payload = verifyJwt(token);
    if (!payload || typeof payload !== "object") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    (req as any).user = {
      id: (payload as any).id,
      email: (payload as any).email,
      name: (payload as any).name,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
