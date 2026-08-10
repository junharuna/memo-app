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
  const { content, fieldErrors, title } = readAndValidateMemo(formData);

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

    const { data: updatedMemo, error } = await supabase
      .from("memos")
      .update({ content, title })
      .eq("owner_id", ownerId)
      .eq("id", memoId)
      .select("id")
      .maybeSingle();

    if (error || !updatedMemo) {
      if (error) {
        console.error("Memo update failed", error);
      }

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
  revalidatePath(`/memos/${memoId}`);
  redirect(`/memos/${memoId}?toast=memo-updated`);
}
