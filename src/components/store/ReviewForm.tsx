"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { submitReviewAction } from "@/server/content-actions";

export function ReviewForm({ productId, signedIn }: { productId: string; signedIn: boolean }) {
  const [pending, start] = useTransition();
  if (!signedIn) {
    return <p className="mt-6 text-sm text-muted">Log in to write a review.</p>;
  }
  return (
    <form
      className="mt-6 grid max-w-lg gap-3"
      action={(data) =>
        start(async () => {
          const result = await submitReviewAction(data);
          if (result.error) toast.error(result.error);
          else toast.success(result.message || "Review submitted");
        })
      }
    >
      <input type="hidden" name="productId" value={productId} />
      <label className="text-sm">
        Rating
        <select name="rating" className="mt-1 w-full rounded-xl border border-border bg-bg-elevated px-3 py-2" defaultValue="5">
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Review
        <textarea name="comment" required minLength={8} className="mt-1 min-h-28 w-full rounded-xl border border-border bg-bg-elevated p-3" />
      </label>
      <button disabled={pending} className="w-fit rounded-full bg-text px-5 py-2 text-sm text-bg">
        {pending ? "Sending..." : "Submit review"}
      </button>
    </form>
  );
}
