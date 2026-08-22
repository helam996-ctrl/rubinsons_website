import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import Button from "@/components/ui/Button";
import Link from "next/link";
import DownloadButton from "@/components/analytics/DownloadButton";
import TrackLogin from "@/components/analytics/TrackLogin";

interface DocumentItem {
  id: string;
  title: string;
  category: string;
  fileSize: number;
  isPrivate: boolean;
  fileUrl: string;
  createdAt: Date;
}

export default async function InvestorPortalPage(props: {
  searchParams?: Promise<{ search?: string; category?: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const searchParams = (await props.searchParams) || {};
  const search = searchParams.search || "";
  const category = searchParams.category || "";

  const userRole = session.user.role || "INVESTOR";

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
      fileUrl: d.fileUrl,
      createdAt: d.createdAt,
    }));
  } catch {
    isDbOffline = true;
    // Loaded visual mock documents matching specs
    documents = [
      {
        id: "mock-1",
        title: "Q2 2026 Financial Prospectus",
        category: "Quarterly Financial Reports",
        fileSize: 2516582, // ~2.4 MB
        isPrivate: true,
        fileUrl: "/uploads/Q2_2026_Financial_Prospectus.pdf",
        createdAt: new Date("2026-08-01"),
      },
      {
        id: "mock-2",
        title: "Rubinsons Governance Charter 2026",
        category: "Governance Charters",
        fileSize: 1153433, // ~1.1 MB
        isPrivate: true,
        fileUrl: "/uploads/Rubinsons_Governance_Charter_2026.pdf",
        createdAt: new Date("2026-01-15"),
      },
      {
        id: "mock-3",
        title: "Board Strategic Expansion Plan v2",
        category: "Board Publications",
        fileSize: 5033164, // ~4.8 MB
        isPrivate: true,
        fileUrl: "/uploads/Board_Strategic_Expansion_Plan.pdf",
        createdAt: new Date("2026-08-10"),
      },
      {
        id: "pub-1",
        title: "Rubinsons Group Corporate Profile 2026",
        category: "Corporate Profile",
        fileSize: 3355443, // ~3.2 MB
        isPrivate: false,
        fileUrl: "/uploads/Rubinsons_Group_Corporate_Profile_2026.pdf",
        createdAt: new Date("2026-03-10"),
      },
      {
        id: "pub-2",
        title: "Public Governance Framework & Charter",
        category: "Governance",
        fileSize: 1048576, // ~1.0 MB
        isPrivate: false,
        fileUrl: "/uploads/Public_Governance_Framework.pdf",
        createdAt: new Date("2026-01-20"),
      },
      {
        id: "pub-3",
        title: "Sustainability & Environmental Impact Report",
        category: "ESG Report",
        fileSize: 1887436, // ~1.8 MB
        isPrivate: false,
        fileUrl: "/uploads/ESG_Report_2025.pdf",
        createdAt: new Date("2026-05-12"),
      },
    ];
  }

  // Filter Logic on Server-Side
  let filteredDocs = documents;

  if (category) {
    filteredDocs = filteredDocs.filter(
      (d) => d.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredDocs = filteredDocs.filter(
      (d) =>
        d.title.toLowerCase().includes(searchLower) ||
        d.category.toLowerCase().includes(searchLower)
    );
  }

  // Get Unique Categories for Sidebar/Tabs Filter
  const categories = Array.from(new Set(documents.map((d) => d.category)));

  // Helper to check user access
  const hasAccess = (doc: DocumentItem) => {
    if (doc.category === "Board Publications") {
      return userRole === "SUPER_ADMIN" || userRole === "ADMIN";
    }
    return true;
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1048576) {
      return `${(bytes / 1048576).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans py-12 px-6 sm:px-8">
      <TrackLogin email={session.user.email || ""} />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white border border-slate-200 p-8 rounded shadow-sm">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-brand-bronze font-semibold">
              Secured Stakeholder Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-brand-slate-900 leading-tight">
              Investor & Board Workspace
            </h1>
            <p className="text-xs text-brand-text-muted">
              Session: <strong className="text-brand-slate-900">{session.user.email}</strong> | Role: <span className="uppercase font-semibold text-brand-slate-900">{userRole}</span>
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="secondary" size="sm" className="uppercase tracking-wider text-[10px] font-bold">
              Sign Out Session
            </Button>
          </form>
        </div>

        {/* Warning/Info Banner */}
        {isDbOffline && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
            <p className="text-xs text-amber-800">
              <strong>Database Offline Mode</strong>: Displaying verified document templates. Inquiries and file downloads will fallback to demo endpoints.
            </p>
          </div>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>Security Notice:</strong> Document visibility is restricted programmatically based on credentials. Request parameters are checked server-side. Downloading confidential files requires appropriate authorization.
          </p>
        </div>

        {/* Search and Navigation Toolbar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 p-6 rounded shadow-sm space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-brand-slate-900 font-bold border-b border-slate-100 pb-2">
                Filter by Category
              </h3>
              <nav className="flex flex-col space-y-1 text-xs">
                <Link
                  href="/investor-portal"
                  className={`px-3 py-2 rounded transition-colors font-medium ${
                    !category
                      ? "bg-brand-slate-900 text-white font-semibold"
                      : "text-brand-text-muted hover:bg-slate-50 hover:text-brand-slate-900"
                  }`}
                >
                  All Categories
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/investor-portal?category=${encodeURIComponent(cat)}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                    className={`px-3 py-2 rounded transition-colors font-medium truncate ${
                      category.toLowerCase() === cat.toLowerCase()
                        ? "bg-brand-slate-900 text-white font-semibold"
                        : "text-brand-text-muted hover:bg-slate-50 hover:text-brand-slate-900"
                    }`}
                  >
                    {cat}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Documents Browser Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Input Bar */}
            <div className="bg-white border border-slate-200 p-4 rounded shadow-sm flex flex-col sm:flex-row gap-3">
              <form method="GET" action="/investor-portal" className="flex-1 flex gap-2 w-full">
                {category && <input type="hidden" name="category" value={category} />}
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search file name, report content..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-bronze bg-slate-50/50"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-slate-900 hover:bg-brand-slate-800 text-white text-xs font-semibold rounded uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Search
                </button>
              </form>
              {search && (
                <Link
                  href={`/investor-portal${category ? `?category=${encodeURIComponent(category)}` : ""}`}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-brand-text-muted text-xs font-semibold rounded text-center uppercase tracking-wider transition-colors"
                >
                  Clear Filter
                </Link>
              )}
            </div>

            {/* Document List */}
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-sm font-serif font-semibold text-brand-slate-900">
                  Document Listings ({filteredDocs.length} items)
                </h3>
              </div>

              {filteredDocs.length === 0 ? (
                <div className="p-12 text-center text-xs text-brand-text-muted">
                  No documents found matching your filters.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredDocs.map((doc) => {
                    const allowed = hasAccess(doc);

                    return (
                      <div
                        key={doc.id}
                        className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600 border border-slate-200 uppercase tracking-wide">
                              {doc.category}
                            </span>
                            {doc.isPrivate ? (
                              <span className="inline-flex items-center rounded bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-700 border border-amber-200 uppercase tracking-wide">
                                Private Secure
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                                Public File
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-brand-slate-900">{doc.title}</h4>
                          <p className="text-xs text-slate-400">
                            Date Uploaded: {doc.createdAt.toLocaleDateString()} | Size: {formatSize(doc.fileSize)}
                          </p>
                        </div>

                        <div>
                          {allowed ? (
                            <DownloadButton
                              href={doc.isPrivate ? `/api/documents/${doc.id}/download` : doc.fileUrl}
                              documentTitle={doc.title}
                              category={doc.category}
                              isPrivate={doc.isPrivate}
                              className="inline-flex items-center gap-1.5 px-4 py-2 border border-brand-slate-900 bg-brand-slate-900 hover:bg-brand-slate-800 text-white text-xs font-semibold rounded transition-colors uppercase tracking-wider cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                                />
                              </svg>
                              Download PDF
                            </DownloadButton>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-400 text-xs font-semibold rounded border border-slate-200 cursor-not-allowed uppercase tracking-wider">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                                />
                              </svg>
                              Restricted (Board Only)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
