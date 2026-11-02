"use client";

import Image, { type ImageProps } from "next/image";

export default function ProtectedProductImage(
  props: ImageProps
) {
  return (
    <Image
      {...props}
      draggable={false}
      onContextMenu={(event) => {
        event.preventDefault();
      }}
      onDragStart={(event) => {
        event.preventDefault();
      }}
      onCopy={(event) => {
        event.preventDefault();
      }}
      style={{
        ...props.style,
        WebkitUserDrag: "none",
        userSelect: "none",
      } as React.CSSProperties}
    />
  );
}
