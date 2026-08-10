"use client";

import { useActionState } from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/categories/actions";
import { OrganizationDeleteButton } from "@/components/memos/organization-delete-button";
import { Icon } from "@/components/ui/icon";
import type { CategoryRecord } from "@/lib/memos/organization-queries";
import { initialOrganizationState } from "@/lib/memos/organization-state";
import {
  CATEGORY_COLORS,
  CATEGORY_NAME_MAX_LENGTH,
} from "@/lib/memos/organization-validation";

const colorLabels = {
  blue: "ブルー",
  orange: "オレンジ",
  violet: "バイオレット",
};

const colorClasses = {
  blue: "bg-[#5e8bff]",
  orange: "bg-[#ff9f56]",
  violet: "bg-[#a67cf7]",
};

function Feedback({ message, status }: { message: string; status: "error" | "idle" | "success" }) {
  if (!message) return null;
  return (
    <p
      className={`mt-3 text-sm ${status === "error" ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`}
      role={status === "error" ? "alert" : "status"}
    >
      {message}
    </p>
  );
}

function CategoryRow({ category }: { category: CategoryRecord }) {
  const updateAction = updateCategoryAction.bind(null, category.id);
  const deleteAction = deleteCategoryAction.bind(null, category.id);
  const [state, formAction, isPending] = useActionState(
    updateAction,
    initialOrganizationState,
  );

  return (
    <article className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-raised)] p-4 shadow-[0_2px_8px_rgba(20,24,31,0.025)]">
      <form action={formAction} aria-label={`${category.name}を編集`}>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_13rem_auto] md:items-end">
          <div>
            <label className="text-sm font-semibold text-[var(--ink)]" htmlFor={`category-name-${category.id}`}>
              カテゴリ名
            </label>
            <input
              aria-invalid={state.fieldErrors.name ? "true" : undefined}
              className="mt-2 h-10 w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--ink)] outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
              defaultValue={category.name}
              id={`category-name-${category.id}`}
              maxLength={CATEGORY_NAME_MAX_LENGTH}
              name="name"
            />
            {state.fieldErrors.name && <p className="mt-2 text-sm text-red-700 dark:text-red-300">{state.fieldErrors.name}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-[var(--ink)]" htmlFor={`category-color-${category.id}`}>
              分類色
            </label>
            <select
              className="mt-2 h-10 w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--ink)] outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
              defaultValue={category.colorKey}
              id={`category-color-${category.id}`}
              name="colorKey"
            >
              {CATEGORY_COLORS.map((color) => <option key={color} value={color}>{colorLabels[color]}</option>)}
            </select>
          </div>
          <button className="secondary-button w-full md:w-auto" disabled={isPending} type="submit">
            <Icon name="check" size={16} />
            {isPending ? "保存中…" : "変更を保存"}
          </button>
        </div>
        <Feedback message={state.message} status={state.status} />
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hairline-soft)] pt-4">
        <p className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <span className={`size-2 rounded-full ${colorClasses[category.colorKey]}`} />
          {category.memoCount}件のメモ
        </p>
        <OrganizationDeleteButton
          action={deleteAction}
          kind="category"
          memoCount={category.memoCount}
          name={category.name}
        />
      </div>
    </article>
  );
}

export function CategoryManager({ categories }: { categories: CategoryRecord[] }) {
  const [state, formAction, isPending] = useActionState(
    createCategoryAction,
    initialOrganizationState,
  );

  return (
    <div className="mt-9 grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
      <form
        action={formAction}
        aria-label="カテゴリを作成"
        className="rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-5 shadow-[0_2px_3px_rgba(20,24,31,0.02),0_12px_30px_rgba(20,24,31,0.025)]"
        key={state.submissionId}
      >
        <h2 className="section-title">新しいカテゴリ</h2>
        <div className="mt-5">
          <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="new-category-name">カテゴリ名</label>
          <input
            aria-invalid={state.fieldErrors.name ? "true" : undefined}
            className="mt-2 h-10 w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--ink)] outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
            id="new-category-name"
            maxLength={CATEGORY_NAME_MAX_LENGTH}
            name="name"
            required
          />
          {state.fieldErrors.name && <p className="mt-2 text-sm text-red-700 dark:text-red-300">{state.fieldErrors.name}</p>}
        </div>
        <div className="mt-4">
          <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="new-category-color">分類色</label>
          <select
            className="mt-2 h-10 w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--ink)] outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
            defaultValue="blue"
            id="new-category-color"
            name="colorKey"
          >
            {CATEGORY_COLORS.map((color) => <option key={color} value={color}>{colorLabels[color]}</option>)}
          </select>
        </div>
        <Feedback message={state.message} status={state.status} />
        <button className="primary-button mt-5 w-full" disabled={isPending} type="submit">
          <Icon name="plus" size={16} />
          {isPending ? "作成中…" : "カテゴリを作成"}
        </button>
      </form>

      <section aria-labelledby="saved-categories-title">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="section-title" id="saved-categories-title">保存済みカテゴリ</h2>
          <span className="text-xs text-[var(--muted-soft)]">{categories.length}件</span>
        </div>
        {categories.length > 0 ? (
          <div className="space-y-3">{categories.map((category) => <CategoryRow category={category} key={category.id} />)}</div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-[var(--hairline)] bg-[var(--surface-raised)] px-6 py-10 text-center">
            <p className="text-sm leading-6 text-[var(--muted)]">カテゴリはまだありません。左のフォームから最初のカテゴリを作成できます。</p>
          </div>
        )}
      </section>
    </div>
  );
}
