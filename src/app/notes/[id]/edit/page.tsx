import Link from "next/link";
import { db } from "../../../../db";
import { notes } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { updateNote } from "../../../../server/actions/notes";
import { notFound } from "next/navigation";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const noteId = Number(id);

  // Guard against invalid IDs
  if (Number.isNaN(noteId)) {
    notFound();
  }

  const note = await db
    .select()
    .from(notes)
    .where(eq(notes.id, noteId))
    .then((res) => res[0]);

  if (!note) {
    notFound();
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <Link
        href="/"
        className="text-sm text-gray-600 hover:underline"
      >
        ← Back to Home
      </Link>

      <h1 className="text-xl font-bold">Edit Note</h1>

      <form
        action={updateNote.bind(null, note.id)}
        className="space-y-4"
      >
        <input
          name="title"
          defaultValue={note.title}
          className="w-full border p-2 rounded"
          required
        />

        <textarea
          name="content"
          defaultValue={note.content}
          className="w-full border p-2 rounded"
          rows={5}
          required
        />

        <button className="px-4 py-2 bg-black text-white rounded">
          Update
        </button>
      </form>
    </main>
  );
}
