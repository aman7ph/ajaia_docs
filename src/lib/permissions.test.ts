import { describe, it, expect } from "vitest";
import { resolveRole, can } from "./permissions";

const doc = { ownerId: "alice" };
const shares = [
  { userId: "bob", role: "editor" as const },
  { userId: "carol", role: "viewer" as const },
];

describe("resolveRole", () => {
  it("identifies the owner", () =>
    expect(resolveRole(doc, "alice", shares)).toBe("owner"));
  it("returns the shared role", () => {
    expect(resolveRole(doc, "bob", shares)).toBe("editor");
    expect(resolveRole(doc, "carol", shares)).toBe("viewer");
  });
  it("returns null for users with no access", () =>
    expect(resolveRole(doc, "dave", shares)).toBeNull());
  it("owner wins even if also listed in shares", () =>
    expect(
      resolveRole(doc, "alice", [{ userId: "alice", role: "viewer" }]),
    ).toBe("owner"));
});

describe("can", () => {
  it("owner can do everything", () => {
    for (const a of ["read", "edit", "rename", "share", "delete"] as const)
      expect(can("owner", a)).toBe(true);
  });
  it("editor can edit but not share or delete", () => {
    expect(can("editor", "edit")).toBe(true);
    expect(can("editor", "share")).toBe(false);
    expect(can("editor", "delete")).toBe(false);
  });
  it("viewer is read-only", () => {
    expect(can("viewer", "read")).toBe(true);
    expect(can("viewer", "edit")).toBe(false);
  });
  it("no role means no access", () => expect(can(null, "read")).toBe(false));
});
