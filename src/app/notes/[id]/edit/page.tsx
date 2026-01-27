import Link from "next/link";
import { db } from "../../../../db";
import { notes } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button, Title, Input, Textarea } from "../../../../components/ui/client-component";
import { PiArrowLeft } from "react-icons/pi";
import { EditNoteForm } from "../../../../components/EditNoteForm";
import { getOrCreateUser } from "../../../../server/actions/users.action";

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

  // Get or create user
  const user = await getOrCreateUser();

  // Get note and verify it belongs to the user
  const note = await db
    .select()
    .from(notes)
    .where(eq(notes.id, noteId))
    .then((res) => res[0]);

  if (!note || note.userId !== user.id) {
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

      <EditNoteForm note={note} />
    </main>
  );
}
