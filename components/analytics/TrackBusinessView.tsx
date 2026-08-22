"use client";

import { useEffect } from "react";
import { trackGAEvent } from "@/lib/analytics/events";

interface TrackBusinessViewProps {
  slug: string;
  title: string;
}

export default function TrackBusinessView({ slug, title }: TrackBusinessViewProps) {
  useEffect(() => {
    trackGAEvent("business_viewed", {
      business_slug: slug,
      business_title: title,
    });
  }, [slug, title]);

  return null;
}
