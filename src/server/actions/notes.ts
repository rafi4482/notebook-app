"use server";

import { db } from "../../db";
import { notes } from "../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { noteSchema } from "../../lib/validations";
import { getOrCreateUser } from "./users";
import { sanitizeContent } from "../../lib/sanitize";

/**
 * CREATE
 */
export async function createNote(
  prevState: { errors?: { title?: string[]; content?: string[] } } | null,
  formData: FormData
) {
  const title = formData.get("title");
  const content = formData.get("content");
  const imagesJson = formData.get("images") as string || "[]";

  // Validate with zod
  const result = noteSchema.safeParse({
    title,
    content,
  });

  if (!result.success) {
    // Return validation errors
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  // Sanitize user-provided HTML so only allowed formatting remains
  const sanitizedContent = sanitizeContent(result.data.content);
  const sanitizedTitle = sanitizeContent(result.data.title);

  // Get or create user
  const user = await getOrCreateUser();

  await db.insert(notes).values({
    title: sanitizedTitle,
    content: sanitizedContent,
    userId: user.id,
    images: imagesJson,
  });

  revalidatePath("/");
  redirect("/");
}

/**
 * UPDATE
 */
export async function updateNote(
  id: number,
  prevState: { errors?: { title?: string[]; content?: string[] } } | null,
  formData: FormData
) {
  const title = formData.get("title");
  const content = formData.get("content");
  const imagesJson = formData.get("images") as string || "[]";

  // Validate with zod
  const result = noteSchema.safeParse({
    title,
    content,
  });

  if (!result.success) {
    // Return validation errors
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  // Sanitize user-provided HTML so only allowed formatting remains
  const sanitizedContent = sanitizeContent(result.data.content);
  const sanitizedTitle = sanitizeContent(result.data.title);

  // Get user and verify ownership
  const user = await getOrCreateUser();
  
  // Verify the note belongs to the user
  const note = await db
    .select()
    .from(notes)
    .where(eq(notes.id, id))
    .then((res) => res[0]);

  if (!note || note.userId !== user.id) {
    return {
      errors: { _form: ["Note not found or you don't have permission to edit it"] },
    };
  }

  await db
    .update(notes)
    .set({
      title: sanitizedTitle,
      content: sanitizedContent,
      images: imagesJson,
    })
    .where(eq(notes.id, id));

  revalidatePath("/");
  redirect("/");
}

/**
 * DELETE
 */
export async function deleteNote(id: number) {
  // Get user and verify ownership
  const user = await getOrCreateUser();
  
  // Verify the note belongs to the user
  const note = await db
    .select()
    .from(notes)
    .where(eq(notes.id, id))
    .then((res) => res[0]);

  if (!note || note.userId !== user.id) {
    throw new Error("Note not found or you don't have permission to delete it");
  }

  // Delete associated images from R2
  if (note.images) {
    try {
      const images = JSON.parse(note.images);
      if (Array.isArray(images)) {
        const { deleteImageFromR2 } = await import("../../lib/r2");
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
  revalidatePath("/");
}
