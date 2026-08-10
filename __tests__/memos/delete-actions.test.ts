/** @jest-environment node */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteMemoAction } from "../../app/memos/[id]/delete/actions";
import { initialDeleteMemoState } from "../../lib/memos/delete-state";
import { createClient } from "../../lib/supabase/server";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

jest.mock("../../lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

const memoId = "11111111-1111-4111-8111-111111111111";
const mockCreateClient = jest.mocked(createClient);
const mockRevalidatePath = jest.mocked(revalidatePath);
const mockRedirect = jest.mocked(redirect);
const mockGetClaims = jest.fn();
const mockMaybeSingle = jest.fn();
const mockSelect = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockIdEq = jest.fn(() => ({ select: mockSelect }));
const mockOwnerEq = jest.fn(() => ({ eq: mockIdEq }));
const mockDelete = jest.fn(() => ({ eq: mockOwnerEq }));
const mockFrom = jest.fn(() => ({ delete: mockDelete }));

function createDeleteFormData() {
  const formData = new FormData();
  formData.set("intent", "delete-memo");
  return formData;
}

beforeEach(() => {
  mockGetClaims.mockResolvedValue({
    data: { claims: { sub: "user-123" } },
    error: null,
  });
  mockMaybeSingle.mockResolvedValue({ data: { id: memoId }, error: null });
  mockCreateClient.mockResolvedValue({
    auth: { getClaims: mockGetClaims },
    from: mockFrom,
  } as never);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("deleteMemoAction", () => {
  it("所有するゴミ箱のメモだけを完全削除してゴミ箱一覧へ戻る", async () => {
    await expect(
      deleteMemoAction(memoId, initialDeleteMemoState, createDeleteFormData()),
    ).rejects.toThrow("redirect:/memos?view=trash&toast=memo-deleted");

    expect(mockOwnerEq).toHaveBeenCalledWith("owner_id", "user-123");
    expect(mockIdEq).toHaveBeenCalledWith("id", memoId);
    expect(mockSelect).toHaveBeenCalledWith("id");
    expect(mockMaybeSingle).toHaveBeenCalledTimes(1);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/memos");
    expect(mockRedirect).toHaveBeenCalledWith(
      "/memos?view=trash&toast=memo-deleted",
    );
  });

  it("不正なメモIDでは削除しない", async () => {
    const result = await deleteMemoAction(
      "invalid",
      initialDeleteMemoState,
      createDeleteFormData(),
    );

    expect(result.status).toBe("error");
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("削除フォーム以外からの送信では削除しない", async () => {
    const result = await deleteMemoAction(
      memoId,
      initialDeleteMemoState,
      new FormData(),
    );

    expect(result.status).toBe("error");
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("未認証の場合は削除しない", async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: null }, error: null });

    const result = await deleteMemoAction(
      memoId,
      initialDeleteMemoState,
      createDeleteFormData(),
    );

    expect(result.message).toBe(
      "セッションの有効期限が切れました。もう一度サインインしてください。",
    );
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("所有するメモが見つからない場合は削除失敗を返す", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await deleteMemoAction(
      memoId,
      initialDeleteMemoState,
      createDeleteFormData(),
    );

    expect(result).toEqual({
      message: "メモを削除できませんでした。もう一度お試しください。",
      status: "error",
    });
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
