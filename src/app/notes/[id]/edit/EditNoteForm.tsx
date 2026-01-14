"use client";

import { useActionState } from "react";
import { updateNote } from "../../../../server/actions/notes";
import { Button, Input, Textarea } from "../../../../components/ui/client-component";

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
        <Input
          name="title"
          defaultValue={note.title}
          placeholder="Note title"
          required
          className="w-full"
          error={state?.errors?.title?.[0]}
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
          error={state?.errors?.content?.[0]}
        />
      </div>

      <Button type="submit">
        Update Note
      </Button>
    </form>
  );
}

