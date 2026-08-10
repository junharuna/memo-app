import { render, screen } from "@testing-library/react";
import TagsPage from "../../app/tags/page";
import { listOrganizationForCurrentUser } from "../../lib/memos/organization-queries";

jest.mock("next/navigation", () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));
jest.mock("../../lib/memos/organization-queries", () => ({
  listOrganizationForCurrentUser: jest.fn(),
}));
jest.mock("../../components/memos/tag-manager", () => ({
  TagManager: ({ tags }: { tags: Array<{ name: string; memoCount: number }> }) => (
    <div>
      <form aria-label="タグを作成"><button>タグを作成</button></form>
      {tags.map((tag) => <article key={tag.name}>#{tag.name} {tag.memoCount}件のメモ</article>)}
    </div>
  ),
}));

const mockListOrganization = jest.mocked(listOrganizationForCurrentUser);

afterEach(() => jest.clearAllMocks());

it("タグと関連メモ件数を管理できる", async () => {
  mockListOrganization.mockResolvedValue({
    categories: [],
    status: "success",
    tags: [{ id: "tag-1", memoCount: 3, name: "重要" }],
  });

  render(await TagsPage());

  expect(screen.getByRole("heading", { level: 1, name: "タグ" })).toBeInTheDocument();
  expect(screen.getByRole("form", { name: "タグを作成" })).toBeInTheDocument();
  expect(screen.getByRole("article")).toHaveTextContent("#重要 3件のメモ");
});
