import { prisma } from "@/lib/db/client";
import { NextResponse } from "next/server";
import { sendInquiryNotification } from "@/lib/email";
import { isRateLimited } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  try {
    // 0. Rate limiting check (max 5 requests per minute)
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (isRateLimited(ip, 5, 60 * 1000)) {
      return NextResponse.json(
        { error: { message: "Too many requests. Please try again later." } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, phone, organisation, type, message, b_phone } = body;

    // 1. Honeypot check (silently drop bot submissions)
    if (b_phone) {
      console.warn("[CRM] Honeypot field b_phone filled by potential bot. Silently discarding inquiry.");
      return NextResponse.json({
        success: true,
        message: "Inquiry registered successfully.",
      });
    }

    // 2. Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: { message: "Name, email, and message are required fields." } },
        { status: 400 }
      );
    }

    // 2. Safe save to PostgreSQL
    let inquiry = null;
    let dbOffline = false;

    try {
      inquiry = await prisma.inquiry.create({
        data: {
          name,
          email,
          phone: phone || null,
          organisation: organisation || null,
          type: type || "GENERAL",
          message,
          source: "FORM",
          status: "NEW",
        },
      });
      console.log(`[CRM] Inquiry logged successfully. ID: ${inquiry.id}`);
    } catch {
      dbOffline = true;
      console.warn("[CRM] PostgreSQL offline. Inquiry log skipped. Payload:", body);
    }

    // 3. Dispatch Email notification asynchronously
    try {
      await sendInquiryNotification({
        id: inquiry?.id,
        name,
        email,
        phone,
        organisation,
        type: type || "GENERAL",
        message,
      });
    } catch (emailErr) {
      console.error("[CRM] Failed to trigger email notification alert:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: dbOffline
        ? "Inquiry verified. Database offline (payload captured in server logs)."
        : "Inquiry registered successfully.",
      data: inquiry || body,
    });
  } catch (error) {
    const err = error as Error;
    console.error("[CRM] API handler error:", err);
    return NextResponse.json(
      { error: { message: err.message || "Internal server error." } },
      { status: 500 }
    );
  }
}

