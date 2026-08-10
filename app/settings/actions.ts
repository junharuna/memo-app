"use server";

import { revalidatePath } from "next/cache";
import { readPreferencesInput } from "@/lib/settings/preferences";
import type { SettingsFormState } from "@/lib/settings/settings-state";
import { createClient } from "@/lib/supabase/server";

function settingsErrorState(
  message: string,
  fieldErrors: SettingsFormState["fieldErrors"] = {},
): SettingsFormState {
  return { fieldErrors, message, status: "error" };
}

export async function saveSettingsAction(
  _previousState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const { displayName, fieldErrors, theme } = readPreferencesInput(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return settingsErrorState("入力内容を確認してください。", fieldErrors);
  }

  try {
    const supabase = await createClient();
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();
    const ownerId = claimsData?.claims?.sub;

    if (claimsError || typeof ownerId !== "string" || ownerId.length === 0) {
      if (claimsError) {
        console.error("Settings authorization failed", claimsError);
      }
      return settingsErrorState(
        "セッションの有効期限が切れました。もう一度サインインしてください。",
      );
    }

    const { data: saved, error } = await supabase.rpc(
      "save_profile_preferences",
      {
        display_name_input: displayName,
        theme_input: theme,
      },
    );

    if (error || !saved) {
      if (error) {
        console.error("Settings update failed", error);
      }
      return settingsErrorState(
        "設定を保存できませんでした。入力内容を残したまま、もう一度お試しください。",
      );
    }

    revalidatePath("/", "layout");
    revalidatePath("/settings");
    return {
      fieldErrors: {},
      message: "設定を保存しました。",
      status: "success",
    };
  } catch (error) {
    console.error("Settings update failed", error);
    return settingsErrorState(
      "設定を保存できませんでした。入力内容を残したまま、もう一度お試しください。",
    );
  }
}
