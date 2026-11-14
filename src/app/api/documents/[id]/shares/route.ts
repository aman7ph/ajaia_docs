import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { shares, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { getDocumentAccess } from "@/lib/documents";
import { can } from "@/lib/permissions";
import { shareSchema, unshareSchema } from "@/lib/validation";
import { jsonError } from "@/lib/api";

type Ctx = { params: { id: string } };

/** Shared guard: must be logged in, must have access, and must be the owner. */
async function requireOwner(docId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: jsonError("Not authenticated", 401) };

  const access = await getDocumentAccess(docId, user.id);
  if (!access) return { error: jsonError("Document not found", 404) };
  if (!can(access.role, "share"))
    return { error: jsonError("Only the owner can manage sharing", 403) };

  return { user, access };
}

export async function GET(_req: Request, { params }: Ctx) {
  const guard = await requireOwner(params.id);
  if (guard.error) return guard.error;

  const list = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      role: shares.role,
    })
    .from(shares)
    .innerJoin(users, eq(shares.userId, users.id))
    .where(eq(shares.documentId, params.id));

  return NextResponse.json(list);
}

export async function POST(req: Request, { params }: Ctx) {
  const guard = await requireOwner(params.id);
  if (guard.error) return guard.error;

  const parsed = shareSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0].message, 400);

  const [target] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  if (!target) return jsonError("No user with that email", 404);
  if (target.id === guard.user.id)
    return jsonError("You already own this document", 400);

  // Upsert: sharing again with a different role updates the existing grant
  await db
    .insert(shares)
    .values({
      documentId: params.id,
      userId: target.id,
      role: parsed.data.role,
    })
    .onConflictDoUpdate({
      target: [shares.documentId, shares.userId],
      set: { role: parsed.data.role },
    });

  return NextResponse.json(
    {
      userId: target.id,
      name: target.name,
      email: target.email,
      role: parsed.data.role,
    },
    { status: 201 },
  );
}

export async function DELETE(req: Request, { params }: Ctx) {
  const guard = await requireOwner(params.id);
  if (guard.error) return guard.error;

  const parsed = unshareSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid request", 400);

  await db
    .delete(shares)
    .where(
      and(
        eq(shares.documentId, params.id),
        eq(shares.userId, parsed.data.userId),
      ),
    );

  return NextResponse.json({ ok: true });
}
