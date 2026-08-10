"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { MarkdownContent } from "@/components/memos/markdown-content";
import { Icon } from "@/components/ui/icon";
import {
  initialMemoFormState,
  type MemoFormState,
} from "@/lib/memos/form-state";
import {
  MEMO_CONTENT_MAX_LENGTH,
  MEMO_TITLE_MAX_LENGTH,
} from "@/lib/memos/validation";
import type {
  CategoryRecord,
  TagRecord,
} from "@/lib/memos/organization-queries";

type MemoEditorAction = (
  previousState: MemoFormState,
  formData: FormData,
) => Promise<MemoFormState>;

type MemoEditorFormProps = {
  action: MemoEditorAction;
  categories?: CategoryRecord[];
  formLabel: string;
  initialCategoryId?: string | null;
  initialContent?: string;
  initialTagIds?: string[];
  initialTitle?: string;
  pendingLabel: string;
  resetAfterSuccess?: boolean;
  submitLabel: string;
  tags?: TagRecord[];
};

type MemoFormFieldsProps = Omit<
  MemoEditorFormProps,
  "action" | "resetAfterSuccess"
> & {
  formAction: (formData: FormData) => void;
  isPending: boolean;
  state: MemoFormState;
};

function MemoFormFields({
  formAction,
  formLabel,
  categories = [],
  initialCategoryId = null,
  initialContent = "",
  initialTagIds = [],
  initialTitle = "",
  isPending,
  pendingLabel,
  state,
  submitLabel,
  tags = [],
}: MemoFormFieldsProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const titleDescriptionId = state.fieldErrors.title
    ? "memo-title-help memo-title-error"
    : "memo-title-help";
  const contentDescriptionId = state.fieldErrors.content
    ? "memo-content-help memo-content-error"
    : "memo-content-help";

  return (
    <form
      action={formAction}
      aria-label={formLabel}
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
            maxLength={MEMO_TITLE_MAX_LENGTH}
            name="title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="メモのタイトル"
            required
            value={title}
          />
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]" id="memo-title-help">
            必須・{MEMO_TITLE_MAX_LENGTH}文字以内
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
            maxLength={MEMO_CONTENT_MAX_LENGTH}
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
              {Array.from(content).length.toLocaleString("ja-JP")} / {MEMO_CONTENT_MAX_LENGTH.toLocaleString("ja-JP")}
            </p>
          </div>
          {state.fieldErrors.content && (
            <p className="mt-2 text-sm text-red-700 dark:text-red-300" id="memo-content-error">
              {state.fieldErrors.content}
            </p>
          )}
        </div>

        <div className="mt-6 border-t border-[var(--hairline-soft)] pt-5">
          <div className="flex items-center justify-between gap-3">
            <label
              className="text-sm font-semibold text-[var(--ink)]"
              htmlFor="memo-category"
            >
              カテゴリ
            </label>
            <Link className="text-button" href="/categories">
              カテゴリを管理
            </Link>
          </div>
          <select
            aria-describedby={
              state.fieldErrors.categoryId ? "memo-category-error" : undefined
            }
            aria-invalid={state.fieldErrors.categoryId ? "true" : undefined}
            className="mt-2 h-10 w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--ink)] outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
            defaultValue={initialCategoryId ?? ""}
            id="memo-category"
            name="categoryId"
          >
            <option value="">カテゴリなし</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {state.fieldErrors.categoryId && (
            <p
              className="mt-2 text-sm text-red-700 dark:text-red-300"
              id="memo-category-error"
            >
              {state.fieldErrors.categoryId}
            </p>
          )}

          <fieldset className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <legend className="text-sm font-semibold text-[var(--ink)]">
                タグ
              </legend>
              <Link className="text-button" href="/tags">
                タグを管理
              </Link>
            </div>
            {tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--hairline)] bg-[var(--chip)] px-3 text-sm text-[var(--muted)] transition has-checked:border-blue-500/30 has-checked:text-[var(--ink)]"
                    key={tag.id}
                  >
                    <input
                      defaultChecked={initialTagIds.includes(tag.id)}
                      className="size-4 accent-blue-600"
                      name="tagIds"
                      type="checkbox"
                      value={tag.id}
                    />
                    #{tag.name}
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                タグはまだありません。タグ管理から作成できます。
              </p>
            )}
            {state.fieldErrors.tagIds && (
              <p className="mt-2 text-sm text-red-700 dark:text-red-300" role="alert">
                {state.fieldErrors.tagIds}
              </p>
            )}
          </fieldset>
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
          {isPending ? pendingLabel : submitLabel}
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

export function MemoEditorForm({
  action,
  resetAfterSuccess = false,
  ...fieldsProps
}: MemoEditorFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialMemoFormState,
  );

  return (
    <MemoFormFields
      {...fieldsProps}
      formAction={formAction}
      isPending={isPending}
      key={resetAfterSuccess ? state.submissionId : "memo-editor"}
      state={state}
    />
  );
}
