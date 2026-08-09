"use client";

import { type FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEND_ERROR_MESSAGE =
  "確認メールを送信できませんでした。時間をおいて、もう一度お試しください。";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();
    setErrorMessage("");
    setIsSuccessful(false);

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setErrorMessage("有効なメールアドレスを入力してください。");
      return;
    }

    setIsPending(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          shouldCreateUser: true,
        },
      });

      if (error) {
        setErrorMessage(SEND_ERROR_MESSAGE);
        return;
      }

      setEmail(normalizedEmail);
      setIsSuccessful(true);
    } catch {
      setErrorMessage(SEND_ERROR_MESSAGE);
    } finally {
      setIsPending(false);
    }
  }

  const describedBy = errorMessage
    ? "signup-email-help signup-email-error"
    : "signup-email-help";

  return (
    <form className="mt-8" noValidate onSubmit={handleSubmit}>
      <div>
        <label
          className="text-sm font-semibold text-[var(--ink)]"
          htmlFor="signup-email"
        >
          メールアドレス
        </label>
        <input
          aria-describedby={describedBy}
          aria-invalid={errorMessage ? "true" : undefined}
          autoComplete="email"
          className="mt-2 h-10 w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted-soft)] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
          id="signup-email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
        <p
          className="mt-2 text-xs leading-5 text-[var(--muted)]"
          id="signup-email-help"
        >
          入力したアドレスへ、アカウント作成用のリンクを送ります。
        </p>
      </div>

      {errorMessage && (
        <p
          className="mt-4 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5 text-sm leading-6 text-red-700 dark:text-red-300"
          id="signup-email-error"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      {isSuccessful && (
        <p
          className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-3 py-2.5 text-sm leading-6 text-emerald-700 dark:text-emerald-300"
          role="status"
        >
          確認メールを送信しました。メール内のリンクから登録を完了してください。
        </p>
      )}

      <button
        className="primary-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "送信中…" : "確認メールを送信"}
      </button>
    </form>
  );
}
