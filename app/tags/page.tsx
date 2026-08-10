import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TagManager } from "@/components/memos/tag-manager";
import { listOrganizationForCurrentUser } from "@/lib/memos/organization-queries";

export const metadata: Metadata = {
  title: "タグ",
  description: "メモへ付けるタグを管理します。",
};

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const result = await listOrganizationForCurrentUser();
  if (result.status === "unauthenticated") redirect("/signin");

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10 xl:px-10">
      <header className="max-w-3xl">
        <p className="eyebrow">ORGANIZE</p>
        <h1 className="mt-2 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.06em] text-[var(--ink)]">タグ</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-[15px]">複数のメモを横断して見つけるためのタグを管理できます。</p>
      </header>
      {result.status === "error" ? (
        <div className="mt-9 rounded-[20px] border border-red-500/20 bg-red-500/8 p-5 text-red-700 dark:text-red-300" role="alert">
          <h2 className="text-base font-semibold">タグを読み込めませんでした</h2>
          <p className="mt-2 text-sm leading-6">通信状態を確認して、もう一度お試しください。</p>
          <Link className="secondary-button mt-4" href="/tags">もう一度試す</Link>
        </div>
      ) : (
        <TagManager tags={result.tags} />
      )}
    </div>
  );
}
