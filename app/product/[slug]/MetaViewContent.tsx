"use client";

import { useEffect, useRef } from "react";

type MetaViewContentProps = {
  productId: string;
  productName: string;
  productSlug: string;
  value: number;
  category: string;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function MetaViewContent({
  productId,
  productName,
  productSlug,
  value,
  category,
}: MetaViewContentProps) {
  const fired = useRef(false);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20;

    const sendViewContent = () => {
      if (fired.current) {
        return true;
      }

      if (!window.fbq) {
        return false;
      }

      window.fbq("track", "ViewContent", {
        content_ids: [productId],
        content_name: productName,
        content_type: "product",
        content_category: category,
        content_url: `https://www.shopdeeglobalgh.com/product/${productSlug}`,
        value,
        currency: "GHS",
      });

      fired.current = true;
      return true;
    };

    if (sendViewContent()) {
      return;
    }

    const interval = window.setInterval(() => {
      attempts += 1;

      if (sendViewContent() || attempts >= maxAttempts) {
        window.clearInterval(interval);
      }
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [productId, productName, productSlug, value, category]);

  return null;
}