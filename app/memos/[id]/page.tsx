import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MarkdownContent } from "@/components/memos/markdown-content";
import { Icon } from "@/components/ui/icon";
import { formatMemoDate } from "@/lib/memos/format";
import { getMemoForCurrentUser } from "@/lib/memos/queries";

export const metadata: Metadata = {
  title: "メモを表示",
  description: "保存したMarkdownメモを表示します。",
};

type MemoDetailPageProps = {
  params: Promise<{ id: string }>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

function MemoLoadError({ id }: { id: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
      <div
        className="rounded-[20px] border border-red-500/20 bg-red-500/8 p-5 text-red-700 dark:text-red-300"
        role="alert"
      >
        <h1 className="text-lg font-semibold">メモを読み込めませんでした</h1>
        <p className="mt-2 text-sm leading-6">
          通信状態を確認して、もう一度お試しください。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="secondary-button" href={`/memos/${id}`}>
            もう一度試す
          </Link>
          <Link className="text-button px-2" href="/">
            メモ一覧へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function MemoDetailPage({ params }: MemoDetailPageProps) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const result = await getMemoForCurrentUser(id);

  if (result.status === "unauthenticated") {
    redirect("/signin");
  }

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "error") {
    return <MemoLoadError id={id} />;
  }

  const { memo } = result;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
      <Link
        className="text-button -ml-2 min-h-10 px-2"
        href="/"
      >
        <Icon className="rotate-180" name="chevronRight" size={16} />
        メモ一覧へ戻る
      </Link>

      <header className="mt-5 border-b border-[var(--hairline-soft)] pb-6 sm:pb-8">
        <p className="eyebrow">MEMO</p>
        <h1 className="mt-2 break-words text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.06em] text-[var(--ink)]">
          {memo.title}
        </h1>
        <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs leading-5 text-[var(--muted-soft)]">
          <div className="flex items-center gap-1.5">
            <dt>更新</dt>
            <dd>
              <time dateTime={memo.updated_at}>{formatMemoDate(memo.updated_at)}</time>
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt>作成</dt>
            <dd>
              <time dateTime={memo.created_at}>{formatMemoDate(memo.created_at)}</time>
            </dd>
          </div>
        </dl>
      </header>

      <article aria-label={memo.title} className="mt-7 sm:mt-9">
        {memo.content ? (
          <div className="markdown-preview memo-detail-markdown">
            <MarkdownContent content={memo.content} />
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-[var(--hairline)] px-5 py-12 text-center text-sm leading-6 text-[var(--muted)]">
            このメモには本文がありません。
          </p>
        )}
      </article>
    </div>
  );
}
