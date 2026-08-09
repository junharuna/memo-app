import { createClient } from "./server";

type SignOutResult = {
  status: "error" | "success" | "unauthenticated";
};

function hasSubject(claims: Record<string, unknown> | null | undefined) {
  return typeof claims?.sub === "string" && claims.sub.length > 0;
}

export async function getAuthState() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.getClaims();

    if (error) {
      console.error("Supabase auth state check failed", error);
      return { isAuthenticated: false };
    }

    return { isAuthenticated: hasSubject(data?.claims) };
  } catch (error) {
    console.error("Supabase auth state check failed", error);
    return { isAuthenticated: false };
  }
}

export async function signOutCurrentUser(): Promise<SignOutResult> {
  try {
    const supabase = await createClient();
    const { data, error: claimsError } = await supabase.auth.getClaims();

    if (claimsError) {
      console.error("Supabase sign-out authorization failed", claimsError);
      return { status: "error" };
    }

    if (!hasSubject(data?.claims)) {
      return { status: "unauthenticated" };
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Supabase sign-out failed", error);
      return { status: "error" };
    }

    return { status: "success" };
  } catch (error) {
    console.error("Supabase sign-out failed", error);
    return { status: "error" };
  }
}
