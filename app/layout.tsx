import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rubinsons Group",
    template: "%s | Rubinsons Group",
  },
  description: "Diversified family-backed Indian corporate enterprise operating across infrastructure, contracting, education, healthcare, and digital media.",
  metadataBase: new URL("https://rubinsons.com"),
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans" suppressHydrationWarning>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}

