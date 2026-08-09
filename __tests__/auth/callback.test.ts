/** @jest-environment node */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { GET } from "@/app/auth/callback/route";

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const mockCreateServerClient = jest.mocked(createServerClient);
const mockCookies = jest.mocked(cookies);
const mockExchangeCodeForSession = jest.fn();

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_example";
  mockCookies.mockResolvedValue({ getAll: jest.fn(() => []), set: jest.fn() } as never);
  mockCreateServerClient.mockReturnValue({
    auth: { exchangeCodeForSession: mockExchangeCodeForSession },
  } as never);
});

afterEach(() => {
  jest.clearAllMocks();
});

it("認証コードをセッションへ交換して安全なアプリ内URLへ戻す", async () => {
  mockExchangeCodeForSession.mockResolvedValue({ error: null });

  const response = await GET(
    new NextRequest("https://memora.example/auth/callback?code=valid-code&next=%2F%3Fview%3Dfavorites"),
  );

  expect(mockExchangeCodeForSession).toHaveBeenCalledWith("valid-code");
  expect(response.headers.get("location")).toBe("https://memora.example/?view=favorites");
});

it("外部URLへのリダイレクトを拒否する", async () => {
  mockExchangeCodeForSession.mockResolvedValue({ error: null });

  const response = await GET(
    new NextRequest("https://memora.example/auth/callback?code=valid&next=https://evil.example"),
  );

  expect(response.headers.get("location")).toBe("https://memora.example/");
});

it("認証コードの交換失敗をサインイン画面へ返す", async () => {
  mockExchangeCodeForSession.mockResolvedValue({ error: new Error("invalid code") });

  const response = await GET(
    new NextRequest("https://memora.example/auth/callback?code=invalid&next=https://evil.example"),
  );

  expect(response.headers.get("location")).toBe(
    "https://memora.example/signin?error=callback",
  );
});
