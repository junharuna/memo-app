"use client";

import { useActionState } from "react";
import { mutateMemoLifecycleAction } from "@/app/memos/[id]/lifecycle/actions";
import { Icon } from "@/components/ui/icon";
import { initialMemoLifecycleActionState } from "@/lib/memos/lifecycle-state";

type MemoFavoriteButtonProps = {
  favorited: boolean;
  memoId: string;
};

export function MemoFavoriteButton({ favorited, memoId }: MemoFavoriteButtonProps) {
  const boundAction = mutateMemoLifecycleAction.bind(null, memoId);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialMemoLifecycleActionState,
  );
  const label = favorited ? "お気に入りから外す" : "お気に入りに追加";

  return (
    <form action={formAction} className="relative z-20">
      <input
        name="intent"
        type="hidden"
        value={favorited ? "unfavorite" : "favorite"}
      />
      <button
        aria-label={label}
        className={`flex size-10 items-center justify-center rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] transition hover:bg-[var(--nav-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-wait disabled:opacity-60 ${favorited ? "text-amber-500" : "text-[var(--muted-soft)]"}`}
        disabled={isPending}
        title={label}
        type="submit"
      >
        <Icon className={favorited ? "fill-current" : undefined} name="star" size={18} />
      </button>
      {state.status !== "idle" && (
        <span
          className="sr-only"
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </span>
      )}
    </form>
  );
}
