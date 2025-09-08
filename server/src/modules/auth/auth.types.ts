// server/src/modules/auth/auth.types.ts
import { z } from "zod";

/** Reusable field validators */
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address");

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

/** -------------------- Signup -------------------- */
export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be at most 60 characters"),
  email: emailField,
  password: passwordField,
});

export type SignupBody = z.infer<typeof signupSchema>;

/** -------------------- Login --------------------- */
export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export type LoginBody = z.infer<typeof loginSchema>;
