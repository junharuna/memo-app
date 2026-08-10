import { render, screen, within } from "@testing-library/react";
import { CategoryManager } from "@/components/memos/category-manager";

jest.mock("../../app/categories/actions", () => ({
  createCategoryAction: jest.fn(),
  deleteCategoryAction: jest.fn(),
  updateCategoryAction: jest.fn(),
}));

jest.mock("../../components/memos/organization-delete-button", () => ({
  OrganizationDeleteButton: () => <button type="button">削除</button>,
}));

it("カテゴリ作成時に名称と色見本付きの10色から選択できる", () => {
  render(<CategoryManager categories={[]} />);

  const createForm = screen.getByRole("form", { name: "カテゴリを作成" });
  const colorChoices = within(createForm).getAllByRole("radio");

  expect(colorChoices).toHaveLength(10);
  expect(within(createForm).getByRole("radio", { name: "ブルー" })).toBeChecked();
  expect(within(createForm).getByRole("radio", { name: "シアン" })).toBeInTheDocument();
  expect(within(createForm).getByRole("radio", { name: "バイオレット" })).toBeInTheDocument();
  expect(within(createForm).getByTestId("category-color-swatch-cyan")).toHaveStyle({
    backgroundColor: "#2fb7c4",
  });
});

it("保存済みカテゴリの色を編集欄と件数表示の両方へ反映する", () => {
  render(
    <CategoryManager
      categories={[
        {
          colorKey: "rose",
          id: "11111111-1111-4111-8111-111111111111",
          memoCount: 2,
          name: "読書",
        },
      ]}
    />,
  );

  const editForm = screen.getByRole("form", { name: "読書を編集" });
  expect(within(editForm).getByRole("radio", { name: "ローズ" })).toBeChecked();
  expect(screen.getByTestId("saved-category-color-rose")).toHaveStyle({
    backgroundColor: "#e8788d",
  });
});
