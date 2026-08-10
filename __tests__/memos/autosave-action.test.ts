/** @jest-environment node */

import { revalidatePath } from "next/cache";
import { autosaveMemoAction } from "@/app/memos/[id]/edit/autosave-action";
import { createClient } from "@/lib/supabase/server";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("../../lib/supabase/server", () => ({ createClient: jest.fn() }));

const memoId = "11111111-1111-4111-8111-111111111111";
const mockCreateClient = jest.mocked(createClient);
const mockRevalidatePath = jest.mocked(revalidatePath);
const mockGetClaims = jest.fn();
const mockRpc = jest.fn();

function createFormData(overrides: Record<string, string | string[]> = {}) {
  const values: Record<string, string | string[]> = {
    content: "# 自動保存本文",
    expectedRevision: "2",
    title: "自動保存タイトル",
    ...overrides,
  };
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    const entries = Array.isArray(value) ? value : [value];
    entries.forEach((entry) => formData.append(key, entry));
  });
  return formData;
}

beforeEach(() => {
  mockGetClaims.mockResolvedValue({
    data: { claims: { sub: "user-123" } },
    error: null,
  });
  mockRpc.mockResolvedValue({
    data: [
      {
        new_revision: 3,
        new_updated_at: "2026-08-10T03:00:00.000Z",
        status: "saved",
      },
    ],
    error: null,
  });
  mockCreateClient.mockResolvedValue({
    auth: { getClaims: mockGetClaims },
    rpc: mockRpc,
  } as never);
});

afterEach(() => {
  jest.clearAllMocks();
});

it("revisionが一致する所有メモを自動保存する", async () => {
  await expect(autosaveMemoAction(memoId, createFormData())).resolves.toEqual({
    revision: 3,
    status: "saved",
    updatedAt: "2026-08-10T03:00:00.000Z",
  });

  expect(mockRpc).toHaveBeenCalledWith("save_memo_revision", {
    expected_revision: 2,
    memo_category_id: undefined,
    memo_content: "# 自動保存本文",
    memo_tag_ids: [],
    memo_title: "自動保存タイトル",
    target_memo_id: memoId,
  });
  expect(mockRevalidatePath).toHaveBeenCalledWith(`/memos/${memoId}`);
});

it.each([
  ["conflict", "別の場所で更新"],
  ["trashed", "ゴミ箱"],
])("DBの%s状態を上書きせず呼び出し側へ返す", async (status, message) => {
  mockRpc.mockResolvedValue({
    data: [{ new_revision: 2, new_updated_at: "", status }],
    error: null,
  });

  const result = await autosaveMemoAction(memoId, createFormData());

  expect(result.status).toBe(status);
  expect("message" in result ? result.message : "").toContain(message);
  expect(mockRevalidatePath).not.toHaveBeenCalled();
});

it("不正な入力とrevisionはSupabaseへ送らない", async () => {
  const invalidTitle = await autosaveMemoAction(
    memoId,
    createFormData({ title: " " }),
  );
  expect(invalidTitle.status).toBe("invalid");

  const invalidRevision = await autosaveMemoAction(
    memoId,
    createFormData({ expectedRevision: "invalid" }),
  );
  expect(invalidRevision.status).toBe("error");
  expect(mockCreateClient).not.toHaveBeenCalled();
});
