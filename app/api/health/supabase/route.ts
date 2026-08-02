import { checkSupabaseConnection } from "@/lib/supabase/health";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

export async function GET() {
  try {
    await checkSupabaseConnection();

    return Response.json(
      { status: "ok" },
      {
        headers: NO_STORE_HEADERS,
      },
    );
  } catch (error) {
    console.error("Supabase health check failed", error);

    return Response.json(
      { status: "error" },
      {
        status: 503,
        headers: NO_STORE_HEADERS,
      },
    );
  }
}
