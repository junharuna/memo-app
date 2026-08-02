import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const mockCreateServerClient = jest.mocked(createServerClient);
const mockCookies = jest.mocked(cookies);

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_example";
});

afterEach(() => {
  jest.clearAllMocks();
});

it("adapts the Next.js cookie store for the server client", async () => {
  const expectedClient = {};
  const cookieStore = {
    getAll: jest.fn(() => [{ name: "session", value: "current" }]),
    set: jest.fn(),
  };
  mockCookies.mockResolvedValue(cookieStore as never);
  mockCreateServerClient.mockReturnValue(expectedClient as never);

  await expect(createClient()).resolves.toBe(expectedClient);

  const options = mockCreateServerClient.mock.calls[0][2];
  expect(options.cookies.getAll()).toEqual([
    { name: "session", value: "current" },
  ]);

  options.cookies.setAll?.(
    [{ name: "session", value: "updated", options: { path: "/" } }],
    {},
  );
  expect(cookieStore.set).toHaveBeenCalledWith("session", "updated", {
    path: "/",
  });
});
