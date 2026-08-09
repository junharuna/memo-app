import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MemoList } from "@/components/memos/memo-list";
import { Icon } from "@/components/ui/icon";
import { listMemosForCurrentUser } from "@/lib/memos/queries";

export const metadata: Metadata = {
  title: "すべてのメモ",
  description: "保存したメモを更新日時の新しい順に一覧表示します。",
};

export const dynamic = "force-dynamic";

export default async function MemosPage() {
  const result = await listMemosForCurrentUser();

  if (result.status === "unauthenticated") {
    redirect("/signin");
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10 xl:px-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">YOUR LIBRARY</p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.06em] text-[var(--ink)]">
            すべてのメモ
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-[15px]">
            保存したメモを、更新日時の新しい順に表示しています。
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

      <section aria-labelledby="memo-list-title" className="mt-9 sm:mt-11">
        <h2 className="sr-only" id="memo-list-title">
          メモ一覧
        </h2>
        <MemoList result={result} retryHref="/memos" />
      </section>
    </div>
  );
}
