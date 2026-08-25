import { auth } from "@/auth";
import { uploadToBucket } from "@/lib/storage/storage";
import { NextResponse } from "next/server";
import crypto from "crypto";

const AUTHORIZED_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "INVESTOR_RELATIONS"];

async function checkAdminAuth() {
  const session = await auth();
  if (!session || !session.user) {
    return { error: "Unauthorized", status: 401 };
  }
  const role = session.user.role || "INVESTOR";
  if (!AUTHORIZED_ROLES.includes(role)) {
    return { error: "Forbidden - Insufficient permissions", status: 403 };
  }
  return { authorized: true };
}

export async function POST(req: Request) {
  const authCheck = await checkAdminAuth();
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate type (must be image)
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only image files (JPEG, PNG, GIF, WEBP) are allowed" }, { status: 400 });
    }

    // Validate size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image file exceeds maximum size limit of 5MB" }, { status: 400 });
    }

    // Create file buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uniqueId = crypto.randomUUID();
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9_\-.]/g, "_");
    const fileKey = `uploads/media/${uniqueId}-${cleanFilename}`;

    // Upload to public folder (isPrivate = false)
    const fileUrl = await uploadToBucket(fileKey, fileBuffer, file.type, false);

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (err) {
    const error = err as Error;
    console.error("[Upload API] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload image" }, { status: 500 });
  }
}
