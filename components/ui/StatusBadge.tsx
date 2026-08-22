import React from "react";

interface StatusBadgeProps {
  status: "NEW" | "CONTACTED" | "IN_PROGRESS" | "CLOSED" | "SPAM" | "ACTIVE" | "PLANNED";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    // Inquiry statuses
    NEW: "bg-amber-50 text-amber-800 border-amber-200",
    CONTACTED: "bg-blue-50 text-blue-800 border-blue-200",
    IN_PROGRESS: "bg-indigo-50 text-indigo-800 border-indigo-200",
    CLOSED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    SPAM: "bg-slate-100 text-slate-700 border-slate-200",
    // Business statuses
    ACTIVE: "bg-emerald-50 text-emerald-800 border-emerald-200",
    PLANNED: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const selectedStyle = styles[status] || styles.SPAM;

  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold font-sans tracking-wide uppercase ${selectedStyle}`}>
      {status.replace("_", " ")}
    </span>
  );
}
