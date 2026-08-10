"use server";

import { createClient } from "@/lib/supabase/server";
import { readAndValidateMemo } from "@/lib/memos/validation";
import type { CreateMemoState } from "./create-memo-state";

export async function createMemoAction(
  previousState: CreateMemoState,
  formData: FormData,
): Promise<CreateMemoState> {
  const { content, fieldErrors, title } = readAndValidateMemo(formData);

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

    const { error } = await supabase.from("memos").insert({
      content,
      owner_id: ownerId,
      title,
    });

    if (error) {
      console.error("Memo creation failed", error);
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
