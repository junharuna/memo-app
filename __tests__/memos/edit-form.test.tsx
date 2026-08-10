import { fireEvent, render, screen } from "@testing-library/react";
import { MemoEditForm } from "../../app/memos/[id]/edit/memo-edit-form";

jest.mock("../../app/memos/[id]/edit/actions", () => ({
  updateMemoAction: jest.fn(),
}));

const memo = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "編集前タイトル",
  content: "# 編集前本文",
  created_at: "2026-08-09T01:00:00.000Z",
  updated_at: "2026-08-09T02:00:00.000Z",
  category: { colorKey: "orange" as const, id: "category-1", name: "個人" },
  tags: [{ id: "tag-1", name: "重要" }],
};

it("保存済みのタイトル、本文、カテゴリ、タグを初期表示して編集できる", () => {
  render(
    <MemoEditForm
      categories={[
        { colorKey: "orange", id: "category-1", memoCount: 1, name: "個人" },
      ]}
      memo={memo}
      tags={[{ id: "tag-1", memoCount: 1, name: "重要" }]}
    />,
  );

  expect(screen.getByRole("textbox", { name: "タイトル" })).toHaveValue(
    "編集前タイトル",
  );
  expect(screen.getByRole("textbox", { name: "本文" })).toHaveValue(
    "# 編集前本文",
  );
  expect(
    screen.getByRole("heading", { level: 1, name: "編集前本文" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "変更を保存" })).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "カテゴリ" })).toHaveValue(
    "category-1",
  );
  expect(screen.getByRole("checkbox", { name: "#重要" })).toBeChecked();

  fireEvent.change(screen.getByRole("textbox", { name: "本文" }), {
    target: { value: "## 編集後本文\n次の行" },
  });

  expect(
    screen.getByRole("heading", { level: 2, name: "編集後本文" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Markdownプレビュー" })).toHaveTextContent(
    "次の行",
  );
});
