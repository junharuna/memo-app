import {
  CATEGORY_COLORS,
  normalizeTagName,
  validateCategoryInput,
  validateTagInput,
} from "@/lib/memos/organization-validation";

describe("カテゴリ入力", () => {
  it("名前をtrimしDesign Systemの分類色だけを受け付ける", () => {
    expect(validateCategoryInput("  仕事  ", "blue")).toEqual({
      colorKey: "blue",
      fieldErrors: {},
      name: "仕事",
    });
    expect(CATEGORY_COLORS).toEqual(["blue", "orange", "violet"]);
  });

  it("空、50文字超過、不正な色を拒否する", () => {
    expect(validateCategoryInput(" ", "blue").fieldErrors.name).toBe(
      "カテゴリ名を入力してください。",
    );
    expect(
      validateCategoryInput("あ".repeat(51), "blue").fieldErrors.name,
    ).toBe("カテゴリ名は50文字以内で入力してください。");
    expect(validateCategoryInput("仕事", "green").fieldErrors.colorKey).toBe(
      "カテゴリの色を選択してください。",
    );
  });
});

describe("タグ入力", () => {
  it("表示用の先頭#を除き、C#のような名前は保持する", () => {
    expect(normalizeTagName("  #TypeScript  ")).toBe("TypeScript");
    expect(normalizeTagName(" C# ")).toBe("C#");
    expect(validateTagInput(" #読書 ")).toEqual({
      fieldErrors: {},
      name: "読書",
    });
  });

  it("空と30文字超過を拒否する", () => {
    expect(validateTagInput("#  ").fieldErrors.name).toBe(
      "タグ名を入力してください。",
    );
    expect(validateTagInput("あ".repeat(31)).fieldErrors.name).toBe(
      "タグ名は30文字以内で入力してください。",
    );
  });
});
