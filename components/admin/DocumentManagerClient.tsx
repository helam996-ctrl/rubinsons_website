"use client";

import { useState, useTransition } from "react";
import { createDocument, updateDocument, deleteDocument } from "@/app/admin/documents/actions";

interface DocumentItem {
  id: string;
  title: string;
  category: string;
  fileSize: number;
  isPrivate: boolean;
  order: number;
  fileUrl: string;
  fileKey: string;
}

interface DocumentManagerClientProps {
  initialDocuments: DocumentItem[];
  isDbOffline: boolean;
}

export default function DocumentManagerClient({
  initialDocuments,
  isDbOffline,
}: DocumentManagerClientProps) {
  const [documents] = useState<DocumentItem[]>(initialDocuments);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for new document
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Annual Report");
  const [newIsPrivate, setNewIsPrivate] = useState(true);
  const [newOrder, setNewOrder] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form states for editing document
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editIsPrivate, setEditIsPrivate] = useState(true);
  const [editOrder, setEditOrder] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const formatSize = (bytes: number) => {
    if (bytes >= 1048576) {
      return `${(bytes / 1048576).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedFile) {
      setError("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("category", newCategory);
    formData.append("isPrivate", String(newIsPrivate));
    formData.append("order", String(newOrder));
    formData.append("file", selectedFile);

    startTransition(async () => {
      const res = await createDocument(null, formData);
      if (res.success) {
        setSuccess("Document uploaded successfully.");
        // Clear fields
        setNewTitle("");
        setNewOrder(0);
        setSelectedFile(null);
        setIsAdding(false);
        // Refresh local documents list or trigger reload
        window.location.reload();
      } else {
        setError(res.error || "Failed to upload document.");
      }
    });
  };

  const handleEditClick = (doc: DocumentItem) => {
    setEditingId(doc.id);
    setEditTitle(doc.title);
    setEditCategory(doc.category);
    setEditIsPrivate(doc.isPrivate);
    setEditOrder(doc.order);
  };

  const handleEditSubmit = async (id: string) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await updateDocument(id, {
        title: editTitle,
        category: editCategory,
        isPrivate: editIsPrivate,
        order: editOrder,
      });

      if (res.success) {
        setSuccess("Document updated successfully.");
        setEditingId(null);
        window.location.reload();
      } else {
        setError(res.error || "Failed to update document.");
      }
    });
  };

  const handleDeleteClick = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will remove the file from storage.`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await deleteDocument(id);
      if (res.success) {
        setSuccess("Document deleted successfully.");
        window.location.reload();
      } else {
        setError(res.error || "Failed to delete document.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r text-xs text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r text-xs text-emerald-800">
          <strong>Success:</strong> {success}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-between items-center bg-white border border-slate-200 p-6 rounded shadow-sm">
        <div>
          <h2 className="text-lg font-serif font-semibold text-brand-slate-900">
            Document Repository Management
          </h2>
          <p className="text-xs text-brand-text-muted mt-0.5">
            Configure accessibility layers and upload reports to S3 Object Storage.
          </p>
        </div>
        <button
          disabled={isDbOffline || isPending}
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 border border-brand-slate-900 bg-brand-slate-900 text-white text-xs font-semibold rounded hover:bg-brand-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
        >
          {isAdding ? "Cancel Upload" : "+ Add Document"}
        </button>
      </div>

      {/* Upload Form */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white border border-slate-200 p-6 rounded shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-slate-900 uppercase tracking-wide mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Annual Audit Report 2026"
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-bronze"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-slate-900 uppercase tracking-wide mb-1">
                Document Category *
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-bronze bg-white"
              >
                <option value="Annual Report">Annual Report</option>
                <option value="Presentation">Presentation</option>
                <option value="Corporate Profile">Corporate Profile</option>
                <option value="Governance">Governance</option>
                <option value="Board Publications">Board Publications</option>
                <option value="Quarterly Financial Reports">Quarterly Financial Reports</option>
                <option value="Governance Charters">Governance Charters</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-brand-slate-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newIsPrivate}
                  onChange={(e) => setNewIsPrivate(e.target.checked)}
                  className="rounded border-slate-300 text-brand-bronze focus:ring-brand-bronze"
                />
                Private (Authenticated Access Only)
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-slate-900 uppercase tracking-wide mb-1">
                Order Index (For sorting)
              </label>
              <input
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-bronze"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-slate-900 uppercase tracking-wide mb-1">
                Select PDF File * (Max 10MB)
              </label>
              <input
                type="file"
                required
                accept=".pdf,application/pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-50 file:text-brand-slate-900 hover:file:bg-slate-100"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 bg-brand-slate-900 text-white text-xs font-semibold rounded hover:bg-brand-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
              >
                {isPending ? "Uploading..." : "Upload & Save Document"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Document Grid Table */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-brand-text-muted font-semibold">
            <tr>
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Title / Filename</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Size</th>
              <th className="px-6 py-3">Access Level</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-brand-slate-900">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-xs text-brand-text-muted">
                  No documents in repository. Click Add Document to upload your first PDF.
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const isEditing = editingId === doc.id;

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Order Column */}
                    <td className="px-6 py-4 font-mono text-xs">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editOrder}
                          onChange={(e) => setEditOrder(parseInt(e.target.value, 10) || 0)}
                          className="w-16 px-1.5 py-1 border border-slate-200 rounded text-xs focus:outline-none"
                        />
                      ) : (
                        doc.order
                      )}
                    </td>

                    {/* Title Column */}
                    <td className="px-6 py-4 max-w-xs">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none"
                        />
                      ) : (
                        <div className="space-y-0.5">
                          <p className="font-semibold">{doc.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate" title={doc.fileKey}>
                            {doc.fileKey}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Category Column */}
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none bg-white"
                        >
                          <option value="Annual Report">Annual Report</option>
                          <option value="Presentation">Presentation</option>
                          <option value="Corporate Profile">Corporate Profile</option>
                          <option value="Governance">Governance</option>
                          <option value="Board Publications">Board Publications</option>
                          <option value="Quarterly Financial Reports">Quarterly Financial Reports</option>
                          <option value="Governance Charters">Governance Charters</option>
                        </select>
                      ) : (
                        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                          {doc.category}
                        </span>
                      )}
                    </td>

                    {/* File Size Column */}
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {formatSize(doc.fileSize)}
                    </td>

                    {/* Access Level Column */}
                    <td className="px-6 py-4 text-xs">
                      {isEditing ? (
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editIsPrivate}
                            onChange={(e) => setEditIsPrivate(e.target.checked)}
                            className="rounded border-slate-300 text-brand-bronze focus:ring-brand-bronze"
                          />
                          Private secure
                        </label>
                      ) : doc.isPrivate ? (
                        <span className="inline-flex items-center rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                          Private Secure
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                          Public Free
                        </span>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right space-x-2 text-xs font-semibold shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            disabled={isPending}
                            onClick={() => handleEditSubmit(doc.id)}
                            className="text-emerald-600 hover:underline cursor-pointer"
                          >
                            Save
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            disabled={isPending}
                            onClick={() => setEditingId(null)}
                            className="text-slate-500 hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            disabled={isDbOffline || isPending}
                            onClick={() => handleEditClick(doc)}
                            className="text-brand-bronze-dark hover:underline disabled:opacity-30 disabled:no-underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            disabled={isDbOffline || isPending}
                            onClick={() => handleDeleteClick(doc.id, doc.title)}
                            className="text-red-600 hover:underline disabled:opacity-30 disabled:no-underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
