"use server";

import { db } from "../db";
import { notes } from "../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createNote(formData: FormData) {
  const title = formData.get("title");
  const content = formData.get("content");

  if (!title || !content) return;

  await db.insert(notes).values({
    title: String(title),
    content: String(content),
  });

  revalidatePath("/");
}

export async function deleteNote(id: number) {
  await db.delete(notes).where(eq(notes.id, id));
  revalidatePath("/");
}
