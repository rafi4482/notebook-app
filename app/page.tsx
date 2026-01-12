import Link from "next/link";
import { headers } from "next/headers";
import { db } from "../db";
import { notes } from "../db/schema";
import { deleteNote } from "../actions/notes";
import { auth } from "@/lib/auth";

export default async function Home() {
  // ✅ headers() is ASYNC in Next 15/16
  const hdrs = await headers();

  // ✅ Correct Better Auth session retrieval
  const session = await auth.api.getSession({
    headers: Object.fromEntries(hdrs.entries()),
  });

  if (!session) {
    return (
      <main className="max-w-xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Notebook</h1>
        <p className="text-gray-600">
          Please sign in with GitHub to view your notes.
        </p>
      </main>
    );
  }

  const allNotes = await db.select().from(notes);

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Notebook</h1>

      <Link
        href="/new"
        className="inline-block px-4 py-2 bg-black text-white rounded"
      >
        New Note
      </Link>

      <ul className="space-y-4">
        {allNotes.map((note) => (
          <li key={note.id} className="border p-4 rounded bg-white">
            <h2 className="font-semibold">{note.title}</h2>
            <p className="text-sm text-gray-600">{note.content}</p>

            <div className="flex gap-4 mt-3">
              <Link
                href={`/notes/${note.id}/edit`}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit
              </Link>

              <form
                action={async () => {
                  "use server";
                  await deleteNote(note.id);
                }}
              >
                <button className="text-sm text-red-500">
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
