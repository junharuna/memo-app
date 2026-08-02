import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

jest.mock("next/server", () => {
  class CookieStore {
    private values = new Map<string, string>();

    get(name: string) {
      const value = this.values.get(name);
      return value === undefined ? undefined : { name, value };
    }

    getAll() {
      return Array.from(this.values, ([name, value]) => ({ name, value }));
    }

    set(name: string, value: string) {
      this.values.set(name, value);
    }
  }

  class HeaderStore {
    private values = new Map<string, string>();

    get(name: string) {
      return this.values.get(name) ?? null;
    }

    set(name: string, value: string) {
      this.values.set(name, value);
    }
  }

  class MockNextRequest {
    cookies = new CookieStore();

    constructor(public url: string) {}
  }

  class MockNextResponse {
    cookies = new CookieStore();
    headers = new HeaderStore();

    static next() {
      return new MockNextResponse();
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  };
});

const mockCreateServerClient = jest.mocked(createServerClient);

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_example";
});

afterEach(() => {
  jest.clearAllMocks();
});

it("refreshes claims and forwards auth cookies and cache headers", async () => {
  mockCreateServerClient.mockImplementation((_url, _key, options) => ({
    auth: {
      getClaims: async () => {
        options.cookies.setAll?.(
          [{ name: "sb-token", value: "refreshed", options: { path: "/" } }],
          { "Cache-Control": "private, no-store" },
        );
        return { data: { claims: null }, error: null };
      },
    },
  }) as never);

  const response = await updateSession(
    new NextRequest("https://example.com/memos"),
  );

  expect(response.cookies.get("sb-token")?.value).toBe("refreshed");
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
});
