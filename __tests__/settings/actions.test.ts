/** @jest-environment node */

import { revalidatePath } from "next/cache";
import { saveSettingsAction } from "@/app/settings/actions";
import { initialSettingsFormState } from "@/lib/settings/settings-state";
import { createClient } from "@/lib/supabase/server";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("../../lib/supabase/server", () => ({ createClient: jest.fn() }));

const mockCreateClient = jest.mocked(createClient);
const mockRevalidatePath = jest.mocked(revalidatePath);
const mockGetClaims = jest.fn();
const mockRpc = jest.fn();

function createFormData(displayName: string, theme: string) {
  const formData = new FormData();
  formData.set("displayName", displayName);
  formData.set("theme", theme);
  return formData;
}

beforeEach(() => {
  mockGetClaims.mockResolvedValue({
    data: { claims: { sub: "user-123" } },
    error: null,
  });
  mockRpc.mockResolvedValue({ data: true, error: null });
  mockCreateClient.mockResolvedValue({
    auth: { getClaims: mockGetClaims },
    rpc: mockRpc,
  } as never);
});

afterEach(() => {
  jest.clearAllMocks();
});

it("所有者の表示名とテーマを保存する", async () => {
  await expect(
    saveSettingsAction(
      initialSettingsFormState,
      createFormData("  新しい表示名  ", "dark"),
    ),
  ).resolves.toEqual({
    fieldErrors: {},
    message: "設定を保存しました。",
    status: "success",
  });

  expect(mockRpc).toHaveBeenCalledWith("save_profile_preferences", {
    display_name_input: "新しい表示名",
    theme_input: "dark",
  });
  expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
  expect(mockRevalidatePath).toHaveBeenCalledWith("/settings");
});

it("不正な入力はSupabaseへ送らない", async () => {
  const result = await saveSettingsAction(
    initialSettingsFormState,
    createFormData(" ", "sepia"),
  );

  expect(result.status).toBe("error");
  expect(result.fieldErrors).toHaveProperty("displayName");
  expect(result.fieldErrors).toHaveProperty("theme");
  expect(mockCreateClient).not.toHaveBeenCalled();
});

it("未認証とDB障害を明示的な失敗へ変換する", async () => {
  mockGetClaims.mockResolvedValue({ data: { claims: null }, error: null });
  const unauthenticated = await saveSettingsAction(
    initialSettingsFormState,
    createFormData("表示名", "system"),
  );
  expect(unauthenticated.message).toContain("サインイン");

  mockGetClaims.mockResolvedValue({
    data: { claims: { sub: "user-123" } },
    error: null,
  });
  mockRpc.mockResolvedValue({ data: false, error: null });
  const failed = await saveSettingsAction(
    initialSettingsFormState,
    createFormData("表示名", "system"),
  );
  expect(failed.message).toContain("保存できませんでした");
});
