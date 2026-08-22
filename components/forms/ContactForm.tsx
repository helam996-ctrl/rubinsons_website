"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { trackGAEvent } from "@/lib/analytics/events";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organisation: "",
    type: "GENERAL",
    message: "",
    b_phone: "", // Honeypot spam filter
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    // Honeypot spam verification
    if (formData.b_phone) {
      // Silently fail to spam bots
      setStatus("success");
      return;
    }

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          organisation: formData.organisation,
          type: formData.type,
          message: formData.message,
          b_phone: formData.b_phone,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.message || "Failed to submit inquiry.");
      }

      // GA4 Event Tracking
      if (formData.type === "INVESTOR") {
        trackGAEvent("investor_enquiry_submitted", {
          form_id: "contact_form",
          method: "Form",
        });
      } else {
        trackGAEvent("contact_enquiry_submitted", {
          form_id: "contact_form",
          type: formData.type,
        });
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        organisation: "",
        type: "GENERAL",
        message: "",
        b_phone: "",
      });
    } catch (err) {
      const errorObj = err as Error;
      setStatus("error");
      setErrorMessage(errorObj.message || "An unexpected error occurred. Please try again.");
    }
  };


  if (status === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded p-8 text-center space-y-4 font-sans">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-emerald-800">Inquiry Submitted</h3>
        <p className="text-xs text-emerald-700 max-w-sm mx-auto">
          Thank you for contacting Rubinsons Group. Your request has been securely logged in our system. Our admin team will follow up shortly.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-xs font-semibold text-emerald-800 underline hover:text-emerald-900 cursor-pointer"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {/* Honeypot field (hidden from view) */}
      <input
        type="text"
        name="b_phone"
        value={formData.b_phone}
        onChange={handleChange}
        style={{ display: "none" }}
        autoComplete="off"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input
          id="name"
          name="name"
          label="Full Name *"
          placeholder="e.g. Vikram Sharma"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          id="email"
          name="email"
          label="Email Address *"
          type="email"
          placeholder="e.g. name@company.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input
          id="phone"
          name="phone"
          label="Phone Number"
          placeholder="e.g. +91 99999 99999"
          value={formData.phone}
          onChange={handleChange}
        />
        <Input
          id="organisation"
          name="organisation"
          label="Organization / Company"
          placeholder="e.g. Sharma Holdings"
          value={formData.organisation}
          onChange={handleChange}
        />
      </div>

      <Select
        id="type"
        name="type"
        label="Division of Interest *"
        value={formData.type}
        onChange={handleChange}
        options={[
          { label: "General Corporate Inquiry", value: "GENERAL" },
          { label: "Investor Relations Board", value: "INVESTOR" },
          { label: "Rubinsons Builders & Infrastructure", value: "builders-infrastructure" },
          { label: "Rubinsons Contracting", value: "contracting" },
          { label: "ICH Dine Academia", value: "ich-dine-academia" },
          { label: "Healthcare / Shanti Medical Hall", value: "healthcare" },
          { label: "Rubinsons Digital Media & Marketing", value: "digital-media-marketing" },
        ]}
      />

      <div className="space-y-1.5">
        <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
          Your Inquiry Message *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          placeholder="Please describe your interest, project scope, or document requests here..."
          className="w-full px-4 py-2.5 bg-white border border-brand-border rounded text-sm text-brand-slate-900 focus:outline-none focus:border-brand-bronze focus:ring-1 focus:ring-brand-bronze transition-colors placeholder-slate-400"
          required
        />
      </div>

      {status === "error" && (
        <p className="text-xs text-red-500 font-semibold">{errorMessage}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full sm:w-auto"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Submitting..." : "Submit Corporate Inquiry"}
      </Button>
    </form>
  );
}
