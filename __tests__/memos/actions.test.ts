/** @jest-environment node */

import { createMemoAction } from "../../app/memos/new/actions";
import { initialCreateMemoState } from "../../app/memos/new/create-memo-state";
import { createClient } from "../../lib/supabase/server";

jest.mock("../../lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

const mockCreateClient = jest.mocked(createClient);
const mockGetClaims = jest.fn();
const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));

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
  mockInsert.mockResolvedValue({ error: null });
  mockCreateClient.mockResolvedValue({
    auth: { getClaims: mockGetClaims },
    from: mockFrom,
  } as never);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("createMemoAction", () => {
  it("認証済みユーザーを所有者としてMarkdownソースを保存する", async () => {
    const content = "# 見出し\n\n- 項目1\n- 項目2";

    await expect(
      createMemoAction(initialCreateMemoState, createFormData("  新しいメモ  ", content)),
    ).resolves.toEqual({
      fieldErrors: {},
      message: "メモを保存しました。続けて新しいメモを作成できます。",
      status: "success",
      submissionId: 1,
    });
    expect(mockGetClaims).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith("memos");
    expect(mockInsert).toHaveBeenCalledWith({
      content,
      owner_id: "user-123",
      title: "新しいメモ",
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
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("データベース障害時は入力内容を保てるエラーを返す", async () => {
    mockInsert.mockResolvedValue({ error: new Error("database unavailable") });
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
});
