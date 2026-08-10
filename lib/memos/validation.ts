import type { MemoFormState } from "@/lib/memos/form-state";
import { isValidMemoId } from "@/lib/memos/id";

export const MEMO_TITLE_MAX_LENGTH = 200;
export const MEMO_CONTENT_MAX_LENGTH = 100_000;

function readTextField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function characterCount(value: string) {
  return Array.from(value).length;
}

export function readAndValidateMemo(formData: FormData) {
  const title = readTextField(formData, "title").trim();
  const content = readTextField(formData, "content");
  const rawCategoryId = readTextField(formData, "categoryId");
  const categoryId = rawCategoryId || null;
  const rawTagIds = formData
    .getAll("tagIds")
    .filter((value): value is string => typeof value === "string");
  const tagIds = Array.from(new Set(rawTagIds));
  const fieldErrors: MemoFormState["fieldErrors"] = {};

  if (!title) {
    fieldErrors.title = "タイトルを入力してください。";
  } else if (characterCount(title) > MEMO_TITLE_MAX_LENGTH) {
    fieldErrors.title = "タイトルは200文字以内で入力してください。";
  }

  if (characterCount(content) > MEMO_CONTENT_MAX_LENGTH) {
    fieldErrors.content = "本文は100,000文字以内で入力してください。";
  }

  if (categoryId && !isValidMemoId(categoryId)) {
    fieldErrors.categoryId = "カテゴリを選び直してください。";
  }

  if (tagIds.some((tagId) => !isValidMemoId(tagId))) {
    fieldErrors.tagIds = "タグを選び直してください。";
  }

  return { categoryId, content, fieldErrors, tagIds, title };
}
