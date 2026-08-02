const SUPABASE_URL = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_PUBLISHABLE_KEY = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

function requireEnv(name: string, value: string | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return normalizedValue;
}

function requireHttpUrl(name: string, value: string) {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }

    return value;
  } catch {
    throw new Error(`${name} must be a valid HTTP(S) URL`);
  }
}

export function getSupabaseEnv() {
  const url = requireEnv(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = requireEnv(
    SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  return {
    url: requireHttpUrl(SUPABASE_URL, url),
    publishableKey,
  };
}
