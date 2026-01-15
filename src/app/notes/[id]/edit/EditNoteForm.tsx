"use client";

import { useActionState } from "react";
import { updateNote } from "../../../../server/actions/notes";
import { Button, Input } from "../../../../components/ui/client-component";
import TipTapEditor from "../../../../components/editor/TipTapEditor";

interface EditNoteFormProps {
  note: {
    id: number;
    title: string;
    content: string;
  };
}

export function EditNoteForm({ note }: EditNoteFormProps) {
  const [state, formAction] = useActionState(
    (prevState: { errors?: { title?: string[]; content?: string[] } } | null, formData: FormData) =>
      updateNote(note.id, prevState, formData),
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <TipTapEditor
          name="title"
          initialContent={note.title}
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
        <TipTapEditor name="content" initialContent={note.content} required className="w-full" simple />
        {state?.errors?.content?.[0] && (
          <p className="text-sm text-red-600">{state?.errors?.content?.[0]}</p>
        )}
      </div>

      <Button type="submit">
        Update Note
      </Button>
    </form>
  );
}

