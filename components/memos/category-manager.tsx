"use client";

import { useActionState } from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/categories/actions";
import { OrganizationDeleteButton } from "@/components/memos/organization-delete-button";
import { Icon } from "@/components/ui/icon";
import {
  CATEGORY_COLOR_OPTIONS,
  getCategoryColorPresentation,
  type CategoryColor,
} from "@/lib/memos/category-colors";
import type { CategoryRecord } from "@/lib/memos/organization-queries";
import { initialOrganizationState } from "@/lib/memos/organization-state";
import { CATEGORY_NAME_MAX_LENGTH } from "@/lib/memos/organization-validation";

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

function CategoryColorPicker({
  defaultColor,
  error,
  idPrefix,
  wide = false,
}: {
  defaultColor: CategoryColor;
  error?: string;
  idPrefix: string;
  wide?: boolean;
}) {
  const errorId = `${idPrefix}-error`;

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="text-sm font-semibold text-[var(--ink)]">分類色</legend>
      <div
        className={`mt-2 grid grid-cols-2 gap-2 ${wide ? "md:grid-cols-5" : ""}`}
      >
        {CATEGORY_COLOR_OPTIONS.map((color) => (
          <label
            className="relative flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--nav-hover)]"
            key={color.key}
          >
            <input
              className="peer sr-only"
              defaultChecked={color.key === defaultColor}
              name="colorKey"
              type="radio"
              value={color.key}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-xl border border-[var(--hairline)] peer-checked:border-blue-500/45 peer-checked:bg-blue-500/8 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-500/20"
            />
            <span
              aria-hidden="true"
              className="relative size-4 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/20"
              data-testid={`category-color-swatch-${color.key}`}
              style={{ backgroundColor: color.value }}
            />
            <span className="relative min-w-0 truncate pr-4 peer-checked:text-[var(--ink)]">
              {color.label}
            </span>
            <Icon
              className="absolute right-2.5 z-10 shrink-0 text-blue-600 opacity-0 peer-checked:opacity-100 dark:text-blue-300"
              name="check"
              size={14}
            />
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-700 dark:text-red-300" id={errorId}>
          {error}
        </p>
      )}
    </fieldset>
  );
}

function CategoryRow({ category }: { category: CategoryRecord }) {
  const updateAction = updateCategoryAction.bind(null, category.id);
  const deleteAction = deleteCategoryAction.bind(null, category.id);
  const [state, formAction, isPending] = useActionState(
    updateAction,
    initialOrganizationState,
  );
  const color = getCategoryColorPresentation(category.colorKey);

  return (
    <article className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-raised)] p-4 shadow-[0_2px_8px_rgba(20,24,31,0.025)]">
      <form action={formAction} aria-label={`${category.name}を編集`}>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
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
          <button className="secondary-button w-full md:w-auto" disabled={isPending} type="submit">
            <Icon name="check" size={16} />
            {isPending ? "保存中…" : "変更を保存"}
          </button>
        </div>
        <div className="mt-4">
          <CategoryColorPicker
            defaultColor={category.colorKey}
            error={state.fieldErrors.colorKey}
            idPrefix={`category-color-${category.id}`}
            wide
          />
        </div>
        <Feedback message={state.message} status={state.status} />
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hairline-soft)] pt-4">
        <p className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <span
            aria-hidden="true"
            className="size-2 rounded-full"
            data-testid={`saved-category-color-${category.colorKey}`}
            style={{ backgroundColor: color.value }}
          />
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
          <CategoryColorPicker
            defaultColor="blue"
            error={state.fieldErrors.colorKey}
            idPrefix="new-category-color"
          />
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
