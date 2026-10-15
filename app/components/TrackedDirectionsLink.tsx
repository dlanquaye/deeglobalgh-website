"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { trackDirectionsClick } from "@/app/lib/analytics";

type TrackedDirectionsLinkProps = {
  href: string;
  linkLocation: string;
  className?: string;
  children: ReactNode;
};

export default function TrackedDirectionsLink({
  href,
  linkLocation,
  className,
  children,
}: TrackedDirectionsLinkProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackDirectionsClick(linkLocation, href)}
    >
      {children}
    </Link>
  );
}