/** @jest-environment node */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { GET } from "@/app/auth/confirm/route";

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const mockCreateServerClient = jest.mocked(createServerClient);
const mockCookies = jest.mocked(cookies);
const mockVerifyOtp = jest.fn();

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_example";
  mockCookies.mockResolvedValue({ getAll: jest.fn(() => []), set: jest.fn() } as never);
  mockCreateServerClient.mockReturnValue({
    auth: { verifyOtp: mockVerifyOtp },
  } as never);
});

afterEach(() => {
  jest.clearAllMocks();
});

it("メールのTokenHashを検証してセッションを作成する", async () => {
  mockVerifyOtp.mockResolvedValue({ error: null });

  const response = await GET(
    new NextRequest(
      "https://tagnote.example/auth/confirm?token_hash=valid-hash&type=email&next=%2F%3Ftoast%3Dsigned-in",
    ),
  );

  expect(mockVerifyOtp).toHaveBeenCalledWith({
    token_hash: "valid-hash",
    type: "email",
  });
  expect(response.headers.get("location")).toBe("https://tagnote.example/?toast=signed-in");
});

it("不正な認証種別は検証せずエラー通知へ戻す", async () => {
  const response = await GET(
    new NextRequest(
      "https://tagnote.example/auth/confirm?token_hash=valid-hash&type=recovery",
    ),
  );

  expect(mockVerifyOtp).not.toHaveBeenCalled();
  expect(response.headers.get("location")).toBe(
    "https://tagnote.example/signin?toast=auth-error",
  );
});

it("外部URLへのリダイレクトを拒否する", async () => {
  mockVerifyOtp.mockResolvedValue({ error: null });

  const response = await GET(
    new NextRequest(
      "https://tagnote.example/auth/confirm?token_hash=valid-hash&type=email&next=https://evil.example",
    ),
  );

  expect(response.headers.get("location")).toBe("https://tagnote.example/");
});
