export type Role = "owner" | "editor" | "viewer";
export type Action = "read" | "edit" | "rename" | "share" | "delete";

type ShareLike = { userId: string; role: "editor" | "viewer" };
type DocLike = { ownerId: string };

export function resolveRole(
  doc: DocLike,
  userId: string,
  shares: ShareLike[],
): Role | null {
  if (doc.ownerId === userId) return "owner";
  const share = shares.find((s) => s.userId === userId);
  return share ? share.role : null;
}

const MATRIX: Record<Role, Action[]> = {
  owner: ["read", "edit", "rename", "share", "delete"],
  editor: ["read", "edit", "rename"],
  viewer: ["read"],
};

export function can(role: Role | null, action: Action): boolean {
  return role !== null && MATRIX[role].includes(action);
}
