import SiteHeader from "@/components/navigation/SiteHeader";
import Footer from "@/components/navigation/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

interface WebsiteLayoutProps {
  children: React.ReactNode;
}

export default function WebsiteLayout({ children }: WebsiteLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      {/* Spacer to push content down from sticky transparent navbar */}
      <div className="flex-1 flex flex-col pt-24">
        {children}
      </div>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
