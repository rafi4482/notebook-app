import Link from "next/link";
import { headers } from "next/headers";
import { DeleteNoteButton } from "../components/DeleteNoteButton";
import { getUserNotesWithFilters, getUserTagCounts } from "../server/actions/notes.action";
import { auth } from "@/src/utils/auth";
import { Button, Text, Title } from "../components/ui/client-component";
import { sanitizeContent } from "../lib/sanitize";
import { ImageGallery } from "../components/ImageGallery";
import TagList from "../components/TagList";
import { SearchInput } from "../components/SearchInput";
import { Pagination } from "../components/Pagination";
import { TagFilter } from "../components/TagFilter";
import { ActiveFilters } from "../components/ActiveFilters";
import { PiPencilSimple, PiPlus } from "react-icons/pi";

interface PageProps {
  searchParams?: Promise<{
    page?: string;
    search?: string;
    tag?: string;
  }>;
}

export default async function Home({ searchParams }: PageProps) {
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

  // Parse URL parameters
  const params = await searchParams;
  const page = params?.page ? parseInt(params.page, 10) : 1;
  const search = params?.search || null;
  const tag = params?.tag || null;

  // Fetch paginated notes and tag counts in parallel
  const [notesResult, tagCounts] = await Promise.all([
    getUserNotesWithFilters({ page, search, tag }),
    getUserTagCounts(),
  ]);

  const { notes, pagination, filters } = notesResult;

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <Title as="h1" className="text-2xl">
        Notebook
      </Title>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/new">
          <Button className="gap-2">
            <PiPlus className="h-4 w-4" />
            New Note
          </Button>
        </Link>
        <div className="flex-1">
          <SearchInput defaultValue={filters.search || ""} />
        </div>
      </div>

      {/* Tag filter buttons */}
      <TagFilter tags={tagCounts} activeTag={filters.tag} />

      {/* Active filters display */}
      <ActiveFilters
        search={filters.search}
        tag={filters.tag}
        totalCount={pagination.totalCount}
      />

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filters.search || filters.tag ? (
              <p>No notes found matching your filters.</p>
            ) : (
              <p>No notes yet. Create your first note!</p>
            )}
          </div>
        ) : (
          notes.map((note) => (
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
                } catch {
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

                <DeleteNoteButton noteId={note.id} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
      />
    </main>
  );
}
