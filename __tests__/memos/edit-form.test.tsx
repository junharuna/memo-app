import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoEditForm } from "../../app/memos/[id]/edit/memo-edit-form";
import { autosaveMemoAction } from "../../app/memos/[id]/edit/autosave-action";

jest.mock("../../app/memos/[id]/edit/actions", () => ({
  updateMemoAction: jest.fn(),
}));
jest.mock("../../app/memos/[id]/edit/autosave-action", () => ({
  autosaveMemoAction: jest.fn(),
}));
jest.mock("../../components/layout/unsaved-changes-guard", () => ({
  UnsavedChangesGuard: () => null,
}));

const mockAutosave = jest.mocked(autosaveMemoAction);

const memo = {
  archivedAt: null,
  id: "11111111-1111-4111-8111-111111111111",
  title: "編集前タイトル",
  content: "# 編集前本文",
  created_at: "2026-08-09T01:00:00.000Z",
  favoritedAt: null,
  revision: 1,
  updated_at: "2026-08-09T02:00:00.000Z",
  category: { colorKey: "orange" as const, id: "category-1", name: "個人" },
  tags: [{ id: "tag-1", name: "重要" }],
  trashedAt: null,
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
  expect(document.querySelector('input[name="expectedRevision"]')).toHaveValue("1");
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

it("変更が1秒続かなければ最新revisionで自動保存する", async () => {
  jest.useFakeTimers();
  mockAutosave.mockResolvedValue({
    revision: 2,
    status: "saved",
    updatedAt: "2026-08-10T04:00:00.000Z",
  });

  render(<MemoEditForm memo={memo} />);

  fireEvent.change(screen.getByRole("textbox", { name: "タイトル" }), {
    target: { value: "自動保存後タイトル" },
  });

  expect(screen.getByText("未保存")).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(999));
  expect(mockAutosave).not.toHaveBeenCalled();

  await act(async () => {
    jest.advanceTimersByTime(1);
    await Promise.resolve();
  });

  expect(mockAutosave).toHaveBeenCalledTimes(1);
  const [, formData] = mockAutosave.mock.calls[0];
  expect(formData.get("title")).toBe("自動保存後タイトル");
  expect(formData.get("expectedRevision")).toBe("1");
  expect(screen.getByText("保存済み")).toBeInTheDocument();
  expect(document.querySelector('input[name="expectedRevision"]')).toHaveValue("2");

  jest.useRealTimers();
});

it("競合時は上書きせず入力のコピーと再読み込みを案内する", async () => {
  jest.useFakeTimers();
  mockAutosave.mockResolvedValue({
    message: "別の場所で更新されました。現在の入力は上書きしていません。",
    status: "conflict",
  });
  render(<MemoEditForm memo={memo} />);

  fireEvent.change(screen.getByRole("textbox", { name: "タイトル" }), {
    target: { value: "競合する入力" },
  });
  await act(async () => {
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
  });

  expect(screen.getByText("競合")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "現在の入力をコピー" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "最新の内容を読み直す" })).toBeInTheDocument();
  jest.useRealTimers();
});
