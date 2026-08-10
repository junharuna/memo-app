import { render, screen } from "@testing-library/react";
import CategoriesPage from "../../app/categories/page";
import { listOrganizationForCurrentUser } from "../../lib/memos/organization-queries";

jest.mock("next/navigation", () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));
jest.mock("../../lib/memos/organization-queries", () => ({
  listOrganizationForCurrentUser: jest.fn(),
}));
jest.mock("../../components/memos/category-manager", () => ({
  CategoryManager: ({ categories }: { categories: Array<{ name: string; memoCount: number }> }) => (
    <div>
      <form aria-label="カテゴリを作成"><button>カテゴリを作成</button></form>
      {categories.map((category) => (
        <article key={category.name}>{category.name} {category.memoCount}件のメモ</article>
      ))}
    </div>
  ),
}));

const mockListOrganization = jest.mocked(listOrganizationForCurrentUser);

afterEach(() => jest.clearAllMocks());

it("カテゴリと関連メモ件数を管理できる", async () => {
  mockListOrganization.mockResolvedValue({
    categories: [{ colorKey: "blue", id: "category-1", memoCount: 2, name: "仕事" }],
    status: "success",
    tags: [],
  });

  render(await CategoriesPage());

  expect(screen.getByRole("heading", { level: 1, name: "カテゴリ" })).toBeInTheDocument();
  expect(screen.getByRole("form", { name: "カテゴリを作成" })).toBeInTheDocument();
  expect(screen.getByRole("article")).toHaveTextContent("仕事 2件のメモ");
});

it("取得失敗時は再試行導線を表示する", async () => {
  mockListOrganization.mockResolvedValue({ status: "error" });

  render(await CategoriesPage());

  expect(screen.getByRole("alert")).toHaveTextContent("カテゴリを読み込めませんでした");
  expect(screen.getByRole("link", { name: "もう一度試す" })).toHaveAttribute(
    "href",
    "/categories",
  );
});
