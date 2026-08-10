"use server";

import { revalidatePath } from "next/cache";
import { isValidMemoId } from "@/lib/memos/id";
import type { MemoLifecycleActionState } from "@/lib/memos/lifecycle-state";
import { createClient } from "@/lib/supabase/server";

const lifecycleErrorMessage =
  "メモの状態を変更できませんでした。ページを再読み込みして、もう一度お試しください。";

const lifecycleIntents = [
  "archive",
  "favorite",
  "restore",
  "trash",
  "unarchive",
  "unfavorite",
] as const;

type MemoLifecycleIntent = (typeof lifecycleIntents)[number];

type LifecycleRow = {
  archived_at: string | null;
  favorited_at: string | null;
  trashed_at: string | null;
};

function isLifecycleIntent(value: FormDataEntryValue | null): value is MemoLifecycleIntent {
  return (
    typeof value === "string" &&
    lifecycleIntents.some((intent) => intent === value)
  );
}

function errorState(message = lifecycleErrorMessage): MemoLifecycleActionState {
  return { message, status: "error" };
}

function mutationForIntent(intent: MemoLifecycleIntent, memo: LifecycleRow) {
  const now = new Date().toISOString();

  switch (intent) {
    case "favorite":
      return memo.trashed_at
        ? null
        : { message: "お気に入りに追加しました。", values: { favorited_at: now } };
    case "unfavorite":
      return memo.trashed_at
        ? null
        : { message: "お気に入りから外しました。", values: { favorited_at: null } };
    case "archive":
      return memo.archived_at || memo.trashed_at
        ? null
        : { message: "アーカイブしました。", values: { archived_at: now } };
    case "unarchive":
      return !memo.archived_at || memo.trashed_at
        ? null
        : { message: "アーカイブを解除しました。", values: { archived_at: null } };
    case "trash":
      return memo.trashed_at
        ? null
        : {
            message: "ゴミ箱に移動しました。",
            values: { archived_at: null, trashed_at: now },
          };
    case "restore":
      return !memo.trashed_at
        ? null
        : { message: "メモを復元しました。", values: { trashed_at: null } };
  }
}

function revalidateMemoLifecycle(id: string) {
  revalidatePath("/");
  revalidatePath("/memos");
  revalidatePath("/categories");
  revalidatePath("/tags");
  revalidatePath(`/memos/${id}`);
}

export async function mutateMemoLifecycleAction(
  memoId: string,
  _previousState: MemoLifecycleActionState,
  formData: FormData,
): Promise<MemoLifecycleActionState> {
  const intent = formData.get("intent");
  if (!isValidMemoId(memoId) || !isLifecycleIntent(intent)) {
    return errorState();
  }

  try {
    const supabase = await createClient();
    const { data, error: claimsError } = await supabase.auth.getClaims();
    const ownerId = data?.claims?.sub;

    if (claimsError || typeof ownerId !== "string" || ownerId.length === 0) {
      if (claimsError) {
        console.error("Memo lifecycle authorization failed", claimsError);
      }
      return errorState(
        "セッションの有効期限が切れました。もう一度サインインしてください。",
      );
    }

    const { data: memo, error: readError } = await supabase
      .from("memos")
      .select("archived_at, favorited_at, trashed_at")
      .eq("owner_id", ownerId)
      .eq("id", memoId)
      .maybeSingle();

    if (readError || !memo) {
      if (readError) {
        console.error("Memo lifecycle read failed", readError);
      }
      return errorState();
    }

    const mutation = mutationForIntent(intent, memo);
    if (!mutation) {
      return errorState();
    }

    const { data: updatedMemo, error: updateError } = await supabase
      .from("memos")
      .update(mutation.values)
      .eq("owner_id", ownerId)
      .eq("id", memoId)
      .select("id")
      .maybeSingle();

    if (updateError || !updatedMemo) {
      if (updateError) {
        console.error("Memo lifecycle update failed", updateError);
      }
      return errorState();
    }

    revalidateMemoLifecycle(memoId);
    return { message: mutation.message, status: "success" };
  } catch (error) {
    console.error("Memo lifecycle update failed", error);
    return errorState();
  }
}
