import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";
import Link from "next/link";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  organisation?: string | null;
  type: string;
  message: string;
  status: string;
  createdAt: Date;
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Safe metrics retrieval
  const stats = {
    totalInquiries: 0,
    newInquiries: 0,
    totalConversations: 0,
    recentInquiries: [] as Inquiry[],
    conversionRate: 0,
    intentDistribution: [] as { name: string; count: number }[],
    statusBreakdown: {
      NEW: 0,
      CONTACTED: 0,
      IN_PROGRESS: 0,
      CLOSED: 0,
    },
  };
  let isDbOffline = false;

  try {
    const [
      totalInquiries,
      newInquiries,
      totalConversations,
      recentInquiries,
      chatbotInquiries,
      messageIntents,
      intentRecords,
      statusGroups
    ] = await Promise.all([
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: "NEW" } }),
      prisma.conversation.count(),
      prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.inquiry.count({ where: { source: "CHATBOT" } }),
      prisma.message.groupBy({
        by: ['intentId'],
        _count: { id: true },
        where: { sender: "BOT", intentId: { not: null } },
      }),
      prisma.chatbotIntent.findMany({ select: { id: true, name: true } }),
      prisma.inquiry.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    stats.totalInquiries = totalInquiries;
    stats.newInquiries = newInquiries;
    stats.totalConversations = totalConversations;
    stats.recentInquiries = recentInquiries;
    stats.conversionRate = totalConversations > 0 ? parseFloat(((chatbotInquiries / totalConversations) * 100).toFixed(1)) : 0;

    const intentMap = new Map(intentRecords.map(i => [i.id, i.name]));
    stats.intentDistribution = messageIntents.map(m => ({
      name: intentMap.get(m.intentId || "") || "General",
      count: m._count.id,
    }));

    const statusMap = { NEW: 0, CONTACTED: 0, IN_PROGRESS: 0, CLOSED: 0 };
    statusGroups.forEach(g => {
      if (g.status in statusMap) {
        statusMap[g.status as keyof typeof statusMap] = g._count.id;
      }
    });
    stats.statusBreakdown = statusMap;
  } catch {
    isDbOffline = true;
    stats.totalInquiries = 28;
    stats.newInquiries = 3;
    stats.totalConversations = 120;
    stats.recentInquiries = [
      {
        id: "mock-i1",
        name: "Vikram Malhotra",
        email: "vikram@malhotraholdings.in",
        type: "INVESTOR",
        message: "Requesting prospectuses...",
        status: "NEW",
        createdAt: new Date(),
      },
    ];
    stats.conversionRate = 14.2;
    stats.intentDistribution = [
      { name: "INVESTOR", count: 24 },
      { name: "BUSINESS", count: 42 },
      { name: "LEADERSHIP", count: 15 },
      { name: "IMPACT", count: 18 },
      { name: "CONTACT", count: 35 },
    ];
    stats.statusBreakdown = {
      NEW: 3,
      CONTACTED: 5,
      IN_PROGRESS: 2,
      CLOSED: 18,
    };
  }

  return (
    <main className="p-8 space-y-8 overflow-y-auto flex-1 font-sans">
      {/* Title Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-sans font-medium">
          Management
        </span>
        <h1 className="text-4xl font-serif font-medium text-brand-slate-900 mt-1">
          Dashboard Overview
        </h1>
      </div>

      {/* Database Offline Warning Alert */}
      {isDbOffline && (
        <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded-r shadow-sm">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Database Connectivity Status: Offline
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                The local PostgreSQL server is unreachable. Admin dashboard is running on offline fallback profiles. Apply database migrations to restore live dashboard metrics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Inquiries */}
        <div className="bg-white border border-slate-200 rounded p-6 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
            Total Inquiries
          </p>
          <p className="text-3xl font-serif font-medium text-brand-slate-900 mt-3">
            {stats.totalInquiries}
          </p>
        </div>

        {/* New Inquiries */}
        <div className="bg-white border border-slate-200 rounded p-6 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
            Unresolved (New)
          </p>
          <p className="text-3xl font-serif font-medium text-brand-slate-900 mt-3 text-brand-bronze-dark">
            {stats.newInquiries}
          </p>
        </div>

        {/* Chatbot Conversations */}
        <div className="bg-white border border-slate-200 rounded p-6 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
            Chatbot Conversations
          </p>
          <p className="text-3xl font-serif font-medium text-brand-slate-900 mt-3">
            {stats.totalConversations}
          </p>
        </div>

        {/* Inquiry Conversion Rate */}
        <div className="bg-white border border-slate-200 rounded p-6 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
            Chat-to-Inquiry Conversion
          </p>
          <p className="text-3xl font-serif font-medium text-brand-slate-900 mt-3">
            {stats.conversionRate}%
          </p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chatbot Intent Trigger Distribution */}
        <div className="bg-white border border-slate-200 rounded p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-serif font-medium text-brand-slate-900 border-b border-slate-100 pb-3">
            AI Chatbot Intent Trigger Distribution
          </h3>
          <div className="space-y-4 pt-2">
            {stats.intentDistribution.length === 0 ? (
              <p className="text-xs text-brand-text-muted text-center py-4">No triggers logged yet.</p>
            ) : (
              stats.intentDistribution.map((item) => {
                const totalTriggers = stats.intentDistribution.reduce((acc, curr) => acc + curr.count, 0);
                const percent = totalTriggers > 0 ? (item.count / totalTriggers) * 100 : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-brand-slate-900">
                      <span>{item.name}</span>
                      <span>{item.count} hits ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                      <div
                        className="bg-brand-bronze h-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Inquiry Status Breakdown */}
        <div className="bg-white border border-slate-200 rounded p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-serif font-medium text-brand-slate-900 border-b border-slate-100 pb-3">
            Inquiry Status Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="border border-slate-100 bg-slate-50/50 p-4 rounded text-center">
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded uppercase">
                New Leads
              </span>
              <p className="text-2xl font-semibold text-brand-slate-900 mt-2">
                {stats.statusBreakdown.NEW}
              </p>
            </div>
            <div className="border border-slate-100 bg-slate-50/50 p-4 rounded text-center">
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 rounded uppercase">
                Contacted
              </span>
              <p className="text-2xl font-semibold text-brand-slate-900 mt-2">
                {stats.statusBreakdown.CONTACTED}
              </p>
            </div>
            <div className="border border-slate-100 bg-slate-50/50 p-4 rounded text-center">
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 rounded uppercase">
                In Progress
              </span>
              <p className="text-2xl font-semibold text-brand-slate-900 mt-2">
                {stats.statusBreakdown.IN_PROGRESS}
              </p>
            </div>
            <div className="border border-slate-100 bg-slate-50/50 p-4 rounded text-center">
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded uppercase">
                Resolved
              </span>
              <p className="text-2xl font-semibold text-brand-slate-900 mt-2">
                {stats.statusBreakdown.CLOSED}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Inquiries List */}
      <div className="bg-white border border-slate-200 rounded shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-serif font-medium text-brand-slate-900">
            Recent Submissions
          </h3>
          <Link
            href="/admin/inquiries"
            className="text-xs font-sans font-medium text-brand-bronze-dark hover:underline"
          >
            View All Inquiries &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-100 font-sans">
          {stats.recentInquiries.length === 0 ? (
            <div className="p-8 text-center text-sm text-brand-text-muted">
              No inquiries found. Submit some entries via public forms to populate logs.
            </div>
          ) : (
            stats.recentInquiries.map((inq: Inquiry) => (
              <div key={inq.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="text-sm font-semibold text-brand-slate-900">{inq.name}</h4>
                  <p className="text-xs text-brand-text-muted mt-0.5">{inq.email} &bull; {inq.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {inq.status}
                  </span>
                  <Link
                    href={`/admin/inquiries?id=${inq.id}`}
                    className="text-xs text-brand-bronze-dark font-semibold hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
