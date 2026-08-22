import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "link";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  // Styles based on DESIGN.md
  const baseStyles = "inline-flex items-center justify-center font-sans font-medium rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants = {
    primary: "bg-brand-slate-900 border border-brand-slate-900 text-white hover:bg-brand-slate-800 focus:ring-2 focus:ring-brand-bronze focus:outline-none",
    secondary: "border border-brand-bronze text-brand-slate-900 bg-transparent hover:bg-slate-50 focus:ring-2 focus:ring-brand-bronze focus:outline-none",
    link: "text-brand-bronze-dark hover:underline bg-transparent px-0 py-0",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };

  const selectedVariant = variants[variant];
  const selectedSize = variant === "link" ? "" : sizes[size];

  return (
    <button
      type={type}
      className={`${baseStyles} ${selectedVariant} ${selectedSize} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
