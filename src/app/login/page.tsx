import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  const allUsers = await db.select().from(users).orderBy(users.name);

  return (
    <main style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Ajaia Docs</h1>
        <p style={{ color: "var(--muted)" }}>
          Demo login: pick a seeded user. There are no passwords on purpose
          (mocked auth).
        </p>
        <LoginForm users={allUsers} />
      </div>
    </main>
  );
}
