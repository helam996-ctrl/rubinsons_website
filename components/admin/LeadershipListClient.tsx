"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Leader {
  id: string;
  name: string;
  role: string;
  biography: string | null;
  imageUrl: string | null;
  order: number;
}

interface LeadershipListClientProps {
  initialLeaders: Leader[];
  isDbOffline: boolean;
}

export default function LeadershipListClient({
  initialLeaders,
  isDbOffline,
}: LeadershipListClientProps) {
  const router = useRouter();
  const [leaders, setLeaders] = useState<Leader[]>(initialLeaders);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentLeader, setCurrentLeader] = useState<Partial<Leader> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formBiography, setFormBiography] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formOrder, setFormOrder] = useState(0);

  const openCreateModal = () => {
    setError(null);
    setCurrentLeader(null);
    setFormName("");
    setFormRole("");
    setFormBiography("");
    setFormImageUrl("");
    setFormOrder(leaders.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (l: Leader) => {
    setError(null);
    setCurrentLeader(l);
    setFormName(l.name);
    setFormRole(l.role);
    setFormBiography(l.biography || "");
    setFormImageUrl(l.imageUrl || "");
    setFormOrder(l.order);
    setModalOpen(true);
  };

  const openDeleteConfirm = (l: Leader) => {
    setCurrentLeader(l);
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
      id: currentLeader?.id,
      name: formName,
      role: formRole,
      biography: formBiography || null,
      imageUrl: formImageUrl || null,
      order: formOrder,
    };

    try {
      const url = "/api/admin/leadership";
      const method = currentLeader ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save board profile");
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
    if (!currentLeader?.id) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/leadership?id=${currentLeader.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete board member");
      }

      setDeleteConfirmOpen(false);
      router.refresh();
      window.location.reload();
    } catch (err) {
      const errorObj = err as Error;
      alert(errorObj.message || "Failed to delete board member.");
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
            Governance
          </span>
          <h1 className="text-3xl font-serif font-medium text-brand-slate-900 mt-0.5">
            Board of Directors
          </h1>
        </div>
        <button
          onClick={openCreateModal}
          disabled={isDbOffline}
          className="px-4 py-2 border border-brand-slate-900 bg-brand-slate-900 text-white text-xs font-semibold rounded hover:bg-brand-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          + Add Board Profile
        </button>
      </div>

      {/* Warning banner */}
      {isDbOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
          <p className="text-xs text-amber-800">
            <strong>Database Offline Mode</strong>: Displaying verified leadership registry. Reordering weights and edits are disabled.
          </p>
        </div>
      )}

      {/* Grid List */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-brand-text-muted font-semibold">
            <tr>
              <th className="px-6 py-3 w-16">Order</th>
              <th className="px-6 py-3 w-20">Photo</th>
              <th className="px-6 py-3">Leader Name</th>
              <th className="px-6 py-3">Designation</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-brand-slate-900">
            {leaders.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{l.order}</td>
                <td className="px-6 py-4">
                  <div className="h-10 w-10 overflow-hidden rounded bg-slate-100 border border-slate-200/50">
                    {l.imageUrl ? (
                      <img
                        src={l.imageUrl}
                        alt={l.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400 font-bold bg-slate-100">
                        N/A
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold">{l.name}</td>
                <td className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  {l.role}
                </td>
                <td className="px-6 py-4 text-right space-x-2 font-medium">
                  <button
                    onClick={() => openEditModal(l)}
                    disabled={isDbOffline}
                    className="text-xs text-brand-bronze-dark hover:underline font-semibold disabled:opacity-30 disabled:no-underline cursor-pointer"
                  >
                    Edit Biography
                  </button>
                  <span className="text-slate-200">|</span>
                  <button
                    onClick={() => openDeleteConfirm(l)}
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

      {/* CREATE / EDIT LEADERSHIP MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-lg shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-serif font-medium text-brand-slate-900 border-b border-slate-100 pb-3">
              {currentLeader ? "Edit Board Profile" : "Add Board Profile"}
            </h3>

            {error && (
              <div className="my-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-r text-xs text-red-800 font-medium animate-in fade-in duration-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="py-4 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">Leader Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Dr. Rudra Bhanu"
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:border-brand-bronze focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">Designation / Role</label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Managing Director"
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:border-brand-bronze focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 block">Biography</label>
                <textarea
                  rows={4}
                  value={formBiography}
                  onChange={(e) => setFormBiography(e.target.value)}
                  placeholder="Enter biography details..."
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:border-brand-bronze focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="space-y-1 bg-slate-50 border border-slate-200/60 rounded p-3">
                <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Leader Photo</label>
                
                <div className="flex items-center gap-4">
                  {/* Photo Preview */}
                  <div className="h-14 w-14 overflow-hidden rounded bg-slate-100 border border-slate-200 shrink-0">
                    {formImageUrl ? (
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[9px] text-slate-400 font-bold bg-slate-100 text-center px-1">
                        No Photo
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    {/* File Input */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border file:border-slate-300 file:text-[10px] file:font-semibold file:bg-white file:text-slate-700 hover:file:bg-slate-50 file:cursor-pointer disabled:opacity-50"
                    />
                    
                    {/* Raw URL Input */}
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
                    "Save Member"
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
              Delete Board Profile
            </h3>
            <div className="py-4 text-xs font-sans text-slate-600 leading-relaxed">
              Are you sure you want to delete the board profile of <strong>&quot;{currentLeader?.name}&quot;</strong>? This action is permanent.
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
