import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { NextResponse } from "next/server";
import { BusinessStatus } from "@prisma/client";

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
    const { title, slug, shortDescription, detailedDescription, imageUrl, status, order } = body;

    if (!title || !slug || !shortDescription || !detailedDescription) {
      return NextResponse.json({ error: "Missing required fields: title, slug, shortDescription, detailedDescription are required" }, { status: 400 });
    }

    // Check if slug is unique
    const existing = await prisma.business.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: `A division with slug "${slug}" already exists.` }, { status: 400 });
    }

    const business = await prisma.business.create({
      data: {
        title,
        slug,
        shortDescription,
        detailedDescription,
        imageUrl: imageUrl || null,
        status: (status as BusinessStatus) || BusinessStatus.ACTIVE,
        order: typeof order === "number" ? order : parseInt(order) || 0,
      }
    });

    return NextResponse.json({ success: true, business });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to create business sector. Database offline." }, { status: 503 });
  }
}

export async function PUT(req: Request) {
  const authCheck = await checkAdminAuth();
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await req.json();
    const { id, title, slug, shortDescription, detailedDescription, imageUrl, status, order } = body;

    if (!id || !title || !slug || !shortDescription || !detailedDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if slug is taken by another business
    const existing = await prisma.business.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    });
    if (existing) {
      return NextResponse.json({ error: `A division with slug "${slug}" already exists.` }, { status: 400 });
    }

    const business = await prisma.business.update({
      where: { id },
      data: {
        title,
        slug,
        shortDescription,
        detailedDescription,
        imageUrl: imageUrl || null,
        status: (status as BusinessStatus) || BusinessStatus.ACTIVE,
        order: typeof order === "number" ? order : parseInt(order) || 0,
      }
    });

    return NextResponse.json({ success: true, business });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to update business sector. Database offline." }, { status: 503 });
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

    await prisma.business.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Business sector deleted successfully" });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to delete business sector. Database offline." }, { status: 503 });
  }
}
