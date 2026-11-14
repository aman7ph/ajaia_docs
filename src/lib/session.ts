import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";

export const SESSION_COOKIE = "ajaia_uid";

/** Returns the logged-in user, or null if there is no valid session. */
export async function getCurrentUser() {
  const id = cookies().get(SESSION_COOKIE)?.value;
  if (!id || !z.string().uuid().safeParse(id).success) return null;
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}
