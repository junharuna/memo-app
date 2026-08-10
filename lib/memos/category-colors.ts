export const CATEGORY_COLOR_OPTIONS = [
  { key: "blue", label: "ブルー", tint: "rgba(94, 139, 255, 0.12)", value: "#5e8bff" },
  { key: "sky", label: "スカイ", tint: "rgba(76, 165, 224, 0.12)", value: "#4ca5e0" },
  { key: "cyan", label: "シアン", tint: "rgba(47, 183, 196, 0.12)", value: "#2fb7c4" },
  { key: "teal", label: "ティール", tint: "rgba(42, 168, 137, 0.12)", value: "#2aa889" },
  { key: "lime", label: "ライム", tint: "rgba(134, 168, 63, 0.12)", value: "#86a83f" },
  { key: "yellow", label: "イエロー", tint: "rgba(213, 165, 42, 0.12)", value: "#d5a52a" },
  { key: "orange", label: "オレンジ", tint: "rgba(255, 159, 86, 0.13)", value: "#ff9f56" },
  { key: "rose", label: "ローズ", tint: "rgba(232, 120, 141, 0.12)", value: "#e8788d" },
  { key: "pink", label: "ピンク", tint: "rgba(217, 115, 197, 0.12)", value: "#d973c5" },
  { key: "violet", label: "バイオレット", tint: "rgba(166, 124, 247, 0.12)", value: "#a67cf7" },
] as const;

export type CategoryColor = (typeof CATEGORY_COLOR_OPTIONS)[number]["key"];

export const CATEGORY_COLORS: readonly CategoryColor[] =
  CATEGORY_COLOR_OPTIONS.map(({ key }) => key);

export function isCategoryColor(value: string): value is CategoryColor {
  return CATEGORY_COLORS.some((color) => color === value);
}

export function getCategoryColorPresentation(colorKey: CategoryColor) {
  return (
    CATEGORY_COLOR_OPTIONS.find(({ key }) => key === colorKey) ??
    CATEGORY_COLOR_OPTIONS[0]
  );
}
