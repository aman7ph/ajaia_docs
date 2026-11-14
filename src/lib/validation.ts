import { z } from "zod";

const title = z.string().trim().min(1, "Title is required").max(200);

export const createDocumentSchema = z.object({
  title: title.optional(),
});

export const updateDocumentSchema = z
  .object({
    title: title.optional(),
    content: z.string().max(500_000).optional(),
  })
  .refine((d) => d.title !== undefined || d.content !== undefined, {
    message: "Nothing to update",
  });
