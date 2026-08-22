import { prisma } from "@/lib/db/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        OR: [
          { key: { startsWith: "link_" } },
          { key: { startsWith: "social_" } }
        ]
      }
    });

    // Convert array to key-value object
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsObj);
  } catch (err) {
    console.warn("[API] Database offline. Serving default settings fallback.");
    // Return empty object; client will fallback to default values
    return NextResponse.json({});
  }
}
