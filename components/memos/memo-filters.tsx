"use client";

import Link from "next/link";
import { useRef } from "react";
import { Icon } from "@/components/ui/icon";
import {
  buildMemoListHref,
  MEMO_SEARCH_MAX_LENGTH,
  type MemoFilters,
} from "@/lib/memos/filters";
import type {
  CategoryRecord,
  TagRecord,
} from "@/lib/memos/organization-queries";

type MemoFiltersProps = {
  categories: CategoryRecord[];
  filters: MemoFilters;
  tags: TagRecord[];
};

function createFilterHref(
  filters: MemoFilters,
  overrides: Partial<Pick<MemoFilters, "categoryId" | "query" | "tagIds" | "uncategorized">>,
) {
  return buildMemoListHref({
    categoryId:
      overrides.categoryId === undefined
        ? filters.categoryId
        : overrides.categoryId,
    page: 1,
    query: overrides.query === undefined ? filters.query : overrides.query,
    tagIds: overrides.tagIds === undefined ? filters.tagIds : overrides.tagIds,
    uncategorized:
      overrides.uncategorized === undefined
        ? filters.uncategorized
        : overrides.uncategorized,
  });
}

function MemoFiltersContent({
  categories,
  filters,
  idPrefix,
  isDialog = false,
  tags,
}: MemoFiltersProps & { idPrefix: string; isDialog?: boolean }) {
  const hasFilters =
    filters.query.length > 0 ||
    filters.categoryId !== null ||
    filters.uncategorized ||
    filters.tagIds.length > 0;
  const categoryValue = filters.uncategorized
    ? "none"
    : (filters.categoryId ?? "");
  const selectedCategory = categories.find(
    (category) => category.id === filters.categoryId,
  );

  return (
    <section
      aria-labelledby={`${idPrefix}-memo-filter-title`}
      className={
        isDialog
          ? "p-5 sm:p-6"
          : "mt-8 rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-4 sm:p-5"
      }
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          className="text-[17px] font-semibold tracking-[-0.025em] text-[var(--ink)]"
          id={`${idPrefix}-memo-filter-title`}
        >
          メモを絞り込む
        </h2>
        {hasFilters && (
          <Link className="text-button" href="/memos">
            条件をクリア
          </Link>
        )}
      </div>

      <form
        action="/memos"
        className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(12rem,0.4fr)_auto]"
        role="search"
      >
        <div>
          <label
            className="mb-1.5 block text-xs font-semibold text-[var(--muted)]"
            htmlFor={`${idPrefix}-memo-body-search`}
          >
            本文キーワード
          </label>
          <div className="relative">
            <Icon
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-soft)]"
              name="search"
              size={17}
            />
            <input
              aria-describedby={
                filters.queryError
                  ? `${idPrefix}-memo-search-error`
                  : undefined
              }
              aria-invalid={filters.queryError ? "true" : undefined}
              aria-label="メモの本文を検索"
              className="h-10 w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface)] pl-10 pr-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted-soft)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
              defaultValue={filters.query}
              id={`${idPrefix}-memo-body-search`}
              maxLength={MEMO_SEARCH_MAX_LENGTH}
              name="q"
              placeholder="本文に含まれる言葉"
              type="search"
            />
          </div>
          {filters.queryError && (
            <p
              className="mt-2 text-sm text-red-700 dark:text-red-300"
              id={`${idPrefix}-memo-search-error`}
              role="alert"
            >
              {filters.queryError}
            </p>
          )}
        </div>

        <div>
          <label
            className="mb-1.5 block text-xs font-semibold text-[var(--muted)]"
            htmlFor={`${idPrefix}-memo-category-filter`}
          >
            カテゴリ
          </label>
          <select
            aria-label="カテゴリで絞り込む"
            className="h-10 w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            defaultValue={categoryValue}
            id={`${idPrefix}-memo-category-filter`}
            name="category"
          >
            <option value="">すべてのカテゴリ</option>
            <option value="none">未分類</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}（{category.memoCount}件）
              </option>
            ))}
          </select>
        </div>

        {filters.tagIds.length > 0 && (
          <input name="tags" type="hidden" value={filters.tagIds.join(",")} />
        )}
        <button className="primary-button self-end" type="submit">
          <Icon name="search" size={17} />
          検索
        </button>
      </form>

      {hasFilters && (
        <div className="mt-5 border-t border-[var(--hairline-soft)] pt-4">
          <p className="text-xs font-semibold text-[var(--muted)]">適用中の条件</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {filters.query && (
              <Link
                aria-label={`検索キーワード ${filters.query}を解除`}
                className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl bg-[var(--chip)] px-3 text-xs font-semibold text-[var(--ink)] outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                href={createFilterHref(filters, { query: "" })}
              >
                <span className="truncate">本文: {filters.query}</span>
                <Icon name="x" size={14} />
              </Link>
            )}
            {(filters.categoryId || filters.uncategorized) && (
              <Link
                aria-label={`カテゴリ ${filters.uncategorized ? "未分類" : (selectedCategory?.name ?? "選択中")}を解除`}
                className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl bg-[var(--chip)] px-3 text-xs font-semibold text-[var(--ink)] outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                href={createFilterHref(filters, {
                  categoryId: null,
                  uncategorized: false,
                })}
              >
                <span className="truncate">
                  カテゴリ: {filters.uncategorized ? "未分類" : (selectedCategory?.name ?? "選択中")}
                </span>
                <Icon name="x" size={14} />
              </Link>
            )}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-5 border-t border-[var(--hairline-soft)] pt-4">
          <p className="text-xs font-semibold text-[var(--muted)]">タグ</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => {
              const selected = filters.tagIds.includes(tag.id);
              const nextTagIds = selected
                ? filters.tagIds.filter((tagId) => tagId !== tag.id)
                : [...filters.tagIds, tag.id];

              return (
                <Link
                  aria-current={selected ? "true" : undefined}
                  aria-label={
                    selected
                      ? `タグ #${tag.name}を解除`
                      : `タグ #${tag.name}で絞り込む`
                  }
                  className={
                    selected
                      ? "inline-flex min-h-10 items-center rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      : "inline-flex min-h-10 items-center rounded-xl bg-[var(--chip)] px-3 text-xs font-semibold text-[var(--muted)] outline-none hover:text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  }
                  href={createFilterHref(filters, { tagIds: nextTagIds })}
                  key={tag.id}
                >
                  #{tag.name}
                  <span className="ml-1.5 opacity-70">{tag.memoCount}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export function MemoFiltersPanel(props: MemoFiltersProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const activeConditionCount =
    Number(props.filters.query.length > 0) +
    Number(
      props.filters.categoryId !== null || props.filters.uncategorized,
    ) +
    props.filters.tagIds.length;

  return (
    <>
      <button
        aria-label="絞り込み条件を開く"
        className="secondary-button mt-8 w-full md:hidden"
        onClick={() => dialogRef.current?.showModal()}
        type="button"
      >
        <Icon name="search" size={17} />
        絞り込み
        {activeConditionCount > 0 && (
          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
            {activeConditionCount}
          </span>
        )}
      </button>

      <div className="hidden md:block">
        <MemoFiltersContent {...props} idPrefix="desktop" />
      </div>

      <dialog
        aria-labelledby="mobile-memo-filter-title"
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-[24px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-0 text-[var(--ink)] shadow-[0_24px_80px_rgba(10,12,18,0.28)] backdrop:bg-black/40 backdrop:backdrop-blur-[2px]"
        ref={dialogRef}
      >
        <div className="flex justify-end border-b border-[var(--hairline-soft)] px-4 py-3">
          <button
            aria-label="絞り込み条件を閉じる"
            className="flex size-10 items-center justify-center rounded-xl text-[var(--muted)] outline-none hover:bg-[var(--nav-hover)] focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <MemoFiltersContent {...props} idPrefix="mobile" isDialog />
      </dialog>
    </>
  );
}
