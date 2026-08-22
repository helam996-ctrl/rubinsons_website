"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/admin" });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center p-6 bg-slate-50 min-h-screen" suppressHydrationWarning>
      <div className="w-full max-w-md bg-white border border-slate-200 rounded p-10 shadow-sm space-y-8" suppressHydrationWarning>
        {/* Header */}
        <div className="text-center space-y-2" suppressHydrationWarning>
          <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-sans font-medium">
            Portal Access
          </span>
          <h1 className="text-3xl font-serif font-medium text-brand-slate-900">
            Rubinsons Group
          </h1>
          <p className="text-sm text-brand-text-muted font-sans">
            Authentication is required to access administrative panel and confidential investor resources.
          </p>
        </div>

        {/* Action */}
        <div className="space-y-4 pt-4" suppressHydrationWarning>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 border border-brand-slate-900 bg-brand-slate-900 text-white text-sm font-sans font-medium rounded hover:bg-brand-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="animate-pulse">Connecting...</span>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.85-6.277-6.36s2.811-6.358 6.277-6.358c1.624 0 3.036.57 4.137 1.632l3.07-3.07C19.245 2.64 15.93 1.5 12.24 1.5 6.033 1.5 1 6.533 1 12.74s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.99 0-.746-.08-1.32-.224-1.705H12.24z" />
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center" suppressHydrationWarning>
          <Link
            href="/"
            className="text-xs text-brand-bronze-dark hover:underline font-sans font-medium"
          >
            &larr; Return to Public Website
          </Link>
        </div>
      </div>
    </main>
  );
}
