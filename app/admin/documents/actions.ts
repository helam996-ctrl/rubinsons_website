"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { uploadToBucket, deleteFromBucket } from "@/lib/storage/storage";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "INVESTOR_RELATIONS"];

async function checkAuth() {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized - Please log in");
  }
  const role = session.user.role || "";
  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error("Forbidden - Insufficient permissions");
  }
  return session.user;
}

export async function createDocument(prevState: unknown, formData: FormData) {
  try {
    await checkAuth();

    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const isPrivate = formData.get("isPrivate") === "true" || formData.get("isPrivate") === "on";
    const orderStr = formData.get("order") as string;
    const order = orderStr ? parseInt(orderStr, 10) : 0;
    const file = formData.get("file") as File | null;

    if (!title || title.trim().length < 2) {
      return { success: false, error: "Title must be at least 2 characters long." };
    }
    if (!category) {
      return { success: false, error: "Category is required." };
    }
    if (!file || file.size === 0) {
      return { success: false, error: "PDF document file is required." };
    }

    // Validate MIME type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return { success: false, error: "Invalid file type. Only PDF documents are allowed." };
    }

    // Validate File Size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return { success: false, error: "File exceeds maximum size limit of 10MB." };
    }

    // Upload file
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uniqueId = crypto.randomUUID();
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9_\-.]/g, "_");
    const fileKey = `uploads/documents/${uniqueId}-${cleanFilename}`;

    const fileUrl = await uploadToBucket(fileKey, fileBuffer, "application/pdf", isPrivate);

    // Save metadata to DB
    await prisma.investorDocument.create({
      data: {
        title: title.trim(),
        category,
        fileUrl,
        fileKey,
        fileSize: file.size,
        isPrivate,
        order,
      },
    });

    revalidatePath("/investors");
    revalidatePath("/investor-portal");
    revalidatePath("/admin/documents");

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in createDocument action:", err);
    return { success: false, error: err.message || "Failed to create document." };
  }
}

export async function updateDocument(
  id: string,
  data: { title: string; category: string; isPrivate: boolean; order: number }
) {
  try {
    await checkAuth();

    if (!data.title || data.title.trim().length < 2) {
      return { success: false, error: "Title must be at least 2 characters long." };
    }
    if (!data.category) {
      return { success: false, error: "Category is required." };
    }

    // Update in DB
    await prisma.investorDocument.update({
      where: { id },
      data: {
        title: data.title.trim(),
        category: data.category,
        isPrivate: data.isPrivate,
        order: data.order,
      },
    });

    revalidatePath("/investors");
    revalidatePath("/investor-portal");
    revalidatePath("/admin/documents");

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in updateDocument action:", err);
    return { success: false, error: err.message || "Failed to update document." };
  }
}

export async function deleteDocument(id: string) {
  try {
    await checkAuth();

    // Fetch document to get fileKey
    const doc = await prisma.investorDocument.findUnique({
      where: { id },
    });

    if (!doc) {
      return { success: false, error: "Document not found." };
    }

    // Delete file from bucket
    await deleteFromBucket(doc.fileKey);

    // Delete record from DB
    await prisma.investorDocument.delete({
      where: { id },
    });

    revalidatePath("/investors");
    revalidatePath("/investor-portal");
    revalidatePath("/admin/documents");

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in deleteDocument action:", err);
    return { success: false, error: err.message || "Failed to delete document." };
  }
}
