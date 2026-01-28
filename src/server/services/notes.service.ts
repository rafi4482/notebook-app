import { db } from "../../db";
import { notes } from "../../db/schema";
import { eq, and, or, ilike, sql, desc } from "drizzle-orm";
import { noteSchema } from "../../lib/validations";
import { sanitizeContent } from "../../lib/sanitize";
import { parseTagsFromJson } from "./tags.service";
import { deleteImageFromR2 } from "../../lib/r2";

const NOTES_PER_PAGE = 5;

export interface PaginatedNotesResult {
  notes: Array<typeof notes.$inferSelect>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    search: string | null;
    tag: string | null;
  };
}

export interface NotesFilterParams {
  page?: number;
  search?: string | null;
  tag?: string | null;
}

export interface TagCount {
  tag: string;
  count: number;
}

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

/**
 * Get paginated notes for a user with optional search and tag filtering
 */
export async function getNotesByUserIdWithFilters(
  userId: number,
  params: NotesFilterParams
): Promise<PaginatedNotesResult> {
  const page = Math.max(1, params.page || 1);
  const search = params.search?.trim() || null;
  const tag = params.tag?.trim() || null;
  const offset = (page - 1) * NOTES_PER_PAGE;

  try {
    console.log(`[getNotesByUserIdWithFilters] Fetching notes for user ${userId} with filters:`, { page, search, tag });

    // Build where conditions
    const conditions = [eq(notes.userId, userId)];

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          ilike(notes.title, searchPattern),
          ilike(notes.content, searchPattern)
        )!
      );
    }

    if (tag) {
      // Tags are stored as JSON text like '["tag1","tag2"]'
      // Use LIKE to check if the tag exists in the array
      const tagPattern = `%"${tag}"%`;
      conditions.push(ilike(notes.tags, tagPattern));
    }

    const whereClause = and(...conditions);

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notes)
      .where(whereClause);

    const totalCount = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / NOTES_PER_PAGE);

    // Get paginated notes
    const result = await db
      .select()
      .from(notes)
      .where(whereClause)
      .orderBy(desc(notes.createdAt))
      .limit(NOTES_PER_PAGE)
      .offset(offset);

    console.log(`[getNotesByUserIdWithFilters] Found ${result.length} notes (total: ${totalCount})`);

    return {
      notes: result,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        search,
        tag,
      },
    };
  } catch (error) {
    console.error(`[getNotesByUserIdWithFilters] Failed to fetch notes for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get all unique tags with counts for a user
 */
export async function getUserTags(userId: number): Promise<TagCount[]> {
  try {
    console.log(`[getUserTags] Fetching tags for user ${userId}`);

    const userNotes = await db
      .select({ tags: notes.tags })
      .from(notes)
      .where(eq(notes.userId, userId));

    // Aggregate tag counts in memory since tags are stored as JSON text
    const tagCounts: Record<string, number> = {};

    for (const note of userNotes) {
      if (!note.tags) continue;
      try {
        const tags = JSON.parse(note.tags);
        if (Array.isArray(tags)) {
          for (const tag of tags) {
            if (typeof tag === "string") {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }
          }
        }
      } catch {
        // Ignore malformed JSON
      }
    }

    const result = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    console.log(`[getUserTags] Found ${result.length} unique tags for user ${userId}`);
    return result;
  } catch (error) {
    console.error(`[getUserTags] Failed to fetch tags for user ${userId}:`, error);
    throw error;
  }
}
