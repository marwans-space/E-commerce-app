import { Link, Navigate, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import API_URL from "../config";
import meQueryOptions from "../queries/query";
import type { ChangePassFormData } from "../types/auth";

const changePassSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required."),
    newPassword: z
      .string()
      .min(8, "Password must be 8-16 characters.")
      .max(16, "Password must be 8-16 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "The old and new passwords can't be equal.",
    path: ["newPassword"],
  });

async function getChangePassError(res: Response) {
  const body: unknown = await res.json().catch(() => null);
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }
  return "Unable to change password. Please try again.";
}

export function ChangePass() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useQuery(meQueryOptions());

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePassFormData>({
    resolver: zodResolver(changePassSchema),
  });

  if (user === null) return <Navigate to="/login" replace />;

  async function onSubmit(data: ChangePassFormData) {
    let res: Response;
    try {
      res = await fetch(API_URL + "/auth/change-pass", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        }),
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
      const message = await getChangePassError(res);
      setError("root", { type: "manual", message });
      return;
    }

    queryClient.setQueryData(meQueryOptions().queryKey, null);
    navigate("/login", { replace: true });
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
            Change password
          </h1>
          <p className="mb-5 text-sm leading-relaxed text-black/55">
            Enter your old password and choose a new one
          </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-2.5"
          >
            <div className="relative">
              <input
                className={`h-12 w-full rounded-xl border bg-white px-4 pr-16 text-sm outline-none transition-colors placeholder:text-black/50 hover:border-black/35 focus:ring-2 focus:ring-black/10 sm:text-base ${errors.oldPassword ? "border-red-500 hover:border-red-500" : "border-black/10"}`}
                {...register("oldPassword")}
                id="old-password"
                type={showOldPassword ? "text" : "password"}
                placeholder="Old Password"
                autoComplete="current-password"
                aria-label="Old password"
                aria-invalid={!!errors.oldPassword}
                aria-describedby={
                  errors.oldPassword ? "old-password-error" : undefined
                }
              />
              <button
                className="absolute inset-y-0 right-3 my-auto h-fit rounded px-1 py-1 text-xs font-semibold text-black/60 underline underline-offset-2 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                type="button"
                aria-controls="old-password"
                aria-label={showOldPassword ? "Hide old password" : "Show old password"}
                onClick={() => setShowOldPassword((visible) => !visible)}
              >
                {showOldPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.oldPassword?.message && (
              <p id="old-password-error" className="text-xs font-medium leading-relaxed text-red-600" role="alert">
                {errors.oldPassword.message}
              </p>
            )}

            <div className="relative">
              <input
                className={`h-12 w-full rounded-xl border bg-white px-4 pr-16 text-sm outline-none transition-colors placeholder:text-black/50 hover:border-black/35 focus:ring-2 focus:ring-black/10 sm:text-base ${errors.newPassword ? "border-red-500 hover:border-red-500" : "border-black/10"}`}
                {...register("newPassword")}
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                autoComplete="new-password"
                aria-label="New password"
                aria-invalid={!!errors.newPassword}
                aria-describedby={
                  errors.newPassword ? "new-password-error" : undefined
                }
              />
              <button
                className="absolute inset-y-0 right-3 my-auto h-fit rounded px-1 py-1 text-xs font-semibold text-black/60 underline underline-offset-2 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                type="button"
                aria-controls="new-password"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                onClick={() => setShowNewPassword((visible) => !visible)}
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.newPassword?.message && (
              <p id="new-password-error" className="text-xs font-medium leading-relaxed text-red-600" role="alert">
                {errors.newPassword.message}
              </p>
            )}

            <div className="relative">
              <input
                className={`h-12 w-full rounded-xl border bg-white px-4 pr-16 text-sm outline-none transition-colors placeholder:text-black/50 hover:border-black/35 focus:ring-2 focus:ring-black/10 sm:text-base ${errors.confirmPassword ? "border-red-500 hover:border-red-500" : "border-black/10"}`}
                {...register("confirmPassword")}
                id="confirm-new-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                autoComplete="new-password"
                aria-label="Confirm new password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword
                    ? "confirm-new-password-error"
                    : undefined
                }
              />
              <button
                className="absolute inset-y-0 right-3 my-auto h-fit rounded px-1 py-1 text-xs font-semibold text-black/60 underline underline-offset-2 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                type="button"
                aria-controls="confirm-new-password"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm new password"
                    : "Show confirm new password"
                }
                onClick={() =>
                  setShowConfirmPassword((visible) => !visible)
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirmPassword?.message && (
              <p id="confirm-new-password-error" className="text-xs font-medium leading-relaxed text-red-600" role="alert">
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

            <button
              className="mt-1 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:cursor-wait disabled:opacity-60 sm:text-base"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Changing password..." : "Change Password"}
            </button>
          </form>
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
