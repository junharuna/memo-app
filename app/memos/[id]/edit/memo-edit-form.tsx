"use client";

import { MemoEditorForm } from "@/components/memos/memo-editor-form";
import type { MemoRecord } from "@/lib/memos/queries";
import { updateMemoAction } from "./actions";

export function MemoEditForm({ memo }: { memo: MemoRecord }) {
  const updateAction = updateMemoAction.bind(null, memo.id);

  return (
    <MemoEditorForm
      action={updateAction}
      formLabel="メモを編集"
      initialContent={memo.content}
      initialTitle={memo.title}
      pendingLabel="更新中…"
      submitLabel="変更を保存"
    />
  );
}
