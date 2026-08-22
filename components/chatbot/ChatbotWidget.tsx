"use client";

import { useState, useRef, useEffect } from "react";
import { trackGAEvent } from "@/lib/analytics/events";

interface QuickAction {
  id: string;
  label: string;
  promptText: string;
}

interface ChatMessage {
  sender: "USER" | "BOT";
  content: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "BOT",
      content: "Hello! I am the Rubinsons AI Assistant. How can I help you explore our sectors, leadership, or investor information today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("rubinsons_chat_session");
      if (id) return id;
      const newId = "session-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now();
      localStorage.setItem("rubinsons_chat_session", newId);
      return newId;
    }
    return "";
  });

  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([
    { id: "q1", label: "Request Investor Package", promptText: "I want to request the investor package." },
    { id: "q2", label: "Learn about Builders division", promptText: "Tell me about Rubinsons Builders and Infrastructure division." },
    { id: "q3", label: "Contact Corporate Office", promptText: "How can I contact the corporate office?" },
  ]);

  // Inline Inquiry Form states
  const [inqName, setInqName] = useState("");
  const [inqEmail, setInqEmail] = useState("");
  const [inqMessage, setInqMessage] = useState("");
  const [inqSuccess, setInqSuccess] = useState(false);
  const [inqError, setInqError] = useState<string | null>(null);
  const [inqBPhone, setInqBPhone] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, showInquiryForm]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message
    const userMsg: ChatMessage = { sender: "USER", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          sessionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg: ChatMessage = { sender: "BOT", content: data.reply };
        setMessages((prev) => [...prev, botMsg]);

        if (data.showInquiryForm) {
          setShowInquiryForm(true);
          setInqMessage(`Follow-up inquiry details derived from chat query regarding: "${text}"`);
        }

        if (data.quickActions && data.quickActions.length > 0) {
          setQuickActions(data.quickActions);
        }
      } else {
        throw new Error("Chatbot API response error");
      }
    } catch (error) {
      console.error("Chatbot query error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "BOT",
          content: "Sorry, I am experiencing temporary connection problems. Would you like to reach our team directly at contact@rubinsons.com?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
 
  useEffect(() => {
    const handleOpenChatWithQuery = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setIsOpen(true);
      if (customEvent.detail) {
        setTimeout(() => {
          handleSendMessage(customEvent.detail);
        }, 150);
      }
    };
    window.addEventListener("open-chatbot-with-query", handleOpenChatWithQuery);
    return () => {
      window.removeEventListener("open-chatbot-with-query", handleOpenChatWithQuery);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, isLoading]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInqError(null);

    // Client-side honeypot protection (silently succeed)
    if (inqBPhone) {
      setInqSuccess(true);
      setMessages((prev) => [
        ...prev,
        { sender: "BOT", content: "Thank you. Your corporate inquiry has been logged successfully inside our CRM." },
      ]);
      setTimeout(() => {
        setShowInquiryForm(false);
      }, 3000);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: inqName,
          email: inqEmail,
          message: inqMessage,
          type: "CHATBOT",
          b_phone: inqBPhone,
        }),
      });

      if (response.ok) {
        // Track GA4 chatbot inquiry event
        trackGAEvent("chatbot_enquiry_created", {
          conversation_id: sessionId,
          intent: "chatbot_fallback",
        });

        setInqSuccess(true);
        // Append bot confirm message
        setMessages((prev) => [
          ...prev,
          { sender: "BOT", content: "Thank you. Your corporate inquiry has been logged successfully inside our CRM." },
        ]);
        setTimeout(() => {
          setShowInquiryForm(false);
        }, 3000);
      } else {
        const errJson = await response.json();
        setInqError(errJson.error?.message || "Failed to submit inquiry.");
      }
    } catch {
      setInqError("Connection failed. Please send email directly to contact@rubinsons.com");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Icon */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            trackGAEvent("chatbot_opened", { initial_state: "closed" });
          }}
          className="flex items-center justify-center w-14 h-14 bg-brand-slate-900 text-white rounded-full shadow-lg hover:bg-brand-slate-800 transition-transform hover:scale-105 cursor-pointer border border-slate-800"
          title="Open Corporate Assistant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M12 18.75c-3.728 0-6.75-3.022-6.75-6.75s3.022-6.75 6.75-6.75 6.75 3.022 6.75 6.75-3.022 6.75-6.75 6.75z"
            />
          </svg>
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-white border border-slate-200 rounded shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="bg-brand-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800 shrink-0">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-brand-bronze font-semibold">
                Verified AI Helper
              </span>
              <h3 className="text-base font-serif font-medium mt-0.5">
                Rubinsons Assistant
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === "USER"
                      ? "bg-brand-slate-900 text-white font-medium shadow-sm"
                      : "bg-white border border-slate-200 text-brand-slate-900 shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing Loader */}
            {isLoading && !showInquiryForm && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded px-4 py-3 text-xs text-slate-400 italic shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  Typing verified response...
                </div>
              </div>
            )}

            {/* Inline Escalation Inquiry Form */}
            {showInquiryForm && (
              <div className="bg-white border border-brand-bronze/40 p-4 rounded shadow-sm space-y-3">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] bg-brand-bronze/10 border border-brand-bronze/20 text-brand-bronze-dark px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Inquiry Escalation
                  </span>
                  <h4 className="text-xs font-semibold text-brand-slate-900 mt-1">
                    Connect with Corporate Office
                  </h4>
                </div>

                {inqSuccess ? (
                  <p className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-2 border border-emerald-200 rounded">
                    ✓ Inquiry submitted successfully.
                  </p>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-2 text-xs">
                    {/* Honeypot field (hidden from view) */}
                    <input
                      type="text"
                      name="b_phone"
                      value={inqBPhone}
                      onChange={(e) => setInqBPhone(e.target.value)}
                      style={{ display: "none" }}
                      autoComplete="off"
                    />
                    {inqError && <p className="text-[10px] text-red-700">{inqError}</p>}
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Your Full Name"
                        value={inqName}
                        onChange={(e) => setInqName(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-[11px] focus:outline-none focus:border-brand-bronze"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Your Email Address"
                        value={inqEmail}
                        onChange={(e) => setInqEmail(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-[11px] focus:outline-none focus:border-brand-bronze"
                      />
                    </div>
                    <div>
                      <textarea
                        required
                        rows={2}
                        placeholder="Your Message..."
                        value={inqMessage}
                        onChange={(e) => setInqMessage(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-[11px] focus:outline-none focus:border-brand-bronze resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2 bg-brand-slate-900 hover:bg-brand-slate-800 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {isLoading ? "Submitting..." : "Submit Inquiry"}
                    </button>
                  </form>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Pills */}
          {!showInquiryForm && quickActions.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 bg-white flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none select-none">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleSendMessage(action.promptText)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] text-brand-slate-900 font-medium rounded-full whitespace-nowrap transition-colors cursor-pointer"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          {!showInquiryForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-4 border-t border-slate-100 bg-white flex gap-2 shrink-0 items-center"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask assistant a question..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-bronze bg-slate-50/50"
              />
              <button
                type="submit"
                className="p-2 bg-brand-slate-900 text-white rounded hover:bg-brand-slate-800 transition-colors cursor-pointer border border-brand-slate-900"
              >
                <svg className="w-4 h-4 fill-current rotate-90" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
