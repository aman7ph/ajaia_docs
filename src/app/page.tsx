import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listDocumentsForUser } from "@/lib/documents";
import LogoutButton from "@/components/LogoutButton";
import NewDocumentButton from "@/components/NewDocumentButton";
import DocumentList from "@/components/DocumentList";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { owned, shared } = await listDocumentsForUser(user.id);

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>Ajaia Docs</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "var(--muted)" }}>{user.name}</span>
          <LogoutButton />
        </div>
      </header>

      <section style={{ marginTop: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>My documents</h2>
          <NewDocumentButton />
        </div>
        <DocumentList
          items={owned}
          emptyMessage="You haven't created any documents yet."
        />
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Shared with me</h2>
        <DocumentList
          items={shared}
          emptyMessage="Nothing has been shared with you yet."
        />
      </section>
    </main>
  );
}
