import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/app/settings/settings-form";
import { getPreferencesForCurrentUser } from "@/lib/settings/preferences";

export const metadata: Metadata = {
  title: "設定",
  description: "プロフィールと表示テーマを設定します。",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const result = await getPreferencesForCurrentUser();

  if (result.status === "unauthenticated") {
    redirect("/signin");
  }

  if (result.status === "error") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
        <div
          className="rounded-[20px] border border-red-500/20 bg-red-500/8 p-5 text-red-700 dark:text-red-300"
          role="alert"
        >
          <h1 className="text-lg font-semibold">設定を読み込めませんでした</h1>
          <p className="mt-2 text-sm leading-6">
            通信状態を確認して、もう一度お試しください。
          </p>
          <Link className="secondary-button mt-5" href="/settings">
            もう一度試す
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
      <header>
        <p className="eyebrow">PREFERENCES</p>
        <h1 className="mt-2 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.06em] text-[var(--ink)]">
          設定
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-[15px]">
          {result.preferences.email || "認証済みアカウント"}
        </p>
      </header>
      <SettingsForm preferences={result.preferences} />
    </div>
  );
}
