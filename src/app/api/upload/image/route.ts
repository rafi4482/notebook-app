import { NextRequest, NextResponse } from "next/server";
import { uploadImageToR2, generateImageFileName } from "../../../../lib/r2";
import { getSession } from "../../../../utils/getSession";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique file name
    const fileName = generateImageFileName(file.name);

    // Upload to R2
    const imageUrl = await uploadImageToR2(buffer, fileName);

    return NextResponse.json(
      { url: imageUrl, fileName },
      { status: 200 }
    );
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
