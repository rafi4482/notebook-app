"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { PiMagnifyingGlass, PiX } from "react-icons/pi";

interface SearchInputProps {
  defaultValue?: string;
}

export function SearchInput({ defaultValue = "" }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);

  // Sync with URL on mount and when URL changes externally
  useEffect(() => {
    setValue(searchParams.get("search") || "");
  }, [searchParams]);

  // Debounced search
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    const newSearch = value.trim();

    // Only navigate if the value actually changed from the URL
    if (currentSearch === newSearch) {
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (newSearch) {
        params.set("search", newSearch);
      } else {
        params.delete("search");
      }

      // Reset to page 1 when search changes
      params.delete("page");

      startTransition(() => {
        router.push(`/?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [value, router, searchParams]);

  const handleClear = () => {
    setValue("");
  };

  return (
    <div className="relative">
      <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search notes..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <PiX className="h-4 w-4" />
        </button>
      )}
      {isPending && (
        <div className={`absolute top-1/2 -translate-y-1/2 ${value ? "right-9" : "right-3"}`}>
          <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
