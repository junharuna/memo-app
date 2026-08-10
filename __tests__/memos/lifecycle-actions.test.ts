/** @jest-environment node */

import { revalidatePath } from "next/cache";
import { mutateMemoLifecycleAction } from "../../app/memos/[id]/lifecycle/actions";
import { initialMemoLifecycleActionState } from "../../lib/memos/lifecycle-state";
import { createClient } from "../../lib/supabase/server";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("../../lib/supabase/server", () => ({ createClient: jest.fn() }));

const memoId = "11111111-1111-4111-8111-111111111111";
const mockCreateClient = jest.mocked(createClient);
const mockRevalidatePath = jest.mocked(revalidatePath);
const mockGetClaims = jest.fn();
const mockReadMaybeSingle = jest.fn();
const mockReadIdEq = jest.fn(() => ({ maybeSingle: mockReadMaybeSingle }));
const mockReadOwnerEq = jest.fn(() => ({ eq: mockReadIdEq }));
const mockSelect = jest.fn(() => ({ eq: mockReadOwnerEq }));
const mockWriteMaybeSingle = jest.fn();
const mockWriteSelect = jest.fn(() => ({ maybeSingle: mockWriteMaybeSingle }));
const mockWriteIdEq = jest.fn(() => ({ select: mockWriteSelect }));
const mockWriteOwnerEq = jest.fn(() => ({ eq: mockWriteIdEq }));
const mockUpdate = jest.fn(() => ({ eq: mockWriteOwnerEq }));

function createFormData(intent: string) {
  const formData = new FormData();
  formData.set("intent", intent);
  return formData;
}

beforeEach(() => {
  mockGetClaims.mockResolvedValue({
    data: { claims: { sub: "user-123" } },
    error: null,
  });
  mockReadMaybeSingle.mockResolvedValue({
    data: { archived_at: null, favorited_at: null, trashed_at: null },
    error: null,
  });
  mockWriteMaybeSingle.mockResolvedValue({ data: { id: memoId }, error: null });
  mockCreateClient.mockResolvedValue({
    auth: { getClaims: mockGetClaims },
    from: jest.fn(() => ({ select: mockSelect, update: mockUpdate })),
  } as never);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("mutateMemoLifecycleAction", () => {
  it("所有する有効なメモをお気に入りに追加する", async () => {
    const result = await mutateMemoLifecycleAction(
      memoId,
      initialMemoLifecycleActionState,
      createFormData("favorite"),
    );

    expect(result).toEqual({
      message: "お気に入りに追加しました。",
      status: "success",
    });
    expect(mockUpdate).toHaveBeenCalledWith({ favorited_at: expect.any(String) });
    expect(mockReadOwnerEq).toHaveBeenCalledWith("owner_id", "user-123");
    expect(mockWriteOwnerEq).toHaveBeenCalledWith("owner_id", "user-123");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/memos");
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/memos/${memoId}`);
  });

  it.each([
    ["archive", { archived_at: expect.any(String) }, "アーカイブしました。"],
    ["trash", { archived_at: null, trashed_at: expect.any(String) }, "ゴミ箱に移動しました。"],
  ])("%s操作を保存する", async (intent, expectedUpdate, message) => {
    const result = await mutateMemoLifecycleAction(
      memoId,
      initialMemoLifecycleActionState,
      createFormData(intent),
    );

    expect(mockUpdate).toHaveBeenCalledWith(expectedUpdate);
    expect(result).toEqual({ message, status: "success" });
  });

  it("ゴミ箱のメモを復元する", async () => {
    mockReadMaybeSingle.mockResolvedValue({
      data: {
        archived_at: null,
        favorited_at: "2026-08-10T01:00:00.000Z",
        trashed_at: "2026-08-10T02:00:00.000Z",
      },
      error: null,
    });

    const result = await mutateMemoLifecycleAction(
      memoId,
      initialMemoLifecycleActionState,
      createFormData("restore"),
    );

    expect(mockUpdate).toHaveBeenCalledWith({ trashed_at: null });
    expect(result).toEqual({ message: "メモを復元しました。", status: "success" });
  });

  it("ゴミ箱のメモはお気に入り操作できない", async () => {
    mockReadMaybeSingle.mockResolvedValue({
      data: {
        archived_at: null,
        favorited_at: null,
        trashed_at: "2026-08-10T02:00:00.000Z",
      },
      error: null,
    });

    const result = await mutateMemoLifecycleAction(
      memoId,
      initialMemoLifecycleActionState,
      createFormData("favorite"),
    );

    expect(result.status).toBe("error");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("不正な操作と未認証リクエストを拒否する", async () => {
    const invalid = await mutateMemoLifecycleAction(
      memoId,
      initialMemoLifecycleActionState,
      createFormData("invalid"),
    );
    expect(invalid.status).toBe("error");
    expect(mockCreateClient).not.toHaveBeenCalled();

    mockGetClaims.mockResolvedValue({ data: { claims: null }, error: null });
    const unauthenticated = await mutateMemoLifecycleAction(
      memoId,
      initialMemoLifecycleActionState,
      createFormData("archive"),
    );
    expect(unauthenticated.message).toContain("サインイン");
    expect(mockSelect).not.toHaveBeenCalled();
  });
});
