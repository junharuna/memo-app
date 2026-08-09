import type { Metadata } from "next";
import Link from "next/link";
import { AuthPageCard } from "@/components/auth/auth-page-card";
import { SigninForm } from "./signin-form";

export const metadata: Metadata = {
  title: "サインイン",
  description: "メールアドレスでMemoraへサインインします。",
};

type SigninPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function SigninPage({ searchParams }: SigninPageProps = {}) {
  const { error } = searchParams ? await searchParams : {};

  return (
    <AuthPageCard
      description="登録済みのメールアドレスへ届くリンクから、安全にサインインできます。"
      footer={
        <>
          はじめてご利用ですか？{" "}
          <Link className="font-semibold text-blue-600 hover:underline" href="/signup">
            アカウントを作成
          </Link>
        </>
      }
      title="サインイン"
    >
      {error === "callback" && (
        <p
          className="mt-6 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5 text-sm leading-6 text-red-700 dark:text-red-300"
          role="alert"
        >
          認証リンクを確認できませんでした。もう一度サインインメールを送信してください。
        </p>
      )}
      <SigninForm />
    </AuthPageCard>
  );
}
