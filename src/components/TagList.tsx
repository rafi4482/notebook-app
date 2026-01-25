"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeTag } from "../server/actions/tags.action";

export default function TagList({ noteId, initialTags }: { noteId: number; initialTags: string[] }) {
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [isPending, startTransition] = useTransition();
  const [pendingTag, setPendingTag] = useState<string | null>(null);
  const router = useRouter();

  const handleRemoveTag = (tag: string) => {
    setPendingTag(tag);
    startTransition(async () => {
      try {
        const result = await removeTag(noteId, tag);
        if (result.success) {
          setTags(result.tags);
        } else {
          console.error(result.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setPendingTag(null);
      }
    });
  };

  if (!tags || tags.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm">
          <button
            type="button"
            onClick={() => router.push(`/?tag=${encodeURIComponent(t)}`)}
            className="text-sm font-medium"
          >
            {t}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveTag(t);
            }}
            className="text-gray-600"
            aria-label={`Remove ${t}`}
            disabled={isPending && pendingTag === t}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
