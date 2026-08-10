/** @jest-environment node */

import {
  getPreferencesForCurrentUser,
  readPreferencesInput,
} from "@/lib/settings/preferences";
import { createClient } from "@/lib/supabase/server";

jest.mock("../../lib/supabase/server", () => ({ createClient: jest.fn() }));

const mockCreateClient = jest.mocked(createClient);
const mockGetClaims = jest.fn();
const mockMaybeSingle = jest.fn();
const mockEq = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));

beforeEach(() => {
  mockGetClaims.mockResolvedValue({
    data: { claims: { email: "memo.user@example.com", sub: "user-123" } },
    error: null,
  });
  mockMaybeSingle.mockResolvedValue({
    data: { display_name: "メモ利用者", theme: "dark" },
    error: null,
  });
  mockCreateClient.mockResolvedValue({
    auth: { getClaims: mockGetClaims },
    from: jest.fn(() => ({ select: mockSelect })),
  } as never);
});

afterEach(() => {
  jest.clearAllMocks();
});

it("所有するプロフィールと認証メールを取得する", async () => {
  await expect(getPreferencesForCurrentUser()).resolves.toEqual({
    preferences: {
      displayName: "メモ利用者",
      email: "memo.user@example.com",
      theme: "dark",
    },
    status: "success",
  });
  expect(mockEq).toHaveBeenCalledWith("owner_id", "user-123");
});

it("プロフィール未作成時はメールのローカル部とシステムテーマへフォールバックする", async () => {
  mockMaybeSingle.mockResolvedValue({ data: null, error: null });

  await expect(getPreferencesForCurrentUser()).resolves.toEqual({
    preferences: {
      displayName: "memo.user",
      email: "memo.user@example.com",
      theme: "system",
    },
    status: "success",
  });
});

it("表示名とテーマを許可値に検証する", () => {
  const valid = new FormData();
  valid.set("displayName", "  表示名  ");
  valid.set("theme", "light");
  expect(readPreferencesInput(valid)).toEqual({
    displayName: "表示名",
    fieldErrors: {},
    theme: "light",
  });

  const invalid = new FormData();
  invalid.set("displayName", " ");
  invalid.set("theme", "sepia");
  expect(readPreferencesInput(invalid).fieldErrors).toEqual({
    displayName: "表示名を入力してください。",
    theme: "テーマを選び直してください。",
  });
});
