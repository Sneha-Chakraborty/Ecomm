// server/src/config/env.ts
import "dotenv/config";
import { z } from "zod";

// allow "14d", "12h", "3600s", etc. or a positive number of seconds
const durationRe = /^\d+\s*(ms|s|m|h|d|w|y)$/i;

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  MONGO_URI: z
    .string()
    .min(1, "MONGO_URI is required")
    .refine(
      (v) => v.startsWith("mongodb://") || v.startsWith("mongodb+srv://"),
      "MONGO_URI must start with mongodb:// or mongodb+srv://"
    ),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters (use a long random string)"),
  JWT_EXPIRES_IN: z
    .union([
      z.coerce.number().int().positive(),
      z
        .string()
        .trim()
        .refine((v) => durationRe.test(v), {
          message: "JWT_EXPIRES_IN must be like '14d', '12h', '3600s'",
        }),
    ])
    .default("14d"),
});

type EnvShape = z.infer<typeof EnvSchema>;

function validateEnv(): EnvShape {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    process.exit(1);
  }
  return parsed.data;
}

export const ENV = validateEnv();

export const IS_DEV: boolean = ENV.NODE_ENV === "development";
export const IS_PROD: boolean = ENV.NODE_ENV === "production";
export const IS_TEST: boolean = ENV.NODE_ENV === "test";
