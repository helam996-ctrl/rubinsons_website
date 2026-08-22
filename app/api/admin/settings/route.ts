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

export async function GET() {
  const authCheck = await checkAdminAuth();
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: "asc" }
    });
    return NextResponse.json(settings);
  } catch (err) {
    return NextResponse.json({ error: "Database offline" }, { status: 503 });
  }
}

export async function PUT(req: Request) {
  const authCheck = await checkAdminAuth();
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await req.json();
    const { settings } = body; // Expects settings = { [key: string]: string }

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Invalid payload: settings object required" }, { status: 400 });
    }

    // Perform upserts in a transaction
    const upsertPromises = Object.entries(settings).map(([key, value]) => {
      return prisma.siteSetting.upsert({
        where: { key },
        update: { value: value as string },
        create: {
          key,
          value: value as string,
          description: `Updated via CMS Settings Admin Page`
        }
      });
    });

    await prisma.$transaction(upsertPromises);

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to update settings. Database offline." }, { status: 503 });
  }
}
