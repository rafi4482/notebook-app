import Link from "next/link";
import { headers } from "next/headers";
import { db } from "../db";
import { notes } from "../db/schema";
import { eq } from "drizzle-orm";
import { deleteNote } from "../server/actions/notes";
import { auth } from "@/src/utils/auth";
import { Button, Text, Title } from "../components/ui/client-component";
import { sanitizeContent } from "../lib/sanitize";
import { ImageGallery } from "../components/ImageGallery";
import TagList from "../components/TagList";
import { PiPencilSimple, PiTrash, PiPlus } from "react-icons/pi";

export default async function Home({ searchParams }: { searchParams?: { tag?: string } }) {
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

  const sp = await (searchParams as any);
  const activeTag = sp?.tag;
  const displayedNotes = activeTag
    ? allNotes.filter((note) => {
        try {
          const t = note.tags ? JSON.parse(note.tags) : [];
          return Array.isArray(t) && t.includes(activeTag);
        } catch (err) {
          return false;
        }
      })
    : allNotes;

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

      {/* Tag filter buttons */}
      {(() => {
        const counts: Record<string, number> = {};
        for (const note of allNotes) {
          try {
            const t = note.tags ? JSON.parse(note.tags) : [];
            if (Array.isArray(t)) {
              for (const tag of t) {
                counts[tag] = (counts[tag] || 0) + 1;
              }
            }
          } catch (err) {
            // ignore
          }
        }

        const uniqueTags = Object.keys(counts);
        if (uniqueTags.length === 0) return null;

        return (
          <div className="flex flex-wrap gap-2 items-center">
            <Link href="/" className="text-sm">
              <button className={`px-3 py-1 rounded-md text-sm ${!activeTag ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>All</button>
            </Link>
            {uniqueTags.map((tag) => (
              <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`} className="text-sm">
                <button
                  className={`px-3 py-1 rounded-md text-sm ${activeTag === tag ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                  {tag} <span className="ml-2 text-xs text-gray-600">{counts[tag]}</span>
                </button>
              </Link>
            ))}
          </div>
        );
      })()}

      <div className="space-y-4">
        {activeTag && (
          <div className="flex items-center justify-between bg-yellow-50 border border-yellow-100 rounded-md p-3 mb-2">
            <div className="text-sm text-yellow-800">Filtered by tag: <strong className="ml-1">{activeTag}</strong></div>
            <div>
              <Link href="/" className="text-sm">
                <Button variant="outline" size="sm">Clear Filter</Button>
              </Link>
            </div>
          </div>
        )}
        {displayedNotes.map((note) => (
          <div
            key={note.id}
            className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <Title as="h2" className="text-lg mb-2" dangerouslySetInnerHTML={{ __html: sanitizeContent(note.title) }} />
            
            {/* Display image gallery if images exist */}
            <ImageGallery imagesJson={note.images} />
            
            {/* Render sanitized HTML so formatting (bold/italic) shows up */}
            <div className="text-gray-600 mb-4 prose" dangerouslySetInnerHTML={{ __html: sanitizeContent(note.content) }} />

            {note.tags && (() => {
              try {
                const t = JSON.parse(note.tags);
                if (Array.isArray(t) && t.length > 0) {
                  return <TagList noteId={note.id} initialTags={t} />;
                }
              } catch (err) {
                return null;
              }
              return null;
            })()}

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