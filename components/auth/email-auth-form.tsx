"use client";

import { type FormEvent, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

type EmailAuthMode = "signin" | "signup";

type EmailAuthFormProps = {
  mode: EmailAuthMode;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const copyByMode = {
  signin: {
    button: "サインインメールを送信",
    error: "サインインメールを送信できませんでした。時間をおいて、もう一度お試しください。",
    help: "登録済みのアドレスへ、サインイン用のリンクを送ります。",
    pending: "送信中…",
    success: "サインインメールを送信しました。メール内のリンクからサインインしてください。",
  },
  signup: {
    button: "確認メールを送信",
    error: "確認メールを送信できませんでした。時間をおいて、もう一度お試しください。",
    help: "入力したアドレスへ、アカウント作成用のリンクを送ります。",
    pending: "送信中…",
    success: "確認メールを送信しました。メール内のリンクから登録を完了してください。",
  },
} satisfies Record<EmailAuthMode, Record<string, string>>;

export function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { showToast } = useToast();
  const copy = copyByMode[mode];
  const fieldId = `${mode}-email`;
  const helpId = `${fieldId}-help`;
  const errorId = `${fieldId}-error`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();
    setValidationError("");

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setValidationError("有効なメールアドレスを入力してください。");
      return;
    }

    setIsPending(true);

    try {
      const supabase = createClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set(
        "next",
        `/?toast=${mode === "signup" ? "signed-up" : "signed-in"}`,
      );
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: callbackUrl.toString(),
          shouldCreateUser: mode === "signup",
        },
      });

      if (error) {
        showToast({ message: copy.error, tone: "error" });
        return;
      }

      setEmail(normalizedEmail);
      showToast({ message: copy.success, tone: "success" });
    } catch {
      showToast({ message: copy.error, tone: "error" });
    } finally {
      setIsPending(false);
    }
  }

  const describedBy = validationError ? `${helpId} ${errorId}` : helpId;

  return (
    <form className="mt-8" noValidate onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-semibold text-[var(--ink)]" htmlFor={fieldId}>
          メールアドレス
        </label>
        <input
          aria-describedby={describedBy}
          aria-invalid={validationError ? "true" : undefined}
          autoCapitalize="none"
          autoComplete="email"
          className="mt-2 h-10 w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted-soft)] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
          id={fieldId}
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          spellCheck={false}
          type="email"
          value={email}
        />
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]" id={helpId}>
          {copy.help}
        </p>
      </div>

      {validationError && (
        <p
          className="mt-4 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5 text-sm leading-6 text-red-700 dark:text-red-300"
          id={errorId}
          role="alert"
        >
          {validationError}
        </p>
      )}

      <button
        className="primary-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        disabled={isPending}
        type="submit"
      >
        {isPending ? copy.pending : copy.button}
      </button>
    </form>
  );
}
