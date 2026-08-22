import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";
import ChatbotTuningClient from "@/components/admin/ChatbotTuningClient";

interface Keyword {
  id: string;
  keyword: string;
}

interface QuickAction {
  id: string;
  label: string;
  promptText: string;
  order: number;
}

interface ChatbotIntent {
  id: string;
  name: string;
  description: string | null;
  responseGuidance: string;
  priority: number;
  enabled: boolean;
  keywords: Keyword[];
  quickActions: QuickAction[];
}

export default async function AdminChatbotPage() {
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

  let intents: ChatbotIntent[] = [];
  let isDbOffline = false;

  try {
    const records = await prisma.chatbotIntent.findMany({
      orderBy: { priority: "desc" },
      include: { keywords: true, quickActions: true },
    });
    intents = records.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      responseGuidance: r.responseGuidance,
      priority: r.priority,
      enabled: r.enabled,
      keywords: r.keywords.map(k => ({ id: k.id, keyword: k.keyword })),
      quickActions: r.quickActions.map(q => ({ id: q.id, label: q.label, promptText: q.promptText, order: q.order })),
    }));
  } catch {
    isDbOffline = true;
    intents = [
      {
        id: "mock-intent-1",
        name: "INVESTOR",
        description: "Handles inquiries about investment, partnerships, and group strategy.",
        responseGuidance: "Provide guidance on the Rubinsons investment philosophy. Prompt user to visit the /investors page or submit an investor inquiry form. Under no circumstances quote return metrics or valuation.",
        priority: 10,
        enabled: true,
        keywords: [
          { id: "k-1", keyword: "invest" },
          { id: "k-2", keyword: "shares" },
          { id: "k-3", keyword: "funding" },
        ],
        quickActions: [
          { id: "q-1", label: "Request Investor Package", promptText: "I want to request the investor package.", order: 1 },
        ],
      },
      {
        id: "mock-intent-2",
        name: "BUSINESS",
        description: "Handles requests for sector details and dynamic business offerings.",
        responseGuidance: "Explain the active sectors of Rubinsons: Builders & Infrastructure, Contracting, ICH Dine Academia, Healthcare, and Digital Media. Guide user to browse sector-specific pages.",
        priority: 8,
        enabled: true,
        keywords: [
          { id: "k-4", keyword: "builders" },
          { id: "k-5", keyword: "construction" },
          { id: "k-6", keyword: "hospitality" },
        ],
        quickActions: [
          { id: "q-2", label: "Explore Sectors", promptText: "Tell me about Rubinsons business sectors.", order: 2 },
        ],
      },
      {
        id: "mock-intent-3",
        name: "LEADERSHIP",
        description: "Explains board members, Managing Director, and directors structure.",
        responseGuidance: "State the leadership team: Dr. Rudra Bhanu (Managing Director), Bindu Sharma, Shreyashi Sharma, Nipun Sharma, and Stuti Sharma (Directors). Avoid inventing biographies.",
        priority: 6,
        enabled: true,
        keywords: [
          { id: "k-7", keyword: "director" },
          { id: "k-8", keyword: "board" },
        ],
        quickActions: [],
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
          AI Chatbot Tuning settings
        </h1>
      </div>

      {/* Warning banner for database offline */}
      {isDbOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
          <p className="text-xs text-amber-800">
            <strong>Database Offline Mode</strong>: Displaying verified chatbot intents. Adding keywords, suggestion pills, and updating system prompts are locked until database connection is established.
          </p>
        </div>
      )}

      {/* Client Tuning Manager */}
      <ChatbotTuningClient initialIntents={intents} isDbOffline={isDbOffline} />
    </main>
  );
}
