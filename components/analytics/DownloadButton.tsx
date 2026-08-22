"use client";

import React from "react";
import { trackGAEvent } from "@/lib/analytics/events";

interface DownloadButtonProps {
  href: string;
  documentTitle: string;
  category: string;
  isPrivate: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function DownloadButton({
  href,
  documentTitle,
  category,
  isPrivate,
  className = "",
  children,
}: DownloadButtonProps) {
  const handleClick = () => {
    trackGAEvent("investor_document_download", {
      document_title: documentTitle,
      category,
      is_private: isPrivate ? "true" : "false",
    });
  };

  return (
    <a
      href={href}
      download
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
