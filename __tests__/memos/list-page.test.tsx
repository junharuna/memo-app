import { render, screen } from "@testing-library/react";
import MemosPage, {
  dynamic,
  generateMetadata,
} from "../../app/memos/page";
import { listOrganizationForCurrentUser } from "../../lib/memos/organization-queries";
import { listMemosForCurrentUser } from "../../lib/memos/queries";

const mockRedirect = jest.fn();

jest.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

jest.mock("../../lib/memos/queries", () => ({
  listMemosForCurrentUser: jest.fn(),
}));
jest.mock("../../lib/memos/organization-queries", () => ({
  listOrganizationForCurrentUser: jest.fn(),
}));
jest.mock("../../app/memos/[id]/lifecycle/actions", () => ({
  mutateMemoLifecycleAction: jest.fn(),
}));

const mockListMemos = jest.mocked(listMemosForCurrentUser);
const mockListOrganization = jest.mocked(listOrganizationForCurrentUser);

const memos = Array.from({ length: 4 }, (_, index) => ({
  archivedAt: null,
  id: `${index + 1}`.repeat(8) + "-1111-4111-8111-111111111111",
  title: `${index + 1}件目のメモ`,
  content: `${index + 1}件目の本文`,
  created_at: `2026-08-0${index + 1}T01:00:00.000Z`,
  favoritedAt: null,
  revision: 1,
  trashedAt: null,
  updated_at: `2026-08-0${index + 1}T02:00:00.000Z`,
}));

describe("MemosPage", () => {
  beforeEach(() => {
    mockListOrganization.mockResolvedValue({
      categories: [
        { colorKey: "blue", id: "11111111-1111-4111-8111-111111111111", memoCount: 2, name: "仕事" },
      ],
      status: "success",
      tags: [
        { id: "22222222-2222-4222-8222-222222222222", memoCount: 2, name: "重要" },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("保存済みメモを制限せずすべて表示する", async () => {
    mockListMemos.mockResolvedValue({ status: "success", memos });

    render(await MemosPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { level: 1, name: "すべてのメモ" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.getByText("1件目のメモ")).toBeInTheDocument();
    expect(screen.getByText("4件目のメモ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "新しいメモを作成" })).toHaveAttribute(
      "href",
      "/memos/new",
    );
    expect(mockListMemos).toHaveBeenCalledWith({
      filters: expect.objectContaining({ page: 1, query: "", tagIds: [] }),
    });
  });

  it("認証Cookieに応じてリクエストごとに動的表示する", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it.each([
    [undefined, "すべてのメモ"],
    ["favorites", "お気に入り"],
    ["archive", "アーカイブ"],
    ["trash", "ゴミ箱"],
  ])("%sビューのページタイトルを返す", async (view, title) => {
    await expect(
      generateMetadata({
        searchParams: Promise.resolve(view ? { view } : {}),
      }),
    ).resolves.toMatchObject({ title });
  });

  it.each([
    ["favorites", "お気に入り"],
    ["archive", "アーカイブ"],
  ])("%sビューをURLから取得して見出しへ反映する", async (view, heading) => {
    mockListMemos.mockResolvedValue({ status: "success", memos: [memos[0]] });

    render(
      await MemosPage({ searchParams: Promise.resolve({ view }) }),
    );

    expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
    expect(mockListMemos).toHaveBeenCalledWith({
      filters: expect.objectContaining({ view }),
    });
  });

  it("空のゴミ箱では通常一覧へ戻る導線を表示する", async () => {
    mockListMemos.mockResolvedValue({ status: "success", memos: [], totalCount: 0 });

    render(
      await MemosPage({ searchParams: Promise.resolve({ view: "trash" }) }),
    );

    expect(screen.getByRole("heading", { level: 1, name: "ゴミ箱" })).toBeInTheDocument();
    expect(screen.getByText("ゴミ箱は空です")).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "メモの本文を検索" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "カテゴリで絞り込む" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "すべてのメモへ戻る" })).toHaveAttribute(
      "href",
      "/memos",
    );
  });

  it("認証できない場合はサインインへ移動する", async () => {
    mockListMemos.mockResolvedValue({ status: "unauthenticated" });

    await MemosPage({ searchParams: Promise.resolve({}) });

    expect(mockRedirect).toHaveBeenCalledWith("/signin");
  });

  it("本文、カテゴリ、タグをURLから復元してAND条件で取得する", async () => {
    mockListMemos.mockResolvedValue({ status: "success", memos: [memos[0]], totalCount: 1 });
    const categoryId = "11111111-1111-4111-8111-111111111111";
    const tagId = "22222222-2222-4222-8222-222222222222";

    render(
      await MemosPage({
        searchParams: Promise.resolve({
          category: categoryId,
          q: "日本語 本文",
          tags: tagId,
        }),
      }),
    );

    expect(screen.getByRole("searchbox", { name: "メモの本文を検索" })).toHaveValue(
      "日本語 本文",
    );
    expect(
      screen.getByRole("button", { name: "絞り込み条件を開く" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "カテゴリで絞り込む" })).toHaveValue(
      categoryId,
    );
    expect(screen.getByRole("link", { name: "タグ #重要を解除" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(
      screen.getByRole("link", { name: "検索キーワード 日本語 本文を解除" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "カテゴリ 仕事を解除" }),
    ).toBeInTheDocument();
    expect(mockListMemos).toHaveBeenCalledWith({
      filters: expect.objectContaining({
        categoryId,
        searchTerms: ["日本語", "本文"],
        tagIds: [tagId],
      }),
    });
  });

  it("長すぎる検索語はDBへ問い合わせず入力エラーを表示する", async () => {
    render(
      await MemosPage({
        searchParams: Promise.resolve({ q: "あ".repeat(101) }),
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "検索キーワードは100文字以内で入力してください。",
    );
    expect(mockListMemos).not.toHaveBeenCalled();
  });
});
