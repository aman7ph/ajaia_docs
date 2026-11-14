import { marked } from "marked";
import mammoth from "mammoth";

export const SUPPORTED_EXTENSIONS = [".txt", ".md", ".docx"] as const;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

export class ImportError extends Error {}

export function getExtension(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i === -1 ? "" : filename.slice(i).toLowerCase();
}

export function titleFromFilename(filename: string): string {
  const i = filename.lastIndexOf(".");
  const base = (i > 0 ? filename.slice(0, i) : filename).trim();
  return (base || "Imported document").slice(0, 200);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Blank line = new paragraph, single newline = line break. */
export function textToHtml(text: string): string {
  const normalized = text.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return "";
  return normalized
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function markdownToHtml(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

/** Converts an uploaded file to HTML. The caller must sanitize the result before storing it. */
export async function convertFileToHtml(
  filename: string,
  data: Buffer,
): Promise<string> {
  switch (getExtension(filename)) {
    case ".txt":
      return textToHtml(data.toString("utf-8"));
    case ".md":
      return markdownToHtml(data.toString("utf-8"));
    case ".docx":
      try {
        const result = await mammoth.convertToHtml({ buffer: data });
        return result.value;
      } catch {
        throw new ImportError(
          "Could not read this .docx file. It may be corrupted.",
        );
      }
    default:
      throw new ImportError(
        `Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(", ")}`,
      );
  }
}
