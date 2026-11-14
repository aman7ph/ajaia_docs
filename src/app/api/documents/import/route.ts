import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { sanitizeHtml } from "@/lib/sanitize";
import { jsonError } from "@/lib/api";
import {
  convertFileToHtml,
  getExtension,
  ImportError,
  MAX_UPLOAD_BYTES,
  SUPPORTED_EXTENSIONS,
  titleFromFilename,
} from "@/lib/import";

const MAX_CONTENT_CHARS = 500_000; // same cap as normal saves

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Not authenticated", 401);

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return jsonError("No file uploaded", 400);
  if (file.size === 0) return jsonError("The file is empty", 400);
  if (file.size > MAX_UPLOAD_BYTES)
    return jsonError("File is too large (max 2 MB)", 413);
  if (
    !(SUPPORTED_EXTENSIONS as readonly string[]).includes(
      getExtension(file.name),
    )
  ) {
    return jsonError(
      `Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(", ")}`,
      400,
    );
  }

  try {
    const html = await convertFileToHtml(
      file.name,
      Buffer.from(await file.arrayBuffer()),
    );
    const content = sanitizeHtml(html);
    if (content.length > MAX_CONTENT_CHARS)
      return jsonError("This file has too much content to import", 413);

    const [doc] = await db
      .insert(documents)
      .values({
        ownerId: user.id,
        title: titleFromFilename(file.name),
        content,
      })
      .returning({ id: documents.id, title: documents.title });

    return NextResponse.json(doc, { status: 201 });
  } catch (e) {
    if (e instanceof ImportError) return jsonError(e.message, 400);
    console.error("Import failed", e);
    return jsonError("Import failed", 500);
  }
}
