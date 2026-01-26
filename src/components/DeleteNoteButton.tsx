"use client";

import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Button, Text } from "./ui/client-component";
import { PiTrash } from "react-icons/pi";
import { deleteNote } from "../server/actions/notes.action";

interface DeleteNoteButtonProps {
  noteId: number;
}

export function DeleteNoteButton({ noteId }: DeleteNoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    await deleteNote(noteId);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        color="danger"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <PiTrash className="h-4 w-4" />
        Delete
      </Button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <DialogTitle className="text-lg font-semibold mb-2">
              Delete Note
            </DialogTitle>
            <Text className="text-gray-600 mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </Text>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button color="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
