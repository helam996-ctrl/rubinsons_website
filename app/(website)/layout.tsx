import SiteHeader, { DBBusiness } from "@/components/navigation/SiteHeader";
import Footer from "@/components/navigation/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

interface WebsiteLayoutProps {
  children: React.ReactNode;
}

export default async function WebsiteLayout({ children }: WebsiteLayoutProps) {
  let businesses: DBBusiness[] = [];
  try {
    businesses = await prisma.business.findMany({
      where: { status: "ACTIVE" },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        imageUrl: true,
        status: true,
        order: true,
      }
    });
  } catch (err) {
    console.error("[WebsiteLayout] Failed to load businesses from database:", err);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader dbBusinesses={businesses} />
      {/* Spacer to push content down from sticky transparent navbar */}
      <div className="flex-1 flex flex-col pt-24">
        {children}
      </div>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
