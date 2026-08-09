"use client";

import { useActionState, useState } from "react";
import { MarkdownContent } from "@/components/memos/markdown-content";
import { Icon } from "@/components/ui/icon";
import { createMemoAction } from "./actions";
import {
  type CreateMemoState,
  initialCreateMemoState,
} from "./create-memo-state";

const TITLE_MAX_LENGTH = 200;
const CONTENT_MAX_LENGTH = 100_000;

type MemoFormFieldsProps = {
  formAction: (formData: FormData) => void;
  isPending: boolean;
  state: CreateMemoState;
};

function MemoFormFields({ formAction, isPending, state }: MemoFormFieldsProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const titleDescriptionId = state.fieldErrors.title
    ? "memo-title-help memo-title-error"
    : "memo-title-help";
  const contentDescriptionId = state.fieldErrors.content
    ? "memo-content-help memo-content-error"
    : "memo-content-help";

  return (
    <form
      action={formAction}
      aria-label="メモを作成"
      className="mt-8 grid min-w-0 gap-4 lg:grid-cols-2"
      noValidate
    >
      <section
        aria-labelledby="memo-editor-title"
        className="min-w-0 rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-4 shadow-[0_2px_3px_rgba(20,24,31,0.02),0_12px_30px_rgba(20,24,31,0.025)] sm:p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="section-title" id="memo-editor-title">
            メモを書く
          </h2>
          <span className="rounded-lg bg-[var(--chip)] px-2 py-1 text-[10px] font-semibold text-[var(--muted)]">
            Markdown
          </span>
        </div>

        <div className="mt-5">
          <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="memo-title">
            タイトル
          </label>
          <input
            aria-describedby={titleDescriptionId}
            aria-invalid={state.fieldErrors.title ? "true" : undefined}
            autoComplete="off"
            className="mt-2 h-10 w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted-soft)] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
            id="memo-title"
            maxLength={TITLE_MAX_LENGTH}
            name="title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="メモのタイトル"
            required
            value={title}
          />
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]" id="memo-title-help">
            必須・{TITLE_MAX_LENGTH}文字以内
          </p>
          {state.fieldErrors.title && (
            <p className="mt-2 text-sm text-red-700 dark:text-red-300" id="memo-title-error">
              {state.fieldErrors.title}
            </p>
          )}
        </div>

        <div className="mt-5">
          <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="memo-content">
            本文
          </label>
          <textarea
            aria-describedby={contentDescriptionId}
            aria-invalid={state.fieldErrors.content ? "true" : undefined}
            className="mt-2 min-h-80 w-full resize-y rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] px-3 py-3 font-mono text-[13px] leading-6 text-[var(--ink)] outline-none transition placeholder:text-[var(--muted-soft)] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
            id="memo-content"
            maxLength={CONTENT_MAX_LENGTH}
            name="content"
            onChange={(event) => setContent(event.target.value)}
            placeholder="# 見出し\n\nMarkdownで本文を書けます。"
            spellCheck
            value={content}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs leading-5 text-[var(--muted)]">
            <p id="memo-content-help">
              CommonMarkとGitHub Flavored Markdownに対応し、Enterで改行できます。安全のためHTMLは実行されません。
            </p>
            <p aria-live="polite" className="tabular-nums">
              {Array.from(content).length.toLocaleString("ja-JP")} / {CONTENT_MAX_LENGTH.toLocaleString("ja-JP")}
            </p>
          </div>
          {state.fieldErrors.content && (
            <p className="mt-2 text-sm text-red-700 dark:text-red-300" id="memo-content-error">
              {state.fieldErrors.content}
            </p>
          )}
        </div>

        {state.message && (
          <p
            className={`mt-5 rounded-xl border px-3 py-2.5 text-sm leading-6 ${
              state.status === "success"
                ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300"
                : "border-red-500/20 bg-red-500/8 text-red-700 dark:text-red-300"
            }`}
            role={state.status === "success" ? "status" : "alert"}
          >
            {state.message}
          </p>
        )}

        <button
          className="primary-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
          disabled={isPending}
          type="submit"
        >
          <Icon name="check" size={17} />
          {isPending ? "保存中…" : "メモを保存"}
        </button>
      </section>

      <section
        aria-label="Markdownプレビュー"
        className="min-w-0 rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-4 shadow-[0_2px_3px_rgba(20,24,31,0.02),0_12px_30px_rgba(20,24,31,0.025)] sm:p-5"
      >
        <div className="flex min-h-10 items-center border-b border-[var(--hairline-soft)] pb-4">
          <h2 className="section-title">プレビュー</h2>
        </div>
        <div className="markdown-preview mt-5 min-h-80 overflow-x-auto">
          {content ? (
            <MarkdownContent content={content} />
          ) : (
            <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-[var(--hairline)] px-6 text-center">
              <p className="max-w-xs text-sm leading-6 text-[var(--muted)]">
                本文を入力すると、ここにプレビューが表示されます。
              </p>
            </div>
          )}
        </div>
      </section>
    </form>
  );
}

export function MemoForm() {
  const [state, formAction, isPending] = useActionState(
    createMemoAction,
    initialCreateMemoState,
  );

  return (
    <MemoFormFields
      formAction={formAction}
      isPending={isPending}
      key={state.submissionId}
      state={state}
    />
  );
}
