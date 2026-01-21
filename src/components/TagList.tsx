"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function TagList({ noteId, initialTags }: { noteId: number; initialTags: string[] }) {
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const removeTag = async (tag: string) => {
    setLoading(tag);
    try {
      const res = await fetch("/api/notes/remove-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, tag }),
      });

      if (!res.ok) throw new Error("Failed to remove tag");
      const data = await res.json();
      setTags(data.tags || tags.filter((t) => t !== tag));
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  if (!tags || tags.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm">
          <span>{t}</span>
          <button
            type="button"
            onClick={() => removeTag(t)}
            className="text-gray-600"
            aria-label={`Remove ${t}`}
            disabled={loading === t}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
