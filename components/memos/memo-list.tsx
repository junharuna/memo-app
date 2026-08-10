import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { getCategoryColorPresentation } from "@/lib/memos/category-colors";
import { createMemoExcerpt } from "@/lib/memos/excerpt";
import { formatMemoDate } from "@/lib/memos/format";
import type { MemoListResult, MemoRecord } from "@/lib/memos/queries";

type LoadedMemoListResult = Exclude<
  MemoListResult,
  { status: "unauthenticated" }
>;

type MemoListProps = {
  filtered?: boolean;
  result: LoadedMemoListResult;
  retryHref: string;
};

function MemoCard({ memo }: { memo: MemoRecord }) {
  const excerpt = createMemoExcerpt(memo.content);
  const tags = memo.tags ?? [];
  const categoryColor = memo.category
    ? getCategoryColorPresentation(memo.category.colorKey)
    : getCategoryColorPresentation("blue");

  return (
    <article className="memo-card group flex h-72 flex-col">
      <Link
        aria-label={`${memo.title}を開く`}
        className="absolute inset-0 z-10 rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        href={`/memos/${memo.id}`}
      />
      <div
        className="memo-icon"
        aria-hidden="true"
        style={{
          backgroundColor: categoryColor.tint,
          color: categoryColor.value,
        }}
      >
        <Icon name="fileText" size={20} />
      </div>
      <div className="relative mt-5">
        <h3 className="line-clamp-2 break-words text-[17px] font-semibold leading-6 tracking-[-0.025em] text-[var(--ink)]">
          {memo.title}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-12 break-words text-[13px] leading-6 text-[var(--muted)]">
          {excerpt || "本文はありません。"}
        </p>
      </div>
      <div className="relative mt-3 flex min-h-7 flex-wrap items-center gap-1.5 overflow-hidden">
        {tags.slice(0, 2).map((tag) => (
          <span
            className="max-w-28 truncate rounded-lg bg-[var(--chip)] px-2 py-1 text-[10px] font-semibold text-[var(--muted)]"
            key={tag.id}
          >
            #{tag.name}
          </span>
        ))}
        {tags.length > 2 && (
          <span className="rounded-lg bg-[var(--chip)] px-2 py-1 text-[10px] font-semibold text-[var(--muted-soft)]">
            +{tags.length - 2}
          </span>
        )}
      </div>
      <footer className="relative mt-auto flex items-center border-t border-[var(--hairline-soft)] pt-4 text-[11px] text-[var(--muted-soft)]">
        <span
          className="mr-2 size-1.5 rounded-full"
          aria-hidden="true"
          data-testid={`memo-category-color-${memo.category?.colorKey ?? "blue"}`}
          style={{ backgroundColor: categoryColor.value }}
        />
        <span className="max-w-24 truncate">{memo.category?.name ?? "未分類"}</span>
        <span className="mx-2">·</span>
        <time dateTime={memo.updated_at}>{formatMemoDate(memo.updated_at)}</time>
      </footer>
    </article>
  );
}

function MemoListError({ retryHref }: { retryHref: string }) {
  return (
    <div
      className="rounded-[20px] border border-red-500/20 bg-red-500/8 p-5 text-red-700 dark:text-red-300"
      role="alert"
    >
      <h3 className="text-base font-semibold">メモを読み込めませんでした</h3>
      <p className="mt-2 text-sm leading-6">
        通信状態を確認して、もう一度お試しください。
      </p>
      <Link className="secondary-button mt-4" href={retryHref}>
        もう一度試す
      </Link>
    </div>
  );
}

function EmptyMemoList() {
  return (
    <div className="rounded-[20px] border border-dashed border-[var(--hairline)] bg-[var(--surface-raised)] px-6 py-12 text-center">
      <span className="memo-icon memo-accent-blue" aria-hidden="true">
        <Icon name="fileText" size={20} />
      </span>
      <h3 className="mt-4 text-lg font-semibold tracking-[-0.025em] text-[var(--ink)]">
        まだメモがありません
      </h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        思いついたことを、最初のメモとして残してみましょう。
      </p>
      <Link className="primary-button mt-5" href="/memos/new">
        <Icon name="plus" size={17} />
        最初のメモを作成
      </Link>
    </div>
  );
}

function EmptyFilteredMemoList() {
  return (
    <div className="rounded-[20px] border border-dashed border-[var(--hairline)] bg-[var(--surface-raised)] px-6 py-12 text-center">
      <span className="memo-icon memo-accent-blue" aria-hidden="true">
        <Icon name="search" size={20} />
      </span>
      <h3 className="mt-4 text-lg font-semibold tracking-[-0.025em] text-[var(--ink)]">
        条件に一致するメモがありません
      </h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        キーワードや絞り込み条件を変えて、もう一度お試しください。
      </p>
      <Link className="secondary-button mt-5" href="/memos">
        条件をクリア
      </Link>
    </div>
  );
}

export function MemoList({ filtered = false, result, retryHref }: MemoListProps) {
  if (result.status === "error") {
    return <MemoListError retryHref={retryHref} />;
  }

  if (result.memos.length === 0) {
    return filtered ? <EmptyFilteredMemoList /> : <EmptyMemoList />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {result.memos.map((memo) => (
        <MemoCard memo={memo} key={memo.id} />
      ))}
    </div>
  );
}
