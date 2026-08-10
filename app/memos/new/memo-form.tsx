"use client";

import { MemoEditorForm } from "@/components/memos/memo-editor-form";
import type {
  CategoryRecord,
  TagRecord,
} from "@/lib/memos/organization-queries";
import { createMemoAction } from "./actions";

export function MemoForm({
  categories = [],
  tags = [],
}: {
  categories?: CategoryRecord[];
  tags?: TagRecord[];
}) {
  return (
    <MemoEditorForm
      action={createMemoAction}
      categories={categories}
      formLabel="メモを作成"
      pendingLabel="保存中…"
      resetAfterSuccess
      submitLabel="メモを保存"
      tags={tags}
    />
  );
}
