"use client";

import React from "react";
import Link from "next/link";
import { trackGAEvent } from "@/lib/analytics/events";

interface TrackCtaLinkProps {
  href: string;
  location: "Header" | "Hero" | "Footer" | "CTA_Section";
  className?: string;
  children: React.ReactNode;
}

export default function TrackCtaLink({
  href,
  location,
  className = "",
  children,
}: TrackCtaLinkProps) {
  const handleClick = () => {
    trackGAEvent("investor_cta_click", { location });
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
