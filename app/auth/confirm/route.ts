import { NextResponse, type NextRequest } from "next/server";
import { getSafeNextPath } from "@/lib/supabase/auth-redirect";
import { createClient } from "@/lib/supabase/server";

function createRedirect(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.nextUrl.origin), 303);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const nextPath = getSafeNextPath(request.nextUrl.searchParams.get("next"));

  if (tokenHash && type === "email") {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return createRedirect(request, nextPath);
    }
  }

  return createRedirect(request, "/signin?toast=auth-error");
}
