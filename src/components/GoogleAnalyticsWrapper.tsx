"use client";

import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function GoogleAnalyticsWrapper({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin || !gaId) return null;

  return <GoogleAnalytics gaId={gaId} />;
}
