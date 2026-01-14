"use server";

import { db } from "../../db";
import { notes } from "../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { noteSchema } from "../../lib/validations";
import { getOrCreateUser } from "./users";

/**
 * CREATE
 */
export async function createNote(
  prevState: { errors?: { title?: string[]; content?: string[] } } | null,
  formData: FormData
) {
  const title = formData.get("title");
  const content = formData.get("content");

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

  // Get or create user
  const user = await getOrCreateUser();

  await db.insert(notes).values({
    title: result.data.title,
    content: result.data.content,
    userId: user.id,
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
      title: result.data.title,
      content: result.data.content,
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

  await db.delete(notes).where(eq(notes.id, id));
  revalidatePath("/");
}
