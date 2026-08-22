"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Settings values state
  const [formData, setFormData] = useState<Record<string, string>>({
    link_careers: "",
    link_leadership_prog: "",
    link_mfg_prog: "",
    link_compliance: "",
    link_contact_us: "",
    link_privacy_notice: "",
    link_cookie_notice: "",
    link_terms_conditions: "",
    social_linkedin: "",
    social_instagram: "",
    social_facebook: "",
    social_youtube: "",
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.status === 401 || res.status === 403) {
          router.push("/unauthorized");
          return;
        }
        if (!res.ok) throw new Error("Failed to load settings");
        const data: Setting[] = await res.json();

        const dataMap: Record<string, string> = {};
        data.forEach((s) => {
          dataMap[s.key] = s.value;
        });

        setFormData((prev) => ({
          ...prev,
          ...dataMap,
        }));
      } catch (err) {
        setError("Could not connect to database. Settings are currently running in read-only offline fallback.");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [router]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: formData }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update settings");
      }

      setSuccess("Site settings updated successfully.");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-bronze border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-text-muted font-medium">Loading Site Settings...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="p-8 space-y-6 overflow-y-auto flex-1 font-sans max-w-4xl">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-semibold">
          Configuration
        </span>
        <h1 className="text-3xl font-serif font-medium text-brand-slate-900 mt-0.5">
          Global Site Settings
        </h1>
        <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
          Configure the public-facing footer links, policy documents, and corporate social handles.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r animate-in fade-in duration-200">
          <p className="text-xs text-red-800 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r animate-in fade-in duration-200">
          <p className="text-xs text-emerald-800 font-medium">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Careers & Programs */}
        <div className="bg-white border border-slate-200 rounded shadow-sm p-6 space-y-4">
          <h2 className="text-sm uppercase tracking-wider font-bold text-brand-slate-900 border-b border-slate-100 pb-3">
            Careers & Programs Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Careers Portal Link</label>
              <input
                type="url"
                required
                value={formData.link_careers}
                onChange={(e) => handleChange("link_careers", e.target.value)}
                placeholder="https://careers.rubinsons.com/"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:border-brand-bronze focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Leadership Program Link</label>
              <input
                type="url"
                required
                value={formData.link_leadership_prog}
                onChange={(e) => handleChange("link_leadership_prog", e.target.value)}
                placeholder="https://abglp.rubinsons.com/"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:border-brand-bronze focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block">Global Manufacturing Program Link</label>
              <input
                type="url"
                required
                value={formData.link_mfg_prog}
                onChange={(e) => handleChange("link_mfg_prog", e.target.value)}
                placeholder="https://abgmlp.rubinsons.com/"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:border-brand-bronze focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Governance & Policies */}
        <div className="bg-white border border-slate-200 rounded shadow-sm p-6 space-y-4">
          <h2 className="text-sm uppercase tracking-wider font-bold text-brand-slate-900 border-b border-slate-100 pb-3">
            Governance & Policies Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Compliance Link</label>
              <input
                type="url"
                required
                value={formData.link_compliance}
                onChange={(e) => handleChange("link_compliance", e.target.value)}
                placeholder="https://www.rubinsons.com/compliance/"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:border-brand-bronze focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Contact Us Link</label>
              <input
                type="url"
                required
                value={formData.link_contact_us}
                onChange={(e) => handleChange("link_contact_us", e.target.value)}
                placeholder="https://www.rubinsons.com/contact-us/"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:border-brand-bronze focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Privacy Notice Link</label>
              <input
                type="url"
                required
                value={formData.link_privacy_notice}
                onChange={(e) => handleChange("link_privacy_notice", e.target.value)}
                placeholder="https://www.rubinsons.com/privacy-notice/"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:border-brand-bronze focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Cookie Notice Link</label>
              <input
                type="url"
                required
                value={formData.link_cookie_notice}
                onChange={(e) => handleChange("link_cookie_notice", e.target.value)}
                placeholder="https://www.rubinsons.com/cookie-notice/"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:border-brand-bronze focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block">Terms & Conditions Link</label>
              <input
                type="url"
                required
                value={formData.link_terms_conditions}
                onChange={(e) => handleChange("link_terms_conditions", e.target.value)}
                placeholder="https://www.rubinsons.com/terms-and-conditions/"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:border-brand-bronze focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Social Media Handles */}
        <div className="bg-white border border-slate-200 rounded shadow-sm p-6 space-y-4">
          <h2 className="text-sm uppercase tracking-wider font-bold text-brand-slate-900 border-b border-slate-100 pb-3">
            Social Media URL Handles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">LinkedIn Handle</label>
              <input
                type="url"
                required
                value={formData.social_linkedin}
                onChange={(e) => handleChange("social_linkedin", e.target.value)}
                placeholder="https://linkedin.com/company/rubinsons"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:border-brand-bronze focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Instagram Handle</label>
              <input
                type="url"
                required
                value={formData.social_instagram}
                onChange={(e) => handleChange("social_instagram", e.target.value)}
                placeholder="https://instagram.com/rubinsons"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:border-brand-bronze focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Facebook Handle</label>
              <input
                type="url"
                required
                value={formData.social_facebook}
                onChange={(e) => handleChange("social_facebook", e.target.value)}
                placeholder="https://facebook.com/rubinsons"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:border-brand-bronze focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">YouTube Handle</label>
              <input
                type="url"
                required
                value={formData.social_youtube}
                onChange={(e) => handleChange("social_youtube", e.target.value)}
                placeholder="https://youtube.com/rubinsons"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:border-brand-bronze focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !!error}
            className="px-6 py-2.5 bg-brand-slate-900 text-white hover:bg-brand-slate-800 text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Save Configurations"
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
