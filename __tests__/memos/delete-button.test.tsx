import { fireEvent, render, screen } from "@testing-library/react";
import { MemoDeleteButton } from "@/components/memos/memo-delete-button";

jest.mock("../../app/memos/[id]/delete/actions", () => ({
  deleteMemoAction: jest.fn(),
}));

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.open = false;
    },
  });
});

it("取り消せないことを確認してからメモを削除できる", () => {
  render(
    <MemoDeleteButton
      memoId="11111111-1111-4111-8111-111111111111"
      memoTitle="削除対象メモ"
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "メモを削除" }));

  const dialog = screen.getByRole("dialog", { name: "メモを削除しますか？" });
  expect(dialog).toHaveTextContent("「削除対象メモ」");
  expect(dialog).toHaveTextContent("この操作は取り消せません");
  expect(screen.getByRole("button", { name: "削除を確定" })).toHaveAttribute(
    "type",
    "submit",
  );

  fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
  expect(dialog).not.toHaveAttribute("open");
});
