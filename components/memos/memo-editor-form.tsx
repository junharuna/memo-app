"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { MarkdownContent } from "@/components/memos/markdown-content";
import { UnsavedChangesGuard } from "@/components/layout/unsaved-changes-guard";
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
import type { AutosaveMemoResult } from "@/lib/memos/autosave-state";

type MemoEditorAction = (
  previousState: MemoFormState,
  formData: FormData,
) => Promise<MemoFormState>;

type MemoAutosaveAction = (formData: FormData) => Promise<AutosaveMemoResult>;

type MemoEditorSnapshot = {
  categoryId: string;
  content: string;
  tagIds: string[];
  title: string;
};

type MemoEditorFormProps = {
  action: MemoEditorAction;
  autosaveAction?: MemoAutosaveAction;
  categories?: CategoryRecord[];
  formLabel: string;
  initialCategoryId?: string | null;
  initialContent?: string;
  initialRevision?: number;
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
  autosaveAction,
  formAction,
  formLabel,
  categories = [],
  initialCategoryId = null,
  initialContent = "",
  initialRevision,
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
  const [categoryId, setCategoryId] = useState(initialCategoryId ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState(
    () => [...initialTagIds].sort(),
  );
  const [revision, setRevision] = useState(initialRevision);
  const [autosaveStatus, setAutosaveStatus] = useState<
    "conflict" | "dirty" | "error" | "saved" | "saving" | "trashed"
  >("saved");
  const [autosaveMessage, setAutosaveMessage] = useState("");
  const revisionRef = useRef(initialRevision);
  const savingRef = useRef(false);
  const queuedRef = useRef(false);
  const blockedRef = useRef(false);
  const allowUnloadRef = useRef(false);
  const initialSnapshot: MemoEditorSnapshot = {
    categoryId: initialCategoryId ?? "",
    content: initialContent,
    tagIds: [...initialTagIds].sort(),
    title: initialTitle,
  };
  const latestSnapshotRef = useRef(initialSnapshot);
  const lastSavedKeyRef = useRef(JSON.stringify(initialSnapshot));
  const saveRef = useRef<(snapshot: MemoEditorSnapshot) => void>(
    () => undefined,
  );

  const performAutosave = useCallback(
    async (snapshot: MemoEditorSnapshot) => {
      if (!autosaveAction || revisionRef.current === undefined || blockedRef.current) {
        return;
      }
      if (savingRef.current) {
        queuedRef.current = true;
        return;
      }
      if (!snapshot.title.trim()) {
        setAutosaveStatus("dirty");
        return;
      }

      savingRef.current = true;
      setAutosaveStatus("saving");
      const formData = new FormData();
      formData.set("title", snapshot.title);
      formData.set("content", snapshot.content);
      formData.set("expectedRevision", String(revisionRef.current));
      if (snapshot.categoryId) {
        formData.set("categoryId", snapshot.categoryId);
      }
      snapshot.tagIds.forEach((tagId) => formData.append("tagIds", tagId));

      try {
        const result = await autosaveAction(formData);
        if (result.status === "saved") {
          revisionRef.current = result.revision;
          setRevision(result.revision);
          lastSavedKeyRef.current = JSON.stringify(snapshot);
          if (
            JSON.stringify(latestSnapshotRef.current) ===
            lastSavedKeyRef.current
          ) {
            setAutosaveMessage("");
            setAutosaveStatus("saved");
          } else {
            queuedRef.current = true;
          }
        } else if (result.status === "conflict") {
          blockedRef.current = true;
          setAutosaveMessage(result.message);
          setAutosaveStatus("conflict");
        } else if (result.status === "trashed") {
          blockedRef.current = true;
          setAutosaveMessage(result.message);
          setAutosaveStatus("trashed");
        } else {
          setAutosaveMessage(result.message);
          setAutosaveStatus("error");
        }
      } catch {
        setAutosaveMessage(
          "自動保存できませんでした。入力内容はこの画面に残っています。",
        );
        setAutosaveStatus("error");
      } finally {
        savingRef.current = false;
        if (queuedRef.current && !blockedRef.current) {
          queuedRef.current = false;
          saveRef.current(latestSnapshotRef.current);
        }
      }
    },
    [autosaveAction],
  );

  useEffect(() => {
    saveRef.current = (snapshot) => {
      void performAutosave(snapshot);
    };
  }, [performAutosave]);

  useEffect(() => {
    const snapshot = {
      categoryId,
      content,
      tagIds: [...selectedTagIds].sort(),
      title,
    };
    latestSnapshotRef.current = snapshot;
    if (JSON.stringify(snapshot) === lastSavedKeyRef.current) {
      return;
    }
    if (!blockedRef.current) {
      setAutosaveStatus("dirty");
    }

    if (!autosaveAction) return;

    const timer = window.setTimeout(() => {
      saveRef.current(snapshot);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [autosaveAction, categoryId, content, selectedTagIds, title]);

  useEffect(() => {
    const shouldWarn = autosaveStatus !== "saved";
    if (!shouldWarn) return;

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (allowUnloadRef.current) return;
      event.preventDefault();
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [autosaveStatus]);

  const autosaveLabel = {
    conflict: "競合",
    dirty: "未保存",
    error: "保存できませんでした",
    saved: "保存済み",
    saving: "保存中…",
    trashed: "保存できませんでした",
  }[autosaveStatus];

  async function copyCurrentInput() {
    try {
      await navigator.clipboard.writeText(`${title}\n\n${content}`);
      setAutosaveMessage("現在のタイトルと本文をクリップボードへコピーしました。");
    } catch {
      setAutosaveMessage(
        "入力内容をコピーできませんでした。タイトルと本文を手動でコピーしてください。",
      );
    }
  }

  function reloadLatestContent() {
    allowUnloadRef.current = true;
    window.location.reload();
  }

  const titleDescriptionId = state.fieldErrors.title
    ? "memo-title-help memo-title-error"
    : "memo-title-help";
  const contentDescriptionId = state.fieldErrors.content
    ? "memo-content-help memo-content-error"
    : "memo-content-help";

  return (
    <>
    <form
      action={formAction}
      aria-label={formLabel}
      className="mt-8 grid min-w-0 gap-4 lg:grid-cols-2"
      data-unsaved-guard-ignore
      noValidate
    >
      {revision !== undefined && (
        <input
          name="expectedRevision"
          type="hidden"
          value={revision}
        />
      )}
      <section
        aria-labelledby="memo-editor-title"
        className="min-w-0 rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-4 shadow-[0_2px_3px_rgba(20,24,31,0.02),0_12px_30px_rgba(20,24,31,0.025)] sm:p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="section-title" id="memo-editor-title">
            メモを書く
          </h2>
          <div className="flex items-center gap-2">
            {autosaveAction && (
              <span
                aria-live="polite"
                className="rounded-lg bg-[var(--chip)] px-2 py-1 text-[10px] font-semibold text-[var(--muted)]"
              >
                {autosaveLabel}
              </span>
            )}
            <span className="rounded-lg bg-[var(--chip)] px-2 py-1 text-[10px] font-semibold text-[var(--muted)]">
              Markdown
            </span>
          </div>
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
            id="memo-category"
            name="categoryId"
            onChange={(event) => setCategoryId(event.target.value)}
            value={categoryId}
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
                      checked={selectedTagIds.includes(tag.id)}
                      className="size-4 accent-blue-600"
                      name="tagIds"
                      onChange={(event) => {
                        setSelectedTagIds((current) =>
                          event.target.checked
                            ? Array.from(new Set([...current, tag.id])).sort()
                            : current.filter((tagId) => tagId !== tag.id),
                        );
                      }}
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

        {autosaveMessage && (
          <div
            className="mt-5 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5 text-sm leading-6 text-red-700 dark:text-red-300"
            role="alert"
          >
            <p>{autosaveMessage}</p>
            {autosaveStatus === "conflict" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="secondary-button"
                  onClick={() => void copyCurrentInput()}
                  type="button"
                >
                  現在の入力をコピー
                </button>
                <button
                  className="secondary-button"
                  onClick={reloadLatestContent}
                  type="button"
                >
                  最新の内容を読み直す
                </button>
              </div>
            )}
          </div>
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
    <UnsavedChangesGuard active={autosaveStatus !== "saved"} />
    </>
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
