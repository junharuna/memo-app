import { isValidMemoId } from "@/lib/memos/id";

export const MEMO_SEARCH_MAX_LENGTH = 100;
export const MEMO_SEARCH_MAX_TERMS = 8;
export const MEMOS_PER_PAGE = 24;

export type MemoSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type MemoFilters = {
  categoryId: string | null;
  page: number;
  query: string;
  queryError: string | null;
  searchTerms: string[];
  tagIds: string[];
  uncategorized: boolean;
};

export type MemoFilterHrefInput = Pick<
  MemoFilters,
  "categoryId" | "page" | "query" | "tagIds" | "uncategorized"
>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeQuery(value: string) {
  return value.trim().replace(/\s+/gu, " ");
}

function parsePage(value: string | undefined) {
  if (!value || !/^\d+$/u.test(value)) {
    return 1;
  }

  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

function parseTagIds(value: string | undefined) {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(value.split(",").filter((tagId) => isValidMemoId(tagId))),
  ).sort();
}

export function parseMemoFilters(
  searchParams: MemoSearchParams = {},
): MemoFilters {
  const rawQuery = normalizeQuery(firstValue(searchParams.q) ?? "");
  const category = firstValue(searchParams.category);
  const searchTerms = rawQuery ? rawQuery.split(" ") : [];
  let queryError: string | null = null;

  if (Array.from(rawQuery).length > MEMO_SEARCH_MAX_LENGTH) {
    queryError = "検索キーワードは100文字以内で入力してください。";
  } else if (searchTerms.length > MEMO_SEARCH_MAX_TERMS) {
    queryError = "検索キーワードは8個以内で入力してください。";
  }

  return {
    categoryId:
      category && category !== "none" && isValidMemoId(category)
        ? category
        : null,
    page: parsePage(firstValue(searchParams.page)),
    query: rawQuery,
    queryError,
    searchTerms: queryError ? [] : searchTerms,
    tagIds: parseTagIds(firstValue(searchParams.tags)),
    uncategorized: category === "none",
  };
}

export function buildMemoListHref(input: MemoFilterHrefInput) {
  const entries: Array<[string, string]> = [];
  const query = normalizeQuery(input.query);

  if (query) {
    entries.push(["q", query]);
  }

  if (input.uncategorized) {
    entries.push(["category", "none"]);
  } else if (input.categoryId) {
    entries.push(["category", input.categoryId]);
  }

  const tagIds = Array.from(new Set(input.tagIds)).sort();
  if (tagIds.length > 0) {
    entries.push(["tags", tagIds.join(",")]);
  }

  if (input.page > 1) {
    entries.push(["page", String(input.page)]);
  }

  if (entries.length === 0) {
    return "/memos";
  }

  const queryString = entries
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `/memos?${queryString}`;
}
