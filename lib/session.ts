import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/** Get the current session on the server, or null. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Require a session; redirect to /login if absent. Returns the user. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}

/**
 * Apakah user termasuk "super admin" — dari allowlist email di env ADMIN_EMAILS
 * (dipisah koma). Fail-closed: env kosong berarti tidak ada yang admin, jadi aksi
 * berbahaya seperti hapus paksa tetap tertutup sampai email sengaja didaftarkan.
 */
export function isAdmin(user: { email?: string | null }): boolean {
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !!user.email && allow.includes(user.email.toLowerCase());
}
