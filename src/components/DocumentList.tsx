import Link from "next/link";

export type DocumentListItem = {
  id: string;
  title: string;
  updatedAt: Date;
  role?: "viewer" | "editor";
  ownerName?: string;
};

export default function DocumentList({
  items,
  emptyMessage,
}: {
  items: DocumentListItem[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p style={{ color: "var(--muted)" }}>{emptyMessage}</p>;
  }

  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "grid",
        gap: 8,
      }}
    >
      {items.map((d) => (
        <li key={d.id}>
          <Link
            href={`/documents/${d.id}`}
            className="card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 18px",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <div>
              <strong>{d.title}</strong>
              <div
                style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}
              >
                {d.ownerName ? `Shared by ${d.ownerName} · ` : ""}
                Updated{" "}
                {d.updatedAt.toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
            </div>
            {d.role && (
              <span
                style={{
                  fontSize: 12,
                  padding: "2px 10px",
                  borderRadius: 999,
                  background: d.role === "editor" ? "#e6f4ea" : "#e8eaed",
                  color: d.role === "editor" ? "#137333" : "var(--muted)",
                }}
              >
                {d.role === "editor" ? "Can edit" : "View only"}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
