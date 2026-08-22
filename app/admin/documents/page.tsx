import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";
import DocumentManagerClient from "@/components/admin/DocumentManagerClient";

interface DocumentItem {
  id: string;
  title: string;
  category: string;
  fileSize: number;
  isPrivate: boolean;
  order: number;
  fileUrl: string;
  fileKey: string;
}

export default async function AdminDocumentsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  const isAuthorized =
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    role === "EDITOR" ||
    role === "INVESTOR_RELATIONS";

  if (!isAuthorized) {
    redirect("/unauthorized");
  }

  let documents: DocumentItem[] = [];
  let isDbOffline = false;

  try {
    const docs = await prisma.investorDocument.findMany({
      orderBy: { order: "asc" },
    });
    documents = docs.map(d => ({
      id: d.id,
      title: d.title,
      category: d.category,
      fileSize: d.fileSize,
      isPrivate: d.isPrivate,
      order: d.order,
      fileUrl: d.fileUrl,
      fileKey: d.fileKey,
    }));
  } catch {
    isDbOffline = true;
    documents = [
      {
        id: "mock-1",
        title: "Q2 2026 Financial Prospectus",
        category: "Quarterly Financial Reports",
        fileSize: 2516582,
        isPrivate: true,
        order: 1,
        fileUrl: "/uploads/Q2_2026_Financial_Prospectus.pdf",
        fileKey: "uploads/documents/mock-q2-prospectus.pdf",
      },
      {
        id: "mock-2",
        title: "Rubinsons Governance Charter 2026",
        category: "Governance Charters",
        fileSize: 1153433,
        isPrivate: true,
        order: 2,
        fileUrl: "/uploads/Rubinsons_Governance_Charter_2026.pdf",
        fileKey: "uploads/documents/mock-gov-charter.pdf",
      },
      {
        id: "mock-3",
        title: "Board Strategic Expansion Plan v2",
        category: "Board Publications",
        fileSize: 5033164,
        isPrivate: true,
        order: 3,
        fileUrl: "/uploads/Board_Strategic_Expansion_Plan.pdf",
        fileKey: "uploads/documents/mock-board-plan.pdf",
      },
      {
        id: "pub-1",
        title: "Rubinsons Group Corporate Profile 2026",
        category: "Corporate Profile",
        fileSize: 3355443,
        isPrivate: false,
        order: 4,
        fileUrl: "/uploads/Rubinsons_Group_Corporate_Profile_2026.pdf",
        fileKey: "uploads/documents/mock-corp-profile.pdf",
      },
    ];
  }

  return (
    <main className="p-8 space-y-6 overflow-y-auto flex-1 font-sans">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-brand-bronze font-semibold">
          CMS Control Panel
        </span>
        <h1 className="text-3xl font-serif font-medium text-brand-slate-900 mt-0.5">
          Investor Documents & Disclosures
        </h1>
      </div>

      {/* Warning banner for database offline */}
      {isDbOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
          <p className="text-xs text-amber-800">
            <strong>Database Offline Mode</strong>: Displaying verified document templates. Uploads, status edits, and file deletions are locked until database connection is established.
          </p>
        </div>
      )}

      {/* Client Panel handling uploads and table operations */}
      <DocumentManagerClient initialDocuments={documents} isDbOffline={isDbOffline} />
    </main>
  );
}
