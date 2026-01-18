import React from "react";

interface ImageGalleryProps {
  imagesJson?: string | null;
  className?: string;
}

export function ImageGallery({ imagesJson, className = "" }: ImageGalleryProps) {
  if (!imagesJson) {
    return null;
  }

  let images: string[] = [];
  try {
    images = JSON.parse(imagesJson);
  } catch (e) {
    return null;
  }

  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 ${className}`}>
      {images.map((imageUrl) => (
        <img
          key={imageUrl}
          src={imageUrl}
          alt="Note attachment"
          className="w-full h-24 object-cover rounded-lg"
        />
      ))}
    </div>
  );
}
