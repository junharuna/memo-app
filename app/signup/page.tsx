import type { Metadata } from "next";
import Link from "next/link";
import { AuthPageCard } from "@/components/auth/auth-page-card";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "サインアップ",
  description: "メールアドレスでMemoraのアカウントを作成します。",
};

export default function SignupPage() {
  return (
    <AuthPageCard
      description="パスワードは必要ありません。メールに届くリンクから、安全にサインアップできます。"
      footer={
        <>
          すでにアカウントをお持ちですか？{" "}
          <Link className="font-semibold text-blue-600 hover:underline" href="/signin">
            サインイン
          </Link>
        </>
      }
      title="アカウントを作成"
    >
      <SignupForm />
    </AuthPageCard>
  );
}
