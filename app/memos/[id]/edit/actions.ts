"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MemoFormState } from "@/lib/memos/form-state";
import { isValidMemoId } from "@/lib/memos/id";
import { readAndValidateMemo } from "@/lib/memos/validation";
import { createClient } from "@/lib/supabase/server";

function updateErrorState(
  previousState: MemoFormState,
  message: string,
): MemoFormState {
  return {
    fieldErrors: {},
    message,
    status: "error",
    submissionId: previousState.submissionId,
  };
}

export async function updateMemoAction(
  memoId: string,
  previousState: MemoFormState,
  formData: FormData,
): Promise<MemoFormState> {
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

  if (!isValidMemoId(memoId)) {
    return updateErrorState(
      previousState,
      "メモを更新できませんでした。入力内容はこの画面に残っています。もう一度お試しください。",
    );
  }

  const expectedRevisionValue = formData.get("expectedRevision");
  const expectedRevision = Number(expectedRevisionValue);
  if (
    typeof expectedRevisionValue !== "string" ||
    !Number.isSafeInteger(expectedRevision) ||
    expectedRevision < 1
  ) {
    return updateErrorState(
      previousState,
      "メモの更新情報が不正です。ページを再読み込みして、もう一度お試しください。",
    );
  }

  try {
    const supabase = await createClient();
    const { data, error: claimsError } = await supabase.auth.getClaims();
    const ownerId = data?.claims?.sub;

    if (claimsError || typeof ownerId !== "string" || ownerId.length === 0) {
      if (claimsError) {
        console.error("Memo update authorization failed", claimsError);
      }

      return updateErrorState(
        previousState,
        "セッションの有効期限が切れました。もう一度サインインしてください。",
      );
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
        console.error("Memo update failed", error);
      }

      return updateErrorState(
        previousState,
        "メモを更新できませんでした。入力内容はこの画面に残っています。もう一度お試しください。",
      );
    }

    if (saveResult.status === "conflict") {
      return updateErrorState(
        previousState,
        "このメモは別の画面で更新されています。入力内容をコピーしてから再読み込みしてください。",
      );
    }

    if (saveResult.status === "trashed") {
      return updateErrorState(
        previousState,
        "ゴミ箱のメモは編集できません。復元してからもう一度お試しください。",
      );
    }

    if (saveResult.status !== "saved") {
      return updateErrorState(
        previousState,
        "メモを更新できませんでした。入力内容はこの画面に残っています。もう一度お試しください。",
      );
    }
  } catch (error) {
    console.error("Memo update failed", error);
    return updateErrorState(
      previousState,
      "メモを更新できませんでした。入力内容はこの画面に残っています。もう一度お試しください。",
    );
  }

  revalidatePath("/");
  revalidatePath("/memos");
  revalidatePath("/categories");
  revalidatePath("/tags");
  revalidatePath(`/memos/${memoId}`);
  redirect(`/memos/${memoId}?toast=memo-updated`);
}
