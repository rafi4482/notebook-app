import Link from "next/link";
import { headers } from "next/headers";
import { db } from "../db";
import { notes } from "../db/schema";
import { eq } from "drizzle-orm";
import { deleteNote } from "../server/actions/notes";
import { auth } from "@/src/utils/auth";
import { Button, Text, Title } from "../components/ui/client-component";
import { PiPencilSimple, PiTrash, PiPlus } from "react-icons/pi";

export default async function Home() {
  const hdrs = await headers();

  const session = await auth.api.getSession({
    headers: Object.fromEntries(hdrs.entries()),
  });

  if (!session) {
    return (
      <main className="max-w-xl mx-auto p-6 space-y-6">
        <Title as="h1" className="text-2xl">
          Notebook
        </Title>
        <Text className="text-gray-600">
          Please sign in with GitHub to view your notes.
        </Text>
      </main>
    );
  }

  // Get or create user
  const { getOrCreateUser } = await import("../server/actions/users");
  const user = await getOrCreateUser();

  // Get only notes for this user
  const allNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, user.id));

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <Title as="h1" className="text-2xl">
        Notebook
      </Title>

      <Link href="/new">
        <Button className="gap-2">
          <PiPlus className="h-4 w-4" />
          New Note
        </Button>
      </Link>

      <div className="space-y-4">
        {allNotes.map((note) => (
          <div
            key={note.id}
            className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <Title as="h2" className="text-lg mb-2">
              {note.title}
            </Title>
            <Text className="text-gray-600 mb-4">{note.content}</Text>

            <div className="flex gap-3">
              <Link href={`/notes/${note.id}/edit`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <PiPencilSimple className="h-4 w-4" />
                  Edit
                </Button>
              </Link>

              <form
                action={async () => {
                  "use server";
                  await deleteNote(note.id);
                }}
              >
                <Button
                  type="submit"
                  variant="outline"
                  color="danger"
                  size="sm"
                  className="gap-2"
                >
                  <PiTrash className="h-4 w-4" />
                  Delete
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}