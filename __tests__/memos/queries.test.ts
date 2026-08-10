/** @jest-environment node */

import {
  getMemoForCurrentUser,
  listMemosForCurrentUser,
} from "../../lib/memos/queries";
import { createClient } from "../../lib/supabase/server";

jest.mock("../../lib/supabase/server", () => ({ createClient: jest.fn() }));

const mockCreateClient = jest.mocked(createClient);
const mockGetClaims = jest.fn();
const mockFrom = jest.fn();
const mockRpc = jest.fn();

beforeEach(() => {
  mockGetClaims.mockResolvedValue({
    data: { claims: { sub: "user-123" } },
    error: null,
  });
  mockCreateClient.mockResolvedValue({
    auth: { getClaims: mockGetClaims },
    from: mockFrom,
    rpc: mockRpc,
  } as never);
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

it("本文、カテゴリ、複数タグをAND条件でページング取得する", async () => {
  const rows = [
    {
      archived_at: null,
      category_color_key: "orange",
      category_id: "category-1",
      category_name: "個人",
      content: "日本語の本文",
      created_at: "2026-08-09T01:00:00.000Z",
      favorited_at: "2026-08-09T03:00:00.000Z",
      id: "memo-1",
      revision: 4,
      tags: [{ id: "tag-1", name: "重要" }],
      title: "検索結果",
      total_count: 25,
      trashed_at: null,
      updated_at: "2026-08-09T02:00:00.000Z",
    },
  ];
  mockRpc.mockResolvedValue({ data: rows, error: null });

  await expect(
    listMemosForCurrentUser({
      filters: {
        categoryId: "category-1",
        page: 2,
        query: "日本語 本文",
        queryError: null,
        searchTerms: ["日本語", "本文"],
        sort: "updated_desc",
        tagIds: ["tag-1", "tag-2"],
        uncategorized: false,
        view: "active",
      },
    }),
  ).resolves.toEqual({
    memos: [
      {
        archivedAt: null,
        category: { colorKey: "orange", id: "category-1", name: "個人" },
        content: "日本語の本文",
        created_at: "2026-08-09T01:00:00.000Z",
        favoritedAt: "2026-08-09T03:00:00.000Z",
        id: "memo-1",
        revision: 4,
        tags: [{ id: "tag-1", name: "重要" }],
        title: "検索結果",
        trashedAt: null,
        updated_at: "2026-08-09T02:00:00.000Z",
      },
    ],
    status: "success",
    totalCount: 25,
  });
  expect(mockRpc).toHaveBeenCalledWith("search_memos_v2", {
    category_filter: "category-1",
    include_uncategorized: false,
    memo_view: "active",
    result_limit: 24,
    result_offset: 24,
    search_terms: ["日本語", "本文"],
    sort_key: "updated_desc",
    tag_filters: ["tag-1", "tag-2"],
  });
});

it("最近のメモは指定件数だけ取得する", async () => {
  mockRpc.mockResolvedValue({ data: [], error: null });

  await expect(listMemosForCurrentUser({ limit: 3 })).resolves.toEqual({
    memos: [],
    status: "success",
    totalCount: 0,
  });
  expect(mockRpc).toHaveBeenCalledWith(
    "search_memos_v2",
    expect.objectContaining({
      memo_view: "active",
      result_limit: 3,
      result_offset: 0,
      sort_key: "updated_desc",
    }),
  );
});

it("指定IDかつ所有者のメモをカテゴリとタグ付きで取得する", async () => {
  const memo = {
    archived_at: "2026-08-09T04:00:00.000Z",
    category: { color_key: "blue", id: "category-1", name: "仕事" },
    content: "# 本文",
    created_at: "2026-08-09T01:00:00.000Z",
    favorited_at: null,
    id: "memo-1",
    memo_tags: [{ tag: { id: "tag-1", name: "重要" } }],
    revision: 3,
    title: "詳細メモ",
    trashed_at: null,
    updated_at: "2026-08-09T02:00:00.000Z",
  };
  const maybeSingle = jest.fn().mockResolvedValue({ data: memo, error: null });
  const idEq = jest.fn(() => ({ maybeSingle }));
  const ownerEq = jest.fn(() => ({ eq: idEq }));
  mockFrom.mockReturnValue({ select: jest.fn(() => ({ eq: ownerEq })) });

  await expect(getMemoForCurrentUser("memo-1")).resolves.toEqual({
    memo: {
      archivedAt: "2026-08-09T04:00:00.000Z",
      category: { colorKey: "blue", id: "category-1", name: "仕事" },
      content: "# 本文",
      created_at: "2026-08-09T01:00:00.000Z",
      favoritedAt: null,
      id: "memo-1",
      revision: 3,
      tags: [{ id: "tag-1", name: "重要" }],
      title: "詳細メモ",
      trashedAt: null,
      updated_at: "2026-08-09T02:00:00.000Z",
    },
    status: "success",
  });
  expect(ownerEq).toHaveBeenCalledWith("owner_id", "user-123");
  expect(idEq).toHaveBeenCalledWith("id", "memo-1");
});

it("認証できない場合はデータベースへ問い合わせない", async () => {
  mockGetClaims.mockResolvedValue({ data: { claims: null }, error: null });

  await expect(listMemosForCurrentUser()).resolves.toEqual({
    status: "unauthenticated",
  });
  expect(mockRpc).not.toHaveBeenCalled();
});

it("データベース障害を明示的なエラー結果へ変換する", async () => {
  const databaseError = new Error("database unavailable");
  mockRpc.mockResolvedValue({ data: null, error: databaseError });
  jest.spyOn(console, "error").mockImplementation(() => undefined);

  await expect(listMemosForCurrentUser()).resolves.toEqual({ status: "error" });
});
