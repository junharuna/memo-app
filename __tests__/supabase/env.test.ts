import { getSupabaseEnv } from "@/lib/supabase/env";

const SUPABASE_URL = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_KEY = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

const originalEnv = {
  url: process.env[SUPABASE_URL],
  key: process.env[SUPABASE_KEY],
};

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

afterEach(() => {
  restoreEnv(SUPABASE_URL, originalEnv.url);
  restoreEnv(SUPABASE_KEY, originalEnv.key);
});

describe("getSupabaseEnv", () => {
  it("returns validated Supabase configuration", () => {
    process.env[SUPABASE_URL] = "https://example.supabase.co";
    process.env[SUPABASE_KEY] = "sb_publishable_example";

    expect(getSupabaseEnv()).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_example",
    });
  });

  it.each([SUPABASE_URL, SUPABASE_KEY])(
    "throws when %s is missing",
    (missingName) => {
      process.env[SUPABASE_URL] = "https://example.supabase.co";
      process.env[SUPABASE_KEY] = "sb_publishable_example";
      delete process.env[missingName];

      expect(() => getSupabaseEnv()).toThrow(
        `Missing required environment variable: ${missingName}`,
      );
    },
  );

  it("throws when the Supabase URL is invalid", () => {
    process.env[SUPABASE_URL] = "not-a-url";
    process.env[SUPABASE_KEY] = "sb_publishable_example";

    expect(() => getSupabaseEnv()).toThrow(
      `${SUPABASE_URL} must be a valid HTTP(S) URL`,
    );
  });
});
