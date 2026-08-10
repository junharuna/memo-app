import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MemoForm } from "./memo-form";
import { listOrganizationForCurrentUser } from "@/lib/memos/organization-queries";
import { getAuthState } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "新しいメモ",
  description: "Markdownプレビューを確認しながら、新しいメモを作成します。",
};

export default async function NewMemoPage() {
  const { isAuthenticated } = await getAuthState();

  if (!isAuthenticated) {
    redirect("/signin");
  }

  const organization = await listOrganizationForCurrentUser();
  if (organization.status === "unauthenticated") {
    redirect("/signin");
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10 xl:px-10">
      <header className="max-w-3xl">
        <p className="eyebrow">NEW MEMO</p>
        <h1 className="mt-2 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.06em] text-[var(--ink)]">
          新しいメモ
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-[15px]">
          Markdownで書きながら、右側のプレビューで仕上がりを確認できます。
        </p>
      </header>

      {organization.status === "error" ? (
        <div
          className="mt-8 rounded-[20px] border border-red-500/20 bg-red-500/8 p-5 text-red-700 dark:text-red-300"
          role="alert"
        >
          <h2 className="text-base font-semibold">分類を読み込めませんでした</h2>
          <p className="mt-2 text-sm leading-6">
            カテゴリとタグを取得できませんでした。通信状態を確認してください。
          </p>
          <Link className="secondary-button mt-4" href="/memos/new">
            もう一度試す
          </Link>
        </div>
      ) : (
        <MemoForm
          categories={organization.categories}
          tags={organization.tags}
        />
      )}
    </div>
  );
}
