"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Business {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  imageUrl: string | null;
  status: string;
  order: number;
}

interface BusinessListClientProps {
  initialBusinesses: Business[];
  isDbOffline: boolean;
}

export default function BusinessListClient({
  initialBusinesses,
  isDbOffline,
}: BusinessListClientProps) {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentBusiness, setCurrentBusiness] = useState<Partial<Business> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formShortDesc, setFormShortDesc] = useState("");
  const [formDetailedDesc, setFormDetailedDesc] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState("ACTIVE");
  const [formOrder, setFormOrder] = useState(0);

  const openCreateModal = () => {
    setError(null);
    setCurrentBusiness(null);
    setFormTitle("");
    setFormSlug("");
    setFormShortDesc("");
    setFormDetailedDesc("");
    setFormImageUrl("");
    setFormStatus("ACTIVE");
    setFormOrder(businesses.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (b: Business) => {
    setError(null);
    setCurrentBusiness(b);
    setFormTitle(b.title);
    setFormSlug(b.slug);
    setFormShortDesc(b.shortDescription);
    setFormDetailedDesc(b.detailedDescription);
    setFormImageUrl(b.imageUrl || "");
    setFormStatus(b.status);
    setFormOrder(b.order);
    setModalOpen(true);
  };

  const openDeleteConfirm = (b: Business) => {
    setCurrentBusiness(b);
    setDeleteConfirmOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      id: currentBusiness?.id,
      title: formTitle,
      slug: formSlug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, ""),
      shortDescription: formShortDesc,
      detailedDescription: formDetailedDesc,
      imageUrl: formImageUrl || null,
      status: formStatus,
      order: formOrder,
    };

    try {
      const url = "/api/admin/businesses";
      const method = currentBusiness ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save sector");
      }

      setModalOpen(false);
      router.refresh();
      window.location.reload(); // Hard reload to update list from server component
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentBusiness?.id) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/businesses?id=${currentBusiness.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete sector");
      }

      setDeleteConfirmOpen(false);
      router.refresh();
      window.location.reload(); // Hard reload to update list from server component
    } catch (err) {
      const errorObj = err as Error;
      alert(errorObj.message || "Failed to delete sector.");
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
            Sectors
          </span>
          <h1 className="text-3xl font-serif font-medium text-brand-slate-900 mt-0.5">
            Business Divisions
          </h1>
        </div>
        <button
          onClick={openCreateModal}
          disabled={isDbOffline}
          className="px-4 py-2 border border-brand-slate-900 bg-brand-slate-900 text-white text-xs font-semibold rounded hover:bg-brand-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          + Add New Sector
        </button>
      </div>

      {/* Warning banner */}
      {isDbOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r animate-in fade-in duration-200">
          <p className="text-xs text-amber-800">
            <strong>Database Offline Mode</strong>: Displaying verified company sectors from specifications. Creation, edits, and deletions are locked until database connection is established.
          </p>
        </div>
      )}

      {/* Grid List */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-brand-text-muted font-semibold">
            <tr>
              <th className="px-6 py-3 w-16">Order</th>
              <th className="px-6 py-3">Sector Title</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-brand-slate-900">
            {businesses.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{b.order}</td>
                <td className="px-6 py-4 font-semibold">{b.title}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-500">{b.slug}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      b.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                        : "bg-slate-50 text-slate-700 ring-slate-600/20"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2 font-medium">
                  <button
                    onClick={() => openEditModal(b)}
                    disabled={isDbOffline}
                    className="text-xs text-brand-bronze-dark hover:underline font-semibold disabled:opacity-30 disabled:no-underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <span className="text-slate-200">|</span>
                  <button
                    onClick={() => openDeleteConfirm(b)}
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

      {/* 1. CREATE / EDIT SECTOR MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-lg shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-serif font-medium text-brand-slate-900 border-b border-slate-100 pb-3">
              {currentBusiness ? "Edit Business Sector" : "Add New Business Sector"}
            </h3>

            {error && (
              <div className="my-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-r text-xs text-red-800 font-medium animate-in fade-in duration-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="py-4 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">Sector Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Agriculture"
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
                    placeholder="e.g. agriculture"
                    className="w-full px-3 py-2 border border-slate-200 rounded font-mono focus:border-brand-bronze focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 block">Short Description</label>
                <input
                  type="text"
                  required
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="e.g. Precision farming, sustainable crop procurement, and logistics."
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:border-brand-bronze focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 block">Detailed Overview</label>
                <textarea
                  required
                  rows={3}
                  value={formDetailedDesc}
                  onChange={(e) => setFormDetailedDesc(e.target.value)}
                  placeholder="Provide a comprehensive operational summary of the sector..."
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:border-brand-bronze focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 block">Image URL / Path</label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="e.g. /images/agriculture.jpg or S3 web link"
                  className="w-full px-3 py-2 border border-slate-200 rounded font-mono focus:border-brand-bronze focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">Display Order</label>
                  <input
                    type="number"
                    required
                    value={formOrder}
                    onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:border-brand-bronze focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:border-brand-bronze focus:outline-none transition-colors bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PLANNED">PLANNED</option>
                  </select>
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
                  disabled={saving}
                  className="px-4 py-2 bg-brand-slate-900 text-white hover:bg-brand-slate-800 rounded font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Sector"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. DELETE CONFIRMATION MODAL */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 max-w-sm w-full rounded-lg shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-serif font-medium text-red-600 border-b border-slate-100 pb-3">
              Delete Business Sector
            </h3>
            <div className="py-4 text-xs font-sans text-slate-600 leading-relaxed">
              Are you sure you want to delete the division <strong>&quot;{currentBusiness?.title}&quot;</strong>? This action will permanently remove it from sitemaps, homepage directories, and CMS registries.
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
