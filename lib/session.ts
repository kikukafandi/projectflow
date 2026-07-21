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
