"use client";

import { useActionState, useId, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import {
  initialOrganizationState,
  type OrganizationState,
} from "@/lib/memos/organization-state";

type BoundDeleteAction = (
  previousState: OrganizationState,
  formData: FormData,
) => Promise<OrganizationState>;

type OrganizationDeleteButtonProps = {
  action: BoundDeleteAction;
  kind: "category" | "tag";
  memoCount: number;
  name: string;
};

export function OrganizationDeleteButton({
  action,
  kind,
  memoCount,
  name,
}: OrganizationDeleteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [state, formAction, isPending] = useActionState(
    action,
    initialOrganizationState,
  );
  const isCategory = kind === "category";
  const label = isCategory ? "カテゴリ" : "タグ";

  return (
    <>
      <button
        aria-label={`${name}を削除`}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-500/20 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-500/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 dark:text-red-300"
        onClick={() => dialogRef.current?.showModal()}
        type="button"
      >
        <Icon name="trash" size={16} />
        削除
      </button>
      <dialog
        aria-describedby={`${id}-description`}
        aria-labelledby={`${id}-title`}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[24px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-0 text-[var(--ink)] shadow-[0_24px_80px_rgba(10,12,18,0.28)] backdrop:bg-black/40 backdrop:backdrop-blur-[2px]"
        ref={dialogRef}
      >
        <form action={formAction} aria-busy={isPending} className="p-5 sm:p-6">
          <div className="flex size-11 items-center justify-center rounded-full bg-red-500/10 text-red-700 dark:text-red-300">
            <Icon name="trash" size={20} />
          </div>
          <h2
            className="mt-4 text-xl font-semibold tracking-[-0.03em]"
            id={`${id}-title`}
          >
            {label}を削除しますか？
          </h2>
          <p
            className="mt-3 break-words text-sm leading-6 text-[var(--muted)]"
            id={`${id}-description`}
          >
            「{name}」を削除します。
            {isCategory
              ? `${memoCount}件のメモは未分類になります。`
              : `${memoCount}件のメモからこのタグが外れます。`}
            メモ自体は削除されません。
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
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:bg-red-500 dark:hover:bg-red-400"
              disabled={isPending}
              type="submit"
            >
              <Icon name="trash" size={16} />
              {isPending ? "削除中…" : "削除を確定"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
