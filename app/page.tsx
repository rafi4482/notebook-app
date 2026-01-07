import { db } from "../db";
import { notes } from "../db/schema";
import { deleteNote } from "../actions/notes";


export default async function Home() {
  const allNotes = await db.select().from(notes);

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Notebook</h1>

      <a
        href="/new"
        className="inline-block px-4 py-2 bg-black text-white rounded"
      >
        New Note
      </a>

      <ul className="space-y-4">
        {allNotes.map((note) => (
          <li key={note.id} className="border p-4 rounded bg-white">
            <h2 className="font-semibold">{note.title}</h2>
            <p className="text-sm text-gray-600">{note.content}</p>

            <form
              action={async () => {
                "use server";
                await deleteNote(note.id);
              }}
            >
              <button className="text-red-500 text-sm mt-2">
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
