import { createMemoExcerpt } from "@/lib/memos/excerpt";

describe("createMemoExcerpt", () => {
  it("Markdownの書式を外し、読みやすい一行の抜粋を返す", () => {
    const markdown = [
      "# 見出し",
      "",
      "**重要**な[リンク](https://example.com)",
      "",
      "- [ ] 確認する",
      "- `コード`を試す",
    ].join("\n");

    expect(createMemoExcerpt(markdown)).toBe(
      "見出し 重要なリンク 確認する コードを試す",
    );
  });

  it("長い本文はカード用の上限で省略する", () => {
    const excerpt = createMemoExcerpt("あ".repeat(241));

    expect(Array.from(excerpt)).toHaveLength(241);
    expect(excerpt.endsWith("…")).toBe(true);
  });

  it("引用、画像、表、コードブロックも装飾なしの本文へ変換する", () => {
    const markdown = [
      "> 引用",
      "![図](https://example.com/image.png)",
      "| 項目 | 値 |",
      "| --- | --- |",
      "| A | B |",
      "```ts",
      "const answer = 42;",
      "```",
    ].join("\n");

    expect(createMemoExcerpt(markdown)).toBe(
      "引用 図 項目 値 A B const answer = 42;",
    );
  });
});
