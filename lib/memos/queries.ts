import type { Json, Tables } from "@/lib/supabase/database.types";
import {
  MEMOS_PER_PAGE,
  parseMemoFilters,
  type MemoFilters,
} from "@/lib/memos/filters";
import {
  isCategoryColor,
  type CategoryColor,
} from "@/lib/memos/organization-validation";
import { createClient } from "@/lib/supabase/server";

export type MemoCategory = {
  colorKey: CategoryColor;
  id: string;
  name: string;
};

export type MemoTag = {
  id: string;
  name: string;
};

type MemoBaseRecord = Pick<
  Tables<"memos">,
  "content" | "created_at" | "id" | "title" | "updated_at"
>;

export type MemoRecord = MemoBaseRecord & {
  archivedAt: string | null;
  category?: MemoCategory | null;
  favoritedAt: string | null;
  revision: number;
  tags?: MemoTag[];
  trashedAt: string | null;
};

export type MemoListResult =
  | { status: "success"; memos: MemoRecord[]; totalCount?: number }
  | { status: "unauthenticated" }
  | { status: "error" };

type MemoListOptions = {
  filters?: MemoFilters;
  limit?: number;
};

export type MemoDetailResult =
  | { status: "success"; memo: MemoRecord }
  | { status: "not_found" }
  | { status: "unauthenticated" }
  | { status: "error" };

type DetailQueryRow = MemoBaseRecord & {
  archived_at: string | null;
  category: {
    color_key: string;
    id: string;
    name: string;
  } | null;
  memo_tags: Array<{
    tag: { id: string; name: string } | null;
  }> | null;
  favorited_at: string | null;
  revision: number;
  trashed_at: string | null;
};

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

function readTags(value: Json): MemoTag[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((tag) => {
    if (
      typeof tag === "object" &&
      tag !== null &&
      !Array.isArray(tag) &&
      typeof tag.id === "string" &&
      typeof tag.name === "string"
    ) {
      return [{ id: tag.id, name: tag.name }];
    }
    return [];
  });
}

function readCategory(
  id: string | null,
  name: string | null,
  colorKey: string | null,
): MemoCategory | null {
  if (!id || !name || !colorKey || !isCategoryColor(colorKey)) {
    return null;
  }
  return { colorKey, id, name };
}

export async function listMemosForCurrentUser(
  options: MemoListOptions = {},
): Promise<MemoListResult> {
  try {
    const authorization = await getAuthorizedClient();
    if (!authorization) return { status: "unauthenticated" };

    const filters = options.filters ?? parseMemoFilters();
    const limit = Math.min(
      Math.max(options.limit ?? MEMOS_PER_PAGE, 1),
      MEMOS_PER_PAGE,
    );
    const offset = options.limit ? 0 : (filters.page - 1) * MEMOS_PER_PAGE;
    const { data, error } = await authorization.supabase.rpc("search_memos_v2", {
      category_filter: filters.categoryId ?? undefined,
      include_uncategorized: filters.uncategorized,
      memo_view: filters.view,
      result_limit: limit,
      result_offset: offset,
      search_terms: filters.searchTerms,
      sort_key: filters.sort,
      tag_filters: filters.tagIds,
    });

    if (error) {
      console.error("Memo list query failed", error);
      return { status: "error" };
    }

    const rows = data ?? [];
    const memos: MemoRecord[] = rows.map((row) => ({
      archivedAt: row.archived_at,
      category: readCategory(
        row.category_id,
        row.category_name,
        row.category_color_key,
      ),
      content: row.content,
      created_at: row.created_at,
      favoritedAt: row.favorited_at,
      id: row.id,
      revision: row.revision,
      tags: readTags(row.tags),
      title: row.title,
      trashedAt: row.trashed_at,
      updated_at: row.updated_at,
    }));

    return {
      memos,
      status: "success",
      totalCount: rows[0]?.total_count ?? 0,
    };
  } catch (error) {
    console.error("Memo list query failed", error);
    return { status: "error" };
  }
}

export async function getMemoForCurrentUser(id: string): Promise<MemoDetailResult> {
  try {
    const authorization = await getAuthorizedClient();
    if (!authorization) return { status: "unauthenticated" };

    const { data, error } = await authorization.supabase
      .from("memos")
      .select(
        "id, title, content, created_at, updated_at, archived_at, favorited_at, trashed_at, revision, category:categories!memos_category_owner_fkey(id, name, color_key), memo_tags(tag:tags!memo_tags_tag_owner_fkey(id, name))",
      )
      .eq("owner_id", authorization.ownerId)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Memo detail query failed", error);
      return { status: "error" };
    }
    if (!data) return { status: "not_found" };

    const row = data as unknown as DetailQueryRow;
    const category = row.category
      ? readCategory(row.category.id, row.category.name, row.category.color_key)
      : null;
    const tags = (row.memo_tags ?? []).flatMap(({ tag }) =>
      tag ? [{ id: tag.id, name: tag.name }] : [],
    );

    return {
      memo: {
        archivedAt: row.archived_at,
        category,
        content: row.content,
        created_at: row.created_at,
        favoritedAt: row.favorited_at,
        id: row.id,
        revision: row.revision,
        tags,
        title: row.title,
        trashedAt: row.trashed_at,
        updated_at: row.updated_at,
      },
      status: "success",
    };
  } catch (error) {
    console.error("Memo detail query failed", error);
    return { status: "error" };
  }
}
