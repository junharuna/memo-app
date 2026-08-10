import {
  isCategoryColor,
  type CategoryColor,
} from "@/lib/memos/organization-validation";
import { createClient } from "@/lib/supabase/server";

export type CategoryRecord = {
  colorKey: CategoryColor;
  id: string;
  memoCount: number;
  name: string;
};

export type TagRecord = {
  id: string;
  memoCount: number;
  name: string;
};

export type OrganizationResult =
  | {
      categories: CategoryRecord[];
      status: "success";
      tags: TagRecord[];
    }
  | { status: "unauthenticated" }
  | { status: "error" };

type CategoryQueryRow = {
  color_key: string;
  id: string;
  memos: Array<{ count: number }> | null;
  name: string;
};

type TagQueryRow = {
  id: string;
  memo_tags: Array<{ count: number }> | null;
  name: string;
};

function readCount(value: Array<{ count: number }> | null) {
  return value?.[0]?.count ?? 0;
}

export async function listOrganizationForCurrentUser(): Promise<OrganizationResult> {
  try {
    const supabase = await createClient();
    const { data, error: claimsError } = await supabase.auth.getClaims();
    const ownerId = data?.claims?.sub;

    if (claimsError || typeof ownerId !== "string" || ownerId.length === 0) {
      if (claimsError) {
        console.error("Organization query authorization failed", claimsError);
      }
      return { status: "unauthenticated" };
    }

    const [categoryResult, tagResult] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, color_key, memos!memos_category_owner_fkey(count)")
        .eq("owner_id", ownerId)
        .order("name", { ascending: true }),
      supabase
        .from("tags")
        .select("id, name, memo_tags(count)")
        .eq("owner_id", ownerId)
        .order("name", { ascending: true }),
    ]);

    if (categoryResult.error || tagResult.error) {
      console.error(
        "Organization query failed",
        categoryResult.error ?? tagResult.error,
      );
      return { status: "error" };
    }

    const categories = (categoryResult.data ?? []).map((rawCategory) => {
      const category = rawCategory as unknown as CategoryQueryRow;
      return {
        colorKey: isCategoryColor(category.color_key)
          ? category.color_key
          : "blue",
        id: category.id,
        memoCount: readCount(category.memos),
        name: category.name,
      };
    });
    const tags = (tagResult.data ?? []).map((rawTag) => {
      const tag = rawTag as unknown as TagQueryRow;
      return {
        id: tag.id,
        memoCount: readCount(tag.memo_tags),
        name: tag.name,
      };
    });

    return { categories, status: "success", tags };
  } catch (error) {
    console.error("Organization query failed", error);
    return { status: "error" };
  }
}
