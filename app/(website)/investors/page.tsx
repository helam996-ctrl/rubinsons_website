import { prisma } from "@/lib/db/client";
import type { Metadata } from "next";
import DownloadButton from "@/components/analytics/DownloadButton";
import TrackCtaLink from "@/components/analytics/TrackCtaLink";

export const metadata: Metadata = {
  title: "Investor Relations | Rubinsons Group",
  description: "Explore the investment framework, corporate structure, and growth roadmap of Rubinsons Private Limited.",
};

interface PublicDocItem {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileSize: number;
}

export default async function InvestorsOverviewPage() {
  let publicDocs: PublicDocItem[] = [];
  let isDbOffline = false;

  try {
    const docs = await prisma.investorDocument.findMany({
      where: { isPrivate: false },
      orderBy: { order: "asc" },
    });
    publicDocs = docs.map(d => ({
      id: d.id,
      title: d.title,
      category: d.category,
      fileUrl: d.fileUrl,
      fileSize: d.fileSize,
    }));
  } catch {
    isDbOffline = true;
    publicDocs = [
      {
        id: "pub-1",
        title: "Rubinsons Group Corporate Profile 2026",
        category: "Corporate Profile",
        fileUrl: "/uploads/Rubinsons_Group_Corporate_Profile_2026.pdf",
        fileSize: 3355443, // ~3.2 MB
      },
      {
        id: "pub-2",
        title: "Public Governance Framework & Charter",
        category: "Governance",
        fileUrl: "/uploads/Public_Governance_Framework.pdf",
        fileSize: 1048576, // ~1.0 MB
      },
      {
        id: "pub-3",
        title: "Sustainability & Environmental Impact Report",
        category: "ESG Report",
        fileUrl: "/uploads/ESG_Report_2025.pdf",
        fileSize: 1887436, // ~1.8 MB
      },
    ];
  }

  const formatSize = (bytes: number) => {
    if (bytes >= 1048576) {
      return `${(bytes / 1048576).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <main className="max-w-7xl mx-auto px-6 sm:px-8 py-24 space-y-20 font-sans">
      {/* Editorial Header */}
      <div className="max-w-3xl space-y-6">
        <span className="text-xs uppercase tracking-widest text-brand-bronze font-semibold">
          Financial Stewardship
        </span>
        <h1 className="text-5xl sm:text-6xl font-serif font-medium text-brand-slate-900 tracking-tight leading-tight">
          Investor Relations & Strategic Growth
        </h1>
        <div className="h-0.5 w-20 bg-brand-bronze"></div>
        <p className="text-base sm:text-lg text-brand-text-muted leading-relaxed">
          At Rubinsons Group, we manage capital with strict long-term discipline. 
          Through institutional excellence, multi-sector diversification, and active local leadership, 
          we compile value that spans generations.
        </p>
      </div>

      {/* Strategic Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="border border-slate-200 p-8 bg-white space-y-4 rounded">
          <div className="text-brand-bronze text-sm font-semibold tracking-wider font-mono">01 / DISCIPLINED CAPITAL</div>
          <h3 className="text-xl font-serif font-medium text-brand-slate-900">Conservative Allocation</h3>
          <p className="text-xs text-brand-text-muted leading-relaxed">
            Prioritizing sound debt-to-equity frameworks, high cash conversions, and conservative project financing models across all commercial divisions.
          </p>
        </div>
        <div className="border border-slate-200 p-8 bg-white space-y-4 rounded">
          <div className="text-brand-bronze text-sm font-semibold tracking-wider font-mono">02 / OPERATIONAL FOCUS</div>
          <h3 className="text-xl font-serif font-medium text-brand-slate-900">Infrastructure Led</h3>
          <p className="text-xs text-brand-text-muted leading-relaxed">
            Investing in robust asset classes—builders, infrastructure, public utilities, and distribution channels—backed by physical capacity.
          </p>
        </div>
        <div className="border border-slate-200 p-8 bg-white space-y-4 rounded">
          <div className="text-brand-bronze text-sm font-semibold tracking-wider font-mono">03 / STEWARDSHIP</div>
          <h3 className="text-xl font-serif font-medium text-brand-slate-900">Governance Integrity</h3>
          <p className="text-xs text-brand-text-muted leading-relaxed">
            Led by a distinguished board of directors enforcing rigorous third-party audits, ESG standards, and transparency metrics.
          </p>
        </div>
      </div>

      {/* Secured Portal callout */}
      <div className="border border-slate-200 rounded p-8 sm:p-12 bg-white grid grid-cols-1 lg:grid-cols-3 gap-8 items-center shadow-sm">
        <div className="lg:col-span-2 space-y-3">
          <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800 border border-slate-200 uppercase tracking-widest">
            Restricted
          </span>
          <h2 className="text-3xl font-serif font-medium text-brand-slate-900">
            Shareholder & Board Workspace
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed max-w-xl">
            Authorized investment partners, institutional analysts, and board members can sign in using their Google Credentials to view confidential board records, quarterly audits, and corporate prospectuses.
          </p>
        </div>
        <div className="lg:text-right">
          <TrackCtaLink
            href="/investor-portal"
            location="CTA_Section"
            className="w-full lg:w-auto text-center px-6 py-3.5 bg-brand-slate-900 text-white text-xs font-semibold rounded hover:bg-brand-slate-800 transition-colors uppercase tracking-widest inline-block border border-brand-slate-900"
          >
            Access Secured Workspace
          </TrackCtaLink>
        </div>
      </div>

      {/* Public Documents Registry */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand-bronze font-semibold">
              Registry
            </span>
            <h2 className="text-3xl font-serif font-medium text-brand-slate-900 mt-1">
              Public Disclosures & Reports
            </h2>
          </div>
          {isDbOffline && (
            <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded font-medium">
              Offline Demo Mode
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicDocs.map((doc) => (
            <div
              key={doc.id}
              className="border border-slate-200 p-6 bg-slate-50/50 hover:bg-white transition-colors flex flex-col justify-between h-48 rounded"
            >
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-wider bg-slate-200/60 px-2 py-0.5 rounded text-slate-600 font-semibold border border-slate-200 inline-block">
                  {doc.category}
                </span>
                <h4 className="text-sm font-semibold text-brand-slate-900 line-clamp-2">
                  {doc.title}
                </h4>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200/60 text-xs">
                <span className="text-slate-400 font-mono text-[10px]">
                  PDF ({formatSize(doc.fileSize)})
                </span>
                <DownloadButton
                  href={doc.fileUrl}
                  documentTitle={doc.title}
                  category={doc.category}
                  isPrivate={false}
                  className="text-brand-bronze hover:text-brand-bronze-dark font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Download
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </DownloadButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
