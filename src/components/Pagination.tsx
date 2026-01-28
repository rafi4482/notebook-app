"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function Pagination({ currentPage, totalPages, totalCount }: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    return `/?${params.toString()}`;
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsisThreshold = 7;

    if (totalPages <= showEllipsisThreshold) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 pt-4 mt-6">
      <div className="text-sm text-gray-500">
        Page {currentPage} of {totalPages} ({totalCount} notes)
      </div>

      <div className="flex items-center gap-1">
        {/* Previous button */}
        {hasPrev ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
            aria-label="Previous page"
          >
            <PiCaretLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span className="p-2 text-gray-300 cursor-not-allowed">
            <PiCaretLeft className="h-4 w-4" />
          </span>
        )}

        {/* Page numbers */}
        {getPageNumbers().map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={createPageUrl(page)}
              className={`px-3 py-1 rounded-md text-sm ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              {page}
            </Link>
          )
        )}

        {/* Next button */}
        {hasNext ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
            aria-label="Next page"
          >
            <PiCaretRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="p-2 text-gray-300 cursor-not-allowed">
            <PiCaretRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
