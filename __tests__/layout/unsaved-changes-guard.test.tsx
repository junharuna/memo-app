import { fireEvent, render, screen } from "@testing-library/react";
import Link from "next/link";
import { UnsavedChangesGuard } from "@/components/layout/unsaved-changes-guard";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

afterEach(() => {
  jest.clearAllMocks();
});

it("未保存時のリンク移動を止め、確認後だけ安全な内部URLへ移動する", () => {
  render(
    <>
      <Link href="/memos">一覧へ</Link>
      <UnsavedChangesGuard active />
    </>,
  );

  fireEvent.click(screen.getByRole("link", { name: "一覧へ" }));

  expect(mockPush).not.toHaveBeenCalled();
  expect(
    screen.getByRole("dialog", { name: "未保存の変更があります" }),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "編集を続ける" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("link", { name: "一覧へ" }));
  fireEvent.click(screen.getByRole("button", { name: "変更を破棄して移動" }));
  expect(mockPush).toHaveBeenCalledWith("/memos");
});

it("保存済みならリンク移動を妨げない", () => {
  render(
    <>
      <Link href="/memos">一覧へ</Link>
      <UnsavedChangesGuard active={false} />
    </>,
  );

  fireEvent.click(screen.getByRole("link", { name: "一覧へ" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
