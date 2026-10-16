import { Link, useNavigate } from "react-router";
import { useState } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import meQueryOptions from "../queries/query";
import type { RegisterFormData } from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL;

const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required.")
      .max(50, "First name must be 1-50 characters."),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required.")
      .max(50, "Last name must be 1-50 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .pipe(z.email("Invalid email address.")),
    password: z
      .string()
      .min(8, "Password must be 8-16 characters.")
      .max(16, "Password must be 8-16 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { data: user } = useQuery(meQueryOptions());
  if (user) {
    navigate("/profile", { replace: true });
  }
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });
  async function onSubmit(data: RegisterFormData) {
    const name = data.firstName + " " + data.lastName;
    const body = { name, email: data.email, password: data.password };
    let res: Response;
    try {
      res = await fetch(API_URL + "/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });
    } catch {
      setError("root", {
        type: "manual",
        message:
          "Unable to connect. Please check your connection and try again.",
      });
      return;
    }

    if (res.status === 409) {
      setError("email", {
        type: "manual",
        message:
          "An account with this email already exists. Please use a different email.",
      });
      return;
    }
    if (!res.ok) {
      setError("root", {
        type: "manual",
        message: "Registration failed. Please try again.",
      });
      return;
    }

    navigate("/", { replace: true });
  }
  return (
    <div className="flex min-h-svh flex-col bg-white px-5 text-black sm:px-8">
      <header className="mx-auto w-full max-w-158 pt-6 text-center sm:pt-8">
        <Link
          className="inline-block text-[30px] leading-none font-extrabold tracking-[-1.8px] transition-opacity hover:opacity-70 sm:text-[34px]"
          to="/"
          aria-label="SHOP.CO home"
        >
          SHOP.CO
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-158 flex-1 items-center justify-center py-8">
        <section className="w-full max-w-96">
          <h1 className="mb-1.5 text-2xl leading-tight font-semibold tracking-[-0.8px] sm:text-[28px]">
            Sign up
          </h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-2.5"
          >
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <input
                  className={`h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition-colors placeholder:text-black/50 hover:border-black/35 focus:ring-2 focus:ring-black/10 sm:text-base ${errors.firstName ? "border-red-500 hover:border-red-500" : "border-black/10"}`}
                  id="first-name"
                  {...register("firstName")}
                  type="text"
                  placeholder="First Name"
                  autoComplete="given-name"
                  aria-label="First Name"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={
                    errors.firstName ? "first-name-error" : undefined
                  }
                />
                {errors.firstName?.message && (
                  <p
                    id="first-name-error"
                    className="text-xs font-medium leading-relaxed text-red-600"
                    role="alert"
                  >
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <input
                  className={`h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition-colors placeholder:text-black/50 hover:border-black/35 focus:ring-2 focus:ring-black/10 sm:text-base ${errors.lastName ? "border-red-500 hover:border-red-500" : "border-black/10"}`}
                  id="last-name"
                  {...register("lastName")}
                  type="text"
                  placeholder="Last Name"
                  autoComplete="family-name"
                  aria-label="Last Name"
                  aria-invalid={!!errors.lastName}
                  aria-describedby={
                    errors.lastName ? "last-name-error" : undefined
                  }
                />
                {errors.lastName?.message && (
                  <p
                    id="last-name-error"
                    className="text-xs font-medium leading-relaxed text-red-600"
                    role="alert"
                  >
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <input
                className={`h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition-colors placeholder:text-black/50 hover:border-black/35 focus:ring-2 focus:ring-black/10 sm:text-base ${errors.email ? "border-red-500 hover:border-red-500" : "border-black/10"}`}
                id="email"
                {...register("email")}
                type="email"
                placeholder="Email"
                autoComplete="email"
                aria-label="Email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email?.message && (
                <p
                  id="email-error"
                  className="text-xs font-medium leading-relaxed text-red-600"
                  role="alert"
                >
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="relative">
              <input
                className={`h-12 w-full rounded-xl border bg-white px-4 pr-16 text-sm outline-none transition-colors placeholder:text-black/50 hover:border-black/35 focus:ring-2 focus:ring-black/10 sm:text-base ${errors.password ? "border-red-500 hover:border-red-500" : "border-black/10"}`}
                id="password"
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="new-password"
                aria-label="Password"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              <button
                className="absolute inset-y-0 right-3 my-auto h-fit rounded px-1 py-1 text-xs font-semibold text-black/60 underline underline-offset-2 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                type="button"
                aria-controls="password"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password?.message && (
              <p
                id="password-error"
                className="text-xs font-medium leading-relaxed text-red-600"
                role="alert"
              >
                {errors.password.message}
              </p>
            )}

            <div className="relative">
              <input
                className={`h-12 w-full rounded-xl border bg-white px-4 pr-16 text-sm outline-none transition-colors placeholder:text-black/50 hover:border-black/35 focus:ring-2 focus:ring-black/10 sm:text-base ${errors.confirmPassword ? "border-red-500 hover:border-red-500" : "border-black/10"}`}
                id="confirm-password"
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                autoComplete="new-password"
                aria-label="Confirm password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "confirm-password-error" : undefined
                }
              />
              <button
                className="absolute inset-y-0 right-3 my-auto h-fit rounded px-1 py-1 text-xs font-semibold text-black/60 underline underline-offset-2 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                type="button"
                aria-controls="confirm-password"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                onClick={() => setShowConfirmPassword((visible) => !visible)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirmPassword?.message && (
              <p
                id="confirm-password-error"
                className="text-xs font-medium leading-relaxed text-red-600"
                role="alert"
              >
                {errors.confirmPassword.message}
              </p>
            )}
            {errors.root?.message && (
              <p
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium leading-relaxed text-red-700"
                role="alert"
              >
                {errors.root.message}
              </p>
            )}

            <label
              className="flex cursor-pointer items-center gap-2.5 py-1 text-sm leading-relaxed text-black/65"
              htmlFor="checkbox"
            >
              <input
                className="size-4 shrink-0 cursor-pointer accent-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                id="checkbox"
                type="checkbox"
              />
              Do you want to receive newsletter?
            </label>
            <button
              className="mt-1 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:cursor-wait disabled:opacity-60 sm:text-base"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Continue"}
            </button>
          </form>
          <p className="mt-4 mb-0 text-center text-xs leading-relaxed text-black/60 sm:text-sm">
            Have an account?{" "}
            <Link
              className="font-semibold text-black underline underline-offset-4 transition-opacity hover:opacity-60"
              to="/login"
            >
              Sign-in
            </Link>
          </p>
        </section>
      </main>
      <footer className="mx-auto w-full max-w-158 border-t border-black/10 py-3 text-center text-xs text-black/55 sm:py-4 sm:text-sm">
        <Link className="transition-colors hover:text-black" to="/">
          Privacy policy
        </Link>
      </footer>
    </div>
  );
}
