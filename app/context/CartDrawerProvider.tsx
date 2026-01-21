"use client";

import React, { createContext, useContext, useState } from "react";
import CartDrawer from "@/app/components/CartDrawer";

type DrawerContextValue = {
  openDrawer: () => void;
  closeDrawer: () => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer }}>
      {children}

      {/* Drawer UI mounted globally */}
      <CartDrawer open={open} onClose={closeDrawer} />
    </DrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useCartDrawer must be used inside CartDrawerProvider");
  return ctx;
}
