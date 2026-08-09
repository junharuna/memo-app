import type { Metadata } from "next";
import Link from "next/link";
import { AuthPageCard } from "@/components/auth/auth-page-card";
import { SigninForm } from "./signin-form";

export const metadata: Metadata = {
  title: "サインイン",
  description: "メールアドレスでTagNoteへサインインします。",
};

export default function SigninPage() {
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
      <SigninForm />
    </AuthPageCard>
  );
}
