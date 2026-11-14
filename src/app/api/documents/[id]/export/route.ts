import { getCurrentUser } from "@/lib/session";
import { getDocumentAccess } from "@/lib/documents";
import { can } from "@/lib/permissions";
import { htmlToMarkdown, toExportFilename } from "@/lib/export";
import { jsonError } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Not authenticated", 401);

  const access = await getDocumentAccess(params.id, user.id);
  if (!access || !can(access.role, "read"))
    return jsonError("Document not found", 404);

  const markdown = htmlToMarkdown(access.doc.content);
  const filename = toExportFilename(access.doc.title);

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // ASCII fallback plus a UTF-8 version for non-ASCII titles
      "Content-Disposition": `attachment; filename="${filename.replace(/[^\x20-\x7e]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
