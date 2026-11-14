import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "./sanitize";

describe("sanitizeHtml", () => {
  it("removes script tags and their contents", () => {
    expect(sanitizeHtml("<h1>Hello</h1><script>alert(1)</script>")).toBe(
      "<h1>Hello</h1>",
    );
  });

  it("keeps the formatting the editor produces", () => {
    const html =
      "<h2>T</h2><p><strong>b</strong> <em>i</em> <u>u</u></p><ul><li>a</li></ul><ol><li>b</li></ol>";
    expect(sanitizeHtml(html)).toBe(html);
  });

  it("strips event handler attributes", () => {
    const out = sanitizeHtml('<p onclick="alert(1)">hi</p>');
    expect(out).toBe("<p>hi</p>");
  });

  it("rejects javascript: links", () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).not.toContain(
      "javascript:",
    );
  });
});
