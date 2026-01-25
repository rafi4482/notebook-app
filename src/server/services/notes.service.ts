import { db } from "../../db";
import { notes } from "../../db/schema";
import { eq } from "drizzle-orm";
import { noteSchema } from "../../lib/validations";
import { sanitizeContent } from "../../lib/sanitize";
import { parseTagsFromJson } from "./tags.service";
import { deleteImageFromR2 } from "../../lib/r2";

export type NoteValidationResult =
  | {
      success: true;
      data: {
        sanitizedTitle: string;
        sanitizedContent: string;
        parsedTags: string[];
      };
    }
  | { success: false; errors: Record<string, string[]> };

/**
 * Validate and sanitize note input
 */
export function validateAndSanitizeNote(
  title: unknown,
  content: unknown,
  tagsJson: string
): NoteValidationResult {
  const parsedTags = parseTagsFromJson(tagsJson);

  const result = noteSchema.safeParse({
    title,
    content,
    tags: parsedTags,
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  return {
    success: true,
    data: {
      sanitizedTitle: sanitizeContent(result.data.title),
      sanitizedContent: sanitizeContent(result.data.content),
      parsedTags,
    },
  };
}

/**
 * Get a note by ID
 */
export async function getNoteById(id: number) {
  return db
    .select()
    .from(notes)
    .where(eq(notes.id, id))
    .then((res) => res[0]);
}

/**
 * Create a new note record
 */
export async function createNoteRecord(data: {
  title: string;
  content: string;
  userId: number;
  images: string;
  tags: string;
}) {
  return db.insert(notes).values(data);
}

/**
 * Update a note record with ownership check
 */
export async function updateNoteRecord(
  id: number,
  data: {
    title: string;
    content: string;
    images: string;
    tags: string;
  },
  userId: number
): Promise<{ success: true } | { success: false; error: string }> {
  const note = await getNoteById(id);

  if (!note || note.userId !== userId) {
    return {
      success: false,
      error: "Note not found or you don't have permission to edit it",
    };
  }

  await db
    .update(notes)
    .set(data)
    .where(eq(notes.id, id));

  return { success: true };
}

/**
 * Delete a note record with ownership check and R2 cleanup
 */
export async function deleteNoteRecord(
  id: number,
  userId: number
): Promise<{ success: true } | { success: false; error: string }> {
  const note = await getNoteById(id);

  if (!note || note.userId !== userId) {
    return {
      success: false,
      error: "Note not found or you don't have permission to delete it",
    };
  }

  // Delete associated images from R2
  if (note.images) {
    try {
      const images = JSON.parse(note.images);
      if (Array.isArray(images)) {
        for (const imageUrl of images) {
          // Extract file name from URL
          // URL format: https://domain.com/notes-images/timestamp-random.jpg
          const fileName = imageUrl.split("/").slice(-2).join("/");
          await deleteImageFromR2(fileName).catch((err) => {
            console.error("Failed to delete image from R2:", err);
            // Don't fail the entire delete operation if image deletion fails
          });
        }
      }
    } catch (err) {
      console.error("Error parsing images for deletion:", err);
    }
  }

  await db.delete(notes).where(eq(notes.id, id));

  return { success: true };
}
