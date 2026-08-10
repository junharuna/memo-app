/** @jest-environment node */

import { listOrganizationForCurrentUser } from "../../lib/memos/organization-queries";
import { createClient } from "../../lib/supabase/server";

jest.mock("../../lib/supabase/server", () => ({ createClient: jest.fn() }));

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

afterEach(() => jest.clearAllMocks());

it("カテゴリとタグを関連メモ件数付きで一括取得する", async () => {
  mockFrom.mockImplementation((table: string) => {
    const data =
      table === "categories"
        ? [
            {
              color_key: "blue",
              id: "category-1",
              name: "仕事",
              memos: [{ count: 2 }],
            },
          ]
        : [
            {
              id: "tag-1",
              name: "重要",
              memo_tags: [{ count: 3 }],
            },
          ];
    const order = jest.fn().mockResolvedValue({ data, error: null });
    const eq = jest.fn(() => ({ order }));
    return { select: jest.fn(() => ({ eq })) } as never;
  });

  await expect(listOrganizationForCurrentUser()).resolves.toEqual({
    categories: [
      {
        colorKey: "blue",
        id: "category-1",
        memoCount: 2,
        name: "仕事",
      },
    ],
    status: "success",
    tags: [{ id: "tag-1", memoCount: 3, name: "重要" }],
  });
  expect(mockFrom).toHaveBeenCalledWith("categories");
  expect(mockFrom).toHaveBeenCalledWith("tags");
});

it("未認証ではテーブルを問い合わせない", async () => {
  mockGetClaims.mockResolvedValue({ data: { claims: null }, error: null });

  await expect(listOrganizationForCurrentUser()).resolves.toEqual({
    status: "unauthenticated",
  });
  expect(mockFrom).not.toHaveBeenCalled();
});

it("片方でも取得に失敗したらエラーとして扱う", async () => {
  mockFrom.mockImplementation(() => {
    const order = jest.fn().mockResolvedValue({
      data: null,
      error: new Error("unavailable"),
    });
    return {
      select: jest.fn(() => ({ eq: jest.fn(() => ({ order })) })),
    } as never;
  });
  jest.spyOn(console, "error").mockImplementation(() => undefined);

  await expect(listOrganizationForCurrentUser()).resolves.toEqual({
    status: "error",
  });
});
