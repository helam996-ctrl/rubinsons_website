import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { streamFromBucket } from "@/lib/storage/storage";
import { NextRequest, NextResponse } from "next/server";

// Dynamic minimal PDF buffer for mock fallbacks
const MOCK_PDF_BUFFER = Buffer.from(
  "%PDF-1.4\n" +
  "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
  "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
  "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>\nendobj\n" +
  "4 0 obj\n<< /Length 50 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Rubinsons Group - Secured Document) Tj\nET\nendstream\nendobj\n" +
  "xref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\n" +
  "trailer\n<< /Size 5 /Root 1 0 R >>\n" +
  "startxref\n313\n%%EOF"
);

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const id = params.id;
  const session = await auth();

  // A. Check Authentication
  if (!session || !session.user) {
    return new NextResponse("Unauthorized - Session Required", { status: 401 });
  }

  const userRole = session.user.role || "INVESTOR";

  // B. Handle Mock Document IDs (For offline/testing fallbacks)
  if (id.startsWith("mock-")) {
    // Role permissions for mocks
    if (id === "mock-3" || id === "doc-3") {
      // restricted mock
      if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
        return new NextResponse("Forbidden - Board Access Only", { status: 403 });
      }
    }
    
    const mockFilename = id === "mock-1" || id === "doc-1" 
      ? "Q2_2026_Financial_Prospectus.pdf" 
      : id === "mock-2" || id === "doc-2"
      ? "Rubinsons_Governance_Charter_2026.pdf"
      : "Board_Strategic_Expansion_Plan_v2.pdf";

    return new NextResponse(new Uint8Array(MOCK_PDF_BUFFER), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${mockFilename}"`,
      },
    });
  }

  // C. Fetch Document Metadata
  let doc = null;
  try {
    doc = await prisma.investorDocument.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Database offline query during download proxy:", error);
  }

  // D. Fallback if DB is offline and id matches a common GUID format
  if (!doc) {
    return new NextResponse("Document Not Found", { status: 404 });
  }

  // E. Role Verification Check for Private Documents
  if (doc.isPrivate) {
    const isAuthorized =
      userRole === "SUPER_ADMIN" ||
      userRole === "ADMIN" ||
      userRole === "INVESTOR_RELATIONS" ||
      userRole === "INVESTOR";

    if (!isAuthorized) {
      return new NextResponse("Forbidden - Insufficient Permissions", { status: 403 });
    }

    // Double check Board restriction
    if (
      doc.category === "Board Publications" &&
      userRole !== "SUPER_ADMIN" &&
      userRole !== "ADMIN"
    ) {
      return new NextResponse("Forbidden - Board Access Only", { status: 403 });
    }
  }

  // F. Retrieve and Stream from Storage Bucket
  try {
    const fileBuffer = await streamFromBucket(doc.fileKey);
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${doc.title.replace(/[^a-zA-Z0-9_\-.]/g, "_")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to stream document from storage:", error);
    return new NextResponse("Storage Read Error", { status: 500 });
  }
}
