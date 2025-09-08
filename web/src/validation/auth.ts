import { z } from "zod";

/** -------------------- Signup -------------------- */
export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name must be at most 60 characters"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
export type SignupRequest = Pick<SignupFormValues, "name" | "email" | "password">;

export function toSignupRequest(values: SignupFormValues): SignupRequest {
  return {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    password: values.password,
  };
}

/** -------------------- Login --------------------- */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type LoginRequest = LoginFormValues; // { email, password }

export function toLoginRequest(values: LoginFormValues): LoginRequest {
  return {
    email: values.email.trim().toLowerCase(),
    password: values.password,
  };
}
