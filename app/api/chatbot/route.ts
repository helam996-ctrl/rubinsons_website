import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/auth";
import { isRateLimited } from "@/lib/security/rate-limit";

const FALLBACK_MESSAGE = "I don't have that verified detail in our records. Would you like me to connect you with our corporate office via an inquiry?";

// Helper to normalize user text
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting check (max 5 requests per minute)
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (isRateLimited(ip, 5, 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "Message and sessionId are required" },
        { status: 400 }
      );
    }

    const normalizedMsg = normalizeText(message);
    const session = await auth();
    const isAuthenticated = !!session;

    interface KeywordItem {
      keyword: string;
    }
    interface QuickActionItem {
      id: string;
      label: string;
      promptText: string;
      order: number;
    }
    interface IntentItem {
      id?: string;
      name: string;
      description: string | null;
      responseGuidance: string;
      priority: number;
      keywords: KeywordItem[];
      quickActions?: QuickActionItem[];
    }
    interface BusinessItem {
      slug: string;
      title: string;
      shortDescription: string;
    }
    interface LeaderItem {
      name: string;
      role: string;
    }
    interface PrivateDocItem {
      id: string;
      fileKey: string;
    }
    interface MessageItem {
      sender: "USER" | "BOT";
      content: string;
    }
    interface ConversationItem {
      id: string;
      messages: MessageItem[];
    }

    // 1. Get or create Conversation session from DB
    let conversation: ConversationItem | null = null;
    let isDbOffline = false;

    try {
      const dbConv = await prisma.conversation.findUnique({
        where: { sessionId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });

      if (dbConv) {
        conversation = {
          id: dbConv.id,
          messages: dbConv.messages.map(m => ({ sender: m.sender as "USER" | "BOT", content: m.content })),
        };
      } else {
        const newConv = await prisma.conversation.create({
          data: { sessionId },
          include: { messages: { orderBy: { createdAt: "asc" } } },
        });
        conversation = {
          id: newConv.id,
          messages: newConv.messages.map(m => ({ sender: m.sender as "USER" | "BOT", content: m.content })),
        };
      }
    } catch {
      console.error("Database offline during chatbot conversation fetching");
      isDbOffline = true;
    }

    // 2. Fetch context variables from Database
    let intents: IntentItem[] = [];
    let businessDivisions: BusinessItem[] = [];
    let leaders: LeaderItem[] = [];
    let privateDocs: PrivateDocItem[] = [];

    if (!isDbOffline) {
      try {
        intents = await prisma.chatbotIntent.findMany({
          where: { enabled: true },
          include: { keywords: true, quickActions: true },
        });
        businessDivisions = await prisma.business.findMany({ where: { status: "ACTIVE" } });
        leaders = await prisma.leadership.findMany({ orderBy: { order: "asc" } });
        privateDocs = await prisma.investorDocument.findMany({ where: { isPrivate: true } });
      } catch (e) {
        console.error("Database query failed during chatbot processing:", e);
        isDbOffline = true;
      }
    }

    // If DB is offline, load mock defaults for local intent checking
    if (isDbOffline || intents.length === 0) {
      intents = [
        {
          name: "INVESTOR",
          description: "Handles inquiries about investment, partnerships, and group strategy.",
          responseGuidance: "Provide guidance on the Rubinsons investment philosophy. Prompt user to visit the /investors page or submit an investor inquiry form. Under no circumstances quote return metrics or valuation.",
          priority: 10,
          keywords: [{ keyword: "invest" }, { keyword: "funding" }, { keyword: "shares" }, { keyword: "equity" }, { keyword: "partnership" }, { keyword: "capital" }],
        },
        {
          name: "BUSINESS",
          description: "Handles requests for sector details and dynamic business offerings.",
          responseGuidance: "Explain the active sectors of Rubinsons: Builders & Infrastructure, Contracting, ICH Dine Academia, Healthcare, and Digital Media. Guide user to browse sector-specific pages.",
          priority: 8,
          keywords: [{ keyword: "builders" }, { keyword: "construction" }, { keyword: "contracting" }, { keyword: "dine" }, { keyword: "academia" }, { keyword: "healthcare" }, { keyword: "shanti" }, { keyword: "digital" }, { keyword: "sectors" }],
        },
        {
          name: "LEADERSHIP",
          description: "Explains board members, Managing Director, and directors structure.",
          responseGuidance: "State the leadership team: Dr. Rudra Bhanu (Managing Director), Bindu Sharma, Shreyashi Sharma, Nipun Sharma, and Stuti Sharma (Directors). Avoid inventing biographies.",
          priority: 6,
          keywords: [{ keyword: "director" }, { keyword: "board" }, { keyword: "bhanu" }, { keyword: "rudra" }, { keyword: "sharma" }, { keyword: "governance" }, { keyword: "management" }],
        },
        {
          name: "IMPACT",
          description: "Explains CSR work and the independent Rudra Vahini Foundation.",
          responseGuidance: "Introduce the Rudra Vahini Foundation as an independent social impact organization focused on rural education, community welfare, and skill empowerment. Emphasize it is not a commercial division.",
          priority: 7,
          keywords: [{ keyword: "foundation" }, { keyword: "charity" }, { keyword: "social" }, { keyword: "welfare" }, { keyword: "csr" }, { keyword: "ngo" }],
        },
        {
          name: "CONTACT",
          description: "Routes users to support channels and recruitment pipelines.",
          responseGuidance: "Provide links to submit a public inquiry or contact the administration team. Mention email contact points and WhatsApp Click-to-Chat shortcuts.",
          priority: 5,
          keywords: [{ keyword: "contact" }, { keyword: "job" }, { keyword: "apply" }, { keyword: "careers" }, { keyword: "email" }, { keyword: "phone" }, { keyword: "office" }, { keyword: "location" }, { keyword: "address" }],
        },
      ];

      businessDivisions = [
        { slug: "builders-infrastructure", title: "Rubinsons Builders & Infrastructure", shortDescription: "Civil construction, engineering, residential and commercial infrastructure." },
        { slug: "contracting", title: "Rubinsons Contracting", shortDescription: "Private and public sector contracting services, procurement, and project execution." },
        { slug: "ich-dine-academia", title: "ICH Dine Academia", shortDescription: "Education, skill development, hospitality training, vocational programs, and professional events." },
        { slug: "healthcare", title: "Healthcare / Shanti Medical Hall", shortDescription: "Distribution of medical supplies, retail pharmaceuticals, and healthcare consulting." },
        { slug: "digital-media-marketing", title: "Rubinsons Digital Media & Marketing", shortDescription: "Digital advertising, consulting, brand strategy, e-commerce support, and media creation." },
      ];

      leaders = [
        { name: "Dr. Rudra Bhanu", role: "Managing Director" },
        { name: "Bindu Sharma", role: "Director" },
        { name: "Shreyashi Sharma", role: "Director" },
        { name: "Nipun Sharma", role: "Director" },
        { name: "Stuti Sharma", role: "Director" },
      ];
    }

    // 3. Match Intent Keywords
    let matchedIntent = null;
    let highestPriority = -1;

    for (const intent of intents) {
      const hasKeyword = intent.keywords.some((kw: KeywordItem) =>
        normalizedMsg.includes(normalizeText(kw.keyword))
      );

      if (hasKeyword && intent.priority > highestPriority) {
        matchedIntent = intent;
        highestPriority = intent.priority;
      }
    }

    // 4. Construct Prompt Context
    let promptContext = "GENERAL CONTEXT:\n";
    promptContext += "Rubinsons Group is a serious Indian corporate group preparing for long-term expansion and institutional investor engagement.\n";
    
    if (matchedIntent) {
      promptContext += `CURRENT INTENT PATHWAY: ${matchedIntent.name}\n`;
      promptContext += `GUIDANCE FOR CURRENT TOPIC: ${matchedIntent.responseGuidance}\n\n`;
    }

    // Sector context
    promptContext += "VERIFIED BUSINESS SECTORS:\n";
    businessDivisions.forEach((b) => {
      promptContext += `- ${b.title}: ${b.shortDescription} (Webpage: /businesses/${b.slug})\n`;
    });

    // Leadership context
    promptContext += "\nVERIFIED BOARD OF DIRECTORS:\n";
    leaders.forEach((l) => {
      promptContext += `- ${l.name} (${l.role})\n`;
    });

    // Social Impact context
    promptContext += "\nVERIFIED SOCIAL IMPACT:\n";
    promptContext += "- Rudra Vahini Foundation is an independent social impact NGO focused on rural education and community welfare. It is not a commercial business unit.\n";

    // Contact info
    promptContext += "\nVERIFIED CONTACT CHANNELS:\n";
    promptContext += "- Email: contact@rubinsons.com\n- Public contact form: /contact\n- Secure portal: /investor-portal\n";

    // 5. Format Conversation History (last 4 messages)
    let historyText = "";
    const historyMessages = conversation?.messages?.slice(-4) || [];
    historyMessages.forEach((msg: MessageItem) => {
      const sender = msg.sender === "USER" ? "User" : "Assistant";
      historyText += `${sender}: ${msg.content}\n`;
    });

    // 6. Call LLM Layer
    let responseText = "";
    const apiKey = process.env.LLM_API_KEY;

    if (apiKey) {
      try {
        const prompt = `System: You are the Rubinsons Assistant, the verified AI helper for the Rubinsons Group.
Rules:
- Speak in a professional, polite, and restrained corporate voice.
- Base your answers ONLY on the VERIFIED CONTEXT provided below.
- Do NOT use external pre-training knowledge to describe Rubinsons' statistics, projects, or financials.
- If the CONTEXT does not contain the answer to a question, politely say: "${FALLBACK_MESSAGE}"
- NEVER invent valuation, revenues, projects, employees, or awards.

VERIFIED CONTEXT:
${promptContext}

CONVERSATION HISTORY:
${historyText}
User: ${message}
Assistant:`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const json = await response.json();
          responseText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } else {
          console.error("Gemini API call failed status:", response.status);
        }
      } catch (error) {
        console.error("Gemini API calling exception:", error);
      }
    }

    // Offline / Fallback response generation
    if (!responseText) {
      if (matchedIntent) {
        if (matchedIntent.name === "INVESTOR") {
          responseText = "Rubinsons Group prioritizes disciplined capital allocation, multi-generational value creation, and strong corporate governance. Authorized stakeholders can access our secure reports in the /investor-portal or request our investor prospectus pack.";
        } else if (matchedIntent.name === "BUSINESS") {
          responseText = "Rubinsons Group operates across 5 key sectors: Builders & Infrastructure, Contracting, ICH Dine Academia, Healthcare (Shanti Medical Hall), and Digital Media. You can explore details for each division on our /businesses page.";
        } else if (matchedIntent.name === "LEADERSHIP") {
          responseText = "Our Group is governed by a distinguished board: Dr. Rudra Bhanu (Managing Director), alongside Directors Bindu Sharma, Shreyashi Sharma, Nipun Sharma, and Stuti Sharma. Biography details can be updated via the CMS.";
        } else if (matchedIntent.name === "IMPACT") {
          responseText = "Rudra Vahini Foundation is our independent social impact wing, dedicated to rural education, community welfare, and vocational skill empowerment. It operates as a separate non-profit entity.";
        } else {
          responseText = "To submit an inquiry or speak with our corporate office, you can write to contact@rubinsons.com, fill out our public inquiry form at /contact, or request assistance here.";
        }
      } else {
        responseText = FALLBACK_MESSAGE;
      }
    }

    // 7. Safety & Private Document Filters
    // Financial safety search filter
    const lowerResponse = responseText.toLowerCase();
    const isViolatingFinancials =
      lowerResponse.includes("percent return") ||
      lowerResponse.includes("guarantee profit") ||
      lowerResponse.includes("investment yield") ||
      lowerResponse.includes("guaranteed return");

    if (isViolatingFinancials) {
      responseText = "We operate strictly under conservative financial stewardship. We do not guarantee returns or quote speculative metrics. For official inquiries, please contact our Investor Relations office.";
    }

    // Private files link filter for anonymous users
    if (!isAuthenticated) {
      privateDocs.forEach((doc: PrivateDocItem) => {
        // Look for file keys or URLs or titles of private docs
        const idRegex = new RegExp(doc.id, "gi");
        const keyRegex = new RegExp(doc.fileKey, "gi");
        if (idRegex.test(responseText) || keyRegex.test(responseText)) {
          responseText = responseText.replace(idRegex, "[Link Restricted]").replace(keyRegex, "[Link Restricted]");
          responseText += "\n\n(Note: Some document links in this response are locked. Please log in to the Secured Investor Portal to view confidential board publications.)";
        }
      });
    }

    // 8. Escalation Falling Threshold (Show contact form if fallback met twice)
    let showInquiryForm = false;
    if (responseText.includes("don't have that verified detail") || responseText.includes(FALLBACK_MESSAGE)) {
      // Check if last bot message was also a fallback message
      const lastBotMessage = [...historyMessages].reverse().find((m: MessageItem) => m.sender === "BOT");
      if (
        lastBotMessage &&
        (lastBotMessage.content.includes("don't have that verified detail") ||
          lastBotMessage.content.includes(FALLBACK_MESSAGE))
      ) {
        showInquiryForm = true;
      }
    }

    // 9. Save Messages to database (Prisma logging)
    if (!isDbOffline && conversation) {
      try {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            sender: "USER",
            content: message,
          },
        });

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            sender: "BOT",
            content: responseText,
            intentId: matchedIntent?.id || null,
          },
        });
      } catch (e) {
        console.error("Prisma error logging chatbot conversation messages:", e);
      }
    }

    return NextResponse.json({
      reply: responseText,
      showInquiryForm,
      quickActions: matchedIntent?.quickActions || [],
    });
  } catch (error) {
    console.error("Global Chatbot API Route exception:", error);
    return NextResponse.json(
      { error: { message: "Internal server error", code: "ERR_SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
