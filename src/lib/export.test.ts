import { describe, it, expect } from "vitest";
import { htmlToMarkdown, toExportFilename } from "./export";

describe("htmlToMarkdown", () => {
  it("converts headings, bold and italic", () => {
    const md = htmlToMarkdown(
      "<h1>Title</h1><p><strong>bold</strong> and <em>it</em></p>",
    );
    expect(md).toContain("# Title");
    expect(md).toContain("**bold**");
    expect(md).toContain("_it_");
  });

  it("converts bulleted and numbered lists", () => {
    const md = htmlToMarkdown(
      "<ul><li>a</li><li>b</li></ul><ol><li>one</li><li>two</li></ol>",
    );
    expect(md).toMatch(/^-\s+a$/m);
    expect(md).toMatch(/^1\.\s+one$/m);
    expect(md).toMatch(/^2\.\s+two$/m);
  });

  it("keeps underline as inline HTML since Markdown has no syntax for it", () => {
    expect(htmlToMarkdown("<p><u>under</u></p>")).toContain("<u>under</u>");
  });

  it("returns just a newline for an empty document", () => {
    expect(htmlToMarkdown("")).toBe("\n");
  });
});

describe("toExportFilename", () => {
  it("appends .md and strips invalid characters", () => {
    expect(toExportFilename("Q4: plan/draft?")).toBe("Q4 plandraft.md");
  });
  it("falls back when the title is empty after cleaning", () => {
    expect(toExportFilename("???")).toBe("document.md");
  });
});
