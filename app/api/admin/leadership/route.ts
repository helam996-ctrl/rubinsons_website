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
    const { name, role, biography, imageUrl, order } = body;

    if (!name || !role) {
      return NextResponse.json({ error: "Missing required fields: name and role are required" }, { status: 400 });
    }

    const leader = await prisma.leadership.create({
      data: {
        name,
        role,
        biography: biography || null,
        imageUrl: imageUrl || null,
        order: typeof order === "number" ? order : parseInt(order) || 0,
      }
    });

    return NextResponse.json({ success: true, leader });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to create board member. Database offline." }, { status: 503 });
  }
}

export async function PUT(req: Request) {
  const authCheck = await checkAdminAuth();
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await req.json();
    const { id, name, role, biography, imageUrl, order } = body;

    if (!id || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const leader = await prisma.leadership.update({
      where: { id },
      data: {
        name,
        role,
        biography: biography || null,
        imageUrl: imageUrl || null,
        order: typeof order === "number" ? order : parseInt(order) || 0,
      }
    });

    return NextResponse.json({ success: true, leader });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to update board member. Database offline." }, { status: 503 });
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

    await prisma.leadership.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Board member deleted successfully" });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to delete board member. Database offline." }, { status: 503 });
  }
}
