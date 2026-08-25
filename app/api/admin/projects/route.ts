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
    const { title, slug, description, imageUrl, status, order, businessId } = body;

    if (!title || !slug || !description || !businessId) {
      return NextResponse.json({ error: "Missing required fields: title, slug, description, businessId are required" }, { status: 400 });
    }

    // Check if slug is unique
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: `A project with slug "${slug}" already exists.` }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        imageUrl: imageUrl || null,
        status: status || "ACTIVE",
        order: typeof order === "number" ? order : parseInt(order) || 0,
        businessId,
      }
    });

    return NextResponse.json({ success: true, project });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to create project. Database offline." }, { status: 503 });
  }
}

export async function PUT(req: Request) {
  const authCheck = await checkAdminAuth();
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await req.json();
    const { id, title, slug, description, imageUrl, status, order, businessId } = body;

    if (!id || !title || !slug || !description || !businessId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if slug is taken by another project
    const existing = await prisma.project.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    });
    if (existing) {
      return NextResponse.json({ error: `A project with slug "${slug}" already exists.` }, { status: 400 });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        imageUrl: imageUrl || null,
        status: status || "ACTIVE",
        order: typeof order === "number" ? order : parseInt(order) || 0,
        businessId,
      }
    });

    return NextResponse.json({ success: true, project });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to update project. Database offline." }, { status: 503 });
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

    await prisma.project.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to delete project. Database offline." }, { status: 503 });
  }
}
