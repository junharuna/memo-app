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
      id: memoId,
      title: "詳細メモ",
      content: "# 本文見出し\n1行目\n2行目\n\n- [x] 完了\n\n<script>alert(1)</script>",
      created_at: "2026-08-09T01:00:00.000Z",
      updated_at: "2026-08-09T02:00:00.000Z",
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
