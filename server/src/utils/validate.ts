import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

/**
 * Validate an Express request segment with a Zod schema.
 *
 * Usage:
 *   router.post("/items", validate(createItemSchema), handler)            // body (default)
 *   router.get("/items", validate(listQuerySchema, "query"), handler)     // query string
 *   router.get("/items/:id", validate(idSchema, "params"), handler)       // route params
 *
 * Parsed data is attached to `req.validated`.
 */
export function validate(
  schema: ZodTypeAny,
  source: "body" | "query" | "params" = "body"
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const input =
      source === "body" ? req.body : source === "query" ? req.query : req.params;

    const result = schema.safeParse(input);
    if (!result.success) {
      // Our centralized error handler understands ZodError
      return next(result.error);
    }

    // Attach the parsed, typed data for downstream handlers
    (req as any).validated = result.data;
    return next();
  };
}
