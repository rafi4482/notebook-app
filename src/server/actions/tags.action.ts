"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "./users.action";
import { removeTagFromNote } from "../services/tags.service";

export type RemoveTagResult =
  | { success: true; tags: string[] }
  | { success: false; error: string };

/**
 * Remove a tag from a note
 */
export async function removeTag(
  noteId: number,
  tag: string
): Promise<RemoveTagResult> {
  if (!noteId || !tag) {
    return { success: false, error: "Invalid payload" };
  }

  try {
    const user = await getOrCreateUser();
    const result = await removeTagFromNote(noteId, tag.trim(), user.id);

    if (result.success) {
      revalidatePath("/");
    }

    return result;
  } catch (error) {
    console.error("Error removing tag:", error);
    return { success: false, error: "Server error" };
  }
}
