import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { documents, shares, users } from "@/db/schema";
import { resolveRole } from "./permissions";

const uuid = z.string().uuid();

/** Loads a document and the caller's role. Returns null if it doesn't exist OR the caller has no access. */
export async function getDocumentAccess(docId: string, userId: string) {
  if (!uuid.safeParse(docId).success) return null;

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, docId))
    .limit(1);
  if (!doc) return null;

  const docShares = await db
    .select({ userId: shares.userId, role: shares.role })
    .from(shares)
    .where(eq(shares.documentId, docId));

  const role = resolveRole(doc, userId, docShares);
  return role ? { doc, role } : null;
}

export async function listDocumentsForUser(userId: string) {
  const owned = await db
    .select({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(eq(documents.ownerId, userId))
    .orderBy(desc(documents.updatedAt));

  const shared = await db
    .select({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
      role: shares.role,
      ownerName: users.name,
    })
    .from(shares)
    .innerJoin(documents, eq(shares.documentId, documents.id))
    .innerJoin(users, eq(documents.ownerId, users.id))
    .where(eq(shares.userId, userId))
    .orderBy(desc(documents.updatedAt));

  return { owned, shared };
}
