import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { getDocumentAccess } from "@/lib/documents";
import { can } from "@/lib/permissions";
import { updateDocumentSchema } from "@/lib/validation";
import { sanitizeHtml } from "@/lib/sanitize";
import { jsonError } from "@/lib/api";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Not authenticated", 401);

  const access = await getDocumentAccess(params.id, user.id);
  if (!access) return jsonError("Document not found", 404);

  return NextResponse.json({ ...access.doc, role: access.role });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Not authenticated", 401);

  const access = await getDocumentAccess(params.id, user.id);
  if (!access) return jsonError("Document not found", 404);

  const parsed = updateDocumentSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) return jsonError(parsed.error.issues[0].message, 400);

  const { title, content } = parsed.data;
  if (title !== undefined && !can(access.role, "rename"))
    return jsonError("You can't rename this document", 403);
  if (content !== undefined && !can(access.role, "edit"))
    return jsonError("You have view-only access", 403);

  const [updated] = await db
    .update(documents)
    .set({
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content: sanitizeHtml(content) } : {}),
      updatedAt: new Date(),
    })
    .where(eq(documents.id, params.id))
    .returning({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
    });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Not authenticated", 401);

  const access = await getDocumentAccess(params.id, user.id);
  if (!access) return jsonError("Document not found", 404);
  if (!can(access.role, "delete"))
    return jsonError("Only the owner can delete", 403);

  await db.delete(documents).where(eq(documents.id, params.id));
  return NextResponse.json({ ok: true });
}
