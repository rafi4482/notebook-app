"use client";

import Link from "next/link";
import { createNote } from "../../server/actions/notes";
import { Button, Title, Input } from "../../components/ui/client-component";
import TipTapEditor from "../../components/editor/TipTapEditor";
import { PiArrowLeft } from "react-icons/pi";
import { useActionState } from "react";

export default function NewNotePage() {
  const [state, formAction] = useActionState(createNote, null);

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
        <PiArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <Title as="h1" className="text-xl">
        New Note
      </Title>

      <form action={formAction} className="space-y-4">
        <div>
          <TipTapEditor
            name="title"
            placeholder="Note title"
            required
            className="w-full"
            simple
          />
          {state?.errors?.title?.[0] && (
            <p className="text-sm text-red-600">{state?.errors?.title?.[0]}</p>
          )}
        </div>

        <div>
          <TipTapEditor
            name="content"
            placeholder="Write your note content here..."
            required
            className="w-full"
            simple
          />
          {state?.errors?.content?.[0] && (
            <p className="text-sm text-red-600">{state?.errors?.content?.[0]}</p>
          )}
        </div>

        <Button type="submit">
          Save Note
        </Button>
      </form>
    </main>
  );
}