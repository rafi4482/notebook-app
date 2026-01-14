"use server";

import { db } from "../../db";
import { notes } from "../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { noteSchema } from "../../lib/validations";

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

  await db.insert(notes).values({
    title: result.data.title,
    content: result.data.content,
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
  await db.delete(notes).where(eq(notes.id, id));
  revalidatePath("/");
}
