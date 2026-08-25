"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Story {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  imageUrl: string | null;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | Date | null;
  createdAt: string | Date;
}

interface StoryListClientProps {
  initialStories: Story[];
  isDbOffline: boolean;
}

export default function StoryListClient({
  initialStories,
  isDbOffline,
}: StoryListClientProps) {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<Partial<Story> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState("Corporate");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState("DRAFT");
  const [formSeoTitle, setFormSeoTitle] = useState("");
  const [formSeoDescription, setFormSeoDescription] = useState("");

  const openCreateModal = () => {
    setError(null);
    setCurrentStory(null);
    setFormTitle("");
    setFormSlug("");
    setFormContent("");
    setFormCategory("Corporate");
    setFormImageUrl("");
    setFormStatus("DRAFT");
    setFormSeoTitle("");
    setFormSeoDescription("");
    setModalOpen(true);
  };

  const openEditModal = (s: Story) => {
    setError(null);
    setCurrentStory(s);
    setFormTitle(s.title);
    setFormSlug(s.slug);
    setFormContent(s.content);
    setFormCategory(s.category);
    setFormImageUrl(s.imageUrl || "");
    setFormStatus(s.status);
    setFormSeoTitle(s.seoTitle || "");
    setFormSeoDescription(s.seoDescription || "");
    setModalOpen(true);
  };

  const openDeleteConfirm = (s: Story) => {
    setCurrentStory(s);
    setDeleteConfirmOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image.");
      }

      setFormImageUrl(data.url);
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      id: currentStory?.id,
      title: formTitle,
      slug: formSlug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, ""),
      content: formContent,
      category: formCategory,
      imageUrl: formImageUrl || null,
      status: formStatus,
      seoTitle: formSeoTitle || null,
      seoDescription: formSeoDescription || null,
    };

    try {
      const url = "/api/admin/stories";
      const method = currentStory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save story");
      }

      setModalOpen(false);
      router.refresh();
      window.location.reload();
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentStory?.id) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/stories?id=${currentStory.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete story");
      }

      setDeleteConfirmOpen(false);
      router.refresh();
      window.location.reload();
    } catch (err) {
      const errorObj = err as Error;
      alert(errorObj.message || "Failed to delete story.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-semibold">
            Press & Media
          </span>
          <h1 className="text-3xl font-serif font-medium text-brand-slate-900 mt-0.5">
            Stories & Press Releases
          </h1>
        </div>
        <button
          onClick={openCreateModal}
          disabled={isDbOffline}
          className="px-4 py-2 border border-brand-slate-900 bg-brand-slate-900 text-white text-xs font-semibold rounded hover:bg-brand-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          + Write New Story
        </button>
      </div>

      {/* Warning banner */}
      {isDbOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
          <p className="text-xs text-amber-800">
            <strong>Database Offline Mode</strong>: Displaying verified company stories. Writing and publication updates are locked.
          </p>
        </div>
      )}

      {/* Grid List */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-brand-text-muted font-semibold">
            <tr>
              <th className="px-6 py-3">Published Date</th>
              <th className="px-6 py-3">Cover</th>
              <th className="px-6 py-3">Story Title</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-brand-slate-900">
            {stories.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">
                  {s.publishedAt ? new Date(s.publishedAt).toLocaleDateString() : "Not Published"}
                </td>
                <td className="px-6 py-4">
                  <div className="h-10 w-10 overflow-hidden rounded bg-slate-100 border border-slate-200/50">
                    {s.imageUrl ? (
                      <img
                        src={s.imageUrl}
                        alt={s.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400 font-bold bg-slate-100">
                        N/A
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold">{s.title}</td>
                <td className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  {s.category}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      s.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                        : "bg-amber-50 text-amber-700 ring-amber-600/20"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2 font-medium">
                  <button
                    onClick={() => openEditModal(s)}
                    disabled={isDbOffline}
                    className="text-xs text-brand-bronze-dark hover:underline font-semibold disabled:opacity-30 disabled:no-underline cursor-pointer"
                  >
                    Edit Content
                  </button>
                  <span className="text-slate-200">|</span>
                  <button
                    onClick={() => openDeleteConfirm(s)}
                    disabled={isDbOffline}
                    className="text-xs text-red-600 hover:underline font-semibold disabled:opacity-30 disabled:no-underline cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT STORY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-lg shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-serif font-medium text-brand-slate-900 border-b border-slate-100 pb-3">
              {currentStory ? "Edit Story / Press Release" : "Write New Story / Press Release"}
            </h3>

            {error && (
              <div className="my-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-r text-xs text-red-800 font-medium animate-in fade-in duration-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="py-4 space-y-4 text-xs font-sans max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">Story Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Inauguration of New Office"
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:border-brand-bronze focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. inauguration-new-office"
                    className="w-full px-3 py-2 border border-slate-200 rounded font-mono focus:border-brand-bronze focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:border-brand-bronze focus:outline-none transition-colors bg-white font-medium"
                  >
                    <option value="legacy">Legacy & Heritage</option>
                    <option value="purpose">Group Purpose</option>
                    <option value="press-releases">Press Releases</option>
                    <option value="events">Events & CSR</option>
                    <option value="csr">Rudra Vahini Foundation</option>
                    <option value="kaarigari">Kaarigari Artisans</option>
                    <option value="sustainability">Sustainability</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:border-brand-bronze focus:outline-none transition-colors bg-white font-medium"
                  >
                    <option value="DRAFT">DRAFT (Offline)</option>
                    <option value="PUBLISHED">PUBLISHED (Online)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 block">Content (HTML / Plain Text)</label>
                <textarea
                  required
                  rows={6}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write the body of the story here..."
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:border-brand-bronze focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="space-y-1 bg-slate-50 border border-slate-200/60 rounded p-3">
                <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Cover Image</label>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 overflow-hidden rounded bg-slate-100 border border-slate-200 shrink-0">
                    {formImageUrl ? (
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[9px] text-slate-400 font-bold bg-slate-100 text-center px-1">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border file:border-slate-300 file:text-[10px] file:font-semibold file:bg-white file:text-slate-700 hover:file:bg-slate-50 file:cursor-pointer disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="Or enter image URL path..."
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono text-[10px] focus:border-brand-bronze focus:outline-none bg-white"
                    />
                  </div>
                </div>
                {uploading && (
                  <p className="text-[10px] text-brand-bronze font-semibold mt-1 animate-pulse">
                    Uploading image...
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 mt-2 space-y-3">
                <h4 className="text-[10px] font-bold uppercase text-slate-600 tracking-wider">SEO Metadata (Optional)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block">SEO Title</label>
                    <input
                      type="text"
                      value={formSeoTitle}
                      onChange={(e) => setFormSeoTitle(e.target.value)}
                      placeholder="Meta title override..."
                      className="w-full px-3 py-2 border border-slate-200 rounded focus:border-brand-bronze focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block">SEO Description</label>
                    <input
                      type="text"
                      value={formSeoDescription}
                      onChange={(e) => setFormSeoDescription(e.target.value)}
                      placeholder="Meta description override..."
                      className="w-full px-3 py-2 border border-slate-200 rounded focus:border-brand-bronze focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-4 py-2 bg-brand-slate-900 text-white hover:bg-brand-slate-800 rounded font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Story"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 max-w-sm w-full rounded-lg shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-serif font-medium text-red-600 border-b border-slate-100 pb-3">
              Delete Story / Press Release
            </h3>
            <div className="py-4 text-xs font-sans text-slate-600 leading-relaxed">
              Are you sure you want to delete the story <strong>&quot;{currentStory?.title}&quot;</strong>? This action is permanent and will remove it from sitemaps and indexes.
            </div>
            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded font-semibold cursor-pointer text-xs flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
