"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { DeleteMemoState } from "@/lib/memos/delete-state";
import { isValidMemoId } from "@/lib/memos/id";
import { createClient } from "@/lib/supabase/server";

const deleteErrorMessage = "メモを削除できませんでした。もう一度お試しください。";

function deleteErrorState(
  previousState: DeleteMemoState,
  message = deleteErrorMessage,
): DeleteMemoState {
  return { ...previousState, message, status: "error" };
}

export async function deleteMemoAction(
  memoId: string,
  previousState: DeleteMemoState,
  formData: FormData,
): Promise<DeleteMemoState> {
  if (!isValidMemoId(memoId) || formData.get("intent") !== "delete-memo") {
    return deleteErrorState(previousState);
  }

  try {
    const supabase = await createClient();
    const { data, error: claimsError } = await supabase.auth.getClaims();
    const ownerId = data?.claims?.sub;

    if (claimsError || typeof ownerId !== "string" || ownerId.length === 0) {
      if (claimsError) {
        console.error("Memo deletion authorization failed", claimsError);
      }

      return deleteErrorState(
        previousState,
        "セッションの有効期限が切れました。もう一度サインインしてください。",
      );
    }

    const { data: deletedMemo, error } = await supabase
      .from("memos")
      .delete()
      .eq("owner_id", ownerId)
      .eq("id", memoId)
      .select("id")
      .maybeSingle();

    if (error || !deletedMemo) {
      if (error) {
        console.error("Memo deletion failed", error);
      }

      return deleteErrorState(previousState);
    }
  } catch (error) {
    console.error("Memo deletion failed", error);
    return deleteErrorState(previousState);
  }

  revalidatePath("/");
  revalidatePath("/memos");
  redirect("/memos?view=trash&toast=memo-deleted");
}
