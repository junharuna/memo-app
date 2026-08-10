/** @jest-environment node */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateMemoAction } from "../../app/memos/[id]/edit/actions";
import { initialMemoFormState } from "../../lib/memos/form-state";
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
const mockUpdate = jest.fn(() => ({ eq: mockOwnerEq }));
const mockFrom = jest.fn(() => ({ update: mockUpdate }));

function createFormData(title: string, content = "") {
  const formData = new FormData();
  formData.set("title", title);
  formData.set("content", content);
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

describe("updateMemoAction", () => {
  it("所有するメモのタイトルとMarkdownソースを更新して詳細へ戻る", async () => {
    const content = "# 更新後\n\n- [x] 完了";

    await expect(
      updateMemoAction(
        memoId,
        initialMemoFormState,
        createFormData("  更新タイトル  ", content),
      ),
    ).rejects.toThrow(`redirect:/memos/${memoId}?toast=memo-updated`);

    expect(mockUpdate).toHaveBeenCalledWith({
      content,
      title: "更新タイトル",
    });
    expect(mockOwnerEq).toHaveBeenCalledWith("owner_id", "user-123");
    expect(mockIdEq).toHaveBeenCalledWith("id", memoId);
    expect(mockSelect).toHaveBeenCalledWith("id");
    expect(mockMaybeSingle).toHaveBeenCalledTimes(1);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/memos");
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/memos/${memoId}`);
    expect(mockRedirect).toHaveBeenCalledWith(
      `/memos/${memoId}?toast=memo-updated`,
    );
  });

  it("空のタイトルは更新しない", async () => {
    await expect(
      updateMemoAction(
        memoId,
        initialMemoFormState,
        createFormData("   ", "本文"),
      ),
    ).resolves.toEqual({
      fieldErrors: { title: "タイトルを入力してください。" },
      message: "入力内容を確認してください。",
      status: "error",
      submissionId: 0,
    });
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("未認証の場合は更新しない", async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: null }, error: null });

    const result = await updateMemoAction(
      memoId,
      initialMemoFormState,
      createFormData("更新タイトル", "本文"),
    );

    expect(result.message).toBe(
      "セッションの有効期限が切れました。もう一度サインインしてください。",
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("所有するメモが見つからない場合は更新失敗を返す", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await updateMemoAction(
      memoId,
      initialMemoFormState,
      createFormData("更新タイトル", "本文"),
    );

    expect(result.status).toBe("error");
    expect(result.message).toBe(
      "メモを更新できませんでした。入力内容はこの画面に残っています。もう一度お試しください。",
    );
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
