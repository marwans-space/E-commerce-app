import { Link, useNavigate } from "react-router";
import { useState } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import meQueryOptions from "../queries/query";
import { useQuery } from "@tanstack/react-query";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .pipe(z.email("Invalid email address.")),
  password: z.string().min(1, "Password is required."),
});
type UserData = z.infer<typeof loginSchema>;

async function getLoginError(res: Response) {
  if (res.status === 429) {
    return "Too many sign-in attempts. Please try again later.";
  }
  if (res.status >= 500) {
    return "We couldn't sign you in right now. Please try again later.";
  }

  const body: unknown = await res.json().catch(() => null);
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }

  return "Unable to sign in. Please try again.";
}

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
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
  } = useForm<UserData>({
    resolver: zodResolver(loginSchema),
  });
  async function onSubmit(data: UserData) {
    let res: Response;
    try {
      res = await fetch("http://localhost:3434/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
    } catch {
      setError("root", {
        type: "manual",
        message:
          "Unable to connect. Please check your connection and try again.",
      });
      return;
    }

    if (!res.ok) {
      const message =
        res.status === 401
          ? "Invalid email or password."
          : await getLoginError(res);
      setError("root", { type: "manual", message });
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
            Sign in
          </h1>
          <p className="mb-5 text-sm leading-relaxed text-black/55">
            Sign in or create an account
          </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-2.5"
          >
            <div className="flex flex-col gap-1">
              <input
                className={`h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition-colors placeholder:text-black/50 hover:border-black/35 focus:ring-2 focus:ring-black/10 sm:text-base ${errors.email ? "border-red-500 hover:border-red-500" : ""}`}
                {...register("email")}
                id="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                aria-label="Email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email?.message && (
              <p
                id="email-error"
                className="text-xs font-medium leading-relaxed text-red-600"
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
            <div className="relative">
              <input
                className={`h-12 w-full rounded-xl border bg-white px-4 pr-16 text-sm outline-none transition-colors placeholder:text-black/50 hover:border-black/35 focus:ring-2 focus:ring-black/10 sm:text-base ${errors.password ? "border-red-500 hover:border-red-500" : ""}`}
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
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
            {errors.root?.message && (
              <p
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium leading-relaxed text-red-700"
                role="alert"
              >
                {errors.root.message}
              </p>
            )}

            <button
              className="mt-1 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:cursor-wait disabled:opacity-60 sm:text-base"
              type="submit"
              disabled={isSubmitting}
            >
              {!isSubmitting ? "Continue" : "Signing in..."}
            </button>
          </form>
          <p className="mt-4 mb-0 text-center text-xs leading-relaxed text-black/60 sm:text-sm">
            New to SHOP.CO?{" "}
            <Link
              className="font-semibold text-black underline underline-offset-4 transition-opacity hover:opacity-60"
              to="/register"
            >
              Create an account
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
