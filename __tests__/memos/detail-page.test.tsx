import { render, screen, within } from "@testing-library/react";
import { notFound, redirect } from "next/navigation";
import MemoDetailPage from "../../app/memos/[id]/page";
import { getMemoForCurrentUser } from "../../lib/memos/queries";

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("not-found");
  }),
  redirect: jest.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

jest.mock("../../lib/memos/queries", () => ({
  getMemoForCurrentUser: jest.fn(),
}));

jest.mock("../../components/memos/memo-delete-button", () => ({
  MemoDeleteButton: () => <button type="button">完全に削除</button>,
}));
jest.mock("../../components/memos/memo-lifecycle-controls", () => ({
  MemoLifecycleControls: ({
    archivedAt,
    favoritedAt,
    trashedAt,
  }: {
    archivedAt: string | null;
    favoritedAt: string | null;
    trashedAt: string | null;
  }) =>
    trashedAt ? (
      <>
        <button type="button">メモを復元</button>
        <button type="button">完全に削除</button>
      </>
    ) : (
      <>
        <button type="button">
          {favoritedAt ? "お気に入りから外す" : "お気に入りに追加"}
        </button>
        <button type="button">
          {archivedAt ? "アーカイブを解除" : "アーカイブ"}
        </button>
        <button type="button">ゴミ箱に移動</button>
      </>
    ),
}));

const mockGetMemo = jest.mocked(getMemoForCurrentUser);
const mockNotFound = jest.mocked(notFound);
const mockRedirect = jest.mocked(redirect);
const memoId = "11111111-1111-4111-8111-111111111111";

afterEach(() => {
  jest.clearAllMocks();
});

it("所有するメモのMarkdown本文を安全に表示する", async () => {
  mockGetMemo.mockResolvedValue({
    status: "success",
    memo: {
      archivedAt: null,
      id: memoId,
      title: "詳細メモ",
      content: "# 本文見出し\n1行目\n2行目\n\n- [x] 完了\n\n<script>alert(1)</script>",
      created_at: "2026-08-09T01:00:00.000Z",
      favoritedAt: null,
      revision: 1,
      updated_at: "2026-08-09T02:00:00.000Z",
      category: { colorKey: "blue", id: "category-1", name: "仕事" },
      tags: [
        { id: "tag-1", name: "重要" },
        { id: "tag-2", name: "確認" },
      ],
      trashedAt: null,
    },
  });

  render(await MemoDetailPage({ params: Promise.resolve({ id: memoId }) }));

  expect(screen.getByRole("heading", { level: 1, name: "詳細メモ" })).toBeInTheDocument();
  const article = screen.getByRole("article", { name: "詳細メモ" });
  expect(within(article).getByRole("heading", { level: 1, name: "本文見出し" })).toBeInTheDocument();
  expect(article.querySelectorAll("br")).toHaveLength(1);
  expect(within(article).getByRole("checkbox")).toBeChecked();
  expect(article.querySelector("script")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "メモ一覧へ戻る" })).toHaveAttribute("href", "/memos");
  expect(screen.getByRole("link", { name: "メモを編集" })).toHaveAttribute(
    "href",
    `/memos/${memoId}/edit`,
  );
  expect(screen.getByRole("button", { name: "お気に入りに追加" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "アーカイブ" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "ゴミ箱に移動" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "完全に削除" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "カテゴリ: 仕事" })).toHaveAttribute(
    "href",
    "/memos?category=category-1",
  );
  expect(screen.getByRole("link", { name: "タグ: 重要" })).toHaveAttribute(
    "href",
    "/memos?tags=tag-1",
  );
});

it("ゴミ箱のメモは読み取り専用にして復元と完全削除を表示する", async () => {
  mockGetMemo.mockResolvedValue({
    status: "success",
    memo: {
      archivedAt: null,
      content: "復元できる本文",
      created_at: "2026-08-09T01:00:00.000Z",
      favoritedAt: null,
      id: memoId,
      revision: 2,
      title: "ゴミ箱のメモ",
      trashedAt: "2026-08-10T01:00:00.000Z",
      updated_at: "2026-08-09T02:00:00.000Z",
    },
  });

  render(await MemoDetailPage({ params: Promise.resolve({ id: memoId }) }));

  expect(screen.getByText("ゴミ箱")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "ゴミ箱へ戻る" })).toHaveAttribute(
    "href",
    "/memos?view=trash",
  );
  expect(screen.queryByRole("link", { name: "メモを編集" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "メモを復元" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "完全に削除" })).toBeInTheDocument();
});

it("不正なIDと所有していないメモは404にする", async () => {
  await expect(
    MemoDetailPage({ params: Promise.resolve({ id: "invalid" }) }),
  ).rejects.toThrow("not-found");
  expect(mockGetMemo).not.toHaveBeenCalled();

  mockGetMemo.mockResolvedValue({ status: "not_found" });
  await expect(
    MemoDetailPage({ params: Promise.resolve({ id: memoId }) }),
  ).rejects.toThrow("not-found");
  expect(mockNotFound).toHaveBeenCalled();
});

it("未認証の場合はサインイン画面へ移動する", async () => {
  mockGetMemo.mockResolvedValue({ status: "unauthenticated" });

  await expect(
    MemoDetailPage({ params: Promise.resolve({ id: memoId }) }),
  ).rejects.toThrow("redirect:/signin");
  expect(mockRedirect).toHaveBeenCalledWith("/signin");
});

it("取得障害時は再試行できるエラーを表示する", async () => {
  mockGetMemo.mockResolvedValue({ status: "error" });

  render(await MemoDetailPage({ params: Promise.resolve({ id: memoId }) }));

  expect(screen.getByRole("alert")).toHaveTextContent("メモを読み込めませんでした");
  expect(screen.getByRole("link", { name: "もう一度試す" })).toHaveAttribute(
    "href",
    `/memos/${memoId}`,
  );
});
