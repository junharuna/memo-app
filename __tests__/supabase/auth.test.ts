import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getAuthState, signOutCurrentUser } from "@/lib/supabase/auth";

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const mockCreateServerClient = jest.mocked(createServerClient);
const mockCookies = jest.mocked(cookies);
const mockGetClaims = jest.fn();
const mockSignOut = jest.fn();

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_example";
  mockCookies.mockResolvedValue({ getAll: jest.fn(() => []), set: jest.fn() } as never);
  mockCreateServerClient.mockReturnValue({
    auth: {
      getClaims: mockGetClaims,
      signOut: mockSignOut,
    },
  } as never);
});

afterEach(() => {
  jest.clearAllMocks();
});

it("検証済みclaimsがある場合は認証済みと判定する", async () => {
  mockGetClaims.mockResolvedValue({ data: { claims: { sub: "user-id" } }, error: null });

  await expect(getAuthState()).resolves.toEqual({ isAuthenticated: true });
});

it("claimsの検証に失敗した場合は匿名状態へ安全にフォールバックする", async () => {
  const error = new Error("auth unavailable");
  mockGetClaims.mockResolvedValue({ data: null, error });
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);

  await expect(getAuthState()).resolves.toEqual({ isAuthenticated: false });
  expect(consoleError).toHaveBeenCalledWith("Supabase auth state check failed", error);
});

it("認証済みユーザーのセッションを終了する", async () => {
  mockGetClaims.mockResolvedValue({ data: { claims: { sub: "user-id" } }, error: null });
  mockSignOut.mockResolvedValue({ error: null });

  await expect(signOutCurrentUser()).resolves.toEqual({ status: "success" });
  expect(mockSignOut).toHaveBeenCalledTimes(1);
});

it("未認証のサインアウト要求はSupabaseへ送信しない", async () => {
  mockGetClaims.mockResolvedValue({ data: { claims: null }, error: null });

  await expect(signOutCurrentUser()).resolves.toEqual({ status: "unauthenticated" });
  expect(mockSignOut).not.toHaveBeenCalled();
});

it("サインアウト失敗を呼び出し側へ返す", async () => {
  mockGetClaims.mockResolvedValue({ data: { claims: { sub: "user-id" } }, error: null });
  mockSignOut.mockResolvedValue({ error: new Error("sign out failed") });

  await expect(signOutCurrentUser()).resolves.toEqual({ status: "error" });
});
