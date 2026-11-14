import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { listDocumentsForUser } from "@/lib/documents";
import { createDocumentSchema } from "@/lib/validation";
import { jsonError } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Not authenticated", 401);

  return NextResponse.json(await listDocumentsForUser(user.id));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Not authenticated", 401);

  const parsed = createDocumentSchema.safeParse(
    await req.json().catch(() => ({})),
  );
  if (!parsed.success) return jsonError(parsed.error.issues[0].message, 400);

  const [doc] = await db
    .insert(documents)
    .values({
      ownerId: user.id,
      ...(parsed.data.title ? { title: parsed.data.title } : {}),
    })
    .returning({ id: documents.id, title: documents.title });

  return NextResponse.json(doc, { status: 201 });
}
