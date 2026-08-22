"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6 bg-slate-50 min-h-screen">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded p-10 shadow-sm space-y-6 text-center">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200">
            <svg
              className="w-6 h-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-medium text-brand-slate-900">
            Access Denied
          </h1>
          <p className="text-sm text-brand-text-muted font-sans leading-relaxed">
            Your Google Account has successfully authenticated, but it is not authorized to access
            the requested administrative sections.
          </p>
        </div>

        {/* Action buttons */}
        <div className="pt-4 space-y-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full px-5 py-2.5 border border-brand-slate-900 bg-brand-slate-900 text-white text-xs font-sans font-medium rounded hover:bg-brand-slate-800 transition-colors cursor-pointer"
          >
            Sign out and Try Another Account
          </button>
          <Link
            href="/"
            className="block w-full px-5 py-2.5 border border-brand-border text-brand-slate-900 text-xs font-sans font-medium rounded hover:bg-slate-50 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
