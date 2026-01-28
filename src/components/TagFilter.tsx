"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface TagCount {
  tag: string;
  count: number;
}

interface TagFilterProps {
  tags: TagCount[];
  activeTag: string | null;
}

export function TagFilter({ tags, activeTag }: TagFilterProps) {
  const searchParams = useSearchParams();

  if (tags.length === 0) {
    return null;
  }

  const createTagUrl = (tag: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }

    // Reset to page 1 when tag changes
    params.delete("page");

    return `/?${params.toString()}`;
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Link href={createTagUrl(null)}>
        <button
          className={`px-3 py-1 rounded-md text-sm transition-colors ${
            !activeTag
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          All
        </button>
      </Link>
      {tags.map(({ tag, count }) => (
        <Link key={tag} href={createTagUrl(tag)}>
          <button
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              activeTag === tag
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {tag}{" "}
            <span
              className={`ml-1 text-xs ${
                activeTag === tag ? "text-blue-200" : "text-gray-500"
              }`}
            >
              {count}
            </span>
          </button>
        </Link>
      ))}
    </div>
  );
}
