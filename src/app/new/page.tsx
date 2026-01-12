import Link from "next/link";
import { createNote } from "../../server/actions/notes";
import { Button, Title, Input, Textarea } from "../../components/ui/client-component";
import { PiArrowLeft } from "react-icons/pi";

export default function NewNotePage() {
  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
        <PiArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <Title as="h1" className="text-xl">
        New Note
      </Title>

      <form action={createNote} className="space-y-4">
        <div>
          <Input
            name="title"
            placeholder="Note title"
            required
            className="w-full"
          />
        </div>

        <div>
          <Textarea
            name="content"
            placeholder="Write your note content here..."
            rows={5}
            required
            className="w-full"
          />
        </div>

        <Button type="submit">
          Save Note
        </Button>
      </form>
    </main>
  );
}