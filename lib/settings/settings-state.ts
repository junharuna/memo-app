import type { PreferencesFieldErrors } from "@/lib/settings/preferences";

export type SettingsFormState = {
  fieldErrors: PreferencesFieldErrors;
  message: string;
  status: "error" | "idle" | "success";
};

export const initialSettingsFormState: SettingsFormState = {
  fieldErrors: {},
  message: "",
  status: "idle",
};
