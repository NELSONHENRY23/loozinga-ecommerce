"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteProduct } from "@/app/admin/products/actions";

type Props = {
  productId: string;
  productName: string;
};

export default function DeleteProductButton({
  productId,
  productName,
}: Props) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${productName}" and all its images? This cannot be undone.`,
    );

    if (!confirmed) return;

    setError("");

    startTransition(async () => {
      try {
        const result = await deleteProduct(productId);

        if (!result.success) {
          setError(result.message);
          return;
        }

        if (result.message !== "Product deleted successfully.") {
          window.alert(result.message);
        }

        router.refresh();
      } catch (error) {
        console.error(error);
        setError("Could not delete product.");
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded bg-red-500 px-3 py-2 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={16} />

        {isPending ? "Deleting..." : "Delete"}
      </button>

      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}