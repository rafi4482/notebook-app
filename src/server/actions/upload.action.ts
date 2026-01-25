"use server";

import { getOrCreateUser } from "./users.action";
import { uploadImage } from "../services/upload.service";

export type UploadImageResult =
  | { success: true; url: string; fileName: string }
  | { success: false; error: string };

/**
 * Upload an image file
 */
export async function uploadImageAction(
  formData: FormData
): Promise<UploadImageResult> {
  try {
    // Check authentication
    await getOrCreateUser();

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    return uploadImage(file);
  } catch (error) {
    if (error instanceof Error && error.message === "User not authenticated") {
      return { success: false, error: "Unauthorized" };
    }
    console.error("Upload action error:", error);
    return { success: false, error: "Failed to upload image" };
  }
}
