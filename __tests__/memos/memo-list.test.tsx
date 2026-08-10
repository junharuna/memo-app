import { render, screen } from "@testing-library/react";
import { MemoList } from "../../components/memos/memo-list";

it("カードへカテゴリと最大2タグを表示し、Markdown本文はレンダリングしない", () => {
  render(
    <MemoList
      result={{
        memos: [
          {
            category: { colorKey: "cyan", id: "category-1", name: "アイデア" },
            content: "# 見出し\n\n**本文**",
            created_at: "2026-08-09T01:00:00.000Z",
            id: "11111111-1111-4111-8111-111111111111",
            tags: [
              { id: "tag-1", name: "重要" },
              { id: "tag-2", name: "企画" },
              { id: "tag-3", name: "後で" },
            ],
            title: "分類済みメモ",
            updated_at: "2026-08-09T02:00:00.000Z",
          },
        ],
        status: "success",
      }}
      retryHref="/memos"
    />,
  );

  expect(screen.getByText("#重要")).toBeInTheDocument();
  expect(screen.getByText("#企画")).toBeInTheDocument();
  expect(screen.getByText("+1")).toBeInTheDocument();
  expect(screen.getByText("アイデア")).toBeInTheDocument();
  expect(screen.getByTestId("memo-category-color-cyan")).toHaveStyle({
    backgroundColor: "#2fb7c4",
  });
  expect(screen.queryByText("#後で")).not.toBeInTheDocument();
  expect(document.querySelector("article h1")).not.toBeInTheDocument();
  expect(document.querySelector("article strong")).not.toBeInTheDocument();
});
