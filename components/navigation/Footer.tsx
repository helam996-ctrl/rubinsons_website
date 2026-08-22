"use client";

import { useState } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Newsletter states
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Cookie preference states
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  const [marketingCookies, setMarketingCookies] = useState(false);
  const [showCookieToast, setShowCookieToast] = useState(false);

  // AI Summary modal state
  const [showAiModal, setShowAiModal] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    setNewsError(null);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Newsletter Subscriber",
          email: email,
          message: "Subscribe to our newsletter for the latest news straight to your inbox.",
          type: "NEWSLETTER",
        }),
      });

      if (response.ok) {
        setSubscribed(true);
        setEmail("");
      } else {
        const data = await response.json();
        setNewsError(data.error?.message || "Something went wrong. Please try again.");
      }
    } catch {
      setNewsError("Failed to subscribe. Please try again later.");
    } finally {
      setSubscribing(false);
    }
  };

  const triggerChatbotQuery = () => {
    // Open the modal for instant viewing
    setShowAiModal(true);
    // Also trigger the chatbot widget
    window.dispatchEvent(
      new CustomEvent("open-chatbot-with-query", {
        detail: "Please give me a summary of Rubinsons Group.",
      })
    );
  };

  const handleSaveCookiePreferences = () => {
    setShowCookieModal(false);
    setShowCookieToast(true);
    setTimeout(() => {
      setShowCookieToast(false);
    }, 4000);
  };

  return (
    <footer className="bg-brand-slate-900 text-slate-300 font-sans border-t border-brand-slate-800 relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-bronze/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-bronze/5 rounded-full blur-3xl pointer-events-none" />

      {/* Row 1: Interactive Newsletter & AI Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-12 border-b border-brand-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        
        {/* Newsletter Signup Form (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <h3 className="text-lg font-serif font-medium text-white tracking-wide">
              Subscribe to our newsletter
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              Subscribe to our newsletter for the latest news straight to your inbox.
            </p>
          </div>
          
          {subscribed ? (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded max-w-md animate-in fade-in duration-300">
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Thank you! You have successfully subscribed to our newsletter.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md">
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2.5 bg-brand-slate-900/80 border border-brand-slate-800 focus:border-brand-bronze focus:outline-none rounded text-xs text-slate-200 transition-all font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={subscribing}
                className="px-6 py-2.5 bg-brand-bronze hover:bg-white text-brand-slate-900 text-xs font-bold uppercase tracking-wider rounded transition-colors duration-300 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {subscribing ? "Submitting..." : "Submit"}
              </button>
            </form>
          )}
          {newsError && (
            <p className="text-[10px] text-red-400 font-medium animate-in fade-in duration-200">
              {newsError}
            </p>
          )}
        </div>

        {/* Ask AI Card (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-brand-slate-900/60 border border-brand-slate-800/80 p-5 rounded-lg backdrop-blur-sm flex flex-col justify-between h-full relative group hover:border-brand-bronze/30 transition-colors duration-500">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-brand-bronze font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-brand-bronze rounded-full animate-pulse" />
              AI Helper Enabled
            </span>
            <h4 className="text-sm font-serif font-medium text-white">Ask AI</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Get an instant, customized corporate overview of Rubinsons Group&apos;s global operations.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={triggerChatbotQuery}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-slate-800/80 hover:bg-brand-slate-800 border border-brand-slate-700/50 hover:border-brand-bronze text-white text-xs font-semibold rounded transition-all duration-300 cursor-pointer shadow-sm group-hover:shadow-brand-bronze/5"
            >
              <svg className="w-3.5 h-3.5 text-brand-bronze" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464a1 1 0 10-1.414-1.414l-.707.707a1 1 0 101.414 1.414l.707-.707zM5 10a1 1 0 11-2 0v1a1 1 0 112 0v-1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM12.93 17.07a1 1 0 101.414-1.414l-.707-.707a1 1 0 10-1.414 1.414l.707.707zM14 10a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Ask AI for a summary of Rubinsons Group
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Link Directories */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
        
        {/* Column 1: Careers & Programs */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest font-bold text-white border-l-2 border-brand-bronze pl-2.5">
            Careers & Programs
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <a
                href="https://careers.rubinsons.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-bronze transition-colors flex items-center gap-1 group"
              >
                <span>Careers</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </a>
            </li>
            <li>
              <a
                href="https://abglp.rubinsons.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-bronze transition-colors flex items-center gap-1 group"
              >
                <span>Rubinsons Group Leadership Programs</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </a>
            </li>
            <li>
              <a
                href="https://abgmlp.rubinsons.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-bronze transition-colors flex items-center gap-1 group"
              >
                <span>Global Manufacturing Leadership Program</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 2: Legal & Compliance */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest font-bold text-white border-l-2 border-brand-bronze pl-2.5">
            Governance
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <a
                href="https://www.rubinsons.com/compliance/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-bronze transition-colors flex items-center gap-1 group"
              >
                <span>Compliance</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.rubinsons.com/contact-us/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-bronze transition-colors flex items-center gap-1 group"
              >
                <span>Contact Us</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Privacy & Terms */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest font-bold text-white border-l-2 border-brand-bronze pl-2.5">
            Policies & Notices
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <a
                href="https://www.rubinsons.com/privacy-notice/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-bronze transition-colors"
              >
                Privacy Notice
              </a>
            </li>
            <li>
              <a
                href="https://www.rubinsons.com/cookie-notice/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-bronze transition-colors"
              >
                Cookie Notice
              </a>
            </li>
            <li>
              <a
                href="https://www.rubinsons.com/terms-and-conditions/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-bronze transition-colors"
              >
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Important Advisories */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest font-bold text-white border-l-2 border-brand-bronze pl-2.5">
            Important Advisories
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <a
                href="https://www.rubinsons.com/be-aware-of-fraudulent-job-offers/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-bronze transition-colors leading-relaxed block text-red-300 hover:text-red-200"
              >
                ⚠ Be Aware of Fraudulent Job Offers
              </a>
            </li>
            <li>
              <a
                href="https://www.rubinsons.com/discontinuation-of-banking-services/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-bronze transition-colors leading-relaxed block"
              >
                Discontinuation of Banking Services
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Row 3: Legal Disclaimers & Copyright */}
      <div className="border-t border-brand-slate-800/80 bg-black/40 py-8 px-6 sm:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-medium">
          <div>
            <p className="text-slate-400 font-sans tracking-wide">
              &copy; {currentYear} All Rights Reserved. Rubinsons Management Corporation Pvt. Ltd.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowCookieModal(true)}
              className="text-slate-400 hover:text-brand-bronze transition-colors cursor-pointer border-b border-dashed border-slate-600 hover:border-brand-bronze pb-0.5"
            >
              Cookie Preferences
            </button>
          </div>
        </div>
      </div>

      {/* 1. AI Summary Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-brand-slate-900 border border-brand-slate-800 max-w-lg w-full rounded-lg shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-bronze/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start border-b border-brand-slate-800 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-brand-bronze font-bold">
                  Corporate AI Assistant
                </span>
                <h3 className="text-lg font-serif font-medium text-white mt-0.5">
                  Rubinsons Group Overview
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="py-5 space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
              <p>
                <strong>Rubinsons Group</strong> is a premium global conglomerate, headquartered in Mumbai, India.
                It is a Fortune 500 company with a revenue of over US $65 billion.
              </p>
              <p>
                Operating in over 36 countries with 187,000+ employees, the Group is a market leader in sectors including:
              </p>
              <ul className="grid grid-cols-2 gap-2 text-[11px] bg-brand-slate-900/40 p-3 border border-brand-slate-800/60 rounded">
                <li className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 bg-brand-bronze rounded-full" />
                  Metals & Mining (Hindalco/Novelism)
                </li>
                <li className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 bg-brand-bronze rounded-full" />
                  Cement (UltraTech)
                </li>
                <li className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 bg-brand-bronze rounded-full" />
                  Textiles & Carbon Black
                </li>
                <li className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 bg-brand-bronze rounded-full" />
                  Financial Services
                </li>
                <li className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 bg-brand-bronze rounded-full" />
                  Telecom (Vodafone Idea)
                </li>
                <li className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 bg-brand-bronze rounded-full" />
                  Chemicals & Materials
                </li>
              </ul>
              <p className="text-[11px] text-slate-400 italic">
                Note: The verified AI Corporate Assistant widget has also been launched in the bottom right corner with this query.
              </p>
            </div>
            
            <div className="border-t border-brand-slate-800 pt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAiModal(false);
                  // Trigger click on chatbot widget or wait 100ms
                }}
                className="px-4 py-2 bg-brand-slate-800 hover:bg-brand-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors cursor-pointer border border-brand-slate-700"
              >
                Close Summary
              </button>
              <button
                onClick={() => {
                  setShowAiModal(false);
                  // Dispatch open chatbot event again to focus it
                  window.dispatchEvent(new CustomEvent("open-chatbot-with-query", { detail: "" }));
                }}
                className="px-4 py-2 bg-brand-bronze hover:bg-white text-brand-slate-900 text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                Open Full AI Assistant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Cookie Preferences Modal */}
      {showCookieModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-brand-slate-900 border border-brand-slate-800 max-w-md w-full rounded-lg shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-brand-slate-800 pb-3">
              <div>
                <h3 className="text-base font-serif font-medium text-white">
                  Cookie Preferences
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Manage your preferences for Rubinsons Group websites
                </p>
              </div>
              <button
                onClick={() => setShowCookieModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Option 1: Strictly Necessary (Always On) */}
              <div className="flex justify-between items-start gap-4 p-3 bg-brand-slate-900/40 border border-brand-slate-800 rounded">
                <div className="space-y-1">
                  <h4 className="font-semibold text-white">Strictly Necessary Cookies</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Required for core website capabilities, secure login, page navigation, and basic security checks. Cannot be turned off.
                  </p>
                </div>
                <span className="text-[9px] uppercase tracking-wider bg-brand-slate-800 text-brand-bronze px-2 py-1 rounded font-bold">
                  Always Active
                </span>
              </div>

              {/* Option 2: Performance & Analytics */}
              <div className="flex justify-between items-start gap-4 p-3 bg-brand-slate-900/40 border border-brand-slate-800 rounded">
                <div className="space-y-1">
                  <h4 className="font-semibold text-white">Performance & Analytics Cookies</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Allows us to count visits, track traffic sources, and measure performance so we can monitor and improve our website experience.
                  </p>
                </div>
                <button
                  onClick={() => setAnalyticsCookies(!analyticsCookies)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    analyticsCookies ? "bg-brand-bronze" : "bg-brand-slate-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      analyticsCookies ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Option 3: Marketing & Targeting */}
              <div className="flex justify-between items-start gap-4 p-3 bg-brand-slate-900/40 border border-brand-slate-800 rounded">
                <div className="space-y-1">
                  <h4 className="font-semibold text-white">Marketing & Personalization</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Used to track visitor behavior across websites to serve tailored advertisements and remember custom personalization options.
                  </p>
                </div>
                <button
                  onClick={() => setMarketingCookies(!marketingCookies)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    marketingCookies ? "bg-brand-bronze" : "bg-brand-slate-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      marketingCookies ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="border-t border-brand-slate-800 pt-4 flex justify-end gap-2.5">
              <button
                onClick={() => {
                  setAnalyticsCookies(true);
                  setMarketingCookies(true);
                  handleSaveCookiePreferences();
                }}
                className="px-4 py-2 bg-brand-slate-800 hover:bg-brand-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors cursor-pointer border border-brand-slate-700"
              >
                Accept All
              </button>
              <button
                onClick={handleSaveCookiePreferences}
                className="px-4 py-2 bg-brand-bronze hover:bg-white text-brand-slate-900 text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                Save Choices
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Global Cookie Saved Notification Toast */}
      {showCookieToast && (
        <div className="fixed bottom-6 left-6 z-50 p-4 bg-brand-slate-900 border border-brand-slate-800 text-white rounded shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-6 duration-300 max-w-sm">
          <div className="bg-emerald-950 p-1.5 rounded border border-emerald-800/60">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h5 className="text-xs font-semibold">Preferences Saved</h5>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Your customized cookie consent preferences have been updated.
            </p>
          </div>
        </div>
      )}
    </footer>
  );
}
