"use client";

import type { ReactNode } from "react";
import { trackWhatsAppClick } from "@/app/lib/analytics";

type TrackedWhatsAppLinkProps = {
  href: string;
  linkLocation: string;
  className?: string;
  children: ReactNode;
  productName?: string;
};

export default function TrackedWhatsAppLink({
  href,
  linkLocation,
  className,
  children,
  productName,
}: TrackedWhatsAppLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() =>
        trackWhatsAppClick(
          linkLocation,
          "whatsapp",
          productName
        )
      }
    >
      {children}
    </a>
  );
}