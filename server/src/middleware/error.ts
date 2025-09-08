// server/src/middleware/error.ts
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

// Use this to throw typed errors from services/controllers
export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: unknown;

  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

// 404 helper (mount before errorHandler)
export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, "Not Found", "NOT_FOUND"));
}

// Central error handler (last middleware)
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  const payload: {
    error: { message: string; code?: string; details?: unknown };
  } = { error: { message: "Internal Server Error" } };

  // Our own typed errors
  if (err instanceof ApiError) {
    status = err.statusCode || 500;
    payload.error.message = err.message;
    if (err.code) payload.error.code = err.code;
    if (err.details) payload.error.details = err.details;
    return res.status(status).json(payload);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    status = 400;
    payload.error.message = "Validation failed";
    payload.error.code = "VALIDATION_ERROR";
    payload.error.details = err.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    return res.status(status).json(payload);
  }

  // Mongoose duplicate key
  if (err && typeof err === "object" && "code" in err && (err as any).code === 11000) {
    status = 409;
    payload.error.message = "Duplicate key";
    payload.error.code = "DUPLICATE";
    payload.error.details = (err as any).keyValue;
    return res.status(status).json(payload);
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    payload.error.message = "Validation failed";
    payload.error.code = "MONGOOSE_VALIDATION_ERROR";
    payload.error.details = Object.values(err.errors).map((e: any) => e.message);
    return res.status(status).json(payload);
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err instanceof mongoose.Error.CastError) {
    status = 400;
    payload.error.message = "Invalid identifier";
    payload.error.code = "CAST_ERROR";
    payload.error.details = { path: err.path, value: err.value };
    return res.status(status).json(payload);
  }

  // Malformed JSON (from express.json)
  if (err instanceof SyntaxError && "body" in err) {
    status = 400;
    payload.error.message = "Malformed JSON";
    payload.error.code = "BAD_JSON";
    return res.status(status).json(payload);
  }

  // Fallback (include stack only in non-prod)
  if (process.env.NODE_ENV !== "production") {
    payload.error.details = {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
    };
  }

  return res.status(status).json(payload);
}
