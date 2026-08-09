/** @jest-environment node */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signOutAction } from "../../app/auth/actions";
import { signOutCurrentUser } from "../../lib/supabase/auth";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

jest.mock("../../lib/supabase/auth", () => ({
  signOutCurrentUser: jest.fn(),
}));

const mockRevalidatePath = jest.mocked(revalidatePath);
const mockRedirect = jest.mocked(redirect);
const mockSignOutCurrentUser = jest.mocked(signOutCurrentUser);
const initialState = { message: "" };

afterEach(() => {
  jest.clearAllMocks();
});

it("サインアウト成功時にセッション依存表示を再検証して通知付きでホームへ戻す", async () => {
  mockSignOutCurrentUser.mockResolvedValue({ status: "success" });

  await expect(signOutAction(initialState)).rejects.toThrow("redirect:/?toast=signed-out");
  expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
  expect(mockRedirect).toHaveBeenCalledWith("/?toast=signed-out");
});

it("サインアウト失敗時は再試行可能なメッセージを返す", async () => {
  mockSignOutCurrentUser.mockResolvedValue({ status: "error" });

  await expect(signOutAction(initialState)).resolves.toEqual({
    message: "サインアウトできませんでした。時間をおいて、もう一度お試しください。",
  });
  expect(mockRevalidatePath).not.toHaveBeenCalled();
  expect(mockRedirect).not.toHaveBeenCalled();
});

it("期限切れセッションからの要求はサインイン画面へ戻す", async () => {
  mockSignOutCurrentUser.mockResolvedValue({ status: "unauthenticated" });

  await expect(signOutAction(initialState)).rejects.toThrow("redirect:/signin");
  expect(mockRedirect).toHaveBeenCalledWith("/signin");
});
