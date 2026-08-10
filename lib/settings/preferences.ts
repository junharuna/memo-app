import { createClient } from "@/lib/supabase/server";

export const themePreferences = ["system", "light", "dark"] as const;

export type ThemePreference = (typeof themePreferences)[number];

export type UserPreferences = {
  displayName: string;
  email: string;
  theme: ThemePreference;
};

export type PreferencesResult =
  | { preferences: UserPreferences; status: "success" }
  | { status: "unauthenticated" }
  | { status: "error" };

export type PreferencesFieldErrors = Partial<
  Record<"displayName" | "theme", string>
>;

export function isThemePreference(value: unknown): value is ThemePreference {
  return themePreferences.some((theme) => theme === value);
}

function fallbackDisplayName(email: string) {
  const localPart = email.split("@")[0]?.trim();
  return localPart || "ユーザー";
}

export function readPreferencesInput(formData: FormData) {
  const rawDisplayName = formData.get("displayName");
  const rawTheme = formData.get("theme");
  const displayName =
    typeof rawDisplayName === "string" ? rawDisplayName.trim() : "";
  const theme = isThemePreference(rawTheme) ? rawTheme : "system";
  const fieldErrors: PreferencesFieldErrors = {};

  if (!displayName) {
    fieldErrors.displayName = "表示名を入力してください。";
  } else if (Array.from(displayName).length > 50) {
    fieldErrors.displayName = "表示名は50文字以内で入力してください。";
  }

  if (!isThemePreference(rawTheme)) {
    fieldErrors.theme = "テーマを選び直してください。";
  }

  return { displayName, fieldErrors, theme };
}

export async function getPreferencesForCurrentUser(): Promise<PreferencesResult> {
  try {
    const supabase = await createClient();
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();
    const ownerId = claimsData?.claims?.sub;
    const email =
      typeof claimsData?.claims?.email === "string"
        ? claimsData.claims.email
        : "";

    if (claimsError || typeof ownerId !== "string" || ownerId.length === 0) {
      if (claimsError) {
        console.error("Preferences authorization failed", claimsError);
      }
      return { status: "unauthenticated" };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("display_name, theme")
      .eq("owner_id", ownerId)
      .maybeSingle();

    if (error) {
      console.error("Preferences query failed", error);
      return { status: "error" };
    }

    return {
      preferences: {
        displayName:
          profile?.display_name?.trim() || fallbackDisplayName(email),
        email,
        theme: isThemePreference(profile?.theme) ? profile.theme : "system",
      },
      status: "success",
    };
  } catch (error) {
    console.error("Preferences query failed", error);
    return { status: "error" };
  }
}
