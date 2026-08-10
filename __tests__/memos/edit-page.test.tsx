import { render, screen } from "@testing-library/react";
import { notFound, redirect } from "next/navigation";
import MemoEditPage from "../../app/memos/[id]/edit/page";
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

jest.mock("../../app/memos/[id]/edit/memo-edit-form", () => ({
  MemoEditForm: ({ memo }: { memo: { title: string } }) => (
    <div>編集フォーム: {memo.title}</div>
  ),
}));

const memoId = "11111111-1111-4111-8111-111111111111";
const mockGetMemo = jest.mocked(getMemoForCurrentUser);
const mockNotFound = jest.mocked(notFound);
const mockRedirect = jest.mocked(redirect);

afterEach(() => {
  jest.clearAllMocks();
});

it("所有するメモを編集フォームへ渡す", async () => {
  mockGetMemo.mockResolvedValue({
    status: "success",
    memo: {
      id: memoId,
      title: "編集対象",
      content: "本文",
      created_at: "2026-08-09T01:00:00.000Z",
      updated_at: "2026-08-09T02:00:00.000Z",
    },
  });

  render(await MemoEditPage({ params: Promise.resolve({ id: memoId }) }));

  expect(screen.getByRole("heading", { level: 1, name: "メモを編集" })).toBeInTheDocument();
  expect(screen.getByText("編集フォーム: 編集対象")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "編集をキャンセル" })).toHaveAttribute(
    "href",
    `/memos/${memoId}`,
  );
});

it("不正なIDと所有していないメモは404にする", async () => {
  await expect(
    MemoEditPage({ params: Promise.resolve({ id: "invalid" }) }),
  ).rejects.toThrow("not-found");
  expect(mockGetMemo).not.toHaveBeenCalled();

  mockGetMemo.mockResolvedValue({ status: "not_found" });
  await expect(
    MemoEditPage({ params: Promise.resolve({ id: memoId }) }),
  ).rejects.toThrow("not-found");
  expect(mockNotFound).toHaveBeenCalled();
});

it("未認証の場合はサインインへ移動する", async () => {
  mockGetMemo.mockResolvedValue({ status: "unauthenticated" });

  await expect(
    MemoEditPage({ params: Promise.resolve({ id: memoId }) }),
  ).rejects.toThrow("redirect:/signin");
  expect(mockRedirect).toHaveBeenCalledWith("/signin");
});
