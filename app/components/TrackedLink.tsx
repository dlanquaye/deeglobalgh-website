"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { trackNavigationClick } from "@/app/lib/analytics";

type TrackedLinkProps = {
  href: string;
  linkLocation: string;
  contentType?: string;
  contentName?: string;
  className?: string;
  children: ReactNode;
};

export default function TrackedLink({
  href,
  linkLocation,
  contentType,
  contentName,
  className,
  children,
}: TrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackNavigationClick(
          linkLocation,
          href,
          contentType,
          contentName
        )
      }
    >
      {children}
    </Link>
  );
}
