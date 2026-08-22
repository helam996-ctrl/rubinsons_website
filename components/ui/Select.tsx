import React, { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = "", id, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full font-sans">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={id}
            ref={ref}
            className={`w-full appearance-none px-4 py-2.5 bg-white border border-brand-border rounded text-sm text-brand-slate-900 focus:outline-none focus:border-brand-bronze focus:ring-1 focus:ring-brand-bronze transition-colors cursor-pointer ${
              error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
export { Select };
