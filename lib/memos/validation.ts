import type { MemoFormState } from "@/lib/memos/form-state";

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
  const fieldErrors: MemoFormState["fieldErrors"] = {};

  if (!title) {
    fieldErrors.title = "タイトルを入力してください。";
  } else if (characterCount(title) > MEMO_TITLE_MAX_LENGTH) {
    fieldErrors.title = "タイトルは200文字以内で入力してください。";
  }

  if (characterCount(content) > MEMO_CONTENT_MAX_LENGTH) {
    fieldErrors.content = "本文は100,000文字以内で入力してください。";
  }

  return { content, fieldErrors, title };
}
