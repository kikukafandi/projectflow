"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  accountProfileSchema,
  changePasswordSchema,
  type AccountProfileInput,
  type ChangePasswordInput,
} from "@/lib/validations";

/**
 * Account settings run through the Better Auth client rather than a server
 * action — password changes need the caller's own session, and Better Auth
 * already validates the current password server-side.
 */
export function AccountProfileForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountProfileInput>({
    resolver: zodResolver(accountProfileSchema),
    defaultValues: { name: defaultName },
  });

  async function onSubmit(values: AccountProfileInput) {
    setFormError(null);
    setSaved(false);
    const { error } = await authClient.updateUser({ name: values.name.trim() });
    if (error) {
      setFormError(error.message ?? "Gagal menyimpan profil.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <CardTitle>Profil</CardTitle>
          <Field label="Nama" htmlFor="name" required error={errors.name?.message}>
            <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          </Field>

          {formError && (
            <div role="alert" className="rounded-[12px] bg-danger-soft px-3 py-2 text-[13px] text-danger">
              {formError}
            </div>
          )}
          {saved && (
            <div role="status" className="rounded-[12px] bg-success-soft px-3 py-2 text-[13px] text-success">
              Profil tersimpan.
            </div>
          )}

          <Button type="submit" loading={isSubmitting}>
            {isSubmitting ? "Menyimpan…" : "Simpan Profil"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

export function ChangePasswordForm() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(values: ChangePasswordInput) {
    setFormError(null);
    setSaved(false);
    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      // Other devices must re-login once the password changes.
      revokeOtherSessions: true,
    });
    if (error) {
      setFormError(
        error.message ?? "Gagal mengubah password. Periksa password saat ini.",
      );
      return;
    }
    reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <CardTitle>Ganti Password</CardTitle>
          <Field
            label="Password Saat Ini"
            htmlFor="currentPassword"
            required
            error={errors.currentPassword?.message}
          >
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.currentPassword}
              {...register("currentPassword")}
            />
          </Field>
          <Field
            label="Password Baru"
            htmlFor="newPassword"
            required
            hint="Minimal 8 karakter."
            error={errors.newPassword?.message}
          >
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.newPassword}
              {...register("newPassword")}
            />
          </Field>
          <Field
            label="Konfirmasi Password Baru"
            htmlFor="confirmPassword"
            required
            error={errors.confirmPassword?.message}
          >
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
          </Field>

          {formError && (
            <div role="alert" className="rounded-[12px] bg-danger-soft px-3 py-2 text-[13px] text-danger">
              {formError}
            </div>
          )}
          {saved && (
            <div role="status" className="rounded-[12px] bg-success-soft px-3 py-2 text-[13px] text-success">
              Password berhasil diubah. Sesi di perangkat lain telah dikeluarkan.
            </div>
          )}

          <Button type="submit" loading={isSubmitting}>
            {isSubmitting ? "Menyimpan…" : "Ganti Password"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
