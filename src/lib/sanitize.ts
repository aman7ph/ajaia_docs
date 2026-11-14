import sanitize from "sanitize-html";

const OPTIONS: sanitize.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "hr",
    "a",
  ],
  allowedAttributes: { a: ["href"], ol: ["start"] },
  allowedSchemes: ["http", "https", "mailto"],
};

export function sanitizeHtml(html: string): string {
  return sanitize(html, OPTIONS);
}
