"use client";

import Link from "next/link";
import { createNote } from "../../server/actions/notes";
import { Button, Title, Input } from "../../components/ui/client-component";
import TipTapEditor from "../../components/editor/TipTapEditor";
import { PiArrowLeft } from "react-icons/pi";
import { useActionState, useState, useRef } from "react";

export default function NewNotePage() {
  const [state, formAction] = useActionState(createNote, null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    setUploadError(null);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to upload image");
        }

        const data = await response.json();
        setImages((prev) => [...prev, data.url]);
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (imageUrl: string) => {
    setImages((prev) => prev.filter((img) => img !== imageUrl));
  };

  const handleSubmit = async (formData: FormData) => {
    formData.append("images", JSON.stringify(images));
    return formAction(formData);
  };

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
        <PiArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <Title as="h1" className="text-xl">
        New Note
      </Title>

      <form action={handleSubmit} className="space-y-4">
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

        {/* Image Upload Section */}
        <div className="border-t pt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Images
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50"
            />
            {uploadError && (
              <p className="text-sm text-red-600 mt-1">{uploadError}</p>
            )}
            {uploading && (
              <p className="text-sm text-blue-600 mt-1">Uploading...</p>
            )}
          </div>

          {/* Display uploaded images */}
          {images.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Uploaded Images ({images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((imageUrl) => (
                  <div
                    key={imageUrl}
                    className="relative group rounded-lg overflow-hidden bg-gray-100"
                  >
                    <img
                      src={imageUrl}
                      alt="Uploaded"
                      className="w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(imageUrl)}
                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="text-white text-sm font-medium">Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add hidden input to pass images */}
        <input type="hidden" name="images" value={JSON.stringify(images)} />

        <Button type="submit" disabled={uploading}>
          Save Note
        </Button>
      </form>
    </main>
  );
}