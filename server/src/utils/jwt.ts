import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { ENV } from "../config/env";

/** Name of the auth cookie we’ll use */
export const AUTH_COOKIE = "token";

/**
 * Sign a JWT.
 * - Uses ENV.JWT_EXPIRES_IN unless you override via options.expiresIn
 * - `payload` can be anything JSON-serializable (e.g., { sub: userId })
 */
export function signJwt(
  payload: object,
  options?: SignOptions
): string {
  const opts: SignOptions = { ...options };
  if (opts.expiresIn === undefined) {
    // zod lets this be string like "14d" or a number (seconds) — both accepted by jsonwebtoken
    opts.expiresIn = ENV.JWT_EXPIRES_IN as any;
  }
  return jwt.sign(payload, ENV.JWT_SECRET, opts);
}

/**
 * Verify a JWT.
 * - Returns the decoded payload if valid, otherwise `null`
 * - Does NOT throw — safe to call from middleware
 */
export function verifyJwt<T extends JwtPayload = JwtPayload>(
  token?: string
): T | null {
  if (!token) return null;
  try {
    return jwt.verify(token, ENV.JWT_SECRET) as T;
  } catch {
    return null;
  }
}

/**
 * Convert ENV.JWT_EXPIRES_IN to milliseconds (for cookie maxAge).
 * - Supports "ms|s|m|h|d|w|y" (e.g., "14d", "12h", "3600s") or numeric seconds
 */
export function jwtExpiryToMs(): number {
  const v = ENV.JWT_EXPIRES_IN as unknown;
  if (typeof v === "number") return v * 1000; // seconds → ms
  const m = /^(\d+)\s*(ms|s|m|h|d|w|y)$/i.exec(String(v));
  if (!m) return 0;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const mul: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    y: 365 * 24 * 60 * 60 * 1000,
  };
  return n * (mul[unit] ?? 1000);
}
