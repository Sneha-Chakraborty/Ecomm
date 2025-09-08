import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/auth";
import {
  signupSchema,
  type SignupFormValues,
  toSignupRequest,
} from "../validation/auth";
import { HttpError } from "../api/client";

export default function Signup() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: signup,
    onMutate: () => setServerError(null),
  });

  async function onSubmit(values: SignupFormValues) {
    setServerError(null);
    try {
      await mutateAsync(toSignupRequest(values));
      reset();
      // Navigate to login after successful signup
      navigate("/login", { replace: true });
    } catch (e) {
      const err = e as HttpError;
      // Show friendly message for duplicate email, otherwise generic
      if (err.status === 409) {
        setServerError("This email is already registered.");
      } else {
        setServerError(err.message || "Something went wrong. Please try again.");
      }
    }
  }

  return (
    <section className="px-6 md:px-10 lg:px-16 py-10 md:py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-700 hover:underline dark:text-emerald-300">
            Log in
          </Link>
        </p>

        {serverError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200">
            {serverError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register("name")}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Jane Doe"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="At least 8 characters"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Re-enter your password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isPending}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/30 disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
          >
            {isSubmitting || isPending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </section>
  );
}
