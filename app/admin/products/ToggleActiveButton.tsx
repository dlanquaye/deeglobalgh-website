"use client";

import { useRouter } from "next/navigation";

type Props = {
  id: string;
  isActive: boolean;
};

export default function ToggleActiveButton({ id, isActive }: Props) {
  const router = useRouter();

  async function handleToggle() {
    console.log("Toggle clicked for:", id);

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });

    console.log("Response status:", res.status);

    router.refresh();
  }

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-white ${
        isActive
          ? "bg-red-600 hover:bg-red-700"
          : "bg-green-600 hover:bg-green-700"
      }`}
    >
      {isActive ? "Deactivate" : "Activate"}
    </button>
  );
}