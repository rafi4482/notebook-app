import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { notes } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "../../../../server/actions/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const noteId = Number(body.noteId);
    const tag = String(body.tag || "").trim();

    if (!noteId || !tag) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const user = await getOrCreateUser();

    const note = await db
      .select()
      .from(notes)
      .where(eq(notes.id, noteId))
      .then((res) => res[0]);

    if (!note || note.userId !== user.id) {
      return NextResponse.json({ error: "Not found or no permission" }, { status: 404 });
    }

    let tags: string[] = [];
    try {
      tags = note.tags ? JSON.parse(note.tags) : [];
    } catch (err) {
      tags = [];
    }

    const updated = tags.filter((t: string) => t !== tag);

    await db.update(notes).set({ tags: JSON.stringify(updated) }).where(eq(notes.id, noteId));

    revalidatePath("/");

    return NextResponse.json({ ok: true, tags: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
