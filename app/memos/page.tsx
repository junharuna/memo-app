import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MemoFiltersPanel } from "@/components/memos/memo-filters";
import { MemoList } from "@/components/memos/memo-list";
import { Icon } from "@/components/ui/icon";
import {
  buildMemoListHref,
  MEMOS_PER_PAGE,
  parseMemoFilters,
  type MemoSearchParams,
} from "@/lib/memos/filters";
import { listOrganizationForCurrentUser } from "@/lib/memos/organization-queries";
import { listMemosForCurrentUser } from "@/lib/memos/queries";

export const dynamic = "force-dynamic";

type MemosPageProps = {
  searchParams?: Promise<MemoSearchParams>;
};

const viewPresentation = {
  active: {
    description: "保存したメモを、選択した順序で表示しています。",
    eyebrow: "YOUR LIBRARY",
    title: "すべてのメモ",
  },
  archive: {
    description: "今は使わないメモを、本文を残したまま保管しています。",
    eyebrow: "ARCHIVE",
    title: "アーカイブ",
  },
  favorites: {
    description: "大切なメモだけを、すぐに見つけられます。",
    eyebrow: "FAVORITES",
    title: "お気に入り",
  },
  trash: {
    description: "移動したメモを復元するか、完全に削除できます。",
    eyebrow: "TRASH",
    title: "ゴミ箱",
  },
} as const;

export async function generateMetadata({
  searchParams = Promise.resolve({}),
}: MemosPageProps): Promise<Metadata> {
  const presentation = viewPresentation[
    parseMemoFilters(await searchParams).view
  ];

  return {
    description: presentation.description,
    title: presentation.title,
  };
}

export default async function MemosPage({
  searchParams = Promise.resolve({}),
}: MemosPageProps) {
  const filters = parseMemoFilters(await searchParams);
  const presentation = viewPresentation[filters.view];
  const [result, organization] = await Promise.all([
    filters.queryError
      ? Promise.resolve({ memos: [], status: "success" as const, totalCount: 0 })
      : listMemosForCurrentUser({ filters }),
    listOrganizationForCurrentUser(),
  ]);

  if (
    result.status === "unauthenticated" ||
    organization.status === "unauthenticated"
  ) {
    redirect("/signin");
  }

  const hasFilters =
    filters.query.length > 0 ||
    filters.categoryId !== null ||
    filters.uncategorized ||
    filters.tagIds.length > 0;
  const totalCount = result.status === "success" ? (result.totalCount ?? result.memos.length) : 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / MEMOS_PER_PAGE));
  const organizationData =
    organization.status === "success"
      ? organization
      : { categories: [], tags: [] };

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10 xl:px-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{presentation.eyebrow}</p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.06em] text-[var(--ink)]">
            {presentation.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-[15px]">
            {presentation.description}
          </p>
        </div>
        <Link
          aria-label="新しいメモを作成"
          className="primary-button self-start sm:self-auto"
          href="/memos/new"
        >
          <Icon name="plus" size={18} />
          新しいメモ
        </Link>
      </header>

      <MemoFiltersPanel
        categories={organizationData.categories}
        filters={filters}
        tags={organizationData.tags}
      />

      {organization.status === "error" && (
        <p
          className="mt-4 rounded-xl border border-red-500/20 bg-red-500/8 p-4 text-sm text-red-700 dark:text-red-300"
          role="alert"
        >
          カテゴリとタグを読み込めませんでした。ページを再読み込みしてください。
        </p>
      )}

      <section aria-labelledby="memo-list-title" className="mt-9 sm:mt-11">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="section-title" id="memo-list-title">
            {hasFilters ? "検索結果" : "メモ一覧"}
          </h2>
          {result.status === "success" && !filters.queryError && (
            <p aria-live="polite" className="text-sm text-[var(--muted)]">
              {totalCount}件
            </p>
          )}
        </div>
        <MemoList
          filtered={hasFilters}
          result={result}
          retryHref={buildMemoListHref({ ...filters, page: 1 })}
          view={filters.view}
        />

        {result.status === "success" && totalPages > 1 && (
          <nav
            aria-label="メモ一覧のページ"
            className="mt-8 flex items-center justify-center gap-3"
          >
            {filters.page > 1 ? (
              <Link
                className="secondary-button"
                href={buildMemoListHref({ ...filters, page: filters.page - 1 })}
                rel="prev"
              >
                前のページ
              </Link>
            ) : (
              <span className="secondary-button cursor-not-allowed opacity-45" aria-disabled="true">
                前のページ
              </span>
            )}
            <span className="text-sm tabular-nums text-[var(--muted)]">
              {filters.page} / {totalPages}
            </span>
            {filters.page < totalPages ? (
              <Link
                className="secondary-button"
                href={buildMemoListHref({ ...filters, page: filters.page + 1 })}
                rel="next"
              >
                次のページ
              </Link>
            ) : (
              <span className="secondary-button cursor-not-allowed opacity-45" aria-disabled="true">
                次のページ
              </span>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
