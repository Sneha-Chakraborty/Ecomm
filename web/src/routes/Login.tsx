import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth";
import {
  loginSchema,
  type LoginFormValues,
  toLoginRequest,
} from "../validation/auth";
import { HttpError } from "../api/client";
import { useAuthStore } from "../store/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [serverError, setServerError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: login,
    onMutate: () => setServerError(null),
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      const user = await mutateAsync(toLoginRequest(values));
      setUser(user);
      const to = location.state?.from || "/";
      navigate(to, { replace: true });
    } catch (e) {
      const err = e as HttpError;
      if (err.status === 401) {
        setServerError("Invalid email or password.");
      } else {
        setServerError(err.message || "Something went wrong. Please try again.");
      }
    }
  }

  return (
    <section className="px-6 md:px-10 lg:px-16 py-10 md:py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-emerald-700 hover:underline dark:text-emerald-300">
            Create one
          </Link>
        </p>

        {serverError ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
          >
            {serverError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.email.message}
              </p>
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
              autoComplete="current-password"
              {...register("password")}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isPending}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/30 disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
          >
            {isSubmitting || isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          This site uses cookies for authentication. By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </section>
  );
}
