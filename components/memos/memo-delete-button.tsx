"use client";

import { useActionState, useRef } from "react";
import { deleteMemoAction } from "@/app/memos/[id]/delete/actions";
import { Icon } from "@/components/ui/icon";
import { initialDeleteMemoState } from "@/lib/memos/delete-state";

type MemoDeleteButtonProps = {
  memoId: string;
  memoTitle: string;
};

export function MemoDeleteButton({ memoId, memoTitle }: MemoDeleteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const deleteAction = deleteMemoAction.bind(null, memoId);
  const [state, formAction, isPending] = useActionState(
    deleteAction,
    initialDeleteMemoState,
  );

  return (
    <>
      <button
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/8 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-500/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 dark:text-red-300"
        onClick={() => dialogRef.current?.showModal()}
        type="button"
      >
        <Icon name="trash" size={17} />
        メモを削除
      </button>

      <dialog
        aria-describedby="memo-delete-description"
        aria-labelledby="memo-delete-title"
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[24px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-0 text-[var(--ink)] shadow-[0_24px_80px_rgba(10,12,18,0.28)] backdrop:bg-black/40 backdrop:backdrop-blur-[2px]"
        ref={dialogRef}
      >
        <form action={formAction} aria-busy={isPending} className="p-5 sm:p-6">
          <input name="intent" type="hidden" value="delete-memo" />
          <div className="flex size-11 items-center justify-center rounded-full bg-red-500/10 text-red-700 dark:text-red-300">
            <Icon name="trash" size={20} />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em]" id="memo-delete-title">
            メモを削除しますか？
          </h2>
          <p
            className="mt-3 break-words text-sm leading-6 text-[var(--muted)]"
            id="memo-delete-description"
          >
            「{memoTitle}」を完全に削除します。この操作は取り消せません。
          </p>

          {state.status === "error" && (
            <p
              className="mt-4 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5 text-sm leading-6 text-red-700 dark:text-red-300"
              role="alert"
            >
              {state.message}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              className="secondary-button w-full sm:w-auto"
              disabled={isPending}
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              キャンセル
            </button>
            <button
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:bg-red-500 dark:text-white dark:hover:bg-red-400"
              disabled={isPending}
              type="submit"
            >
              <Icon name="trash" size={17} />
              {isPending ? "削除中…" : "削除を確定"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
