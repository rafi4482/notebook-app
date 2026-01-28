"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PiX } from "react-icons/pi";

interface ActiveFiltersProps {
  search: string | null;
  tag: string | null;
  totalCount: number;
}

export function ActiveFilters({ search, tag, totalCount }: ActiveFiltersProps) {
  const searchParams = useSearchParams();

  if (!search && !tag) {
    return null;
  }

  const createClearUrl = (clearSearch: boolean, clearTag: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    if (clearSearch) {
      params.delete("search");
    }
    if (clearTag) {
      params.delete("tag");
    }
    // Reset to page 1 when filters change
    params.delete("page");

    return `/?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-md p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-blue-800">
          {totalCount} {totalCount === 1 ? "result" : "results"}
        </span>

        {search && (
          <Link
            href={createClearUrl(true, false)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded-md text-sm text-blue-700 hover:bg-blue-100"
          >
            Search: &quot;{search}&quot;
            <PiX className="h-3 w-3" />
          </Link>
        )}

        {tag && (
          <Link
            href={createClearUrl(false, true)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded-md text-sm text-blue-700 hover:bg-blue-100"
          >
            Tag: {tag}
            <PiX className="h-3 w-3" />
          </Link>
        )}
      </div>

      {(search || tag) && (
        <Link
          href="/"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Clear all
        </Link>
      )}
    </div>
  );
}
