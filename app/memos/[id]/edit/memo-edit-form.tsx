"use client";

import { MemoEditorForm } from "@/components/memos/memo-editor-form";
import type { MemoRecord } from "@/lib/memos/queries";
import type {
  CategoryRecord,
  TagRecord,
} from "@/lib/memos/organization-queries";
import { updateMemoAction } from "./actions";
import { autosaveMemoAction } from "./autosave-action";

export function MemoEditForm({
  categories = [],
  memo,
  tags = [],
}: {
  categories?: CategoryRecord[];
  memo: MemoRecord;
  tags?: TagRecord[];
}) {
  const updateAction = updateMemoAction.bind(null, memo.id);
  const autosaveAction = autosaveMemoAction.bind(null, memo.id);

  return (
    <MemoEditorForm
      action={updateAction}
      autosaveAction={autosaveAction}
      categories={categories}
      formLabel="メモを編集"
      initialCategoryId={memo.category?.id}
      initialContent={memo.content}
      initialRevision={memo.revision}
      initialTagIds={memo.tags?.map((tag) => tag.id)}
      initialTitle={memo.title}
      pendingLabel="更新中…"
      submitLabel="変更を保存"
      tags={tags}
    />
  );
}
