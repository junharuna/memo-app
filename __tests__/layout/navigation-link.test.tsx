import { render, screen } from "@testing-library/react";
import { NavigationLink } from "@/components/layout/navigation-link";

let currentPathname = "/memos";
let currentSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
  useSearchParams: () => currentSearchParams,
}));

afterEach(() => {
  currentPathname = "/memos";
  currentSearchParams = new URLSearchParams();
});

it("クエリのないメモ一覧だけをアクティブとして示す", () => {
  render(
    <NavigationLink
      activePath="/memos"
      activeView="active"
      href="/memos"
      icon="inbox"
      label="すべてのメモ"
      variant="desktop"
    />,
  );

  expect(screen.getByRole("link", { name: "すべてのメモ" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

it("URLのviewに一致するナビゲーションだけをアクティブとして示す", () => {
  currentSearchParams = new URLSearchParams("view=favorites");

  render(
    <>
      <NavigationLink
        activePath="/memos"
        activeView="active"
        href="/memos"
        icon="inbox"
        label="すべてのメモ"
        variant="desktop"
      />
      <NavigationLink
        activePath="/memos"
        activeView="favorites"
        href="/memos?view=favorites"
        icon="star"
        label="お気に入り"
        variant="desktop"
      />
    </>,
  );

  expect(screen.getByRole("link", { name: "すべてのメモ" })).not.toHaveAttribute(
    "aria-current",
  );
  expect(screen.getByRole("link", { name: "お気に入り" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});
