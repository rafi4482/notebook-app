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
  try {
    const result = await db
      .select()
      .from(notes)
      .where(eq(notes.id, id));
    return result[0];
  } catch (error) {
    console.error(`[getNoteById] Failed to fetch note with id ${id}:`, error);
    throw error;
  }
}

/**
 * Get all notes for a user
 */
export async function getNotesByUserId(userId: number) {
  try {
    console.log(`[getNotesByUserId] Fetching notes for user ${userId}`);
    const result = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId));
    console.log(`[getNotesByUserId] Found ${result.length} notes for user ${userId}`);
    return result;
  } catch (error) {
    console.error(`[getNotesByUserId] Failed to fetch notes for user ${userId}:`, error);
    throw error;
  }
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
  try {
    console.log(`[createNoteRecord] Creating note for user ${data.userId}`);
    const result = await db.insert(notes).values(data);
    console.log(`[createNoteRecord] Note created successfully for user ${data.userId}`);
    return result;
  } catch (error) {
    console.error(`[createNoteRecord] Failed to create note for user ${data.userId}:`, error);
    throw error;
  }
}

/**
 * Update a note record with ownership check and R2 cleanup for removed images
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
  try {
    console.log(`[updateNoteRecord] Updating note ${id} for user ${userId}`);

    const note = await getNoteById(id);

    if (!note || note.userId !== userId) {
      console.warn(`[updateNoteRecord] Note ${id} not found or unauthorized access by user ${userId}`);
      return {
        success: false,
        error: "Note not found or you don't have permission to edit it",
      };
    }

    // Find and delete removed images from R2
    const oldImages: string[] = note.images ? JSON.parse(note.images) : [];
    const newImages: string[] = data.images ? JSON.parse(data.images) : [];
    const removedImages = oldImages.filter((img) => !newImages.includes(img));

    if (removedImages.length > 0) {
      console.log(`[updateNoteRecord] Deleting ${removedImages.length} removed images from R2`);
    }

    for (const imageUrl of removedImages) {
      const fileName = imageUrl.split("/").slice(-2).join("/");
      await deleteImageFromR2(fileName).catch((err) => {
        console.error(`[updateNoteRecord] Failed to delete image ${fileName} from R2:`, err);
      });
    }

    await db
      .update(notes)
      .set(data)
      .where(eq(notes.id, id));

    console.log(`[updateNoteRecord] Note ${id} updated successfully`);
    return { success: true };
  } catch (error) {
    console.error(`[updateNoteRecord] Failed to update note ${id}:`, error);
    return {
      success: false,
      error: "Failed to update note",
    };
  }
}

/**
 * Delete a note record with ownership check and R2 cleanup
 */
export async function deleteNoteRecord(
  id: number,
  userId: number
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    console.log(`[deleteNoteRecord] Deleting note ${id} for user ${userId}`);

    const note = await getNoteById(id);

    if (!note || note.userId !== userId) {
      console.warn(`[deleteNoteRecord] Note ${id} not found or unauthorized access by user ${userId}`);
      return {
        success: false,
        error: "Note not found or you don't have permission to delete it",
      };
    }

    // Delete associated images from R2
    if (note.images) {
      try {
        const images = JSON.parse(note.images);
        if (Array.isArray(images) && images.length > 0) {
          console.log(`[deleteNoteRecord] Deleting ${images.length} images from R2`);
          for (const imageUrl of images) {
            const fileName = imageUrl.split("/").slice(-2).join("/");
            await deleteImageFromR2(fileName).catch((err) => {
              console.error(`[deleteNoteRecord] Failed to delete image ${fileName} from R2:`, err);
            });
          }
        }
      } catch (err) {
        console.error(`[deleteNoteRecord] Error parsing images for note ${id}:`, err);
      }
    }

    await db.delete(notes).where(eq(notes.id, id));

    console.log(`[deleteNoteRecord] Note ${id} deleted successfully`);
    return { success: true };
  } catch (error) {
    console.error(`[deleteNoteRecord] Failed to delete note ${id}:`, error);
    return {
      success: false,
      error: "Failed to delete note",
    };
  }
}
