import { render, screen } from "@testing-library/react";
import MemosPage, { dynamic } from "../../app/memos/page";
import { listMemosForCurrentUser } from "../../lib/memos/queries";

const mockRedirect = jest.fn();

jest.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

jest.mock("../../lib/memos/queries", () => ({
  listMemosForCurrentUser: jest.fn(),
}));

const mockListMemos = jest.mocked(listMemosForCurrentUser);

const memos = Array.from({ length: 4 }, (_, index) => ({
  id: `${index + 1}`.repeat(8) + "-1111-4111-8111-111111111111",
  title: `${index + 1}件目のメモ`,
  content: `${index + 1}件目の本文`,
  created_at: `2026-08-0${index + 1}T01:00:00.000Z`,
  updated_at: `2026-08-0${index + 1}T02:00:00.000Z`,
}));

describe("MemosPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("保存済みメモを制限せずすべて表示する", async () => {
    mockListMemos.mockResolvedValue({ status: "success", memos });

    render(await MemosPage());

    expect(screen.getByRole("heading", { level: 1, name: "すべてのメモ" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.getByText("1件目のメモ")).toBeInTheDocument();
    expect(screen.getByText("4件目のメモ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "新しいメモを作成" })).toHaveAttribute(
      "href",
      "/memos/new",
    );
    expect(mockListMemos).toHaveBeenCalledWith();
  });

  it("認証Cookieに応じてリクエストごとに動的表示する", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("認証できない場合はサインインへ移動する", async () => {
    mockListMemos.mockResolvedValue({ status: "unauthenticated" });

    await MemosPage();

    expect(mockRedirect).toHaveBeenCalledWith("/signin");
  });
});
