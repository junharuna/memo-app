"use client";

import { MemoEditorForm } from "@/components/memos/memo-editor-form";
import { createMemoAction } from "./actions";

export function MemoForm() {
  return (
    <MemoEditorForm
      action={createMemoAction}
      formLabel="メモを作成"
      pendingLabel="保存中…"
      resetAfterSuccess
      submitLabel="メモを保存"
    />
  );
}
