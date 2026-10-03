"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { trackSelectItem } from "@/app/lib/analytics";

type TrackedProductLinkProps = {
  href: string;
  itemId: string;
  itemName: string;
  price: number;
  itemBrand?: string;
  itemListId: string;
  itemListName: string;
  className?: string;
  children: ReactNode;
};

export default function TrackedProductLink({
  href,
  itemId,
  itemName,
  price,
  itemBrand,
  itemListId,
  itemListName,
  className,
  children,
}: TrackedProductLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackSelectItem({
          itemId,
          itemName,
          price,
          itemBrand,
          itemListId,
          itemListName,
        })
      }
    >
      {children}
    </Link>
  );
}
