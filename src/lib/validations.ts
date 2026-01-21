import { z } from "zod";

export const noteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(10000, "Content must be less than 10000 characters"),
  tags: z.array(z.string().min(1).max(50)).max(20).optional(),
});

export type NoteInput = z.infer<typeof noteSchema>;

