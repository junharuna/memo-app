import { isValidMemoId } from "@/lib/memos/id";
import {
  defaultSortForView,
  isMemoSort,
  isMemoView,
  type MemoSort,
  type MemoView,
} from "@/lib/memos/lifecycle";

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
  sort: MemoSort;
  tagIds: string[];
  uncategorized: boolean;
  view: MemoView;
};

export type MemoFilterHrefInput = Pick<
  MemoFilters,
  | "categoryId"
  | "page"
  | "query"
  | "sort"
  | "tagIds"
  | "uncategorized"
  | "view"
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
  const rawView = firstValue(searchParams.view) ?? "";
  const view = isMemoView(rawView) ? rawView : "active";
  const rawSort = firstValue(searchParams.sort) ?? "";
  const requestedSort = isMemoSort(rawSort) ? rawSort : defaultSortForView(view);
  const sort =
    view === "trash"
      ? "trashed_desc"
      : view === "archive"
        ? "archived_desc"
        : requestedSort === "archived_desc" || requestedSort === "trashed_desc"
          ? defaultSortForView(view)
          : requestedSort;
  const searchTerms = rawQuery ? rawQuery.split(" ") : [];
  let queryError: string | null = null;

  if (Array.from(rawQuery).length > MEMO_SEARCH_MAX_LENGTH) {
    queryError = "検索キーワードは100文字以内で入力してください。";
  } else if (searchTerms.length > MEMO_SEARCH_MAX_TERMS) {
    queryError = "検索キーワードは8個以内で入力してください。";
  }

  return {
    categoryId:
      view !== "trash" &&
      category &&
      category !== "none" &&
      isValidMemoId(category)
        ? category
        : null,
    page: parsePage(firstValue(searchParams.page)),
    query: rawQuery,
    queryError,
    searchTerms: queryError ? [] : searchTerms,
    sort,
    tagIds:
      view === "trash" ? [] : parseTagIds(firstValue(searchParams.tags)),
    uncategorized: view !== "trash" && category === "none",
    view,
  };
}

export function buildMemoListHref(input: MemoFilterHrefInput) {
  const entries: Array<[string, string]> = [];
  const query = normalizeQuery(input.query);

  if (input.view !== "active") {
    entries.push(["view", input.view]);
  }

  if (query) {
    entries.push(["q", query]);
  }

  if (input.view !== "trash") {
    if (input.uncategorized) {
      entries.push(["category", "none"]);
    } else if (input.categoryId) {
      entries.push(["category", input.categoryId]);
    }

    const tagIds = Array.from(new Set(input.tagIds)).sort();
    if (tagIds.length > 0) {
      entries.push(["tags", tagIds.join(",")]);
    }
  }

  if (input.sort !== defaultSortForView(input.view)) {
    entries.push(["sort", input.sort]);
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
