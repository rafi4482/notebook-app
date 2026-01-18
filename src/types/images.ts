/**
 * Image upload and R2 related types
 */

export interface ImageUploadResponse {
  url: string;
  fileName: string;
}

export interface ImageUploadError {
  error: string;
}

export interface NoteWithImages {
  id: number;
  title: string;
  content: string;
  images?: string; // JSON string array of image URLs
  userId: number;
  createdAt: Date;
}

export interface ImageMetadata {
  url: string;
  uploadedAt?: Date;
  size?: number;
}

/**
 * Parse images JSON string from database
 */
export function parseNoteImages(imagesJson?: string | null): string[] {
  if (!imagesJson) return [];
  try {
    const parsed = JSON.parse(imagesJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Serialize images array to JSON string for database
 */
export function stringifyNoteImages(images: string[]): string {
  return JSON.stringify(images);
}
