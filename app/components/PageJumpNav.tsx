"use client";

import { useEffect, useState } from "react";

export default function PageJumpNav() {
  const [canGoUp, setCanGoUp] = useState(false);
  const [canGoDown, setCanGoDown] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop;

      const viewportHeight = window.innerHeight;

      const documentHeight =
        document.documentElement.scrollHeight;

      const distanceFromBottom =
        documentHeight - (scrollTop + viewportHeight);

      setCanGoUp(scrollTop > 300);
      setCanGoDown(distanceFromBottom > 300);
    };

    updatePosition();

    window.addEventListener("scroll", updatePosition, {
      passive: true,
    });

    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  if (!canGoUp && !canGoDown) {
    return null;
  }

  return (
    <nav
      aria-label="Page navigation"
      className="fixed bottom-20 right-4 z-40 flex flex-col gap-2"
    >
      {canGoUp && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Go to top of page"
          title="Go to top"
          className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          ↑ Top
        </button>
      )}

      {canGoDown && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Go to bottom of page"
          title="Go to bottom"
          className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          ↓ Bottom
        </button>
      )}
    </nav>
  );
}
