"use client";

import { useState, useTransition } from "react";
import {
  updateIntent,
  addKeyword,
  removeKeyword,
  addQuickAction,
  removeQuickAction,
} from "@/app/admin/chatbot/actions";

interface Keyword {
  id: string;
  keyword: string;
}

interface QuickAction {
  id: string;
  label: string;
  promptText: string;
  order: number;
}

interface ChatbotIntent {
  id: string;
  name: string;
  description: string | null;
  responseGuidance: string;
  priority: number;
  enabled: boolean;
  keywords: Keyword[];
  quickActions: QuickAction[];
}

interface ChatbotTuningClientProps {
  initialIntents: ChatbotIntent[];
  isDbOffline: boolean;
}

export default function ChatbotTuningClient({
  initialIntents,
  isDbOffline,
}: ChatbotTuningClientProps) {
  const [selectedIntentId, setSelectedIntentId] = useState<string>(
    initialIntents[0]?.id || ""
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for selected intent
  const selectedIntent = initialIntents.find((i) => i.id === selectedIntentId);

  const [description, setDescription] = useState(selectedIntent?.description || "");
  const [guidance, setGuidance] = useState(selectedIntent?.responseGuidance || "");
  const [priority, setPriority] = useState(selectedIntent?.priority || 0);
  const [enabled, setEnabled] = useState(selectedIntent?.enabled ?? true);

  // Keyword addition state
  const [newKeyword, setNewKeyword] = useState("");

  // Quick Action addition state
  const [newQaLabel, setNewQaLabel] = useState("");
  const [newQaPrompt, setNewQaPrompt] = useState("");
  const [newQaOrder, setNewQaOrder] = useState(0);

  // Update form states when selected intent changes
  const handleSelectIntent = (intent: ChatbotIntent) => {
    setSelectedIntentId(intent.id);
    setDescription(intent.description || "");
    setGuidance(intent.responseGuidance);
    setPriority(intent.priority);
    setEnabled(intent.enabled);
    setError(null);
    setSuccess(null);
  };

  const handleUpdateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntentId) return;

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await updateIntent(selectedIntentId, {
        description,
        responseGuidance: guidance,
        priority,
        enabled,
      });

      if (res.success) {
        setSuccess("Intent parameters updated successfully.");
        window.location.reload();
      } else {
        setError(res.error || "Failed to update intent.");
      }
    });
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntentId || !newKeyword.trim()) return;

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await addKeyword(selectedIntentId, newKeyword);
      if (res.success) {
        setNewKeyword("");
        setSuccess(`Keyword "${newKeyword}" added successfully.`);
        window.location.reload();
      } else {
        setError(res.error || "Failed to add keyword.");
      }
    });
  };

  const handleRemoveKeyword = async (keywordId: string, kwText: string) => {
    if (!confirm(`Are you sure you want to remove keyword "${kwText}"?`)) return;

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await removeKeyword(keywordId);
      if (res.success) {
        setSuccess("Keyword removed successfully.");
        window.location.reload();
      } else {
        setError(res.error || "Failed to remove keyword.");
      }
    });
  };

  const handleAddQuickAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntentId || !newQaLabel.trim() || !newQaPrompt.trim()) return;

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await addQuickAction(selectedIntentId, {
        label: newQaLabel,
        promptText: newQaPrompt,
        order: newQaOrder,
      });

      if (res.success) {
        setNewQaLabel("");
        setNewQaPrompt("");
        setNewQaOrder(0);
        setSuccess("Quick action card added successfully.");
        window.location.reload();
      } else {
        setError(res.error || "Failed to add quick action.");
      }
    });
  };

  const handleRemoveQuickAction = async (actionId: string, label: string) => {
    if (!confirm(`Are you sure you want to remove quick action "${label}"?`)) return;

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await removeQuickAction(actionId);
      if (res.success) {
        setSuccess("Quick action card removed successfully.");
        window.location.reload();
      } else {
        setError(res.error || "Failed to remove quick action.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Intent List Sidebar */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 p-6 rounded shadow-sm space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-brand-slate-900 font-bold border-b border-slate-100 pb-2">
            AI Intent Pathways
          </h3>
          <nav className="flex flex-col space-y-1 text-xs">
            {initialIntents.map((intent) => (
              <button
                key={intent.id}
                onClick={() => handleSelectIntent(intent)}
                className={`w-full text-left px-3 py-2.5 rounded transition-colors font-medium flex justify-between items-center ${
                  selectedIntentId === intent.id
                    ? "bg-brand-slate-900 text-white font-semibold"
                    : "text-brand-text-muted hover:bg-slate-50 hover:text-brand-slate-900"
                }`}
              >
                <span>{intent.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-[3px] text-[9px] font-semibold border ${
                    intent.enabled
                      ? selectedIntentId === intent.id
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-slate-100 border-slate-200 text-slate-400"
                  }`}
                >
                  {intent.enabled ? "Active" : "Disabled"}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Tuning Workspace */}
      <div className="lg:col-span-3 space-y-6">
        {/* Error/Success Alert */}
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

        {selectedIntent ? (
          <div className="space-y-6">
            {/* Intent Settings Form */}
            <form
              onSubmit={handleUpdateIntent}
              className="bg-white border border-slate-200 p-6 rounded shadow-sm space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-serif font-semibold text-brand-slate-900">
                  Intent Tuning — {selectedIntent.name}
                </h3>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-brand-slate-900 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    disabled={isDbOffline}
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-brand-bronze focus:ring-brand-bronze"
                  />
                  Enable Intent Pathway
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-slate-900 uppercase tracking-wide mb-1">
                    Description / Purpose
                  </label>
                  <input
                    type="text"
                    disabled={isDbOffline}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-bronze"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-slate-900 uppercase tracking-wide mb-1">
                    Matching Priority Weight
                  </label>
                  <input
                    type="number"
                    disabled={isDbOffline}
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-bronze"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-slate-900 uppercase tracking-wide mb-1">
                  Response System Prompt Guidance (Instruction for LLM) *
                </label>
                <textarea
                  required
                  rows={4}
                  disabled={isDbOffline}
                  value={guidance}
                  onChange={(e) => setGuidance(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-bronze font-mono leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isDbOffline || isPending}
                  className="px-6 py-2.5 bg-brand-slate-900 text-white text-xs font-semibold rounded hover:bg-brand-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
                >
                  {isPending ? "Saving..." : "Save Configuration Parameters"}
                </button>
              </div>
            </form>

            {/* Keyword Chip Manager */}
            <div className="bg-white border border-slate-200 p-6 rounded shadow-sm space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-brand-slate-900 font-bold border-b border-slate-100 pb-2">
                Trigger Keywords
              </h3>

              {/* Keyword chips */}
              <div className="flex flex-wrap gap-2">
                {selectedIntent.keywords.length === 0 ? (
                  <span className="text-xs text-brand-text-muted italic">No keywords registered. Add keywords below to route inquiries.</span>
                ) : (
                  selectedIntent.keywords.map((kw) => (
                    <span
                      key={kw.id}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded px-2.5 py-1 text-xs text-brand-slate-900 font-medium font-mono"
                    >
                      {kw.keyword}
                      <button
                        type="button"
                        disabled={isDbOffline || isPending}
                        onClick={() => handleRemoveKeyword(kw.id, kw.keyword)}
                        className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer ml-1 font-sans font-bold text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Keyword Form */}
              <form onSubmit={handleAddKeyword} className="flex gap-2 max-w-sm pt-2">
                <input
                  type="text"
                  required
                  disabled={isDbOffline}
                  placeholder="e.g. shares"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-bronze font-mono"
                />
                <button
                  type="submit"
                  disabled={isDbOffline || isPending}
                  className="px-4 py-1.5 border border-brand-slate-900 bg-brand-slate-900 text-white text-xs font-semibold rounded hover:bg-brand-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
                >
                  + Add
                </button>
              </form>
            </div>

            {/* Quick Actions Manager */}
            <div className="bg-white border border-slate-200 p-6 rounded shadow-sm space-y-6">
              <h3 className="text-xs uppercase tracking-wider text-brand-slate-900 font-bold border-b border-slate-100 pb-2">
                Assistant Quick Action Pills
              </h3>

              {/* List Actions */}
              {selectedIntent.quickActions.length === 0 ? (
                <p className="text-xs text-brand-text-muted italic">No quick actions configured. These are floating suggestion buttons displayed alongside message bubbles.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded">
                  {selectedIntent.quickActions
                    .sort((a, b) => a.order - b.order)
                    .map((qa) => (
                      <div
                        key={qa.id}
                        className="p-4 flex justify-between items-center text-xs hover:bg-slate-50 transition-colors"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-brand-slate-900">
                            {qa.label} <span className="text-[10px] text-slate-400 font-mono">({qa.order})</span>
                          </p>
                          <p className="text-slate-500 font-mono text-[10px]">{qa.promptText}</p>
                        </div>
                        <button
                          disabled={isDbOffline || isPending}
                          onClick={() => handleRemoveQuickAction(qa.id, qa.label)}
                          className="text-red-600 hover:underline font-semibold disabled:opacity-30 disabled:no-underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* Add Action Form */}
              <form onSubmit={handleAddQuickAction} className="border border-slate-200 p-4 rounded bg-slate-50/50 space-y-4">
                <h4 className="text-xs font-semibold text-brand-slate-900 uppercase tracking-wide">
                  Add Suggestion Pill
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-brand-slate-900 uppercase mb-1">
                      Button Label *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Request Valuation"
                      disabled={isDbOffline}
                      value={newQaLabel}
                      onChange={(e) => setNewQaLabel(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-bronze bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-brand-slate-900 uppercase mb-1">
                      Prefilled Prompt Text (Sent to LLM) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. I want to request the corporate valuation overview."
                      disabled={isDbOffline}
                      value={newQaPrompt}
                      onChange={(e) => setNewQaPrompt(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-bronze bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-brand-slate-900 uppercase mb-1">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    disabled={isDbOffline}
                    value={newQaOrder}
                    onChange={(e) => setNewQaOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-24 px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-bronze bg-white"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isDbOffline || isPending}
                    className="px-4 py-2 border border-brand-slate-900 bg-brand-slate-900 text-white text-xs font-semibold rounded hover:bg-brand-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
                  >
                    + Add Suggestion Pill
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 p-12 text-center text-xs text-brand-text-muted rounded">
            No intents configured. Please ensure database seed is run.
          </div>
        )}
      </div>
    </div>
  );
}
