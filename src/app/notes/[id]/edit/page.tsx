import Link from "next/link";
import { db } from "../../../../db";
import { notes } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { updateNote } from "../../../../server/actions/notes";
import { notFound } from "next/navigation";
import { Button, Title, Input, Textarea } from "../../../../components/ui/client-component";
import { PiArrowLeft } from "react-icons/pi";

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
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
        <PiArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <Title as="h1" className="text-xl">
        Edit Note
      </Title>

      <form
        action={updateNote.bind(null, note.id)}
        className="space-y-4"
      >
        <div>
          <Input
            name="title"
            defaultValue={note.title}
            placeholder="Note title"
            required
            className="w-full"
          />
        </div>

        <div>
          <Textarea
            name="content"
            defaultValue={note.content}
            placeholder="Note content"
            rows={5}
            required
            className="w-full"
          />
        </div>

        <Button type="submit">
          Update Note
        </Button>
      </form>
    </main>
  );
}