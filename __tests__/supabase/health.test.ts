/** @jest-environment node */

import { getSupabaseEnv } from "../../lib/supabase/env";
import { checkSupabaseConnection } from "../../lib/supabase/health";

jest.mock("../../lib/supabase/env", () => ({
  getSupabaseEnv: jest.fn(),
}));

const mockGetSupabaseEnv = jest.mocked(getSupabaseEnv);
const mockFetch = jest.fn();

beforeEach(() => {
  mockGetSupabaseEnv.mockReturnValue({
    url: "https://example.supabase.co",
    publishableKey: "sb_publishable_example",
  });
  global.fetch = mockFetch;
});

afterEach(() => {
  jest.clearAllMocks();
});

it("checks the Supabase Auth settings endpoint", async () => {
  mockFetch.mockResolvedValue({ ok: true });

  await expect(checkSupabaseConnection()).resolves.toBeUndefined();
  expect(mockFetch).toHaveBeenCalledWith(
    new URL("https://example.supabase.co/auth/v1/settings"),
    {
      cache: "no-store",
      headers: { apikey: "sb_publishable_example" },
      signal: expect.any(AbortSignal),
    },
  );
});

it("throws a status-only error for an unsuccessful response", async () => {
  mockFetch.mockResolvedValue({ ok: false, status: 502 });

  await expect(checkSupabaseConnection()).rejects.toThrow(
    "Supabase health check failed with status 502",
  );
});
