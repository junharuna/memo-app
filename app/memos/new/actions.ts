"use server";

import { createClient } from "@/lib/supabase/server";
import { readAndValidateMemo } from "@/lib/memos/validation";
import type { CreateMemoState } from "./create-memo-state";

export async function createMemoAction(
  previousState: CreateMemoState,
  formData: FormData,
): Promise<CreateMemoState> {
  const { categoryId, content, fieldErrors, tagIds, title } =
    readAndValidateMemo(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
      message: "入力内容を確認してください。",
      status: "error",
      submissionId: previousState.submissionId,
    };
  }

  try {
    const supabase = await createClient();
    const { data, error: claimsError } = await supabase.auth.getClaims();
    const ownerId = data?.claims?.sub;

    if (claimsError || typeof ownerId !== "string" || ownerId.length === 0) {
      if (claimsError) {
        console.error("Memo creation authorization failed", claimsError);
      }

      return {
        fieldErrors: {},
        message: "セッションの有効期限が切れました。もう一度サインインしてください。",
        status: "error",
        submissionId: previousState.submissionId,
      };
    }

    const { data: memoId, error } = await supabase.rpc(
      "create_memo_with_metadata",
      {
        memo_category_id: categoryId ?? undefined,
        memo_content: content,
        memo_tag_ids: tagIds,
        memo_title: title,
      },
    );

    if (error || !memoId) {
      if (error) {
        console.error("Memo creation failed", error);
      }
      return {
        fieldErrors: {},
        message: "メモを保存できませんでした。入力内容はこの画面に残っています。もう一度お試しください。",
        status: "error",
        submissionId: previousState.submissionId,
      };
    }

    return {
      fieldErrors: {},
      message: "メモを保存しました。続けて新しいメモを作成できます。",
      status: "success",
      submissionId: previousState.submissionId + 1,
    };
  } catch (error) {
    console.error("Memo creation failed", error);
    return {
      fieldErrors: {},
      message: "メモを保存できませんでした。入力内容はこの画面に残っています。もう一度お試しください。",
      status: "error",
      submissionId: previousState.submissionId,
    };
  }
}
