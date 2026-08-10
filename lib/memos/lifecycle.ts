export const MEMO_VIEWS = ["active", "favorites", "archive", "trash"] as const;
export const MEMO_SORTS = [
  "updated_desc",
  "created_desc",
  "title_asc",
  "favorited_desc",
  "archived_desc",
  "trashed_desc",
] as const;

export type MemoView = (typeof MEMO_VIEWS)[number];
export type MemoSort = (typeof MEMO_SORTS)[number];
export type MemoLifecycle = "active" | "archived" | "trashed";

export type MemoLifecycleInput = {
  archivedAt: string | null;
  trashedAt: string | null;
};

export function isMemoView(value: string): value is MemoView {
  return MEMO_VIEWS.some((view) => view === value);
}

export function isMemoSort(value: string): value is MemoSort {
  return MEMO_SORTS.some((sort) => sort === value);
}

export function defaultSortForView(view: MemoView): MemoSort {
  if (view === "favorites") return "favorited_desc";
  if (view === "archive") return "archived_desc";
  if (view === "trash") return "trashed_desc";
  return "updated_desc";
}

export function getMemoLifecycle({
  archivedAt,
  trashedAt,
}: MemoLifecycleInput): MemoLifecycle {
  if (trashedAt) return "trashed";
  if (archivedAt) return "archived";
  return "active";
}

export function isMemoEditable(input: MemoLifecycleInput) {
  return getMemoLifecycle(input) !== "trashed";
}
