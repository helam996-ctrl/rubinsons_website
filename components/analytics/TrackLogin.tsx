"use client";

import { useEffect } from "react";
import { trackGAEvent } from "@/lib/analytics/events";

interface TrackLoginProps {
  email: string;
}

export default function TrackLogin({ email }: TrackLoginProps) {
  useEffect(() => {
    const hashEmail = async (text: string) => {
      try {
        const msgUint8 = new TextEncoder().encode(text.toLowerCase());
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        trackGAEvent("investor_portal_login", { user_id: hashHex });
      } catch {
        trackGAEvent("investor_portal_login", { user_id: "anonymous_fallback" });
      }
    };
    if (email) {
      hashEmail(email);
    }
  }, [email]);

  return null;
}
