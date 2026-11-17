"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function DeeGlobalLiveChat() {
  const pathname = usePathname();

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  ) {
    return null;
  }

  return (
    <Script
      id="deeglobalgh-tawk"
      src="https://embed.tawk.to/6afc9fde1cd1b23cca19a24c/1k7ld1022"
      strategy="lazyOnload"
    />
  );
}