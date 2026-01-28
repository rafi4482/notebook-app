"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrCreateUser } from "./users.action";
import {
  validateAndSanitizeNote,
  createNoteRecord,
  updateNoteRecord,
  deleteNoteRecord,
  getNotesByUserId,
} from "../services/notes.service";
import { parseTagsFromJson } from "../services/tags.service";

/**
 * GET all notes for the current user
 */
export async function getUserNotes() {
  const user = await getOrCreateUser();
  return getNotesByUserId(user.id);
}

/**
 * CREATE
 */
export async function createNote(
  prevState: { errors?: { title?: string[]; content?: string[] } } | null,
  formData: FormData
) {
  const title = formData.get("title");
  const content = formData.get("content");
  const imagesJson = (formData.get("images") as string) || "[]";
  const tagsJson = (formData.get("tags") as string) || "[]";

  // Validate and sanitize
  const validation = validateAndSanitizeNote(title, content, tagsJson);
  if (!validation.success) {
    return { errors: validation.errors };
  }

  const { sanitizedTitle, sanitizedContent, parsedTags } = validation.data;

  // Get or create user
  const user = await getOrCreateUser();

  await createNoteRecord({
    title: sanitizedTitle,
    content: sanitizedContent,
    userId: user.id,
    images: imagesJson,
    tags: JSON.stringify(parsedTags),
  });

  revalidatePath("/");
  redirect("/");
}

/**
 * UPDATE
 */
export async function updateNote(
  id: number,
  prevState: { errors?: { title?: string[]; content?: string[]; _form?: string[] } } | null,
  formData: FormData
) {
  const title = formData.get("title");
  const content = formData.get("content");
  const imagesJson = (formData.get("images") as string) || "[]";
  const tagsJson = (formData.get("tags") as string) || "[]";

  // Validate and sanitize
  const validation = validateAndSanitizeNote(title, content, tagsJson);
  if (!validation.success) {
    return { errors: validation.errors };
  }

  const { sanitizedTitle, sanitizedContent, parsedTags } = validation.data;

  // Get user
  const user = await getOrCreateUser();

  // Update with ownership check
  const result = await updateNoteRecord(
    id,
    {
      title: sanitizedTitle,
      content: sanitizedContent,
      images: imagesJson,
      tags: JSON.stringify(parsedTags),
    },
    user.id
  );

  if (!result.success) {
    return { errors: { _form: [result.error] } };
  }

  revalidatePath("/");
  redirect("/");
}

/**
 * UPDATE NOTE WITH IMAGES - Wrapper for useActionState
 */
export async function updateNoteWithImages(
  id: number,
  prevState: any,
  formData: FormData
) {
  return updateNote(id, prevState, formData);
}

/**
 * DELETE
 */
export async function deleteNote(id: number) {
  const user = await getOrCreateUser();

  const result = await deleteNoteRecord(id, user.id);

  if (!result.success) {
    throw new Error(result.error);
  }

  revalidatePath("/");
}
