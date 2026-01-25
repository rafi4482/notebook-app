import { uploadImageToR2, generateImageFileName } from "../../lib/r2";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export type ImageValidationResult =
  | { valid: true }
  | { valid: false; error: string };

/**
 * Validate an image file for type and size
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "File must be an image" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File size must be less than 5MB" };
  }

  return { valid: true };
}

export type ImageUploadResult =
  | { success: true; url: string; fileName: string }
  | { success: false; error: string };

/**
 * Upload an image file to R2
 */
export async function uploadImage(file: File): Promise<ImageUploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = generateImageFileName(file.name);
    const url = await uploadImageToR2(buffer, fileName);

    return { success: true, url, fileName };
  } catch (error) {
    console.error("Image upload error:", error);
    return { success: false, error: "Failed to upload image" };
  }
}
