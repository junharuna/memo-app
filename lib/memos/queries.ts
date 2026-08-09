import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type MemoRecord = Pick<
  Tables<"memos">,
  "content" | "created_at" | "id" | "title" | "updated_at"
>;

export type MemoListResult =
  | { status: "success"; memos: MemoRecord[] }
  | { status: "unauthenticated" }
  | { status: "error" };

export type MemoDetailResult =
  | { status: "success"; memo: MemoRecord }
  | { status: "not_found" }
  | { status: "unauthenticated" }
  | { status: "error" };

const MEMO_COLUMNS = "id, title, content, created_at, updated_at";

async function getAuthorizedClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const ownerId = data?.claims?.sub;

  if (error || typeof ownerId !== "string" || ownerId.length === 0) {
    if (error) {
      console.error("Memo query authorization failed", error);
    }

    return null;
  }

  return { ownerId, supabase };
}

export async function listMemosForCurrentUser(): Promise<MemoListResult> {
  try {
    const authorization = await getAuthorizedClient();

    if (!authorization) {
      return { status: "unauthenticated" };
    }

    const { data, error } = await authorization.supabase
      .from("memos")
      .select(MEMO_COLUMNS)
      .eq("owner_id", authorization.ownerId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Memo list query failed", error);
      return { status: "error" };
    }

    return { status: "success", memos: data ?? [] };
  } catch (error) {
    console.error("Memo list query failed", error);
    return { status: "error" };
  }
}

export async function getMemoForCurrentUser(id: string): Promise<MemoDetailResult> {
  try {
    const authorization = await getAuthorizedClient();

    if (!authorization) {
      return { status: "unauthenticated" };
    }

    const { data, error } = await authorization.supabase
      .from("memos")
      .select(MEMO_COLUMNS)
      .eq("owner_id", authorization.ownerId)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Memo detail query failed", error);
      return { status: "error" };
    }

    if (!data) {
      return { status: "not_found" };
    }

    return { status: "success", memo: data };
  } catch (error) {
    console.error("Memo detail query failed", error);
    return { status: "error" };
  }
}
