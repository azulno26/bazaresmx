"use client";

import { trackEvent } from "@/src/lib/analytics";
import Link from "next/link";

interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  eventName: string;
  params?: Record<string, string | number>;
  children: React.ReactNode;
}

export default function TrackedLink({ eventName, params, children, href, ...props }: Props) {
  const handleClick = () => {
    trackEvent(eventName, params);
  };

  const isInternal = href && href.startsWith("/") && !href.startsWith("//");

  if (isInternal) {
    return (
      <Link href={href} {...(props as any)} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
