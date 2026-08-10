/** @jest-environment node */

import { createMemoAction } from "../../app/memos/new/actions";
import { initialCreateMemoState } from "../../app/memos/new/create-memo-state";
import { createClient } from "../../lib/supabase/server";

jest.mock("../../lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

const mockCreateClient = jest.mocked(createClient);
const mockGetClaims = jest.fn();
const mockRpc = jest.fn();

function createFormData(
  title: string,
  content = "",
  categoryId = "",
  tagIds: string[] = [],
) {
  const formData = new FormData();
  formData.set("title", title);
  formData.set("content", content);
  formData.set("categoryId", categoryId);
  tagIds.forEach((tagId) => formData.append("tagIds", tagId));
  return formData;
}

beforeEach(() => {
  mockGetClaims.mockResolvedValue({
    data: { claims: { sub: "user-123" } },
    error: null,
  });
  mockRpc.mockResolvedValue({ data: "memo-id", error: null });
  mockCreateClient.mockResolvedValue({
    auth: { getClaims: mockGetClaims },
    rpc: mockRpc,
  } as never);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("createMemoAction", () => {
  it("認証済みユーザーを所有者としてMarkdownソースを保存する", async () => {
    const content = "# 見出し\n\n- 項目1\n- 項目2";

    const categoryId = "11111111-1111-4111-8111-111111111111";
    const tagId = "22222222-2222-4222-8222-222222222222";
    await expect(
      createMemoAction(
        initialCreateMemoState,
        createFormData("  新しいメモ  ", content, categoryId, [tagId]),
      ),
    ).resolves.toEqual({
      fieldErrors: {},
      message: "メモを保存しました。続けて新しいメモを作成できます。",
      status: "success",
      submissionId: 1,
    });
    expect(mockGetClaims).toHaveBeenCalledTimes(1);
    expect(mockRpc).toHaveBeenCalledWith("create_memo_with_metadata", {
      memo_category_id: categoryId,
      memo_content: content,
      memo_tag_ids: [tagId],
      memo_title: "新しいメモ",
    });
  });

  it("空のタイトルは保存せず入力欄のエラーを返す", async () => {
    await expect(
      createMemoAction(initialCreateMemoState, createFormData("   ", "本文")),
    ).resolves.toEqual({
      fieldErrors: { title: "タイトルを入力してください。" },
      message: "入力内容を確認してください。",
      status: "error",
      submissionId: 0,
    });
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("上限を超える本文は保存しない", async () => {
    const result = await createMemoAction(
      initialCreateMemoState,
      createFormData("タイトル", "a".repeat(100_001)),
    );

    expect(result.fieldErrors.content).toBe("本文は100,000文字以内で入力してください。");
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("未認証の要求は保存せず再認証を促す", async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: null }, error: null });

    await expect(
      createMemoAction(initialCreateMemoState, createFormData("タイトル", "本文")),
    ).resolves.toEqual({
      fieldErrors: {},
      message: "セッションの有効期限が切れました。もう一度サインインしてください。",
      status: "error",
      submissionId: 0,
    });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("データベース障害時は入力内容を保てるエラーを返す", async () => {
    mockRpc.mockResolvedValue({ data: null, error: new Error("database unavailable") });
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(
      createMemoAction(initialCreateMemoState, createFormData("タイトル", "本文")),
    ).resolves.toEqual({
      fieldErrors: {},
      message: "メモを保存できませんでした。入力内容はこの画面に残っています。もう一度お試しください。",
      status: "error",
      submissionId: 0,
    });
    expect(consoleError).toHaveBeenCalledWith(
      "Memo creation failed",
      expect.any(Error),
    );
  });

  it("不正なカテゴリとタグIDは保存しない", async () => {
    const result = await createMemoAction(
      initialCreateMemoState,
      createFormData("タイトル", "本文", "invalid", ["invalid"]),
    );

    expect(result.fieldErrors).toEqual({
      categoryId: "カテゴリを選び直してください。",
      tagIds: "タグを選び直してください。",
    });
    expect(mockRpc).not.toHaveBeenCalled();
  });
});
