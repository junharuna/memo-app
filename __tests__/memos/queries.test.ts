/** @jest-environment node */

import {
  getMemoForCurrentUser,
  listMemosForCurrentUser,
} from "../../lib/memos/queries";
import { createClient } from "../../lib/supabase/server";

jest.mock("../../lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

const mockCreateClient = jest.mocked(createClient);
const mockGetClaims = jest.fn();
const mockFrom = jest.fn();

beforeEach(() => {
  mockGetClaims.mockResolvedValue({
    data: { claims: { sub: "user-123" } },
    error: null,
  });
  mockCreateClient.mockResolvedValue({
    auth: { getClaims: mockGetClaims },
    from: mockFrom,
  } as never);
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

it("現在のユーザーのメモだけを更新日時の降順で取得する", async () => {
  const memos = [
    {
      id: "memo-1",
      title: "新しいメモ",
      content: "本文",
      created_at: "2026-08-09T01:00:00.000Z",
      updated_at: "2026-08-09T02:00:00.000Z",
    },
  ];
  const order = jest.fn().mockResolvedValue({ data: memos, error: null });
  const eq = jest.fn(() => ({ order }));
  const select = jest.fn(() => ({ eq }));
  mockFrom.mockReturnValue({ select });

  await expect(listMemosForCurrentUser()).resolves.toEqual({
    status: "success",
    memos,
  });
  expect(mockGetClaims).toHaveBeenCalledTimes(1);
  expect(mockFrom).toHaveBeenCalledWith("memos");
  expect(eq).toHaveBeenCalledWith("owner_id", "user-123");
  expect(order).toHaveBeenCalledWith("updated_at", { ascending: false });
});

it("指定したIDかつ現在のユーザーが所有するメモを1件取得する", async () => {
  const memo = {
    id: "memo-1",
    title: "詳細メモ",
    content: "# 本文",
    created_at: "2026-08-09T01:00:00.000Z",
    updated_at: "2026-08-09T02:00:00.000Z",
  };
  const maybeSingle = jest.fn().mockResolvedValue({ data: memo, error: null });
  const idEq = jest.fn(() => ({ maybeSingle }));
  const ownerEq = jest.fn(() => ({ eq: idEq }));
  const select = jest.fn(() => ({ eq: ownerEq }));
  mockFrom.mockReturnValue({ select });

  await expect(getMemoForCurrentUser("memo-1")).resolves.toEqual({
    status: "success",
    memo,
  });
  expect(ownerEq).toHaveBeenCalledWith("owner_id", "user-123");
  expect(idEq).toHaveBeenCalledWith("id", "memo-1");
  expect(maybeSingle).toHaveBeenCalledTimes(1);
});

it("存在しないメモはnot_foundを返す", async () => {
  const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
  const idEq = jest.fn(() => ({ maybeSingle }));
  const ownerEq = jest.fn(() => ({ eq: idEq }));
  mockFrom.mockReturnValue({ select: jest.fn(() => ({ eq: ownerEq })) });

  await expect(getMemoForCurrentUser("missing")).resolves.toEqual({
    status: "not_found",
  });
});

it("認証できない場合はデータベースへ問い合わせない", async () => {
  mockGetClaims.mockResolvedValue({ data: { claims: null }, error: null });

  await expect(listMemosForCurrentUser()).resolves.toEqual({
    status: "unauthenticated",
  });
  expect(mockFrom).not.toHaveBeenCalled();
});

it("データベース障害を明示的なエラー結果へ変換する", async () => {
  const databaseError = new Error("database unavailable");
  const order = jest.fn().mockResolvedValue({ data: null, error: databaseError });
  const eq = jest.fn(() => ({ order }));
  mockFrom.mockReturnValue({ select: jest.fn(() => ({ eq })) });
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);

  await expect(listMemosForCurrentUser()).resolves.toEqual({ status: "error" });
  expect(consoleError).toHaveBeenCalledWith("Memo list query failed", databaseError);
});
