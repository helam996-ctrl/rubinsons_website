"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Business {
  id: string;
  title: string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  status: string;
  order: number;
  businessId: string;
  business?: {
    title: string;
  };
}

interface ProjectListClientProps {
  initialProjects: Project[];
  businesses: Business[];
  isDbOffline: boolean;
}

export default function ProjectListClient({
  initialProjects,
  businesses,
  isDbOffline,
}: ProjectListClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState("ACTIVE");
  const [formOrder, setFormOrder] = useState(0);
  const [formBusinessId, setFormBusinessId] = useState("");

  const openCreateModal = () => {
    setError(null);
    setCurrentProject(null);
    setFormTitle("");
    setFormSlug("");
    setFormDescription("");
    setFormImageUrl("");
    setFormStatus("ACTIVE");
    setFormOrder(projects.length + 1);
    setFormBusinessId(businesses[0]?.id || "");
    setModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setError(null);
    setCurrentProject(p);
    setFormTitle(p.title);
    setFormSlug(p.slug);
    setFormDescription(p.description);
    setFormImageUrl(p.imageUrl || "");
    setFormStatus(p.status);
    setFormOrder(p.order);
    setFormBusinessId(p.businessId);
    setModalOpen(true);
  };

  const openDeleteConfirm = (p: Project) => {
    setCurrentProject(p);
    setDeleteConfirmOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      id: currentProject?.id,
      title: formTitle,
      slug: formSlug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, ""),
      description: formDescription,
      imageUrl: formImageUrl || null,
      status: formStatus,
      order: formOrder,
      businessId: formBusinessId,
    };

    try {
      const url = "/api/admin/projects";
      const method = currentProject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save project");
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
    if (!currentProject?.id) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/projects?id=${currentProject.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete project");
      }

      setDeleteConfirmOpen(false);
      router.refresh();
      window.location.reload();
    } catch (err) {
      const errorObj = err as Error;
      alert(errorObj.message || "Failed to delete project.");
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
            Portfolios
          </span>
          <h1 className="text-3xl font-serif font-medium text-brand-slate-900 mt-0.5">
            Sectors Projects
          </h1>
        </div>
        <button
          onClick={openCreateModal}
          disabled={isDbOffline}
          className="px-4 py-2 border border-brand-slate-900 bg-brand-slate-900 text-white text-xs font-semibold rounded hover:bg-brand-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          + Add New Project
        </button>
      </div>

      {/* Warning banner */}
      {isDbOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
          <p className="text-xs text-amber-800">
            <strong>Database Offline Mode</strong>: Displaying verified sector projects from specifications. CRUD actions are locked.
          </p>
        </div>
      )}

      {/* Grid List */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-brand-text-muted font-semibold">
            <tr>
              <th className="px-6 py-3 w-16">Order</th>
              <th className="px-6 py-3">Project Title</th>
              <th className="px-6 py-3">Sector Link</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-brand-slate-900">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{p.order}</td>
                <td className="px-6 py-4 font-semibold">{p.title}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-500">
                  {p.business?.title || "Unassigned"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      p.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                        : "bg-slate-50 text-slate-700 ring-slate-600/20"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2 font-medium">
                  <button
                    onClick={() => openEditModal(p)}
                    disabled={isDbOffline}
                    className="text-xs text-brand-bronze-dark hover:underline font-semibold disabled:opacity-30 disabled:no-underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <span className="text-slate-200">|</span>
                  <button
                    onClick={() => openDeleteConfirm(p)}
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

      {/* CREATE / EDIT PROJECT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-lg shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-serif font-medium text-brand-slate-900 border-b border-slate-100 pb-3">
              {currentProject ? "Edit Project" : "Add New Project"}
            </h3>

            {error && (
              <div className="my-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-r text-xs text-red-800 font-medium animate-in fade-in duration-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="py-4 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">Project Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Commercial Complex Alpha"
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
                    placeholder="e.g. commercial-complex-alpha"
                    className="w-full px-3 py-2 border border-slate-200 rounded font-mono focus:border-brand-bronze focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 block">Linked Sector / Division</label>
                <select
                  value={formBusinessId}
                  onChange={(e) => setFormBusinessId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:border-brand-bronze focus:outline-none transition-colors bg-white"
                >
                  <option value="" disabled>Select a Business Sector</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 block">Project Description</label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide a comprehensive operational summary of the project..."
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:border-brand-bronze focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 block">Image URL (Optional)</label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="e.g. /images/projects/project1.jpg"
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
                    <option value="COMPLETED">COMPLETED</option>
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
                    "Save Project"
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
              Delete Project
            </h3>
            <div className="py-4 text-xs font-sans text-slate-600 leading-relaxed">
              Are you sure you want to delete the project <strong>&quot;{currentProject?.title}&quot;</strong>? This action is permanent.
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
