export const CATEGORY_NAME_MAX_LENGTH = 50;
export const TAG_NAME_MAX_LENGTH = 30;
export const CATEGORY_COLORS = ["blue", "orange", "violet"] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

type CategoryFieldErrors = {
  colorKey?: string;
  name?: string;
};

type TagFieldErrors = {
  name?: string;
};

function characterCount(value: string) {
  return Array.from(value).length;
}

export function isCategoryColor(value: string): value is CategoryColor {
  return CATEGORY_COLORS.some((color) => color === value);
}

export function validateCategoryInput(nameInput: string, colorInput: string) {
  const name = nameInput.trim();
  const fieldErrors: CategoryFieldErrors = {};

  if (!name) {
    fieldErrors.name = "カテゴリ名を入力してください。";
  } else if (characterCount(name) > CATEGORY_NAME_MAX_LENGTH) {
    fieldErrors.name = "カテゴリ名は50文字以内で入力してください。";
  }

  if (!isCategoryColor(colorInput)) {
    fieldErrors.colorKey = "カテゴリの色を選択してください。";
  }

  return {
    colorKey: isCategoryColor(colorInput) ? colorInput : null,
    fieldErrors,
    name,
  };
}

export function normalizeTagName(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("#") ? trimmed.slice(1).trimStart() : trimmed;
}

export function validateTagInput(nameInput: string) {
  const name = normalizeTagName(nameInput);
  const fieldErrors: TagFieldErrors = {};

  if (!name) {
    fieldErrors.name = "タグ名を入力してください。";
  } else if (characterCount(name) > TAG_NAME_MAX_LENGTH) {
    fieldErrors.name = "タグ名は30文字以内で入力してください。";
  }

  return { fieldErrors, name };
}
