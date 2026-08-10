import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MemoEditForm } from "./memo-edit-form";
import { Icon } from "@/components/ui/icon";
import { isValidMemoId } from "@/lib/memos/id";
import { listOrganizationForCurrentUser } from "@/lib/memos/organization-queries";
import { getMemoForCurrentUser } from "@/lib/memos/queries";

export const metadata: Metadata = {
  title: "メモを編集",
  description: "保存したメモのタイトルとMarkdown本文を編集します。",
};

export const dynamic = "force-dynamic";

type MemoEditPageProps = {
  params: Promise<{ id: string }>;
};

function MemoEditLoadError({ id }: { id: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
      <div
        className="rounded-[20px] border border-red-500/20 bg-red-500/8 p-5 text-red-700 dark:text-red-300"
        role="alert"
      >
        <h1 className="text-lg font-semibold">メモを読み込めませんでした</h1>
        <p className="mt-2 text-sm leading-6">
          入力内容を取得できませんでした。通信状態を確認して、もう一度お試しください。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="secondary-button" href={`/memos/${id}/edit`}>
            もう一度試す
          </Link>
          <Link className="text-button px-2" href={`/memos/${id}`}>
            詳細へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function MemoEditPage({ params }: MemoEditPageProps) {
  const { id } = await params;

  if (!isValidMemoId(id)) {
    notFound();
  }

  const [result, organization] = await Promise.all([
    getMemoForCurrentUser(id),
    listOrganizationForCurrentUser(),
  ]);

  if (
    result.status === "unauthenticated" ||
    organization.status === "unauthenticated"
  ) {
    redirect("/signin");
  }

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "error" || organization.status === "error") {
    return <MemoEditLoadError id={id} />;
  }

  if (result.memo.trashedAt) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10 xl:px-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">EDIT MEMO</p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.06em] text-[var(--ink)]">
            メモを編集
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-[15px]">
            タイトルとMarkdown本文を編集し、プレビューで仕上がりを確認できます。
          </p>
        </div>
        <Link
          aria-label="編集をキャンセル"
          className="secondary-button self-start sm:self-auto"
          href={`/memos/${id}`}
        >
          <Icon className="rotate-180" name="chevronRight" size={16} />
          キャンセル
        </Link>
      </header>

      <MemoEditForm
        categories={organization.categories}
        memo={result.memo}
        tags={organization.tags}
      />
    </div>
  );
}
