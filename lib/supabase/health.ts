import { getSupabaseEnv } from "./env";

const HEALTH_CHECK_TIMEOUT_MS = 5_000;

export async function checkSupabaseConnection() {
  const { url, publishableKey } = getSupabaseEnv();
  const response = await fetch(new URL("/auth/v1/settings", url), {
    cache: "no-store",
    headers: {
      apikey: publishableKey,
    },
    signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `Supabase health check failed with status ${response.status}`,
    );
  }
}
