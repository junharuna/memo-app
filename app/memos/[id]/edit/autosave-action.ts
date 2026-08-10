"use server";

import { revalidatePath } from "next/cache";
import type { AutosaveMemoResult } from "@/lib/memos/autosave-state";
import { isValidMemoId } from "@/lib/memos/id";
import { readAndValidateMemo } from "@/lib/memos/validation";
import { createClient } from "@/lib/supabase/server";

function autosaveError(message: string): AutosaveMemoResult {
  return { message, status: "error" };
}

export async function autosaveMemoAction(
  memoId: string,
  formData: FormData,
): Promise<AutosaveMemoResult> {
  const { categoryId, content, fieldErrors, tagIds, title } =
    readAndValidateMemo(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
      message: "入力内容を確認してください。",
      status: "invalid",
    };
  }

  const revisionValue = formData.get("expectedRevision");
  const expectedRevision = Number(revisionValue);
  if (
    !isValidMemoId(memoId) ||
    typeof revisionValue !== "string" ||
    !Number.isSafeInteger(expectedRevision) ||
    expectedRevision < 1
  ) {
    return autosaveError(
      "保存情報が不正です。ページを再読み込みして、もう一度お試しください。",
    );
  }

  try {
    const supabase = await createClient();
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();
    const ownerId = claimsData?.claims?.sub;

    if (claimsError || typeof ownerId !== "string" || ownerId.length === 0) {
      if (claimsError) {
        console.error("Memo autosave authorization failed", claimsError);
      }
      return {
        message: "セッションの有効期限が切れました。もう一度サインインしてください。",
        status: "unauthenticated",
      };
    }

    const { data: saveResults, error } = await supabase.rpc(
      "save_memo_revision",
      {
        expected_revision: expectedRevision,
        memo_category_id: categoryId ?? undefined,
        memo_content: content,
        memo_tag_ids: tagIds,
        memo_title: title,
        target_memo_id: memoId,
      },
    );
    const saveResult = saveResults?.[0];

    if (error || !saveResult) {
      if (error) {
        console.error("Memo autosave failed", error);
      }
      return autosaveError(
        "自動保存できませんでした。入力内容はこの画面に残っています。",
      );
    }

    if (saveResult.status === "conflict") {
      return {
        message: "別の場所で更新されました。現在の入力は上書きしていません。",
        status: "conflict",
      };
    }

    if (saveResult.status === "trashed") {
      return {
        message: "このメモはゴミ箱へ移動されたため保存できません。",
        status: "trashed",
      };
    }

    if (saveResult.status !== "saved") {
      return autosaveError(
        "自動保存できませんでした。入力内容はこの画面に残っています。",
      );
    }

    revalidatePath("/");
    revalidatePath("/memos");
    revalidatePath(`/memos/${memoId}`);
    return {
      revision: saveResult.new_revision,
      status: "saved",
      updatedAt: saveResult.new_updated_at,
    };
  } catch (error) {
    console.error("Memo autosave failed", error);
    return autosaveError(
      "自動保存できませんでした。入力内容はこの画面に残っています。",
    );
  }
}
