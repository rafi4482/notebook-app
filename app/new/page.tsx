import Link from "next/link";
import { createNote } from "../../actions/notes";

export default function NewNotePage() {
  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <Link
        href="/"
        className="text-sm text-gray-600 hover:underline"
      >
        ← Back to Home
      </Link>

      <h1 className="text-xl font-bold">New Note</h1>

      <form action={createNote} className="space-y-4">
        <input
          name="title"
          placeholder="Title"
          className="w-full border p-2 rounded"
          required
        />

        <textarea
          name="content"
          placeholder="Content"
          className="w-full border p-2 rounded"
          rows={5}
          required
        />

        <button className="px-4 py-2 bg-black text-white rounded">
          Save
        </button>
      </form>
    </main>
  );
}
