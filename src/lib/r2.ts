import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3Client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
  },
  endpoint: process.env.CLOUDFLARE_ENDPOINT_URL || "",
});

const bucketName = process.env.CLOUDFLARE_BUCKET_NAME || "";

/**
 * Upload an image file to Cloudflare R2
 * @param file - The file to upload
 * @param fileName - The name to store the file as
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToR2(
  file: Buffer,
  fileName: string
): Promise<string> {
  if (!bucketName || !process.env.CLOUDFLARE_ENDPOINT_URL || !process.env.NEXT_PUBLIC_UPLOAD_URL) {
    throw new Error("R2 configuration is missing");
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: file,
      ContentType: "image/*",
    });

    await s3Client.send(command);

    // Return the public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_UPLOAD_URL}/${fileName}`;
    return publicUrl;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error("Failed to upload image to R2");
  }
}

/**
 * Delete an image file from Cloudflare R2
 * @param fileName - The file to delete
 */
export async function deleteImageFromR2(fileName: string): Promise<void> {
  if (!bucketName) {
    throw new Error("R2 bucket name is missing");
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting from R2:", error);
    throw new Error("Failed to delete image from R2");
  }
}

/**
 * Generate a unique file name for the image
 */
export function generateImageFileName(originalFileName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalFileName.split(".").pop() || "jpg";
  return `notes-images/${timestamp}-${random}.${extension}`;
}
