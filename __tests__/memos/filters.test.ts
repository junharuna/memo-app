import {
  buildMemoListHref,
  parseMemoFilters,
} from "@/lib/memos/filters";

const categoryId = "11111111-1111-4111-8111-111111111111";
const tagA = "22222222-2222-4222-8222-222222222222";
const tagB = "33333333-3333-4333-8333-333333333333";

describe("parseMemoFilters", () => {
  it("検索語のUnicode空白を正規化し、複数語をAND条件用に分割する", () => {
    expect(parseMemoFilters({ q: "  日本語\t キーワード　検索  " })).toEqual({
      categoryId: null,
      page: 1,
      query: "日本語 キーワード 検索",
      queryError: null,
      searchTerms: ["日本語", "キーワード", "検索"],
      tagIds: [],
      uncategorized: false,
    });
  });

  it("カテゴリ、未分類、重複を除いたタグ、ページを検証する", () => {
    expect(
      parseMemoFilters({
        category: categoryId,
        page: "3",
        tags: `${tagB},invalid,${tagA},${tagB}`,
      }),
    ).toMatchObject({
      categoryId,
      page: 3,
      tagIds: [tagA, tagB],
      uncategorized: false,
    });

    expect(parseMemoFilters({ category: "none" })).toMatchObject({
      categoryId: null,
      uncategorized: true,
    });
  });

  it("不正なURL値を安全な既定値へ正規化する", () => {
    expect(
      parseMemoFilters({
        category: "invalid",
        page: "-1",
        q: ["最初", "無視する値"],
        tags: [tagA, tagB],
      }),
    ).toEqual({
      categoryId: null,
      page: 1,
      query: "最初",
      queryError: null,
      searchTerms: ["最初"],
      tagIds: [tagA],
      uncategorized: false,
    });
  });

  it("100文字超過と9語以上を入力エラーとして返す", () => {
    expect(parseMemoFilters({ q: "あ".repeat(101) }).queryError).toBe(
      "検索キーワードは100文字以内で入力してください。",
    );
    expect(
      parseMemoFilters({ q: "一 二 三 四 五 六 七 八 九" }).queryError,
    ).toBe("検索キーワードは8個以内で入力してください。");
  });
});

describe("buildMemoListHref", () => {
  it("正規形のURLを作り、1ページ目と空条件を省略する", () => {
    expect(
      buildMemoListHref({
        categoryId,
        page: 2,
        query: "日本語 検索",
        tagIds: [tagB, tagA],
        uncategorized: false,
      }),
    ).toBe(
      `/memos?q=${encodeURIComponent("日本語 検索")}&category=${categoryId}&tags=${tagA}%2C${tagB}&page=2`,
    );

    expect(
      buildMemoListHref({
        categoryId: null,
        page: 1,
        query: "",
        tagIds: [],
        uncategorized: false,
      }),
    ).toBe("/memos");
  });
});
