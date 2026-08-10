"use server";

import { revalidatePath } from "next/cache";
import { isValidMemoId } from "@/lib/memos/id";
import type { OrganizationState } from "@/lib/memos/organization-state";
import { validateTagInput } from "@/lib/memos/organization-validation";
import { createClient } from "@/lib/supabase/server";

function state(
  previousState: OrganizationState,
  status: "error" | "success",
  message: string,
  fieldErrors: OrganizationState["fieldErrors"] = {},
): OrganizationState {
  return {
    fieldErrors,
    message,
    status,
    submissionId:
      status === "success"
        ? previousState.submissionId + 1
        : previousState.submissionId,
  };
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

async function getAuthorization() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const ownerId = data?.claims?.sub;

  if (error || typeof ownerId !== "string" || ownerId.length === 0) {
    if (error) {
      console.error("Tag mutation authorization failed", error);
    }
    return null;
  }

  return { ownerId, supabase };
}

function revalidateTagPaths() {
  revalidatePath("/");
  revalidatePath("/tags");
  revalidatePath("/memos");
}

function readName(formData: FormData) {
  const value = formData.get("name");
  return validateTagInput(typeof value === "string" ? value : "");
}

export async function createTagAction(
  previousState: OrganizationState,
  formData: FormData,
): Promise<OrganizationState> {
  const input = readName(formData);
  if (Object.keys(input.fieldErrors).length > 0) {
    return state(
      previousState,
      "error",
      "入力内容を確認してください。",
      input.fieldErrors,
    );
  }

  try {
    const authorization = await getAuthorization();
    if (!authorization) {
      return state(
        previousState,
        "error",
        "セッションの有効期限が切れました。もう一度サインインしてください。",
      );
    }

    const { error } = await authorization.supabase.from("tags").insert({
      name: input.name,
      owner_id: authorization.ownerId,
    });

    if (error) {
      if (isUniqueViolation(error)) {
        return state(previousState, "error", "入力内容を確認してください。", {
          name: "同じ名前のタグがすでにあります。",
        });
      }
      console.error("Tag creation failed", error);
      return state(
        previousState,
        "error",
        "タグを作成できませんでした。もう一度お試しください。",
      );
    }

    revalidateTagPaths();
    return state(previousState, "success", "タグを作成しました。");
  } catch (error) {
    console.error("Tag creation failed", error);
    return state(
      previousState,
      "error",
      "タグを作成できませんでした。もう一度お試しください。",
    );
  }
}

export async function updateTagAction(
  tagId: string,
  previousState: OrganizationState,
  formData: FormData,
): Promise<OrganizationState> {
  const input = readName(formData);
  if (!isValidMemoId(tagId)) {
    return state(previousState, "error", "タグを更新できませんでした。");
  }
  if (Object.keys(input.fieldErrors).length > 0) {
    return state(
      previousState,
      "error",
      "入力内容を確認してください。",
      input.fieldErrors,
    );
  }

  try {
    const authorization = await getAuthorization();
    if (!authorization) {
      return state(
        previousState,
        "error",
        "セッションの有効期限が切れました。もう一度サインインしてください。",
      );
    }

    const { data, error } = await authorization.supabase
      .from("tags")
      .update({ name: input.name })
      .eq("owner_id", authorization.ownerId)
      .eq("id", tagId)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      if (isUniqueViolation(error)) {
        return state(previousState, "error", "入力内容を確認してください。", {
          name: "同じ名前のタグがすでにあります。",
        });
      }
      if (error) {
        console.error("Tag update failed", error);
      }
      return state(previousState, "error", "タグを更新できませんでした。");
    }

    revalidateTagPaths();
    return state(previousState, "success", "タグを更新しました。");
  } catch (error) {
    console.error("Tag update failed", error);
    return state(previousState, "error", "タグを更新できませんでした。");
  }
}

export async function deleteTagAction(
  tagId: string,
  previousState: OrganizationState,
  formData: FormData,
): Promise<OrganizationState> {
  void formData;
  if (!isValidMemoId(tagId)) {
    return state(previousState, "error", "タグを削除できませんでした。");
  }

  try {
    const authorization = await getAuthorization();
    if (!authorization) {
      return state(
        previousState,
        "error",
        "セッションの有効期限が切れました。もう一度サインインしてください。",
      );
    }

    const { data, error } = await authorization.supabase
      .from("tags")
      .delete()
      .eq("owner_id", authorization.ownerId)
      .eq("id", tagId)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      if (error) {
        console.error("Tag deletion failed", error);
      }
      return state(previousState, "error", "タグを削除できませんでした。");
    }

    revalidateTagPaths();
    return state(previousState, "success", "タグを削除しました。");
  } catch (error) {
    console.error("Tag deletion failed", error);
    return state(previousState, "error", "タグを削除できませんでした。");
  }
}
