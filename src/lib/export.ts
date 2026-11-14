import TurndownService from "turndown";

const turndown = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

// Markdown has no underline syntax, so keep it as inline HTML.
turndown.addRule("underline", {
  filter: ["u"],
  replacement: (content) => `<u>${content}</u>`,
});

export function htmlToMarkdown(html: string): string {
  return turndown.turndown(html).trim() + "\n";
}

/** Safe download filename: strips characters that are invalid on common filesystems. */
export function toExportFilename(title: string): string {
  const base = title
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
  return `${base || "document"}.md`;
}
