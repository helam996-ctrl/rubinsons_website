import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full font-sans">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`w-full px-4 py-2.5 bg-white border border-brand-border rounded text-sm text-brand-slate-900 focus:outline-none focus:border-brand-bronze focus:ring-1 focus:ring-brand-bronze transition-colors placeholder-slate-400 ${
            error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
export { Input };
