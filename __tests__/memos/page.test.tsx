import { render, screen } from "@testing-library/react";
import { redirect } from "next/navigation";
import NewMemoPage from "../../app/memos/new/page";
import { getAuthState } from "../../lib/supabase/auth";

jest.mock("next/navigation", () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

jest.mock("../../lib/supabase/auth", () => ({
  getAuthState: jest.fn(),
}));

const mockGetAuthState = jest.mocked(getAuthState);
const mockRedirect = jest.mocked(redirect);

afterEach(() => {
  jest.clearAllMocks();
});

it("認証済みユーザーへメモ作成画面を表示する", async () => {
  mockGetAuthState.mockResolvedValue({ isAuthenticated: true });

  render(await NewMemoPage());

  expect(screen.getByRole("heading", { level: 1, name: "新しいメモ" })).toBeInTheDocument();
  expect(screen.getByRole("form", { name: "メモを作成" })).toBeInTheDocument();
  expect(mockRedirect).not.toHaveBeenCalled();
});

it("未認証ユーザーをサインイン画面へ移動する", async () => {
  mockGetAuthState.mockResolvedValue({ isAuthenticated: false });

  await expect(NewMemoPage()).rejects.toThrow("redirect:/signin");
  expect(mockRedirect).toHaveBeenCalledWith("/signin");
});
