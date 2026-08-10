"use client";

import { useActionState } from "react";
import { mutateMemoLifecycleAction } from "@/app/memos/[id]/lifecycle/actions";
import { MemoDeleteButton } from "@/components/memos/memo-delete-button";
import { Icon, type IconName } from "@/components/ui/icon";
import { initialMemoLifecycleActionState } from "@/lib/memos/lifecycle-state";

type LifecycleIntent =
  | "archive"
  | "favorite"
  | "restore"
  | "trash"
  | "unarchive"
  | "unfavorite";

type LifecycleActionButtonProps = {
  icon: IconName;
  intent: LifecycleIntent;
  label: string;
  memoId: string;
  tone?: "default" | "danger";
};

function LifecycleActionButton({
  icon,
  intent,
  label,
  memoId,
  tone = "default",
}: LifecycleActionButtonProps) {
  const boundAction = mutateMemoLifecycleAction.bind(null, memoId);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialMemoLifecycleActionState,
  );
  const buttonClass =
    tone === "danger"
      ? "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/8 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-500/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-wait disabled:opacity-60 dark:text-red-300"
      : "secondary-button";

  return (
    <form action={formAction} className="contents">
      <input name="intent" type="hidden" value={intent} />
      <button className={buttonClass} disabled={isPending} type="submit">
        <Icon name={icon} size={17} />
        {isPending ? "処理中…" : label}
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

type MemoLifecycleControlsProps = {
  archivedAt: string | null;
  favoritedAt: string | null;
  memoId: string;
  memoTitle: string;
  trashedAt: string | null;
};

export function MemoLifecycleControls({
  archivedAt,
  favoritedAt,
  memoId,
  memoTitle,
  trashedAt,
}: MemoLifecycleControlsProps) {
  if (trashedAt) {
    return (
      <>
        <LifecycleActionButton
          icon="inbox"
          intent="restore"
          label="メモを復元"
          memoId={memoId}
        />
        <MemoDeleteButton memoId={memoId} memoTitle={memoTitle} />
      </>
    );
  }

  return (
    <>
      <LifecycleActionButton
        icon="star"
        intent={favoritedAt ? "unfavorite" : "favorite"}
        label={favoritedAt ? "お気に入りから外す" : "お気に入りに追加"}
        memoId={memoId}
      />
      <LifecycleActionButton
        icon="archive"
        intent={archivedAt ? "unarchive" : "archive"}
        label={archivedAt ? "アーカイブを解除" : "アーカイブ"}
        memoId={memoId}
      />
      <LifecycleActionButton
        icon="trash"
        intent="trash"
        label="ゴミ箱に移動"
        memoId={memoId}
        tone="danger"
      />
    </>
  );
}
