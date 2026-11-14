import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getDocumentAccess } from "@/lib/documents";
import DocumentEditor from "@/components/DocumentEditor";

export const dynamic = "force-dynamic";

export default async function DocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const access = await getDocumentAccess(params.id, user.id);
  if (!access) notFound();

  return (
    <DocumentEditor
      id={access.doc.id}
      initialTitle={access.doc.title}
      initialContent={access.doc.content}
      role={access.role}
    />
  );
}
