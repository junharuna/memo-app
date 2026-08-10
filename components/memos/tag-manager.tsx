"use client";

import { useActionState } from "react";
import { createTagAction, deleteTagAction, updateTagAction } from "@/app/tags/actions";
import { OrganizationDeleteButton } from "@/components/memos/organization-delete-button";
import { Icon } from "@/components/ui/icon";
import type { TagRecord } from "@/lib/memos/organization-queries";
import { initialOrganizationState } from "@/lib/memos/organization-state";
import { TAG_NAME_MAX_LENGTH } from "@/lib/memos/organization-validation";

function TagRow({ tag }: { tag: TagRecord }) {
  const [state, formAction, isPending] = useActionState(
    updateTagAction.bind(null, tag.id),
    initialOrganizationState,
  );

  return (
    <article className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-raised)] p-4 shadow-[0_2px_8px_rgba(20,24,31,0.025)]">
      <form action={formAction} aria-label={`${tag.name}を編集`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="text-sm font-semibold text-[var(--ink)]" htmlFor={`tag-name-${tag.id}`}>タグ名</label>
            <div className="mt-2 flex h-10 items-center rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10">
              <span className="pl-3 text-sm text-[var(--muted-soft)]">#</span>
              <input
                aria-invalid={state.fieldErrors.name ? "true" : undefined}
                className="min-w-0 flex-1 bg-transparent px-1.5 pr-3 text-sm text-[var(--ink)] outline-none"
                defaultValue={tag.name}
                id={`tag-name-${tag.id}`}
                maxLength={TAG_NAME_MAX_LENGTH}
                name="name"
              />
            </div>
            {state.fieldErrors.name && <p className="mt-2 text-sm text-red-700 dark:text-red-300">{state.fieldErrors.name}</p>}
          </div>
          <button className="secondary-button w-full sm:w-auto" disabled={isPending} type="submit">
            <Icon name="check" size={16} />
            {isPending ? "保存中…" : "変更を保存"}
          </button>
        </div>
        {state.message && <p className={`mt-3 text-sm ${state.status === "error" ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hairline-soft)] pt-4">
        <p className="text-xs text-[var(--muted)]">{tag.memoCount}件のメモ</p>
        <OrganizationDeleteButton action={deleteTagAction.bind(null, tag.id)} kind="tag" memoCount={tag.memoCount} name={tag.name} />
      </div>
    </article>
  );
}

export function TagManager({ tags }: { tags: TagRecord[] }) {
  const [state, formAction, isPending] = useActionState(createTagAction, initialOrganizationState);

  return (
    <div className="mt-9 grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
      <form
        action={formAction}
        aria-label="タグを作成"
        className="rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-5 shadow-[0_2px_3px_rgba(20,24,31,0.02),0_12px_30px_rgba(20,24,31,0.025)]"
        key={state.submissionId}
      >
        <h2 className="section-title">新しいタグ</h2>
        <div className="mt-5">
          <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="new-tag-name">タグ名</label>
          <div className="mt-2 flex h-10 items-center rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10">
            <span className="pl-3 text-sm text-[var(--muted-soft)]">#</span>
            <input
              aria-invalid={state.fieldErrors.name ? "true" : undefined}
              className="min-w-0 flex-1 bg-transparent px-1.5 pr-3 text-sm text-[var(--ink)] outline-none"
              id="new-tag-name"
              maxLength={TAG_NAME_MAX_LENGTH}
              name="name"
              required
            />
          </div>
          {state.fieldErrors.name && <p className="mt-2 text-sm text-red-700 dark:text-red-300">{state.fieldErrors.name}</p>}
        </div>
        {state.message && <p className={`mt-3 text-sm ${state.status === "error" ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
        <button className="primary-button mt-5 w-full" disabled={isPending} type="submit">
          <Icon name="plus" size={16} />
          {isPending ? "作成中…" : "タグを作成"}
        </button>
      </form>
      <section aria-labelledby="saved-tags-title">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="section-title" id="saved-tags-title">保存済みタグ</h2>
          <span className="text-xs text-[var(--muted-soft)]">{tags.length}件</span>
        </div>
        {tags.length > 0 ? (
          <div className="space-y-3">{tags.map((tag) => <TagRow key={tag.id} tag={tag} />)}</div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-[var(--hairline)] bg-[var(--surface-raised)] px-6 py-10 text-center">
            <p className="text-sm leading-6 text-[var(--muted)]">タグはまだありません。左のフォームから最初のタグを作成できます。</p>
          </div>
        )}
      </section>
    </div>
  );
}
