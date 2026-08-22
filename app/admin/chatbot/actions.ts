"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

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

export async function updateIntent(
  id: string,
  data: { description: string; responseGuidance: string; priority: number; enabled: boolean }
) {
  try {
    await checkAuth();

    if (!data.responseGuidance || data.responseGuidance.trim().length < 10) {
      return { success: false, error: "Response Guidance must be at least 10 characters long." };
    }

    await prisma.chatbotIntent.update({
      where: { id },
      data: {
        description: data.description.trim(),
        responseGuidance: data.responseGuidance.trim(),
        priority: data.priority,
        enabled: data.enabled,
      },
    });

    revalidatePath("/admin/chatbot");
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error updating chatbot intent:", err);
    return { success: false, error: err.message || "Failed to update intent." };
  }
}

export async function addKeyword(intentId: string, keyword: string) {
  try {
    await checkAuth();

    const cleanKw = keyword.trim().toLowerCase();
    if (!cleanKw) {
      return { success: false, error: "Keyword cannot be empty." };
    }

    // Check if keyword already exists for this intent
    const existing = await prisma.chatbotKeyword.findUnique({
      where: {
        intentId_keyword: {
          intentId,
          keyword: cleanKw,
        },
      },
    });

    if (existing) {
      return { success: false, error: "Keyword already exists for this intent." };
    }

    await prisma.chatbotKeyword.create({
      data: {
        intentId,
        keyword: cleanKw,
        isExact: false,
      },
    });

    revalidatePath("/admin/chatbot");
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error adding chatbot keyword:", err);
    return { success: false, error: err.message || "Failed to add keyword." };
  }
}

export async function removeKeyword(keywordId: string) {
  try {
    await checkAuth();

    await prisma.chatbotKeyword.delete({
      where: { id: keywordId },
    });

    revalidatePath("/admin/chatbot");
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error removing chatbot keyword:", err);
    return { success: false, error: err.message || "Failed to remove keyword." };
  }
}

export async function addQuickAction(
  intentId: string,
  data: { label: string; promptText: string; order: number }
) {
  try {
    await checkAuth();

    if (!data.label.trim()) {
      return { success: false, error: "Label is required." };
    }
    if (!data.promptText.trim()) {
      return { success: false, error: "Prompt Text is required." };
    }

    await prisma.chatbotQuickAction.create({
      data: {
        intentId,
        label: data.label.trim(),
        promptText: data.promptText.trim(),
        order: data.order,
      },
    });

    revalidatePath("/admin/chatbot");
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error adding chatbot quick action:", err);
    return { success: false, error: err.message || "Failed to add quick action." };
  }
}

export async function removeQuickAction(actionId: string) {
  try {
    await checkAuth();

    await prisma.chatbotQuickAction.delete({
      where: { id: actionId },
    });

    revalidatePath("/admin/chatbot");
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error removing chatbot quick action:", err);
    return { success: false, error: err.message || "Failed to remove quick action." };
  }
}
