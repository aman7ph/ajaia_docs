import { describe, it, expect } from "vitest";
import {
  convertFileToHtml,
  getExtension,
  markdownToHtml,
  textToHtml,
  titleFromFilename,
  ImportError,
} from "./import";

describe("textToHtml", () => {
  it("turns blank lines into paragraphs and single newlines into line breaks", () => {
    expect(textToHtml("one\ntwo\n\nthree")).toBe(
      "<p>one<br>two</p><p>three</p>",
    );
  });
  it("escapes HTML so uploaded text is never treated as markup", () => {
    expect(textToHtml("<script>x</script>")).toBe(
      "<p>&lt;script&gt;x&lt;/script&gt;</p>",
    );
  });
  it("handles Windows line endings and empty input", () => {
    expect(textToHtml("a\r\n\r\nb")).toBe("<p>a</p><p>b</p>");
    expect(textToHtml("   ")).toBe("");
  });
});

describe("markdownToHtml", () => {
  it("converts headings, bold and lists", () => {
    const html = markdownToHtml("# Title\n\n**bold** text\n\n- a\n- b");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<li>a</li>");
  });
});

describe("filename helpers", () => {
  it("extracts lowercase extensions", () => {
    expect(getExtension("Notes.MD")).toBe(".md");
    expect(getExtension("noext")).toBe("");
  });
  it("derives a title from the filename", () => {
    expect(titleFromFilename("Q4 plan.docx")).toBe("Q4 plan");
    expect(titleFromFilename(".md")).toBe(".md");
  });
});

describe("convertFileToHtml", () => {
  it("rejects unsupported file types", async () => {
    await expect(
      convertFileToHtml("photo.png", Buffer.from("x")),
    ).rejects.toBeInstanceOf(ImportError);
  });
  it("rejects a corrupted .docx", async () => {
    await expect(
      convertFileToHtml("bad.docx", Buffer.from("not a zip")),
    ).rejects.toBeInstanceOf(ImportError);
  });
  it("converts a .txt buffer", async () => {
    expect(await convertFileToHtml("a.txt", Buffer.from("hi"))).toBe(
      "<p>hi</p>",
    );
  });
});
