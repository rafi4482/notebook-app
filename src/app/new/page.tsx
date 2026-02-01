import Link from "next/link";
import { Title } from "../../components/ui/client-component";
import { PiArrowLeft } from "react-icons/pi";
import { CreateNoteForm } from "../../components/CreateNoteForm";

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

      <CreateNoteForm />
    </main>
  );
}
