import { db } from "../../db";
import { notes } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getNoteById } from "./notes.service";

/**
 * Parse tags from JSON string with error handling
 */
export function parseTagsFromJson(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return parsed.map((x) => String(x).trim()).filter(Boolean).slice(0, 20);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Remove a tag from a note with ownership verification
 * Returns the updated tags array or null if not found/not authorized
 */
export async function removeTagFromNote(
  noteId: number,
  tag: string,
  userId: number
): Promise<{ success: true; tags: string[] } | { success: false; error: string }> {
  const note = await getNoteById(noteId);

  if (!note || note.userId !== userId) {
    return { success: false, error: "Not found or no permission" };
  }

  const currentTags = parseTagsFromJson(note.tags);
  const updatedTags = currentTags.filter((t) => t !== tag);

  await db
    .update(notes)
    .set({ tags: JSON.stringify(updatedTags) })
    .where(eq(notes.id, noteId));

  return { success: true, tags: updatedTags };
}
