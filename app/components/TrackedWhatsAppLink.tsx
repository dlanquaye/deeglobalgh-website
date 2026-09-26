"use client";

import type { CSSProperties, ReactNode } from "react";
import { trackWhatsAppClick } from "@/app/lib/analytics";

type TrackedWhatsAppLinkProps = {
  href: string;
  linkLocation: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  productName?: string;
};

export default function TrackedWhatsAppLink({
  href,
  linkLocation,
  className,
  style,
  children,
  productName,
}: TrackedWhatsAppLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
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