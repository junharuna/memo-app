"use server";

import { revalidatePath } from "next/cache";
import type { OrganizationState } from "@/lib/memos/organization-state";
import { isValidMemoId } from "@/lib/memos/id";
import { validateCategoryInput } from "@/lib/memos/organization-validation";
import { createClient } from "@/lib/supabase/server";

function errorState(
  previousState: OrganizationState,
  message: string,
  fieldErrors: OrganizationState["fieldErrors"] = {},
): OrganizationState {
  return {
    fieldErrors,
    message,
    status: "error",
    submissionId: previousState.submissionId,
  };
}

function successState(
  previousState: OrganizationState,
  message: string,
): OrganizationState {
  return {
    fieldErrors: {},
    message,
    status: "success",
    submissionId: previousState.submissionId + 1,
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
      console.error("Category mutation authorization failed", error);
    }

    return null;
  }

  return { ownerId, supabase };
}

function revalidateCategoryPaths() {
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/memos");
}

function readCategoryInput(formData: FormData) {
  const name = formData.get("name");
  const colorKey = formData.get("colorKey");

  return validateCategoryInput(
    typeof name === "string" ? name : "",
    typeof colorKey === "string" ? colorKey : "",
  );
}

export async function createCategoryAction(
  previousState: OrganizationState,
  formData: FormData,
): Promise<OrganizationState> {
  const input = readCategoryInput(formData);

  if (Object.keys(input.fieldErrors).length > 0 || !input.colorKey) {
    return errorState(
      previousState,
      "入力内容を確認してください。",
      input.fieldErrors,
    );
  }

  try {
    const authorization = await getAuthorization();
    if (!authorization) {
      return errorState(
        previousState,
        "セッションの有効期限が切れました。もう一度サインインしてください。",
      );
    }

    const { error } = await authorization.supabase.from("categories").insert({
      color_key: input.colorKey,
      name: input.name,
      owner_id: authorization.ownerId,
    });

    if (error) {
      if (isUniqueViolation(error)) {
        return errorState(previousState, "入力内容を確認してください。", {
          name: "同じ名前のカテゴリがすでにあります。",
        });
      }

      console.error("Category creation failed", error);
      return errorState(
        previousState,
        "カテゴリを作成できませんでした。もう一度お試しください。",
      );
    }

    revalidateCategoryPaths();
    return successState(previousState, "カテゴリを作成しました。");
  } catch (error) {
    console.error("Category creation failed", error);
    return errorState(
      previousState,
      "カテゴリを作成できませんでした。もう一度お試しください。",
    );
  }
}

export async function updateCategoryAction(
  categoryId: string,
  previousState: OrganizationState,
  formData: FormData,
): Promise<OrganizationState> {
  const input = readCategoryInput(formData);

  if (!isValidMemoId(categoryId)) {
    return errorState(previousState, "カテゴリを更新できませんでした。");
  }

  if (Object.keys(input.fieldErrors).length > 0 || !input.colorKey) {
    return errorState(
      previousState,
      "入力内容を確認してください。",
      input.fieldErrors,
    );
  }

  try {
    const authorization = await getAuthorization();
    if (!authorization) {
      return errorState(
        previousState,
        "セッションの有効期限が切れました。もう一度サインインしてください。",
      );
    }

    const { data, error } = await authorization.supabase
      .from("categories")
      .update({ color_key: input.colorKey, name: input.name })
      .eq("owner_id", authorization.ownerId)
      .eq("id", categoryId)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      if (isUniqueViolation(error)) {
        return errorState(previousState, "入力内容を確認してください。", {
          name: "同じ名前のカテゴリがすでにあります。",
        });
      }

      if (error) {
        console.error("Category update failed", error);
      }
      return errorState(previousState, "カテゴリを更新できませんでした。");
    }

    revalidateCategoryPaths();
    return successState(previousState, "カテゴリを更新しました。");
  } catch (error) {
    console.error("Category update failed", error);
    return errorState(previousState, "カテゴリを更新できませんでした。");
  }
}

export async function deleteCategoryAction(
  categoryId: string,
  previousState: OrganizationState,
  formData: FormData,
): Promise<OrganizationState> {
  void formData;
  if (!isValidMemoId(categoryId)) {
    return errorState(previousState, "カテゴリを削除できませんでした。");
  }

  try {
    const authorization = await getAuthorization();
    if (!authorization) {
      return errorState(
        previousState,
        "セッションの有効期限が切れました。もう一度サインインしてください。",
      );
    }

    const { data, error } = await authorization.supabase
      .from("categories")
      .delete()
      .eq("owner_id", authorization.ownerId)
      .eq("id", categoryId)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      if (error) {
        console.error("Category deletion failed", error);
      }
      return errorState(previousState, "カテゴリを削除できませんでした。");
    }

    revalidateCategoryPaths();
    return successState(previousState, "カテゴリを削除しました。");
  } catch (error) {
    console.error("Category deletion failed", error);
    return errorState(previousState, "カテゴリを削除できませんでした。");
  }
}
