import { redirect } from "next/navigation";
import { getSession, SessionPayload } from "./auth";

/** For server components/pages: redirect to /login if not authed. */
export async function requirePage(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** For API routes: returns session or null (caller returns 401). */
export async function requireApi(): Promise<SessionPayload | null> {
  return getSession();
}
