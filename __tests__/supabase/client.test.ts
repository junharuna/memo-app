import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/client";

jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(),
}));

const mockCreateBrowserClient = jest.mocked(createBrowserClient);

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_example";
});

afterEach(() => {
  jest.clearAllMocks();
});

it("creates a browser client with the public configuration", () => {
  const expectedClient = {};
  mockCreateBrowserClient.mockReturnValue(expectedClient as never);

  expect(createClient()).toBe(expectedClient);
  expect(mockCreateBrowserClient).toHaveBeenCalledWith(
    "https://example.supabase.co",
    "sb_publishable_example",
  );
});
