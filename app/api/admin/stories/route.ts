import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { NextResponse } from "next/server";

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
    const body = await req.json();
    const { title, slug, content, category, imageUrl, status, seoTitle, seoDescription } = body;

    if (!title || !slug || !content || !category) {
      return NextResponse.json({ error: "Missing required fields: title, slug, content, and category are required" }, { status: 400 });
    }

    // Check if slug is unique
    const existing = await prisma.story.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: `A story with slug "${slug}" already exists.` }, { status: 400 });
    }

    const story = await prisma.story.create({
      data: {
        title,
        slug,
        content,
        category,
        imageUrl: imageUrl || null,
        status: status || "DRAFT",
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      }
    });

    return NextResponse.json({ success: true, story });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to create story. Database offline." }, { status: 503 });
  }
}

export async function PUT(req: Request) {
  const authCheck = await checkAdminAuth();
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await req.json();
    const { id, title, slug, content, category, imageUrl, status, seoTitle, seoDescription } = body;

    if (!id || !title || !slug || !content || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if slug is taken by another story
    const existing = await prisma.story.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    });
    if (existing) {
      return NextResponse.json({ error: `A story with slug "${slug}" already exists.` }, { status: 400 });
    }

    // Find current story to determine if publication status changes
    const current = await prisma.story.findUnique({ where: { id } });
    let publishedAt = current?.publishedAt;
    
    if (status === "PUBLISHED" && (!current || current.status !== "PUBLISHED")) {
      publishedAt = new Date();
    } else if (status === "DRAFT") {
      publishedAt = null;
    }

    const story = await prisma.story.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        category,
        imageUrl: imageUrl || null,
        status: status || "DRAFT",
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        publishedAt,
      }
    });

    return NextResponse.json({ success: true, story });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to update story. Database offline." }, { status: 503 });
  }
}

export async function DELETE(req: Request) {
  const authCheck = await checkAdminAuth();
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing required parameter: id" }, { status: 400 });
    }

    await prisma.story.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Story deleted successfully" });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to delete story. Database offline." }, { status: 503 });
  }
}
