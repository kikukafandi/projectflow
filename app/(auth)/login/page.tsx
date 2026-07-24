"use client";

import { Workflow } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { signIn, signUp } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res =
        mode === "signin"
          ? await signIn.email({ email, password })
          : await signUp.email({ email, password, name });
      if (res.error) {
        setError(res.error.message ?? "Terjadi kesalahan. Coba lagi.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex size-11 items-center justify-center rounded-[14px] bg-primary text-white">
            <Workflow className="size-6" />
          </span>
          <h1 className="text-[22px] font-semibold text-ink">ProjectFlow</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {mode === "signin"
              ? "Masuk untuk melanjutkan pekerjaan."
              : "Buat akun pemilik untuk memulai."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[16px] border border-[#ECECE8] bg-surface p-6 shadow-[0_2px_8px_rgba(24,24,27,0.04)]"
        >
          <div className="space-y-4">
            {mode === "signup" && (
              <Field label="Nama" htmlFor="name" required>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </Field>
            )}
            <Field label="Email" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </Field>
            <Field label="Password" htmlFor="password" required>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
              />
            </Field>

            {error && (
              <div
                role="alert"
                className="rounded-[12px] bg-danger-soft px-3 py-2 text-[13px] text-danger"
              >
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              {loading
                ? "Memproses…"
                : mode === "signin"
                  ? "Masuk"
                  : "Buat akun"}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-[13px] text-ink-secondary">
          {mode === "signin" ? "Belum punya akun? " : "Sudah punya akun? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="font-semibold text-primary hover:underline"
          >
            {mode === "signin" ? "Daftar" : "Masuk"}
          </button>
        </p>
      </div>
    </div>
  );
}
